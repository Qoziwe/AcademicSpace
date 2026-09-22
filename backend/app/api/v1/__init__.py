from flask import Blueprint

from app.api.v1.achievements import achievements_bp
from app.api.v1.ai import ai_bp
from app.api.v1.auth import auth_bp
from app.api.v1.flashcards import flashcards_bp
from app.api.v1.health import health_bp
from app.api.v1.profile import profile_bp
from app.api.v1.questionnaire import questionnaire_bp
from app.api.v1.subscription import subscription_bp
from app.api.v1.tasks import tasks_bp
from app.api.v1.universities import universities_bp
from app.api.v1.vaults import vaults_bp

api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")
api_v1.register_blueprint(health_bp)
api_v1.register_blueprint(auth_bp)
api_v1.register_blueprint(profile_bp)
api_v1.register_blueprint(questionnaire_bp)
api_v1.register_blueprint(universities_bp)
api_v1.register_blueprint(tasks_bp)
api_v1.register_blueprint(vaults_bp)
api_v1.register_blueprint(subscription_bp)
api_v1.register_blueprint(achievements_bp)
api_v1.register_blueprint(ai_bp)
api_v1.register_blueprint(flashcards_bp)
