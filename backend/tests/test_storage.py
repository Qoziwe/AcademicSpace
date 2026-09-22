import io

import pytest
from werkzeug.datastructures import FileStorage

from app.services.storage.local import LocalStorageBackend


def _upload(data: bytes, filename: str = "file.bin") -> FileStorage:
    return FileStorage(stream=io.BytesIO(data), filename=filename)


def test_local_backend_save_and_read_roundtrip(tmp_path):
    backend = LocalStorageBackend(str(tmp_path))

    key = backend.save(_upload(b"hello"), "docs/a/b.txt")

    assert key == "docs/a/b.txt"
    assert backend.read("docs/a/b.txt") == b"hello"


def test_local_backend_delete_removes_file(tmp_path):
    backend = LocalStorageBackend(str(tmp_path))
    backend.save(_upload(b"x"), "f.txt")

    backend.delete("f.txt")

    with pytest.raises(FileNotFoundError):
        backend.read("f.txt")


def test_local_backend_delete_missing_file_is_noop(tmp_path):
    backend = LocalStorageBackend(str(tmp_path))

    backend.delete("does-not-exist.txt")  # не должно бросать


def test_local_backend_read_missing_file_raises(tmp_path):
    backend = LocalStorageBackend(str(tmp_path))

    with pytest.raises(FileNotFoundError):
        backend.read("missing.txt")


def test_local_backend_rejects_path_traversal(tmp_path):
    backend = LocalStorageBackend(str(tmp_path))

    with pytest.raises(ValueError):
        backend.save(_upload(b"x"), "../outside.txt")
