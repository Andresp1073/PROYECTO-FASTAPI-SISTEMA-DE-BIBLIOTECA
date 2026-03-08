import os
from pathlib import Path

import pytest

from services.email_token_service import create_email_token
from models.email_token import EmailTokenTipo
from models.user import UserRol


def _auth_headers(access_token: str) -> dict:
    return {"Authorization": f"Bearer {access_token}"}


def test_auth_register_verify_login_refresh_logout(client, create_test_user, db_session):
    # Create a user and verify email workflow
    email = "test1@example.com"
    password = "Test1234!"
    user = create_test_user(email, password=password, verified=False)

    token = create_email_token(db_session, user=user, tipo=EmailTokenTipo.VERIFY_EMAIL, expires_minutes=60)
    resp = client.post("/auth/verify-email", json={"token": token})
    assert resp.status_code == 200
    assert resp.json()["message"].startswith("Email verificado")

    db_session.refresh(user)
    assert user.is_email_verified

    # Login
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    access = resp.json()["access_token"]
    assert access

    # Get current user
    resp = client.get("/auth/me", headers=_auth_headers(access))
    assert resp.status_code == 200
    assert resp.json()["email"] == email

    # Refresh token endpoint: create a refresh token record manually and call endpoint
    from datetime import datetime, timedelta, timezone
    from models.auth_token import AuthToken
    from services.auth_service import create_refresh_token, hash_refresh_token

    refresh_token = create_refresh_token()
    token_hash = hash_refresh_token(refresh_token)

    db_session.add(
        AuthToken(
            refresh_token_hash=token_hash,
            user_id=user.id,
            is_revoked=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
    )
    db_session.commit()

    resp = client.post("/auth/refresh", headers={"Cookie": f"refresh_token={refresh_token}"})
    assert resp.status_code == 200
    assert resp.json()["access_token"]

    # Logout should revoke refresh token
    resp = client.post("/auth/logout", headers={"Cookie": f"refresh_token={refresh_token}"})
    assert resp.status_code == 200
    assert resp.json()["message"] == "Logout OK"

    # Refresh after logout should fail
    resp = client.post("/auth/refresh", headers={"Cookie": f"refresh_token={refresh_token}"})
    assert resp.status_code == 401


def test_password_reset_flow(client, db_session):
    email = "test2@example.com"
    password = "OldPass123!"

    # Create user directly (skip register)
    from services.user_service import create_user

    user = create_user(db_session, nombre="Reset Test", email=email, password=password)
    user.is_email_verified = True
    db_session.commit()

    # Create reset token and reset password
    token = create_email_token(db_session, user=user, tipo=EmailTokenTipo.RESET_PASSWORD, expires_minutes=60)
    new_password = "NewPass123!"
    resp = client.post("/auth/reset-password", json={"token": token, "new_password": new_password})
    assert resp.status_code == 200
    assert resp.json()["message"].startswith("Contraseña actualizada")

    # Login with new password
    resp = client.post("/auth/login", json={"email": email, "password": new_password})
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_admin_user_endpoints(client, create_test_user):
    # Create users
    admin = create_test_user("admin@example.com", password="Admin123!", nombre="Admin", rol=UserRol.ADMIN)
    user = create_test_user("regular@example.com", password="User123!", nombre="Usuario")

    # Admin login
    resp = client.post("/auth/login", json={"email": admin.email, "password": "Admin123!"})
    assert resp.status_code == 200
    admin_token = resp.json()["access_token"]

    # List users
    resp = client.get("/users/", headers=_auth_headers(admin_token))
    assert resp.status_code == 200
    assert any(u["email"] == user.email for u in resp.json())

    # Get user by id
    resp = client.get(f"/users/{user.id}", headers=_auth_headers(admin_token))
    assert resp.status_code == 200

    # Update user
    resp = client.put(
        f"/users/{user.id}",
        headers=_auth_headers(admin_token),
        json={
            "nombre": "Usuario Mod",
            "email": "regular2@example.com",
            "documento": "123",
            "is_active": True,
            "is_email_verified": True,
            "rol": "USUARIO",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "regular2@example.com"

    # Reset password as admin
    resp = client.post(
        f"/users/{user.id}/reset-password",
        headers=_auth_headers(admin_token),
        json={"new_password": "NewUserPass123!"},
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Password reseteada correctamente"

    # Login with new password
    resp = client.post("/auth/login", json={"email": "regular2@example.com", "password": "NewUserPass123!"})
    assert resp.status_code == 200


def test_categoria_and_libro_flow(client, create_test_user):
    admin = create_test_user("admin2@example.com", password="Admin123!", nombre="Admin2", rol=UserRol.ADMIN)
    user = create_test_user("user2@example.com", password="User123!", nombre="User2")

    # Admin login
    resp = client.post("/auth/login", json={"email": admin.email, "password": "Admin123!"})
    admin_token = resp.json()["access_token"]

    # Create category
    resp = client.post(
        "/categorias/",
        headers=_auth_headers(admin_token),
        json={"nombre": "Ciencia", "descripcion": "Libros de ciencia"},
    )
    assert resp.status_code == 200
    cat_id = resp.json()["id"]

    # List categories as regular user
    resp = client.post("/auth/login", json={"email": user.email, "password": "User123!"})
    user_token = resp.json()["access_token"]

    resp = client.get("/categorias/", headers=_auth_headers(user_token))
    assert resp.status_code == 200
    assert any(c["id"] == cat_id for c in resp.json())

    # Create libro as admin
    resp = client.post(
        "/libros/",
        headers=_auth_headers(admin_token),
        json={
            "titulo": "Libro Test",
            "autor": "Autor",
            "isbn": "ISBN-123",
            "resumen": "Resumen",
            "categoria_id": cat_id,
        },
    )
    assert resp.status_code == 200
    libro_id = resp.json()["id"]

    # List libros as user
    resp = client.get("/libros/", headers=_auth_headers(user_token))
    assert resp.status_code == 200
    assert any(l["id"] == libro_id for l in resp.json())

    # Update libro as admin
    resp = client.put(
        f"/libros/{libro_id}",
        headers=_auth_headers(admin_token),
        json={"titulo": "Libro Mod"},
    )
    assert resp.status_code == 200
    assert resp.json()["titulo"] == "Libro Mod"

    # Delete libro as admin
    resp = client.delete(f"/libros/{libro_id}", headers=_auth_headers(admin_token))
    assert resp.status_code == 200


def test_prestamos_and_solicitudes_flow(client, create_test_user):
    admin = create_test_user("admin3@example.com", password="Admin123!", nombre="Admin3", rol=UserRol.ADMIN)
    user = create_test_user("user3@example.com", password="User123!", nombre="User3")

    # Admin login
    resp = client.post("/auth/login", json={"email": admin.email, "password": "Admin123!"})
    admin_token = resp.json()["access_token"]

    # Create category + libro
    resp = client.post(
        "/categorias/",
        headers=_auth_headers(admin_token),
        json={"nombre": "Ficción", "descripcion": "Libros de ficción"},
    )
    cat_id = resp.json()["id"]

    resp = client.post(
        "/libros/",
        headers=_auth_headers(admin_token),
        json={
            "titulo": "Libro Prestamo",
            "autor": "Autor",
            "isbn": "ISBN-789",
            "resumen": "Resumen",
            "categoria_id": cat_id,
        },
    )
    libro_id = resp.json()["id"]

    # User login
    resp = client.post("/auth/login", json={"email": user.email, "password": "User123!"})
    user_token = resp.json()["access_token"]

    # Create a prestamo (usuario)
    resp = client.post(
        "/prestamos",
        headers=_auth_headers(user_token),
        json={"libro_id": libro_id},
    )
    assert resp.status_code == 200
    prestamo_id = resp.json()["id"]

    # List own prestamos
    resp = client.get("/prestamos/mis-prestamos", headers=_auth_headers(user_token))
    assert resp.status_code == 200
    assert any(p["id"] == prestamo_id for p in resp.json())

    # Return préstamo as user
    resp = client.put(f"/prestamos/{prestamo_id}/devolver", headers=_auth_headers(user_token))
    assert resp.status_code == 200
    assert resp.json()["estado"] == "DEVUELTO"

    # Create solicitud de préstamo (nuevo libro)
    resp = client.post(
        "/libros/",
        headers=_auth_headers(admin_token),
        json={
            "titulo": "Libro Solicitud",
            "autor": "Autor",
            "isbn": "ISBN-999",
            "resumen": "Resumen",
            "categoria_id": cat_id,
        },
    )
    libro2_id = resp.json()["id"]

    resp = client.post(
        "/solicitudes/prestar",
        headers=_auth_headers(user_token),
        json={"libro_id": libro2_id},
    )
    assert resp.status_code == 200
    solicitud_id = resp.json()["id"]

    # Admin lists solicitudes
    resp = client.get("/solicitudes/admin", headers=_auth_headers(admin_token))
    assert resp.status_code == 200
    assert any(s["id"] == solicitud_id for s in resp.json())

    # Approve solicitud
    resp = client.post(
        f"/solicitudes/admin/{solicitud_id}/procesar",
        headers=_auth_headers(admin_token),
        json={"accion": "aprobar"},
    )
    assert resp.status_code == 200
    assert resp.json()["estado"] == "APROBADO"

    # Check user notifications
    resp = client.get("/solicitudes/notificaciones", headers=_auth_headers(user_token))
    assert resp.status_code == 200
    assert any(n["tipo"] == "SOLICITUD_APROBADA" for n in resp.json())

    # Mark notifications as read
    noti_id = resp.json()[0]["id"]
    resp = client.post(f"/solicitudes/notificaciones/{noti_id}/leer", headers=_auth_headers(user_token))
    assert resp.status_code == 200

    resp = client.post("/solicitudes/notificaciones/leer-todas", headers=_auth_headers(user_token))
    assert resp.status_code == 200


def test_upload_and_bulk_import(client, create_test_user):
    admin = create_test_user("admin4@example.com", password="Admin123!", nombre="Admin4", rol=UserRol.ADMIN)
    resp = client.post("/auth/login", json={"email": admin.email, "password": "Admin123!"})
    admin_token = resp.json()["access_token"]

    # Upload cover image
    image_bytes = b"\x89PNG\r\n\x1a\n" + b"0" * 100  # minimal PNG-like header
    resp = client.post(
        "/uploads/covers",
        headers=_auth_headers(admin_token),
        files={"file": ("test.png", image_bytes, "image/png")},
    )
    assert resp.status_code == 200
    url = resp.json()["cover_url"]
    assert url.startswith("/static/covers/")

    # Ensure file exists
    file_path = Path("static") / url.removeprefix("/static/")
    assert file_path.exists()
    file_path.unlink(missing_ok=True)

    # Bulk import libros via CSV
    csv_text = "titulo,autor,isbn,resumen,categoria_nombre\nLibro A,Autor A,ISBN-A,Resumen A,Cat bulk\nLibro B,Autor B,ISBN-B,Resumen B,Cat bulk\n"
    resp = client.post(
        "/bulk/libros",
        headers=_auth_headers(admin_token),
        files={"file": ("libros.csv", csv_text, "text/csv")},
    )
    assert resp.status_code == 200
    assert resp.json()["created"] == 2

    # Ensure libros exist via listing
    resp = client.get("/libros/", headers=_auth_headers(admin_token))
    assert resp.status_code == 200
    assert any(l["isbn"] == "ISBN-A" for l in resp.json())
