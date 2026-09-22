from flask import current_app

from app.services.ai.base import AIProvider

Feature = str  # "chat" | "portfolio" | "flashcards"


def get_provider(feature: Feature) -> AIProvider:
    """Выбирает провайдера для фичи по конфигу (`AI_<FEATURE>_PROVIDER` в
    `.env`), не хардкодит — см. `docs/00-roadmap.md` Фаза 8.5."""
    config_key = f"AI_{feature.upper()}_PROVIDER"
    provider_name = current_app.config.get(config_key)

    if provider_name == "anthropic":
        from app.services.ai.anthropic_provider import AnthropicProvider

        return AnthropicProvider(current_app.config.get("ANTHROPIC_API_KEY"))
    if provider_name == "openai":
        from app.services.ai.openai_provider import OpenAIProvider

        return OpenAIProvider(current_app.config.get("OPENAI_API_KEY"))

    raise RuntimeError(f"Неизвестный ИИ-провайдер для {feature}: {provider_name!r}")
