#!/usr/bin/env python3
"""
🐱 القطة روفان - تحديث الفيديوهات تلقائيًا
بيجيب RSS Feed بتاع قناة يوتيوب ويكتب videos.json
بيتشغل تلقائيًا عبر GitHub Actions كل 6 ساعات
"""
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

CHANNEL_ID = "UCfe5kWm6NIalmc2P_uvsQdw"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
OUT_FILE = Path(__file__).resolve().parent.parent / "videos.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def clean_desc(d: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"#[^\s#]+", "", d or "")).strip()


def fetch_videos():
    req = urllib.request.Request(
        FEED_URL,
        headers={"User-Agent": "Mozilla/5.0 (RovanSiteBuilder/1.0)"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        xml_bytes = r.read()
    root = ET.fromstring(xml_bytes)

    videos = []
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        vid = entry.findtext("yt:videoId", "", NS)
        title = entry.findtext("atom:title", "", NS)
        published = entry.findtext("atom:published", "", NS)
        desc = entry.findtext("media:group/media:description", "", NS)
        if not vid:
            continue
        videos.append(
            {
                "id": vid,
                "title": title,
                "date": published[:10],
                "desc": clean_desc(desc),
                "url": f"https://www.youtube.com/watch?v={vid}",
            }
        )
    return videos


def main():
    videos = fetch_videos()
    payload = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "channel": "🐱القطة روفان",
        "channel_url": "https://www.youtube.com/@RovanTheCat",
        "count": len(videos),
        "videos": videos,
    }
    OUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(f"✅ تم تحديث videos.json بـ {len(videos)} فيديو")


if __name__ == "__main__":
    main()
