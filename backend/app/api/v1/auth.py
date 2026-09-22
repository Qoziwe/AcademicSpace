from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.exceptions import Conflict, Unauthorized
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models import Profile, User
from app.schemas.auth import SignInSchema, SignUpSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

sign_up_schema = SignUpSchema()
sign_in_schema = SignInSchema()


def _user_payload(user: User) -> dict:
    return {"id": str(user.id), "name": user.name, "email": user.email, "grade": user.grade}


@auth_bp.post("/signup")
def signup():
    data = sign_up_schema.load(request.get_json(silent=True) or {})

    exists = db.session.execute(db.select(User).filter_by(email=data["email"])).scalar_one_or_none()
    if exists is not None:
        raise Conflict("Пользователь с таким email уже зарегистрирован.")

    user = User(
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
        name=data["name"],
        grade=data["grade"],
    )
    db.session.add(user)
    db.session.flush()
    db.session.add(Profile(user_id=user.id))
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_payload(user)}), 201


@auth_bp.post("/signin")
def signin():
    data = sign_in_schema.load(request.get_json(silent=True) or {})

    user = db.session.execute(db.select(User).filter_by(email=data["email"])).scalar_one_or_none()
    if user is None or not check_password_hash(user.password_hash, data["password"]):
        raise Unauthorized("Неверный email или пароль.")

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_payload(user)})
