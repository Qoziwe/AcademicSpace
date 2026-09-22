import base64

import anthropic

from app.services.ai.base import AIProvider, ImageInput

MODEL = "claude-opus-5"


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str | None):
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY не настроен.")
        self._client = anthropic.Anthropic(api_key=api_key)

    @staticmethod
    def _text_from(response: anthropic.types.Message) -> str:
        return "".join(block.text for block in response.content if block.type == "text")

    def generate_text(self, *, system: str, prompt: str, max_tokens: int = 4096) -> str:
        response = self._client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return self._text_from(response)

    def generate_vision(
        self, *, system: str, prompt: str, images: list[ImageInput], max_tokens: int = 4096
    ) -> str:
        content: list[dict] = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image.media_type,
                    "data": base64.standard_b64encode(image.data).decode("utf-8"),
                },
            }
            for image in images
        ]
        content.append({"type": "text", "text": prompt})

        response = self._client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": content}],
        )
        return self._text_from(response)
