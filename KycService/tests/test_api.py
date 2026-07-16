from unittest.mock import AsyncMock, Mock, patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
PAYLOAD = {
    "idImageUrl": "https://images.example/id.jpg",
    "selfieImageUrl": "https://images.example/selfie.jpg",
    "challenge": {
        "type": "blink_turn",
        "frameUrls": [
            "https://images.example/neutral.jpg",
            "https://images.example/blink.jpg",
            "https://images.example/turn.jpg",
        ],
    },
}


def test_health_disclaims_government_authentication():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["governmentRecordAuthentication"] is False


def test_verify_with_mocked_model_analyzers():
    original = (
        app.state.ocr_analyzer,
        app.state.face_analyzer,
        app.state.liveness_analyzer,
    )
    app.state.ocr_analyzer = Mock(
        analyze=Mock(return_value={"text": "PASSPORT AB12345", "fields": {}, "confidence": 0.9})
    )
    app.state.face_analyzer = Mock(
        analyze=Mock(return_value={"detected": True, "similarity": 0.91, "match": True})
    )
    app.state.liveness_analyzer = Mock(
        analyze=Mock(return_value={
            "passed": True,
            "score": 1.0,
            "checks": {"orderedFrames": True, "blink": True, "headTurn": True},
        })
    )
    try:
        with patch("app.main.download_image", new=AsyncMock(side_effect=[object()] * 5)):
            response = client.post("/verify", json=PAYLOAD)
    finally:
        (
            app.state.ocr_analyzer,
            app.state.face_analyzer,
            app.state.liveness_analyzer,
        ) = original

    assert response.status_code == 200
    body = response.json()
    assert body["recommendation"] == "manual_review"
    assert "approved" not in body


def test_verify_rejects_incomplete_challenge():
    payload = {**PAYLOAD, "challenge": {"type": "blink_turn", "frameUrls": []}}
    response = client.post("/verify", json=payload)
    assert response.status_code == 422
