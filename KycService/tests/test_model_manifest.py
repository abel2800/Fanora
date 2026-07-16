import json
import re
import unittest
from pathlib import Path


class ModelManifestTests(unittest.TestCase):
    def setUp(self):
        manifest_path = Path(__file__).parents[1] / "models" / "manifest.json"
        self.manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    def test_urls_are_pinned_to_declared_revision(self):
        revision = self.manifest["revision"]
        self.assertRegex(revision, r"^[0-9a-f]{40}$")
        for model in self.manifest["models"]:
            self.assertIn(revision, model["url"])
            self.assertRegex(model["sha256"], r"^[0-9a-f]{64}$")

    def test_expected_commercially_permissive_licenses_are_included(self):
        service_root = Path(__file__).parents[1]
        licenses = {model["license"] for model in self.manifest["models"]}
        self.assertEqual(licenses, {"MIT", "Apache-2.0"})
        for model in self.manifest["models"]:
            license_path = service_root / model["licenseFile"]
            self.assertTrue(license_path.is_file())
            self.assertGreater(license_path.stat().st_size, 500)

    def test_dependencies_exclude_insightface_runtime(self):
        requirements = (Path(__file__).parents[1] / "requirements.txt").read_text(encoding="utf-8")
        self.assertIsNone(re.search(r"(?im)^(insightface|onnxruntime)\s*[=<>]", requirements))


if __name__ == "__main__":
    unittest.main()
