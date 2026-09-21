from flask import Blueprint, jsonify

api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")


@api_v1.get("/health")
def health():
    return jsonify({"status": "ok"})
