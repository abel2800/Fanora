import asyncio
import os

import cv2
import httpx
import numpy as np

from .security import (
    UnsafeUrlError,
    allowed_development_hosts,
    validate_resolved_addresses,
    validate_url_shape,
)

MAX_REDIRECTS = 3


async def _validate_destination(url: str) -> None:
    allowed = allowed_development_hosts()
    host, port = validate_url_shape(url, allowed)
    await asyncio.to_thread(validate_resolved_addresses, host, port, allowed)


async def download_image(url: str) -> np.ndarray:
    max_bytes = int(os.getenv("KYC_MAX_IMAGE_BYTES", str(8 * 1024 * 1024)))
    timeout = float(os.getenv("KYC_DOWNLOAD_TIMEOUT_SECONDS", "10"))
    current_url = url

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(timeout),
        follow_redirects=False,
        trust_env=False,
    ) as client:
        for redirect_count in range(MAX_REDIRECTS + 1):
            await _validate_destination(current_url)
            async with client.stream(
                "GET",
                current_url,
                headers={"accept": "image/*", "user-agent": "fanora-kyc/1.0"},
            ) as response:
                if response.is_redirect:
                    if redirect_count == MAX_REDIRECTS:
                        raise ValueError("Too many image redirects")
                    location = response.headers.get("location")
                    if not location:
                        raise ValueError("Invalid image redirect")
                    current_url = str(response.url.join(location))
                    continue
                response.raise_for_status()
                content_length = response.headers.get("content-length")
                if content_length and int(content_length) > max_bytes:
                    raise ValueError("Image exceeds maximum size")
                body = bytearray()
                async for chunk in response.aiter_bytes():
                    body.extend(chunk)
                    if len(body) > max_bytes:
                        raise ValueError("Image exceeds maximum size")
                break
        else:
            raise ValueError("Image download failed")

    image = cv2.imdecode(np.frombuffer(body, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Downloaded content is not a decodable image")
    return image


__all__ = ["download_image", "UnsafeUrlError"]
