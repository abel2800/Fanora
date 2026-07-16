FROM python:3.11-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt
COPY models/manifest.json ./models/manifest.json
COPY scripts/fetch_models.py ./scripts/fetch_models.py
RUN python scripts/fetch_models.py \
    --manifest models/manifest.json \
    --output /verified-models

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    KYC_YUNET_MODEL_PATH=/models/opencv_zoo/face_detection_yunet_2023mar.onnx \
    KYC_SFACE_MODEL_PATH=/models/opencv_zoo/face_recognition_sface_2021dec.onnx

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-amh libglib2.0-0 libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /service
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index /wheels/* \
    && rm -rf /wheels
COPY --from=builder /verified-models /models/opencv_zoo
COPY app ./app
COPY tests ./tests
COPY models/manifest.json ./models/manifest.json
COPY scripts/fetch_models.py ./scripts/fetch_models.py
COPY licenses ./licenses
COPY THIRD_PARTY_NOTICES.md .

RUN useradd --create-home --uid 10001 kyc \
    && chown -R kyc:kyc /service /models
USER kyc

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
