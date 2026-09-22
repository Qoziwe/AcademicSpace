from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import BadRequest, NotFound
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Vault

vaults_bp = Blueprint("vaults", __name__, url_prefix="/vaults")


def _short_name(university_name: str) -> str:
    return university_name.rsplit(" ", 1)[-1]


def _vault_payload(vault: Vault) -> dict:
    filled = sum(1 for c in vault.cells if c.uploaded)
    return {
        "id": str(vault.id),
        "universityName": vault.university_name,
        "shortName": _short_name(vault.university_name),
        "deadline": vault.deadline,
        "filled": filled,
        "cellsTotal": vault.cells_total,
    }


def _get_vault(user_id: int, vault_id: str) -> Vault | None:
    try:
        vault_pk = int(vault_id)
    except ValueError:
        return None
    return db.session.execute(
        db.select(Vault).filter_by(id=vault_pk, user_id=user_id)
    ).scalar_one_or_none()


@vaults_bp.get("")
@jwt_required()
def get_vaults():
    user_id = int(get_jwt_identity())
    vaults = db.session.execute(db.select(Vault).filter_by(user_id=user_id)).scalars().all()
    return jsonify([_vault_payload(v) for v in vaults])


@vaults_bp.get("/<vault_id>")
@jwt_required()
def get_vault(vault_id: str):
    user_id = int(get_jwt_identity())
    vault = _get_vault(user_id, vault_id)
    if vault is None:
        raise NotFound("Копилка не найдена.")

    payload = _vault_payload(vault)
    payload["cells"] = [
        {"title": c.title, "sub": c.sub, "uploaded": c.uploaded} for c in vault.cells
    ]
    return jsonify(payload)


@vaults_bp.post("/<vault_id>/cells/<int:cell_index>")
@jwt_required()
def upload_vault_cell(vault_id: str, cell_index: int):
    user_id = int(get_jwt_identity())
    vault = _get_vault(user_id, vault_id)
    if vault is None:
        raise NotFound("Копилка не найдена.")

    cell = next((c for c in vault.cells if c.position == cell_index), None)
    if cell is None:
        raise NotFound("Ячейка не найдена.")

    upload = request.files.get("file")
    if upload is None or not upload.filename:
        raise BadRequest("Файл не передан.")

    filename = secure_filename(upload.filename)
    storage_root = Path(current_app.config.get("STORAGE_LOCAL_PATH", "storage"))
    vault_dir = storage_root / "vaults" / str(user_id) / str(vault.id)
    vault_dir.mkdir(parents=True, exist_ok=True)
    file_path = vault_dir / f"{cell.id}_{filename}"
    upload.save(file_path)

    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "файл"
    cell.uploaded = True
    cell.file_path = str(file_path)
    cell.sub = extension
    db.session.commit()

    return jsonify({"cell": {"title": cell.title, "sub": cell.sub, "uploaded": cell.uploaded}})
