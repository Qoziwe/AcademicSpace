from flask import current_app

from app.services.storage.base import StorageBackend


def get_storage() -> StorageBackend:
    """Выбирает бекенд хранилища по `STORAGE_BACKEND` в `.env` — по
    умолчанию `local`. Облачный бекенд подключается новым файлом здесь же,
    без изменений в вызывающем коде."""
    backend_name = current_app.config.get("STORAGE_BACKEND", "local")

    if backend_name == "local":
        from app.services.storage.local import LocalStorageBackend

        return LocalStorageBackend(current_app.config.get("STORAGE_LOCAL_PATH", "storage"))

    raise RuntimeError(f"Неизвестный storage backend: {backend_name!r}")
