import base64

import openai

from app.services.ai.base import AIProvider, ImageInput


class OpenRouterProvider(AIProvider):
    """Третий провайдер за тем же интерфейсом — `AI_*_PROVIDER=openrouter`
    в `.env`. OpenRouter — OpenAI-совместимый Chat Completions API (тот же
    `openai` SDK, что и `OpenAIProvider`, просто другой `base_url`), но
    один ключ даёт доступ к моделям разных вендоров по строке
    `провайдер/модель` (полный список — https://openrouter.ai/models).
    Модель — не хардкод, как у Anthropic/OpenAI (один флагман на
    провайдера), а обязательный `OPENROUTER_MODEL` в `.env`: у агрегатора
    нет единственного разумного дефолта, а угадывать слаг рискованно —
    молча уедет на несуществующую/устаревшую модель вместо явной ошибки."""

    def __init__(self, api_key: str | None, model: str | None):
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY не настроен.")
        if not model:
            raise RuntimeError("OPENROUTER_MODEL не настроен (см. https://openrouter.ai/models).")
        self._client = openai.OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
        self._model = model

    def generate_text(self, *, system: str, prompt: str, max_tokens: int = 4096) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
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
            model=self._model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": content},
            ],
        )
        return response.choices[0].message.content or ""
