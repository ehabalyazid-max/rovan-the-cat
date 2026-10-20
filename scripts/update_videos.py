#!/usr/bin/env python3
"""
🐱 القطة روفان - تحديث الفيديوهات والبلاي ليستات تلقائيًا
بيجيب RSS Feed بتاع قناة يوتيوب + كل بلاي ليست ويكتب videos.json
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

# البلاي ليستات الرسمية على القناة (id, العنوان, عدد الفيديوهات)
PLAYLISTS = [
    ("PLG50mJYVDDco", "[أولى ابتدائي] العلوم مع روفان", 29),
    ("PLIVpDYcFIcm4", "[أولى ابتدائي] الدراسات الاجتماعية مع روفان", 9),
    ("PLRozo9ag1Lag", "[تانية ابتدائي] اللغة العربية مع روفان", 8),
    ("PLJRD26p0HcoE", "النحو", 6),
    ("PLMYbZgP_wMZE", "[تانية ابتدائي] الحساب مع روفان", 29),
    ("PLWCN2vGHzWgE", "[تانية ابتدائي] دروس الإنجليزي مع روفان", 22),
    ("PLLPWuYzjWbxw", "[KG2] القراءة بالعربي والحروف مع روفان", 4),
    ("PLduABixlqgso", "[KG2] تربية إسلامية مع روفان", 10),
    ("PLCnaNGQU8SbA", "[KG2] الفونيكس والأرقام والكلمات بالإنجليزي مع روفان", 50),
    ("PLKtI8IXHHqzE", "[KG1] تعلم الإنجليزية للأطفال مع روفان", 55),
    ("PLVhMrXuQw4Ak", "[KG1] تعلم الإنجليزية للأطفال مع روفان", 5),
    ("PLDo92YXMwDyE", "[أولى ابتدائي] الرياضيات بالإنجليزي مع روفان", 19),
    ("PLIYkrsqz2ywM", "[أولى ابتدائي] القراءة والجمل بالإنجليزي مع روفان", 62),
    ("PLLUWe7PcHG98", "سلسلة الآداب مع روفان", 26),
    ("PLFaRbrIzTz1o", "قصص مصورة", 8),
    ("PLa82TLGr0UKA", "قصص الأنبياء", 24),
    ("PLWwW8uOfUEYI", "الأحاديث النبوية", 31),
    ("PLGgO-9ttvWaY", "قصص روفان التعليمية", 6),
    ("PLYe9vHcpOKzQ", "تربية الأبناء", 6),
    ("PLaNIk5VLXQIc", "نصائح لأولياء الأمور مع روفان", 2),
    ("PLSDZ7QiBOhRQ", "للأهل: تعليم الأطفال في البيت", 5),
]


def clean_desc(d: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"#[^\s#]+", "", d or "")).strip()


def parse_feed(xml_bytes: bytes):
    root = ET.fromstring(xml_bytes)
    videos = []
    for entry in root.findall("atom:entry", NS):
        vid = entry.findtext("yt:videoId", "", NS)
        title = entry.findtext("atom:title", "", NS)
        published = entry.findtext("atom:published", "", NS)
        desc = entry.findtext("media:group/media:description", "", NS)
        if not vid:
            continue
        videos.append({
            "id": vid,
            "title": title,
            "date": published[:10],
            "desc": clean_desc(desc),
            "url": f"https://www.youtube.com/watch?v={vid}",
        })
    return videos


def fetch(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (RovanSiteBuilder/1.0)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    # 1) آخر فيديوهات القناة
    videos = parse_feed(fetch(FEED_URL))
    print(f"✅ القناة: {len(videos)} فيديو")

    # 2) كل بلاي ليست (أحدث 15 فيديو فيها)
    playlists = []
    for pid, title, count in PLAYLISTS:
        try:
            vids = parse_feed(fetch(f"https://www.youtube.com/feeds/videos.xml?playlist_id={pid}"))
        except Exception as e:
            print(f"⚠️ {title}: {e}")
            vids = []
        playlists.append({
            "id": pid,
            "title": title,
            "count": count,
            "url": f"https://www.youtube.com/playlist?list={pid}",
            "videos": vids,
        })
        print(f"   📺 {title}: {len(vids)} فيديو متجدد")

    payload = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "channel": "🐱القطة روفان",
        "channel_url": "https://www.youtube.com/@RovanTheCat",
        "count": len(videos),
        "videos": videos,
        "playlists": playlists,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n✅ تم تحديث videos.json — {len(videos)} فيديو + {len(playlists)} بلاي ليست")


if __name__ == "__main__":
    main()
