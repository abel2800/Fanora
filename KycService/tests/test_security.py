import unittest
from unittest.mock import patch

from app.security import UnsafeUrlError, validate_resolved_addresses, validate_url_shape


class UrlPolicyTests(unittest.TestCase):
    def test_rejects_non_http_and_credentials(self):
        with self.assertRaises(UnsafeUrlError):
            validate_url_shape("file:///etc/passwd")
        with self.assertRaises(UnsafeUrlError):
            validate_url_shape("https://user:password@example.com/id.jpg")

    def test_rejects_literal_private_address(self):
        with self.assertRaises(UnsafeUrlError):
            validate_url_shape("http://127.0.0.1/id.jpg")
        with self.assertRaises(UnsafeUrlError):
            validate_url_shape("http://169.254.169.254/latest/meta-data")

    @patch("app.security.socket.getaddrinfo")
    def test_rejects_hostname_resolving_private(self, getaddrinfo):
        getaddrinfo.return_value = [(2, 1, 6, "", ("10.0.0.8", 443))]
        with self.assertRaises(UnsafeUrlError):
            validate_resolved_addresses("images.example", 443)

    def test_explicit_development_allowlist(self):
        host, port = validate_url_shape("http://localhost:9000/id.jpg", {"localhost"})
        self.assertEqual((host, port), ("localhost", 9000))


if __name__ == "__main__":
    unittest.main()
