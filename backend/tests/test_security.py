import pytest

from core import security
from core.settings import settings


def test_hash_and_verify_password():
    password = "SuperSecret123!"
    hashed = security.hash_password(password)

    assert security.verify_password(password, hashed)
    assert not security.verify_password("wrong-pass", hashed)


def test_create_and_decode_access_token(monkeypatch):
    monkeypatch.setattr(settings, "JWT_SECRET_KEY", "test-secret")
    monkeypatch.setattr(settings, "JWT_ALGORITHM", "HS256")

    token = security.create_access_token("user-123", expires_minutes=1)
    payload = security.decode_access_token(token)

    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_create_access_token_requires_secret(monkeypatch):
    monkeypatch.setattr(settings, "JWT_SECRET_KEY", "")
    with pytest.raises(ValueError):
        security.create_access_token("user-123")
