def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Biblioteca API OK"}


def test_db_ping_endpoint(client):
    response = client.get("/db/ping")
    assert response.status_code == 200
    assert response.json() == {"db": "ok"}
