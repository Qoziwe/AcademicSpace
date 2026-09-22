from abc import ABC, abstractmethod
from typing import BinaryIO, Protocol


class UploadedFile(Protocol):
    """То, что реально нужно от `werkzeug.datastructures.FileStorage` —
    достаточно узкий протокол, чтобы бекенды хранилища не зависели от Flask."""

    filename: str | None

    def save(self, dst: BinaryIO | str) -> None: ...


class StorageBackend(ABC):
    """Абстракция над файловым хранилищем — `local.py` сейчас, облако
    (S3/R2) позже подключается одним новым файлом за этим же интерфейсом,
    без переделки эндпоинтов (см. `docs/00-roadmap.md` Фаза 8.6)."""

    @abstractmethod
    def save(self, file: UploadedFile, path: str) -> str:
        """Сохраняет файл под `path` (относительный ключ, не абсолютный путь
        ОС) и возвращает ключ, под которым он реально сохранён — обычно
        `path` как есть, кладётся в `<Model>.file_path` для последующего
        `read()`."""
        ...

    @abstractmethod
    def read(self, path: str) -> bytes:
        """Читает файл по ключу, полученному от `save()`. Бросает
        `FileNotFoundError`, если файла нет."""
        ...

    @abstractmethod
    def delete(self, path: str) -> None:
        """Удаляет файл по ключу. Не бросает исключение, если файла уже нет."""
        ...
