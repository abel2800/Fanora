from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class Challenge(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["blink_turn"]
    frameUrls: list[HttpUrl]

    @field_validator("frameUrls")
    @classmethod
    def exactly_three_ordered_frames(cls, value: list[HttpUrl]) -> list[HttpUrl]:
        if len(value) != 3:
            raise ValueError("neutral, blink, and turn frames are required in that order")
        return value


class VerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    idImageUrl: HttpUrl
    selfieImageUrl: HttpUrl
    challenge: Challenge


class DocumentResult(BaseModel):
    text: str
    fields: dict[str, str]
    confidence: float = Field(ge=0, le=1)


class FaceResult(BaseModel):
    detected: bool
    similarity: float = Field(ge=0, le=1)
    match: bool


class LivenessResult(BaseModel):
    passed: bool
    score: float = Field(ge=0, le=1)
    checks: dict[str, bool]


class VerifyResponse(BaseModel):
    document: DocumentResult
    face: FaceResult
    liveness: LivenessResult
    riskScore: float = Field(ge=0, le=1)
    recommendation: Literal["manual_review", "reject"]
