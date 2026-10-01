import datetime as dt

from app.services.payments.base import ChargeResult, PaymentProvider
from app.utils import ru_date

# Длительность тарифа в днях — знание конкретно мок-провайдера; реальный
# провайдер будет отвечать своим собственным биллинг-периодом.
PLAN_DURATION_DAYS = {"week": 7, "month": 30}


class MockPaymentProvider(PaymentProvider):
    """Повторяет `idle → processing → success` стейт-машину прототипа
    (processing уже симулируется на фронте `setTimeout`'ом, `CLAUDE.md`
    §11) — здесь всегда `success`, синхронно."""

    def charge(self, *, plan_id: str, period: str, price: str, payment_method: str) -> ChargeResult:
        days = PLAN_DURATION_DAYS.get(plan_id, 30)
        ends_at = dt.datetime.now(dt.UTC).replace(tzinfo=None) + dt.timedelta(days=days)
        renews_at = ru_date(ends_at.date())
        return ChargeResult(
            status="success", renews_at=renews_at, ends_at=ends_at, summary=f"{period} · {price}"
        )
