from pathlib import Path

from app.services.storage.base import StorageBackend, UploadedFile


class LocalStorageBackend(StorageBackend):
    """Хранит файлы на диске бекенда под `STORAGE_LOCAL_PATH`."""

    def __init__(self, root: str):
        self._root = Path(root)

    def _resolve(self, path: str) -> Path:
        full = (self._root / path).resolve()
        root = self._root.resolve()
        if root not in full.parents and full != root:
            raise ValueError(f"Путь выходит за пределы хранилища: {path!r}")
        return full

    def save(self, file: UploadedFile, path: str) -> str:
        full = self._resolve(path)
        full.parent.mkdir(parents=True, exist_ok=True)
        file.save(full)
        return path

    def read(self, path: str) -> bytes:
        return self._resolve(path).read_bytes()

    def delete(self, path: str) -> None:
        self._resolve(path).unlink(missing_ok=True)
