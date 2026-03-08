import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db
from models.user import UserRol
from services.user_service import create_user


@pytest.fixture()
def db_engine():
    """Create a fresh in-memory database per test using shared cache."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def session_factory(db_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture()
def db_session(session_factory):
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def create_test_user(db_session):
    def _create(email: str, password: str = "Test1234!", nombre: str = "Test User", documento: str | None = None, rol: UserRol = UserRol.USUARIO, verified: bool = True, active: bool = True):
        user = create_user(db_session, nombre=nombre, email=email, password=password, documento=documento)
        user.rol = rol
        user.is_email_verified = verified
        user.is_active = active
        db_session.commit()
        db_session.refresh(user)
        return user

    return _create


@pytest.fixture()
def client(session_factory, monkeypatch):
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    # Override the dependency used in the FastAPI app
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
