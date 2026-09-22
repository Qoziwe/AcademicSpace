import base64

import openai

from app.services.ai.base import AIProvider, ImageInput

MODEL = "gpt-4o"


class OpenAIProvider(AIProvider):
    """Второй провайдер за тем же интерфейсом — выбирается через
    `AI_*_PROVIDER=openai` в `.env`. Менее протестирован, чем Anthropic
    (дефолтный провайдер проекта), но держит идентичный контракт."""

    def __init__(self, api_key: str | None):
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY не настроен.")
        self._client = openai.OpenAI(api_key=api_key)

    def generate_text(self, *, system: str, prompt: str, max_tokens: int = 4096) -> str:
        response = self._client.chat.completions.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content or ""

    def generate_vision(
        self, *, system: str, prompt: str, images: list[ImageInput], max_tokens: int = 4096
    ) -> str:
        content: list[dict] = [{"type": "text", "text": prompt}]
        for image in images:
            b64 = base64.standard_b64encode(image.data).decode("utf-8")
            content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{image.media_type};base64,{b64}"},
                }
            )

        response = self._client.chat.completions.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": content},
            ],
        )
        return response.choices[0].message.content or ""
