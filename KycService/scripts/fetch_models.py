"""Download immutable OpenCV Zoo models and verify their SHA-256 digests."""

import argparse
import hashlib
import json
import os
import tempfile
import urllib.request
from pathlib import Path


def fetch_models(manifest_path: Path, output_dir: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)

    for model in manifest["models"]:
        destination = output_dir / model["filename"]
        digest = hashlib.sha256()
        request = urllib.request.Request(
            model["url"],
            headers={"User-Agent": "fanora-kyc-model-fetch/1.0"},
        )
        temporary_path = None
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                with tempfile.NamedTemporaryFile(dir=output_dir, delete=False) as temporary:
                    temporary_path = Path(temporary.name)
                    while chunk := response.read(1024 * 1024):
                        digest.update(chunk)
                        temporary.write(chunk)
            actual = digest.hexdigest()
            if actual != model["sha256"]:
                raise RuntimeError(
                    f"SHA-256 mismatch for {model['filename']}: expected "
                    f"{model['sha256']}, received {actual}"
                )
            os.replace(temporary_path, destination)
            temporary_path = None
            print(f"Verified {model['filename']} ({actual})")
        finally:
            if temporary_path:
                temporary_path.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    fetch_models(arguments.manifest, arguments.output)


if __name__ == "__main__":
    main()
