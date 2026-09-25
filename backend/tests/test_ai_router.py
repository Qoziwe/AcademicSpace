import pytest

from app.services.ai.anthropic_provider import AnthropicProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.openrouter_provider import OpenRouterProvider
from app.services.ai.router import get_provider


def test_get_provider_anthropic(app):
    app.config["AI_CHAT_PROVIDER"] = "anthropic"
    app.config["ANTHROPIC_API_KEY"] = "sk-test"

    assert isinstance(get_provider("chat"), AnthropicProvider)


def test_get_provider_openai(app):
    app.config["AI_CHAT_PROVIDER"] = "openai"
    app.config["OPENAI_API_KEY"] = "sk-test"

    assert isinstance(get_provider("chat"), OpenAIProvider)


def test_get_provider_openrouter(app):
    app.config["AI_CHAT_PROVIDER"] = "openrouter"
    app.config["OPENROUTER_API_KEY"] = "sk-or-test"
    app.config["OPENROUTER_MODEL"] = "anthropic/claude-sonnet-4.5"

    provider = get_provider("chat")

    assert isinstance(provider, OpenRouterProvider)
    assert provider._model == "anthropic/claude-sonnet-4.5"


def test_get_provider_openrouter_requires_api_key(app):
    app.config["AI_CHAT_PROVIDER"] = "openrouter"
    app.config["OPENROUTER_API_KEY"] = None
    app.config["OPENROUTER_MODEL"] = "anthropic/claude-sonnet-4.5"

    with pytest.raises(RuntimeError, match="OPENROUTER_API_KEY"):
        get_provider("chat")


def test_get_provider_openrouter_requires_model(app):
    app.config["AI_CHAT_PROVIDER"] = "openrouter"
    app.config["OPENROUTER_API_KEY"] = "sk-or-test"
    app.config["OPENROUTER_MODEL"] = None

    with pytest.raises(RuntimeError, match="OPENROUTER_MODEL"):
        get_provider("chat")


def test_get_provider_unknown_raises(app):
    app.config["AI_CHAT_PROVIDER"] = "bogus"

    with pytest.raises(RuntimeError, match="Неизвестный"):
        get_provider("chat")
