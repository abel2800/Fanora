import asyncio
import hmac
import os

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException

from .analyzers import FaceAnalyzer, LivenessAnalyzer, OcrAnalyzer
from .downloader import UnsafeUrlError, download_image
from .schemas import VerifyRequest, VerifyResponse

app = FastAPI(
    title="Fanora self-hosted KYC analysis",
    version="1.0.0",
    description=(
        "Document OCR, face comparison, and challenge analysis. "
        "Results are decision support only and never authenticate government records."
    ),
)
app.state.ocr_analyzer = OcrAnalyzer()
app.state.face_analyzer = FaceAnalyzer()
app.state.liveness_analyzer = LivenessAnalyzer()


def require_service_token(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("KYC_SERVICE_TOKEN", "")
    if not expected:
        return
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Invalid service token")


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "purpose": "analysis_only",
        "governmentRecordAuthentication": False,
    }


@app.post("/verify", response_model=VerifyResponse, dependencies=[Depends(require_service_token)])
async def verify(request: VerifyRequest) -> VerifyResponse:
    try:
        images = await asyncio.gather(
            download_image(str(request.idImageUrl)),
            download_image(str(request.selfieImageUrl)),
            *(download_image(str(url)) for url in request.challenge.frameUrls),
        )
        id_image, selfie_image, *frames = images
        document, face, liveness = await asyncio.gather(
            asyncio.to_thread(app.state.ocr_analyzer.analyze, id_image),
            asyncio.to_thread(app.state.face_analyzer.analyze, id_image, selfie_image),
            asyncio.to_thread(app.state.liveness_analyzer.analyze, frames),
        )
    except UnsafeUrlError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (ValueError, httpx.HTTPError) as exc:
        raise HTTPException(status_code=422, detail="An input image could not be downloaded or decoded") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Analysis engine unavailable") from exc

    face_risk = 1 - face["similarity"] if face["detected"] else 1
    liveness_risk = 1 - liveness["score"]
    document_risk = 1 - document["confidence"]
    risk_score = round(min(1, 0.45 * face_risk + 0.35 * liveness_risk + 0.20 * document_risk), 4)
    reject = not face["match"] or not liveness["passed"] or not document["text"].strip()

    return VerifyResponse(
        document=document,
        face=face,
        liveness=liveness,
        riskScore=risk_score,
        recommendation="reject" if reject else "manual_review",
    )
