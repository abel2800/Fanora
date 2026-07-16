import os
import re
import threading

import cv2
import numpy as np


class OcrAnalyzer:
    def analyze(self, image: np.ndarray) -> dict:
        import pytesseract

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        details = pytesseract.image_to_data(
            rgb,
            lang=os.getenv("KYC_OCR_LANGUAGES", "eng+amh"),
            config="--oem 3 --psm 6",
            output_type=pytesseract.Output.DICT,
        )
        words = []
        confidences = []
        for text, confidence in zip(details["text"], details["conf"]):
            text = text.strip()
            try:
                confidence_value = float(confidence)
            except (TypeError, ValueError):
                continue
            if text and confidence_value >= 0:
                words.append(text)
                confidences.append(confidence_value)
        full_text = " ".join(words)
        return {
            "text": full_text,
            "fields": self._extract_fields(full_text),
            "confidence": round((sum(confidences) / len(confidences) / 100) if confidences else 0, 4),
        }

    @staticmethod
    def _extract_fields(text: str) -> dict[str, str]:
        fields = {}
        date = re.search(r"\b(?:19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b", text)
        number = re.search(r"\b[A-Z0-9][A-Z0-9/-]{5,19}\b", text.upper())
        if date:
            fields["date"] = date.group(0)
        if number:
            fields["documentNumberCandidate"] = number.group(0)
        return fields


class FaceAnalyzer:
    def __init__(self) -> None:
        self._detector = None
        self._recognizer = None
        self._lock = threading.RLock()

    def _get_models(self):
        if self._detector is None or self._recognizer is None:
            with self._lock:
                if self._detector is None or self._recognizer is None:
                    detector_path = os.getenv(
                        "KYC_YUNET_MODEL_PATH",
                        "/models/opencv_zoo/face_detection_yunet_2023mar.onnx",
                    )
                    recognizer_path = os.getenv(
                        "KYC_SFACE_MODEL_PATH",
                        "/models/opencv_zoo/face_recognition_sface_2021dec.onnx",
                    )
                    if not hasattr(cv2, "FaceDetectorYN") or not hasattr(cv2, "FaceRecognizerSF"):
                        raise RuntimeError("OpenCV build does not include YuNet/SFace APIs")
                    self._detector = cv2.FaceDetectorYN.create(
                        detector_path,
                        "",
                        (320, 320),
                        float(os.getenv("KYC_FACE_DETECTION_THRESHOLD", "0.9")),
                        0.3,
                        5000,
                    )
                    self._recognizer = cv2.FaceRecognizerSF.create(recognizer_path, "")
        return self._detector, self._recognizer

    @staticmethod
    def _largest_face(faces):
        return max(faces, key=lambda face: face[2] * face[3])

    @staticmethod
    def _detect(detector, image: np.ndarray):
        height, width = image.shape[:2]
        detector.setInputSize((width, height))
        _, faces = detector.detect(image)
        return faces

    def analyze(self, id_image: np.ndarray, selfie_image: np.ndarray) -> dict:
        # FaceDetectorYN has mutable input dimensions, so serialize use of the
        # shared OpenCV models across concurrent requests.
        with self._lock:
            detector, recognizer = self._get_models()
            id_faces = self._detect(detector, id_image)
            selfie_faces = self._detect(detector, selfie_image)
            if id_faces is None or len(id_faces) == 0 or selfie_faces is None or len(selfie_faces) == 0:
                return {"detected": False, "similarity": 0.0, "match": False}
            id_face = self._largest_face(id_faces)
            selfie_face = self._largest_face(selfie_faces)
            first = recognizer.feature(recognizer.alignCrop(id_image, id_face))
            second = recognizer.feature(recognizer.alignCrop(selfie_image, selfie_face))
            cosine = float(recognizer.match(first, second, cv2.FaceRecognizerSF_FR_COSINE))

        similarity = float(np.clip((cosine + 1) / 2, 0, 1))
        threshold = float(os.getenv("KYC_FACE_MATCH_THRESHOLD", "0.68"))
        return {
            "detected": True,
            "similarity": round(similarity, 4),
            "match": similarity >= threshold,
        }


class LivenessAnalyzer:
    LEFT_EYE = (33, 160, 158, 133, 153, 144)
    RIGHT_EYE = (362, 385, 387, 263, 373, 380)

    @staticmethod
    def _distance(a, b) -> float:
        return float(np.linalg.norm(np.array(a) - np.array(b)))

    def _ear(self, landmarks, indices) -> float:
        p1, p2, p3, p4, p5, p6 = [(landmarks[i].x, landmarks[i].y) for i in indices]
        horizontal = 2 * self._distance(p1, p4)
        return (self._distance(p2, p6) + self._distance(p3, p5)) / horizontal if horizontal else 0

    def analyze(self, frames: list[np.ndarray]) -> dict:
        import mediapipe as mp

        measurements = []
        with mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        ) as face_mesh:
            for frame in frames:
                result = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                if not result.multi_face_landmarks:
                    return {
                        "passed": False,
                        "score": 0.0,
                        "checks": {"orderedFrames": False, "blink": False, "headTurn": False},
                    }
                landmarks = result.multi_face_landmarks[0].landmark
                ear = (self._ear(landmarks, self.LEFT_EYE) + self._ear(landmarks, self.RIGHT_EYE)) / 2
                eye_midpoint = (landmarks[33].x + landmarks[263].x) / 2
                eye_width = abs(landmarks[263].x - landmarks[33].x) or 0.001
                nose_offset = abs(landmarks[1].x - eye_midpoint) / eye_width
                measurements.append((ear, nose_offset))

        neutral, blink, turn = measurements
        blink_passed = blink[0] < neutral[0] * float(os.getenv("KYC_BLINK_RATIO", "0.7"))
        turn_passed = turn[1] > max(
            float(os.getenv("KYC_HEAD_TURN_THRESHOLD", "0.12")),
            neutral[1] + 0.05,
        )
        ordered = neutral[0] > blink[0] and turn[1] > neutral[1]
        checks = {"orderedFrames": ordered, "blink": blink_passed, "headTurn": turn_passed}
        score = sum(checks.values()) / len(checks)
        return {"passed": all(checks.values()), "score": round(score, 4), "checks": checks}
