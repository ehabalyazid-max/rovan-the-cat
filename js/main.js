/* ============================================================
   🐱 القطة روفان — الواجهة الرئيسية (main.js)
   النقاط والإنجازات • الفيديوهات • البحث • التنقل • الأقسام
   التقدم محفوظ محليًا على الجهاز فقط (بدون حسابات أو بيانات شخصية)
   ============================================================ */
(function () {
  "use strict";
  const D = window.ROVAN;

  /* ============================================================
     ⭐ نظام النقاط والإنجازات (تخزين محلي آمن)
     ============================================================ */
  const STORE_KEY = "rovan_progress_v2";
  const DEFAULTS = { v: 2, stars: 0, gamesPlayed: [], badges: [], hifz: [], soundOn: true };

  function sanitize(raw) {
    const out = Object.assign({}, DEFAULTS);
    if (!raw || typeof raw !== "object") return out;
    out.stars = (typeof raw.stars === "number" && isFinite(raw.stars) && raw.stars >= 0) ? Math.floor(raw.stars) : 0;
    out.gamesPlayed = Array.isArray(raw.gamesPlayed) ? raw.gamesPlayed.filter(function (x) { return typeof x === "string"; }) : [];
    out.badges = Array.isArray(raw.badges) ? raw.badges.filter(function (x) { return typeof x === "string"; }) : [];
    out.hifz = Array.isArray(raw.hifz) ? raw.hifz.filter(function (x) { return typeof x === "string"; }) : [];
    out.soundOn = raw.soundOn !== false;
    return out;
  }

  function load() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(STORE_KEY) || "null"));
    } catch (e) {
      return Object.assign({}, DEFAULTS); /* بيانات تالفة → نبدأ من جديد */
    }
  }
  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* التخزين ممتلئ أو محظور */ }
  }

  let state = load();

  window.RovanProgress = {
    getState: function () { return state; },
    addStars: function (n, note) {
      if (typeof n !== "number" || !isFinite(n) || n <= 0) return;
      state.stars += Math.floor(n);
      save(state);
      renderProgress();
      checkBadges();
      toast("⭐ +" + Math.floor(n) + " نجمة" + (note ? " — " + note : ""));
    },
    markGamePlayed: function (id) {
      if (state.gamesPlayed.indexOf(id) === -1) {
        state.gamesPlayed.push(id);
        save(state);
        renderProgress();
        checkBadges();
      }
    },
    toggleHifz: function (name) {
      const i = state.hifz.indexOf(name);
      if (i >= 0) {
        state.hifz.splice(i, 1);
      } else {
        state.hifz.push(name);
        window.RovanProgress.addStars(5, "حفظت سورة " + name);
      }
      save(state);
      renderSurahs();
      renderProgress();
      checkBadges();
    },
    reset: function () {
      state = Object.assign({}, DEFAULTS, { soundOn: state.soundOn });
      save(state);
      renderProgress();
      renderSurahs();
      checkBadges();
    }
  };

  function checkBadges() {
    let changed = false;
    function unlock(id) {
      if (state.badges.indexOf(id) === -1) {
        state.badges.push(id);
        const b = D.achievements.filter(function (a) { return a.id === id; })[0];
        if (b && b.stars) state.stars += b.stars;
        changed = true;
        toast("🏅 شارة جديدة: " + (b ? b.name : id));
      }
    }
    if (state.gamesPlayed.length >= 1) unlock("first-game");
    if (state.stars >= 10) unlock("stars-10");
    if (state.stars >= 30) unlock("stars-30");
    if (state.stars >= 50) unlock("stars-50");
    if (state.gamesPlayed.length >= D.games.length) unlock("all-games");
    if (state.hifz.length >= 1) unlock("hifz-1");
    if (state.hifz.length >= 5) unlock("hifz-5");
    if (state.hifz.length >= D.surahs.length) unlock("hifz-all");
    if (changed) {
      save(state);
      renderProgress();
    }
  }

  function renderProgress() {
    const box = document.getElementById("progressStats");
    const badgesBox = document.getElementById("badgesGrid");
    if (!box || !badgesBox) return;
    box.innerHTML =
      '<div class="pstat"><b>' + state.stars + "</b><span>نجمة ⭐</span></div>" +
      '<div class="pstat"><b>' + state.gamesPlayed.length + "</b><span>ألعاب لعبتها 🎮</span></div>" +
      '<div class="pstat"><b>' + state.hifz.length + "</b><span>سور حفظتها 📖</span></div>" +
      '<div class="pstat"><b>' + state.badges.length + "</b><span>شارات 🏅</span></div>";
    badgesBox.innerHTML = D.achievements.map(function (a) {
      const won = state.badges.indexOf(a.id) >= 0;
      return '<div class="badge' + (won ? " won" : "") + '">' +
        '<span class="bicon">' + (won ? a.name.split(" ").slice(-1)[0] : "🔒") + "</span>" +
        a.name.replace(/\s*\S+\s*$/, "") +
        "<small>" + a.desc + "</small></div>";
    }).join("");
  }

  /* ---------- رسالة تشجيعية صغيرة ---------- */
  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById("rovanToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "rovanToast";
      el.setAttribute("role", "status");
      el.style.cssText = "position:fixed; bottom:22px; right:22px; z-index:9998; background:#2B2140; color:#fff;" +
        "padding:14px 22px; border-radius:999px; font-weight:900; box-shadow:0 10px 30px rgba(0,0,0,.3); transition:.3s; max-width:80vw;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = "0"; }, 2600);
  }

  /* ============================================================
     🎬 الفيديوهات — مزامنة مع videos.json (تُحدَّث آليًا)
     ============================================================ */
  const CACHE_KEY = "rovan_videos_cache_v3";
  const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;
  const FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=" + D.channel.channelId;

  let ALL_VIDEOS = D.fallbackVideos;
  let ALL_PLAYLISTS = D.playlists;
  let activePL = "all";

  function plEmoji(title) {
    if (/قصص|أنبياء|أحاديث/.test(title)) return "📚";
    if (/علوم/.test(title)) return "🔬";
    if (/اجتماعية/.test(title)) return "🌍";
    if (/رياضيات|حساب|فونيكس|أرقام/.test(title)) return "🔢";
    if (/إنجليز|الإنجليزي/.test(title)) return "🔤";
    if (/إسلامية|آداب/.test(title)) return "🕌";
    if (/نحو|العربية|قراءة|العربي|الحروف/.test(title)) return "📖";
    if (/تربية|نصائح|للأهل/.test(title)) return "👨‍👩‍👧";
    return "🐾";
  }
  function fmtDate(d) {
    try { return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return d; }
  }

  function buildChips() {
    const box = document.getElementById("filters");
    if (!box) return;
    const chips = ['<button class="chip' + (activePL === "all" ? " active" : "") + '" data-pl="all">الكل 🐾</button>'];
    ALL_PLAYLISTS.forEach(function (p) {
      chips.push('<button class="chip' + (activePL === p.id ? " active" : "") + '" data-pl="' + p.id + '" title="' + p.title + '">' +
        plEmoji(p.title) + " " + p.title + "</button>");
    });
    box.innerHTML = chips.join("");
    box.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        window.RovanSound.click();
        activePL = chip.dataset.pl;
        buildChips();
        renderVideos();
      });
    });
  }

  function vcard(v, i) {
    return '<button type="button" class="vcard" data-video="' + v.id + '" data-title="' +
      String(v.title).replace(/"/g, "&quot;") + '" style="animation:popIn .5s ' + (i * 0.05) + 's both">' +
      '<div class="thumb">' +
      '<div class="fallback" aria-hidden="true">🐱</div>' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="فيديو: ' +
      String(v.title).replace(/"/g, "&quot;") + '" onload="this.style.opacity=1" loading="lazy" width="480" height="360">' +
      '<div class="play" aria-hidden="true"><span>▶</span></div>' +
      "</div>" +
      '<div class="vinfo"><h3>' + v.title + "</h3>" +
      '<div class="vmeta"><span class="tag">📅 ' + fmtDate(v.date) + "</span></div></div>" +
      "</button>";
  }

  function renderVideos() {
    const grid = document.getElementById("videoGrid");
    const banner = document.getElementById("plBanner");
    if (!grid || !banner) return;
    let list = ALL_VIDEOS;
    if (activePL !== "all") {
      const p = ALL_PLAYLISTS.filter(function (x) { return x.id === activePL; })[0];
      if (p) {
        list = (p.videos && p.videos.length) ? p.videos : ALL_VIDEOS.filter(function (v) {
          const words = p.title.replace(/\[.*?\]/g, " ").replace(/مع روفان/g, " ")
            .split(/\s+/).map(function (w) { return w.replace(/^ال/, ""); })
            .filter(function (w) { return w.length > 2; });
          const s = v.title + " " + (v.desc || "");
          return words.some(function (w) { return s.indexOf(w) >= 0 || s.indexOf("ال" + w) >= 0; });
        });
        banner.innerHTML = '<a class="pl-banner" href="' + p.url + '" target="_blank" rel="noopener">▶ افتح بلاي ليست "' +
          p.title + '" كاملة على يوتيوب (' + p.count + " فيديو)</a>";
      }
    } else {
      banner.innerHTML = "";
    }
    if (!list.length) {
      grid.innerHTML = '<div class="empty">مافيش فيديوهات في البلاي ليست دي لسه 🐱</div>';
      return;
    }
    grid.innerHTML = list.map(vcard).join("");
    grid.querySelectorAll(".vcard").forEach(function (card) {
      card.addEventListener("click", function () {
        openVideo(card.dataset.video, card.dataset.title);
      });
    });
  }

  async function loadVideos() {
    let payload = null;
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && cached.videos && cached.videos.length && Date.now() - cached.at < CACHE_MAX_AGE) {
        payload = cached;
      }
    } catch (e) { /* بيانات تالفة */ }

    if (payload) {
      ALL_VIDEOS = payload.videos;
      ALL_PLAYLISTS = (payload.playlists && payload.playlists.length) ? payload.playlists : D.playlists;
    }
    buildChips();
    renderVideos();

    try {
      const r = await fetch("videos.json?t=" + Date.now());
      if (!r.ok) throw new Error("videos.json unavailable");
      const j = await r.json();
      if (j && j.videos && j.videos.length) {
        ALL_VIDEOS = j.videos;
        ALL_PLAYLISTS = (j.playlists && j.playlists.length) ? j.playlists : D.playlists;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), videos: j.videos, playlists: j.playlists })); }
        catch (e) { /* ok */ }
        buildChips();
        renderVideos();
      }
    } catch (e) {
      /* الموقع يفضل شغال بالنسخة الاحتياطية — رسالة لطيفة */
      const grid = document.getElementById("videoGrid");
      if (grid && !grid.querySelector(".vcard")) {
        grid.innerHTML = '<div class="empty">تعذر تحميل الفيديوهات دلوقتي 😿 زوروا <a href="' + D.channel.url +
          '" target="_blank" rel="noopener" style="color:var(--purple); font-weight:900;">قناة روفان على يوتيوب</a></div>';
      }
    }
  }

  /* ---------- مودال الفيديو ---------- */
  function openVideo(id, title) {
    window.RovanSound.click();
    const player = document.getElementById("player");
    player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0" title="' + String(title).replace(/"/g, "&quot;") +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    document.getElementById("modalTitle").textContent = title;
    const fallback = document.getElementById("videoFallback");
    if (fallback) {
      fallback.innerHTML = '<a href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener">افتح الفيديو على يوتيوب ▶</a>';
    }
    openModal("modal");
  }
  function closeVideo() {
    const player = document.getElementById("player");
    if (player) player.innerHTML = "";
    closeModal("modal");
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    const closeBtn = m.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ============================================================
     🎮 مكتبة الألعاب — بحث وتصفية وترتيب
     ============================================================ */
  function renderGames() {
    const grid = document.getElementById("gamesGrid");
    if (!grid) return;
    const q = (document.getElementById("gameSearch") ? document.getElementById("gameSearch").value : "").trim();
    const cat = document.getElementById("gameCat") ? document.getElementById("gameCat").value : "all";
    const diff = document.getElementById("gameDiff") ? document.getElementById("gameDiff").value : "all";
    const sort = document.getElementById("gameSort") ? document.getElementById("gameSort").value : "name";

    let list = D.games.filter(function (g) {
      if (!g.published) return false;
      if (cat !== "all" && g.category !== cat) return false;
      if (diff !== "all" && g.difficulty !== diff) return false;
      if (q && (g.name + " " + g.desc + " " + g.category).indexOf(q) === -1) return false;
      return true;
    });
    list.sort(function (a, b) {
      return sort === "new" ? (b.dateAdded || "").localeCompare(a.dateAdded || "") : a.name.localeCompare(b.name, "ar");
    });

    if (!list.length) {
      grid.innerHTML = '<div class="empty">مافيش ألعاب مطابقة للبحث ده 🐱 جرّب كلمة تانية!</div>';
      return;
    }
    grid.innerHTML = list.map(function (g, i) {
      return '<button type="button" class="game-card gc' + ((i % 8) + 1) + '" data-game="' + g.id + '">' +
        '<span class="gicon" aria-hidden="true">' + g.icon + "</span>" +
        "<h3>" + g.name + "</h3>" +
        "<p>" + g.desc + "</p>" +
        '<div class="gmeta"><span class="ages">' + g.category + " • " + g.difficulty + "</span>" +
        '<span class="ages">' + g.grade + "</span></div>" +
        "</button>";
    }).join("");
    grid.querySelectorAll(".game-card").forEach(function (card) {
      card.addEventListener("click", function () { openGame(card.dataset.game); });
    });
  }

  function openGame(type) {
    window.RovanSound.click();
    const g = D.games.filter(function (x) { return x.id === type; })[0];
    document.getElementById("gameTitle").textContent = g ? g.icon + " " + g.name : "🎮 لعبة";
    const inst = document.getElementById("gameInstructions");
    if (inst) {
      inst.innerHTML = g && g.instructions
        ? '<div class="mascot-guide" style="margin:0 0 18px;"><div class="bubble">📋 ' + g.instructions + "</div></div>"
        : "";
    }
    openModal("gameModal");
    const area = document.getElementById("gameArea");
    area.innerHTML = '<div class="empty">جاري تحميل اللعبة... 🐱</div>';
    try {
      window.RovanGames.start(area, type);
    } catch (e) {
      area.innerHTML = '<div class="empty">حصلت مشكلة بسيطة في اللعبة 😿 جرّب تاني!</div>';
    }
  }
  function closeGame() {
    closeModal("gameModal");
    const area = document.getElementById("gameArea");
    if (area) area.innerHTML = "";
  }

  /* ============================================================
     📖 القرآن والأحاديث والقصص
     ============================================================ */
  function renderSurahs() {
    const grid = document.getElementById("surahGrid");
    if (!grid) return;
    const hifz = state.hifz;
    grid.innerHTML = D.surahs.map(function (s) {
      const done = hifz.indexOf(s.name) >= 0;
      return '<div class="surah-card' + (done ? " done" : "") + '">' +
        '<div class="surah-head"><h3><span class="surah-badge">' + s.num + "</span> سورة " + s.name + "</h3>" +
        "<span aria-hidden=\"true\" style=\"font-size:1.6rem;\">" + (done ? "⭐" : "🌙") + "</span></div>" +
        '<div class="surah-text">' + s.text + "</div>" +
        '<div class="surah-actions">' +
        '<button type="button" class="btn-sm btn-done' + (done ? " done" : "") + '" data-hifz="' + s.name + '">' +
        (done ? "✅ حفظتها!" : "⭐ حفظتها!") + "</button>" +
        '<a class="btn-sm btn-link" href="https://www.youtube.com/@RovanTheCat/search?q=' +
        encodeURIComponent("سورة " + s.name) + '" target="_blank" rel="noopener">▶ احفظها مع روفان</a>' +
        "</div></div>";
    }).join("");
    grid.querySelectorAll("[data-hifz]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.RovanSound.click();
        window.RovanProgress.toggleHifz(btn.dataset.hifz);
      });
    });
    const fill = document.getElementById("hifzFill");
    const text = document.getElementById("hifzText");
    const count = state.hifz.length;
    if (fill) fill.style.width = (count / D.surahs.length * 100) + "%";
    if (text) {
      text.textContent =
        count === 0 ? "لسه محفظتش أي سورة — يلا نبدأ بسورة الإخلاص! 💪" :
        count === D.surahs.length ? "ماشاء الله عليك! 🎉 حفظت كل السور — ربنا يبارك فيك!" :
        "ماشاء الله! حفظت " + count + " من " + D.surahs.length + " سور — كمّل يا بطل! 💪";
    }
  }

  function renderHadiths() {
    const grid = document.getElementById("hadithGrid");
    if (!grid) return;
    grid.innerHTML = D.hadiths.map(function (h) {
      return '<article class="hadith-card">' +
        '<div class="hadith-text">« ' + h.text + " »</div>" +
        '<div class="hadith-meaning"><b>يعني إيه؟</b> ' + h.meaning + "</div>" +
        '<div class="hadith-src">📖 ' + h.src + "</div>" +
        "</article>";
    }).join("");
  }

  function renderProphets() {
    const grid = document.getElementById("prophetsGrid");
    if (!grid) return;
    grid.innerHTML = D.prophets.map(function (p) {
      return '<article class="prophet-card">' +
        '<div class="prophet-top" aria-hidden="true">' + p.emoji + "</div>" +
        '<div class="prophet-body"><h3>' + p.name + "</h3><p>" + p.story + "</p>" +
        '<span class="prophet-ref">' + p.ref + "</span></div></article>";
    }).join("");
  }

  /* ============================================================
     🔍 البحث الشامل
     ============================================================ */
  function doSearch() {
    const input = document.getElementById("siteSearch");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = '<p class="search-note">اكتب كلمة زي «الحيوانات» أو «الإخلاص» أو «الحساب» 🔎</p>';
      return;
    }
    const hits = [];
    D.games.forEach(function (g) {
      if ((g.name + " " + g.desc + " " + g.category).indexOf(q) >= 0) {
        hits.push({ type: "لعبة", label: g.icon + " " + g.name, target: "game:" + g.id });
      }
    });
    ALL_PLAYLISTS.forEach(function (p) {
      if (p.title.indexOf(q) >= 0) hits.push({ type: "بلاي ليست", label: "📺 " + p.title, href: p.url });
    });
    ALL_VIDEOS.forEach(function (v) {
      if (v.title.indexOf(q) >= 0) hits.push({ type: "فيديو", label: "🎬 " + v.title, target: "video:" + v.id + "|" + v.title });
    });
    D.surahs.forEach(function (s) {
      if (s.name.indexOf(q) >= 0 || s.text.indexOf(q) >= 0) hits.push({ type: "سورة", label: "📖 سورة " + s.name, href: "#quran" });
    });
    D.hadiths.forEach(function (h) {
      if ((h.text + h.meaning).indexOf(q) >= 0) hits.push({ type: "حديث", label: "🕌 «" + h.text.slice(0, 50) + "…»", href: "#hadith" });
    });
    D.prophets.forEach(function (p) {
      if ((p.name + p.story).indexOf(q) >= 0) hits.push({ type: "قصة", label: "⭐ " + p.name, href: "#prophets" });
    });

    if (!hits.length) {
      results.innerHTML = '<div class="empty">مافيش نتائج لـ «' + q + '» 🐱 جرّب كلمة تانية!</div>';
      return;
    }
    results.innerHTML = hits.slice(0, 12).map(function (h, i) {
      return '<button type="button" class="sresult" data-i="' + i + '">' +
        '<span class="stype">' + h.type + "</span><span>" + h.label + "</span></button>";
    }).join("");
    results.querySelectorAll(".sresult").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const h = hits[Number(btn.dataset.i)];
        window.RovanSound.click();
        if (h.href) {
          if (h.href.charAt(0) === "#") {
            const el = document.querySelector(h.href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.open(h.href, "_blank", "noopener");
          }
        } else if (h.target.indexOf("game:") === 0) {
          openGame(h.target.slice(5));
        } else if (h.target.indexOf("video:") === 0) {
          const rest = h.target.slice(6);
          const sep = rest.indexOf("|");
          openVideo(rest.slice(0, sep), rest.slice(sep + 1));
        }
      });
    });
  }

  /* ============================================================
     📱 التنقل + الصوت + التذييل + الأنيميشن
     ============================================================ */
  function initNav() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("mobileClose");
    if (!toggle || !menu) return;
    function openMenu() {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      if (closeBtn) closeBtn.focus();
    }
    function closeMenu() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
    toggle.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.addEventListener("click", function (e) { if (e.target === menu) closeMenu(); });
    menu.querySelectorAll(".mlink").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initSoundToggle() {
    const btn = document.getElementById("soundToggle");
    if (!btn) return;
    window.RovanSound.enabled = state.soundOn;
    function paint() {
      btn.textContent = window.RovanSound.enabled ? "🔊 الصوت" : "🔇 الصوت";
      btn.setAttribute("aria-pressed", String(window.RovanSound.enabled));
    }
    btn.addEventListener("click", function () {
      window.RovanSound.enabled = !window.RovanSound.enabled;
      state.soundOn = window.RovanSound.enabled;
      save(state);
      paint();
      if (window.RovanSound.enabled) window.RovanSound.click();
    });
    paint();
  }

  function initFooter() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
    const resetBtn = document.getElementById("resetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (window.confirm("متأكد إنك عايز تمسح كل نجومك وشاراتك؟ 🤔")) {
          window.RovanProgress.reset();
          toast("تم مسح التقدم — يلا من الأول! 💪");
        }
      });
    }
  }

  function initReveal() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".sec-head").forEach(function (el) { observer.observe(el); });
    window.addEventListener("scroll", function () {
      const h = document.documentElement;
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
      const bar = document.getElementById("progressBar");
      if (bar) bar.style.width = pct + "%";
    }, { passive: true });
  }

  function initModals() {
    const vModal = document.getElementById("modal");
    const gModal = document.getElementById("gameModal");
    if (vModal) {
      vModal.addEventListener("click", function (e) { if (e.target === vModal) closeVideo(); });
      const btn = vModal.querySelector(".modal-close");
      if (btn) btn.addEventListener("click", closeVideo);
    }
    if (gModal) {
      gModal.addEventListener("click", function (e) { if (e.target === gModal) closeGame(); });
      const btn = gModal.querySelector(".modal-close");
      if (btn) btn.addEventListener("click", closeGame);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeVideo(); closeGame(); }
    });
  }

  function initSearch() {
    const input = document.getElementById("siteSearch");
    const btn = document.getElementById("searchBtn");
    if (!input) return;
    let t = null;
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(doSearch, 250);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); doSearch(); }
    });
    if (btn) btn.addEventListener("click", doSearch);
  }

  function initGameFilters() {
    ["gameSearch", "gameCat", "gameDiff", "gameSort"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", renderGames);
        el.addEventListener("change", renderGames);
      }
    });
  }

  /* ---------- التشغيل ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initSoundToggle();
    initModals();
    initSearch();
    initGameFilters();
    initReveal();
    initFooter();
    renderGames();
    renderSurahs();
    renderHadiths();
    renderProphets();
    renderProgress();
    checkBadges();
    loadVideos();
  });
})();
