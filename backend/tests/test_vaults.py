import io

from app.extensions import db
from app.models import Vault, VaultCell

SIGNUP_BODY = {
    "email": "vaults@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup(client) -> tuple[str, int]:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    body = res.get_json()
    return body["token"], int(body["user"]["id"])


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _seed_vault(user_id: int) -> Vault:
    vault = Vault(
        user_id=user_id,
        university_name="Università di Bologna",
        deadline="дедлайн 12 мая",
        cells_total=2,
    )
    db.session.add(vault)
    db.session.flush()
    db.session.add(VaultCell(vault_id=vault.id, title="Аттестат", sub="нужен файл", position=0))
    db.session.add(
        VaultCell(vault_id=vault.id, title="IELTS", sub="pdf", uploaded=True, position=1)
    )
    db.session.commit()
    return vault


def test_get_vault_reports_filled_count(client):
    token, user_id = _signup(client)
    vault = _seed_vault(user_id)

    res = client.get(f"/api/v1/vaults/{vault.id}", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["shortName"] == "Bologna"
    assert body["filled"] == 1
    assert body["cellsTotal"] == 2
    assert body["cells"][0]["uploaded"] is False
    assert body["cells"][1]["uploaded"] is True


def test_upload_vault_cell_marks_it_uploaded(client):
    token, user_id = _signup(client)
    vault = _seed_vault(user_id)

    res = client.post(
        f"/api/v1/vaults/{vault.id}/cells/0",
        headers=_auth(token),
        data={"file": (io.BytesIO(b"%PDF-1.4"), "attestat.pdf")},
        content_type="multipart/form-data",
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["cell"]["uploaded"] is True
    assert body["cell"]["sub"] == "pdf"

    detail = client.get(f"/api/v1/vaults/{vault.id}", headers=_auth(token)).get_json()
    assert detail["filled"] == 2


def test_upload_without_file_is_bad_request(client):
    token, user_id = _signup(client)
    vault = _seed_vault(user_id)

    res = client.post(f"/api/v1/vaults/{vault.id}/cells/0", headers=_auth(token))

    assert res.status_code == 400
