from flask import current_app

from app.services.payments.base import PaymentProvider


def get_payment_provider() -> PaymentProvider:
    """Выбирает платёжного провайдера по `PAYMENT_PROVIDER` в `.env` — по
    умолчанию `mock`. Реальный провайдер подключается новым файлом здесь
    же, без изменений в вызывающем коде."""
    provider_name = current_app.config.get("PAYMENT_PROVIDER", "mock")

    if provider_name == "mock":
        from app.services.payments.mock_provider import MockPaymentProvider

        return MockPaymentProvider()

    raise RuntimeError(f"Неизвестный платёжный провайдер: {provider_name!r}")
