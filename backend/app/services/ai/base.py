from abc import ABC, abstractmethod
from typing import NamedTuple


class ImageInput(NamedTuple):
    media_type: str  # "image/png" | "image/jpeg" | ...
    data: bytes


class AIProvider(ABC):
    """Абстракция над конкретной нейронкой — выбор провайдера на фичу
    (`AI_CHAT_PROVIDER`/`AI_PORTFOLIO_PROVIDER`/`AI_FLASHCARDS_PROVIDER`)
    живёт в `router.py`, не хардкодится в вызывающем коде."""

    @abstractmethod
    def generate_text(self, *, system: str, prompt: str, max_tokens: int = 4096) -> str: ...

    @abstractmethod
    def generate_vision(
        self, *, system: str, prompt: str, images: list[ImageInput], max_tokens: int = 4096
    ) -> str: ...
