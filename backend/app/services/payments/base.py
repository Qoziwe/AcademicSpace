from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ChargeResult:
    status: str  # "success" | "failed"
    renews_at: str | None  # человекочитаемая дата продления; None при failed
    summary: str | None  # готовая строка вида «Месяц · 1 900 тг»; None при failed


class PaymentProvider(ABC):
    """Абстракция над платёжным провайдером — реальный провайдер для
    Кыргызстана ещё не выбран (легальность приёма платежей, минимум
    бумажной волокиты — бизнес/юридический вопрос вне этого плана).
    Подключается одним новым файлом здесь же за тем же интерфейсом, без
    изменений в `POST /subscription/subscribe` (см. `docs/00-roadmap.md`
    Фаза 8.7)."""

    @abstractmethod
    def charge(
        self, *, plan_id: str, period: str, price: str, payment_method: str
    ) -> ChargeResult: ...
