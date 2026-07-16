# Third-party face models

The container includes two unmodified model binaries from
[OpenCV Zoo](https://github.com/opencv/opencv_zoo), pinned to revision
`47534e27c9851bb1128ccc0102f1145e27f23f98`.

- `face_detection_yunet_2023mar.onnx` — YuNet face detection, MIT License,
  copyright 2020 Shiqi Yu. See `licenses/YUNET-MIT.txt`.
- `face_recognition_sface_2021dec.onnx` — SFace face recognition,
  Apache License 2.0. SFace was contributed by Yaoyao Zhong; the model
  contains a MobileFaceNet instance trained with SFace loss, and the ONNX
  conversion was contributed by Chengrui Wang. See
  `licenses/SFACE-APACHE-2.0.txt`.

Source URLs and verified SHA-256 digests are recorded in
`models/manifest.json`. The models are analysis aids and do not establish
identity against any government record.
