import ipaddress
import os
import socket
from urllib.parse import urlparse


class UnsafeUrlError(ValueError):
    pass


def allowed_development_hosts() -> set[str]:
    return {
        host.strip().lower()
        for host in os.getenv("KYC_DEV_ALLOWED_HOSTS", "").split(",")
        if host.strip()
    }


def validate_url_shape(url: str, allowed_hosts: set[str] | None = None) -> tuple[str, int]:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme not in {"http", "https"} or not host:
        raise UnsafeUrlError("Only absolute HTTP(S) image URLs are allowed")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("URL credentials are not allowed")
    if host not in (allowed_hosts or set()):
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            address = None
        if address and not address.is_global:
            raise UnsafeUrlError("Private, loopback, and link-local destinations are blocked")
    return host, parsed.port or (443 if parsed.scheme == "https" else 80)


def validate_resolved_addresses(host: str, port: int, allowed_hosts: set[str] | None = None) -> None:
    if host in (allowed_hosts or set()):
        return
    try:
        addresses = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise UnsafeUrlError("Image host could not be resolved") from exc
    if not addresses:
        raise UnsafeUrlError("Image host could not be resolved")
    for entry in addresses:
        address = ipaddress.ip_address(entry[4][0])
        if not address.is_global:
            raise UnsafeUrlError("Private, loopback, and link-local destinations are blocked")
