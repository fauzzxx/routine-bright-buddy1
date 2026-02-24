import os
from typing import Optional

import httpx
from supabase import create_client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "videos")


def _get_supabase_client():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase URL or service key not set")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def download_asset(asset_url: str) -> bytes:
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.get(asset_url)
        r.raise_for_status()
        return r.content


def upload_video_and_get_public_url(path: str, content: bytes, content_type: str = "video/mp4") -> str:
    sb = _get_supabase_client()
    bucket = sb.storage.from_(SUPABASE_BUCKET)

    # Upload; if file exists, overwrite
    # supabase-py currently supports 'upsert' via options dict
    # Some versions of storage3/httpx expect header values to be strings.
    # Ensure 'upsert' is passed as a string to avoid 'bool encode' errors.
    res = bucket.upload(path, content, {
        "contentType": content_type,
        "upsert": "true",
    })
    if hasattr(res, "error") and res.error:
        raise RuntimeError(f"Supabase upload error: {res.error}")

    public_url = bucket.get_public_url(path)
    return public_url
