"""Bounded, immutable-file downloader for public resources (stdlib only)."""
from __future__ import annotations
import argparse, hashlib, json, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]

def download(url: str, destination: Path, *, timeout: int = 30, retries: int = 2) -> dict:
    destination = destination.resolve()
    raw = (ROOT / "data" / "raw").resolve()
    if raw not in destination.parents:
        raise ValueError("Raw downloads must be placed under data/raw")
    if destination.exists():
        raise FileExistsError(f"Refusing to overwrite existing raw file: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    error = None
    for attempt in range(retries + 1):
        temp = destination.with_name(destination.name + ".part")
        try:
            request = Request(url, headers={"User-Agent": "CrisiscopeX-data-pipeline/1.0"})
            with urlopen(request, timeout=timeout) as response, temp.open("wb") as output:
                status = getattr(response, "status", 200)
                if status < 200 or status >= 300: raise RuntimeError(f"HTTP status {status}")
                digest, size = hashlib.sha256(), 0
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk: break
                    size += len(chunk)
                    if size > 2_000_000_000: raise ValueError("Download exceeds 2 GB safety limit")
                    digest.update(chunk); output.write(chunk)
                content_type = response.headers.get("Content-Type", "")
            if size == 0: raise ValueError("Downloaded resource is empty")
            with temp.open("rb") as prefix_file:
                head = prefix_file.read(512).lstrip().lower()
            if "text/html" in content_type.lower() or head.startswith((b"<!doctype html", b"<html")):
                raise ValueError("Resource response was HTML, not a dataset")
            temp.replace(destination)
            return {"url":url,"path":str(destination.relative_to(ROOT)),"downloaded_at":datetime.now(timezone.utc).isoformat(),
                    "bytes":size,"sha256":digest.hexdigest(),"content_type":content_type}
        except (HTTPError, URLError, TimeoutError, OSError, RuntimeError, ValueError) as exc:
            error = exc
            temp.unlink(missing_ok=True)
            if attempt < retries: time.sleep(1.0 * (attempt + 1))
    raise RuntimeError(f"Download failed after {retries + 1} attempt(s): {error}") from error

def main() -> None:
    p=argparse.ArgumentParser(); p.add_argument("url"); p.add_argument("destination",type=Path); a=p.parse_args()
    print(json.dumps(download(a.url,a.destination),indent=2))
if __name__ == "__main__": main()
