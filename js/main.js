/* ============================================================
   🐱 Rovan The Cat — الواجهة الرئيسية (main.js)
   • Chrome موحد (Header/Footer/بحث) بدعم عربي/إنجليزي
   • Rovan Rewards: نجوم/شارات/مستويات — حفظ محلي آمن
   • Rovan TV: فيديوهات حقيقية (videos.json)
   • نموذج طلب القصة + المساعد + التحدي اليومي
   كل العناصر اختيارية — الملف يعمل على أي صفحة
   ============================================================ */
(function () {
  "use strict";
  const D = window.ROVAN;
  const I18N = window.RovanI18n;

  /* ---------- مساعدات ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function t(key) { return I18N ? I18N.t(key) : key; }

  /* ============================================================
     🧩 Chrome: الهيدر والفوتر الموحدان
     ============================================================ */
  function headerHTML() {
    const page = location.pathname.split("/").pop() || "index.html";
    function cls(p) { return page === p ? ' class="nlink active-page"' : ' class="nlink"'; }
    return (
      '<a class="skip-link" href="#main">' + t("nav.skip") + "</a>" +
      '<div id="progressBar" aria-hidden="true"></div>' +
      '<nav class="navbar" aria-label="القائمة الرئيسية">' +
      '<a href="index.html" class="brand">' +
      '<img class="avatar-img" src="images/avatar.jpg" alt="Rovan The Cat">' +
      '<span class="bname">🐱 ' + (I18N.lang === "ar" ? "القطة روفان" : "Rovan The Cat") + "</span></a>" +
      '<div class="nav-links">' +
      '<a href="index.html"' + cls("index.html") + ' data-i18n="nav.home">' + t("nav.home") + "</a>" +
      '<a href="games.html"' + cls("games.html") + ' data-i18n="nav.games">' + t("nav.games") + "</a>" +
      '<a href="academy.html"' + cls("academy.html") + ' data-i18n="nav.academy">' + t("nav.academy") + "</a>" +
      '<a href="stories.html"' + cls("stories.html") + ' data-i18n="nav.stories">' + t("nav.stories") + "</a>" +
      '<a href="request.html"' + cls("request.html") + ' data-i18n="nav.request">' + t("nav.request") + "</a>" +
      '<a href="tv.html"' + cls("tv.html") + ' data-i18n="nav.tv">' + t("nav.tv") + "</a>" +
      '<div class="more-wrap"><button type="button" class="nlink" id="moreBtn" aria-haspopup="true" aria-expanded="false" style="background:none;border:none;cursor:pointer;font-family:inherit;">' + t("nav.more") + "</button>" +
      '<div class="more-menu" id="moreMenu">' +
      '<a href="quran.html"' + cls("quran.html") + ' data-i18n="nav.quran">' + t("nav.quran") + "</a>" +
      '<a href="progress.html"' + cls("progress.html") + ' data-i18n="nav.progress">' + t("nav.progress") + "</a>" +
      '<a href="progress.html#settings" data-i18n="nav.settings">' + t("nav.settings") + "</a>" +
      '<a href="index.html#about" data-i18n="nav.about">' + t("nav.about") + "</a>" +
      "</div></div>" +
      "</div>" +
      '<div class="nav-tools">' +
      '<button type="button" class="icon-btn" id="searchOpen" data-i18n-aria="search.open" aria-label="' + t("search.open") + '">🔎</button>' +
      '<button type="button" class="icon-btn" id="soundToggle" aria-pressed="true" aria-label="الصوت">🔊</button>' +
      '<button type="button" class="icon-btn lang-btn" id="langToggle" data-i18n-aria="nav.langLabel" aria-label="' + t("nav.langLabel") + '">' + t("nav.lang") + "</button>" +
      '<a href="' + D.channel.subscribeUrl + '" target="_blank" rel="noopener" class="btn btn-yt" data-i18n="nav.subscribe">' + t("nav.subscribe") + "</a>" +
      '<button type="button" class="nav-toggle" id="navToggle" data-i18n-aria="nav.menu" aria-label="' + t("nav.menu") + '" aria-expanded="false">☰</button>' +
      "</div></nav>" +
      '<div class="mobile-menu" id="mobileMenu"><div class="mobile-panel" role="dialog" aria-label="قائمة التنقل">' +
      '<button type="button" class="mobile-close" id="mobileClose" data-i18n-aria="nav.closeMenu" aria-label="' + t("nav.closeMenu") + '">✕</button>' +
      '<a href="index.html" class="mlink">🏠 ' + t("nav.home") + "</a>" +
      '<a href="games.html" class="mlink">' + t("nav.games") + "</a>" +
      '<a href="academy.html" class="mlink">' + t("nav.academy") + "</a>" +
      '<a href="stories.html" class="mlink">' + t("nav.stories") + "</a>" +
      '<a href="request.html" class="mlink">' + t("nav.request") + "</a>" +
      '<a href="tv.html" class="mlink">' + t("nav.tv") + "</a>" +
      '<a href="quran.html" class="mlink">' + t("nav.quran") + "</a>" +
      '<a href="progress.html" class="mlink">' + t("nav.progress") + "</a>" +
      '<a href="progress.html#settings" class="mlink">' + t("nav.settings") + "</a>" +
      '<a href="index.html#about" class="mlink">' + t("nav.about") + "</a>" +
      '<a href="' + D.channel.subscribeUrl + '" target="_blank" rel="noopener" class="mlink">▶ ' + t("nav.subscribe") + "</a>" +
      "</div></div>" +
      '<div class="search-overlay" id="searchOverlay"><div class="search-panel" role="search">' +
      '<div class="search-box">' +
      '<input type="search" id="siteSearch" data-i18n-ph="search.placeholder" placeholder="' + esc(t("search.placeholder")) + '" aria-label="' + esc(t("search.placeholder")) + '">' +
      '<button type="button" class="btn btn-play" id="searchBtn" data-i18n="search.btn">' + t("search.btn") + "</button>" +
      "</div>" +
      '<div class="search-results" id="searchResults" aria-live="polite">' +
      '<p class="search-note" data-i18n="search.hint">' + t("search.hint") + "</p></div>" +
      '<div style="text-align:center; margin-top:14px;"><button type="button" class="btn-sm btn-quiet" id="searchClose">✕</button></div>' +
      "</div></div>"
    );
  }

  function footerHTML() {
    const y = new Date().getFullYear();
    return (
      '<footer><div class="fbrand">' +
      '<img src="images/avatar.jpg" alt="Rovan The Cat">' +
      "<span>" + (I18N.lang === "ar" ? "القطة روفان – Rovan The Cat" : "Rovan The Cat – القطة روفان") + "</span></div>" +
      '<nav class="flinks" aria-label="روابط التذييل">' +
      '<a href="index.html#about" data-i18n="footer.about">' + t("footer.about") + "</a>" +
      '<a href="games.html" data-i18n="footer.games">' + t("footer.games") + "</a>" +
      '<a href="stories.html" data-i18n="footer.stories">' + t("footer.stories") + "</a>" +
      '<a href="' + D.channel.url + '" target="_blank" rel="noopener" data-i18n="footer.youtube">' + t("footer.youtube") + "</a>" +
      '<a href="privacy.html" data-i18n="footer.privacy">' + t("footer.privacy") + "</a>" +
      '<a href="terms.html" data-i18n="footer.terms">' + t("footer.terms") + "</a>" +
      '<a href="' + D.channel.url + '" target="_blank" rel="noopener" data-i18n="footer.contact">' + t("footer.contact") + "</a>" +
      "</nav>" +
      '<div class="fnote">' + t("footer.note") + "<br>" + t("footer.note2") +
      '<br>© ' + y + " " + t("footer.rights") + " 🐾</div></footer>"
    );
  }

  function initChrome() {
    const headerBox = document.getElementById("siteHeader");
    const footerBox = document.getElementById("siteFooter");
    if (headerBox) {
      headerBox.innerHTML = headerHTML();
      initNav();
      initSearchOverlay();
      initSoundToggle();
      const langBtn = document.getElementById("langToggle");
      if (langBtn) {
        langBtn.addEventListener("click", function () {
          window.RovanSpeech.sfx.click();
          I18N.toggle();
          location.reload(); /* إعادة رسم كاملة للواجهة بلغة جديدة */
        });
      }
    }
    if (footerBox) footerBox.innerHTML = footerHTML();
  }

  /* ============================================================
     ⭐ Rovan Rewards
     ============================================================ */
  const STORE_KEY = "rovan_progress_v3";
  const DEFAULTS = {
    v: 3, stars: 0, gamesPlayed: [], badges: [], hifz: [],
    lessons: [], stories: [], daily: {}, lastActivity: null
  };

  function sanitize(raw) {
    const out = Object.assign({}, DEFAULTS);
    if (!raw || typeof raw !== "object") return out;
    out.stars = (typeof raw.stars === "number" && isFinite(raw.stars) && raw.stars >= 0) ? Math.floor(raw.stars) : 0;
    ["gamesPlayed", "badges", "hifz", "lessons", "stories"].forEach(function (k) {
      out[k] = Array.isArray(raw[k]) ? raw[k].filter(function (x) { return typeof x === "string"; }) : [];
    });
    out.daily = (raw.daily && typeof raw.daily === "object") ? raw.daily : {};
    out.lastActivity = (raw.lastActivity && typeof raw.lastActivity === "object") ? raw.lastActivity : null;
    return out;
  }
  function load() {
    try {
      const v3 = localStorage.getItem(STORE_KEY);
      if (v3) return sanitize(JSON.parse(v3));
      const v2 = localStorage.getItem("rovan_progress_v2");
      if (v2) return sanitize(JSON.parse(v2));
      return Object.assign({}, DEFAULTS);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* التخزين ممتلئ */ }
  }

  let state = load();

  function levelInfo() {
    const levels = D.rovanLevels;
    let cur = levels[0], next = null;
    for (let i = 0; i < levels.length; i++) {
      if (state.stars >= levels[i].min) {
        cur = levels[i];
        next = levels[i + 1] || null;
      }
    }
    const pct = next
      ? Math.min(100, Math.round((state.stars - cur.min) / (next.min - cur.min) * 100))
      : 100;
    return { name: cur.name, next: next, pct: pct };
  }

  window.RovanProgress = {
    getState: function () { return state; },
    addStars: function (n, note) {
      if (typeof n !== "number" || !isFinite(n) || n <= 0) return;
      const before = levelInfo().name;
      state.stars += Math.floor(n);
      save(state);
      renderProgress();
      checkBadges();
      toast("⭐ +" + Math.floor(n) + " ★" + (note ? " — " + note : ""));
      if (levelInfo().name !== before) {
        setTimeout(function () {
          window.RovanSpeech.say("levelUp");
          toast("🎊 " + levelInfo().name);
        }, 600);
      }
    },
    markGamePlayed: function (id) {
      if (state.gamesPlayed.indexOf(id) === -1) {
        state.gamesPlayed.push(id);
        save(state);
        renderProgress();
        checkBadges();
      }
    },
    markLesson: function (id) {
      if (state.lessons.indexOf(id) === -1) {
        state.lessons.push(id);
        window.RovanProgress.addStars(8, "🎓");
        save(state);
        renderProgress();
        checkBadges();
      }
    },
    markStory: function (id) {
      if (state.stories.indexOf(id) === -1) {
        state.stories.push(id);
        window.RovanProgress.addStars(5, "📚");
        save(state);
        renderProgress();
        checkBadges();
      }
    },
    markDaily: function (dateKey, score) {
      if (!state.daily[dateKey]) {
        state.daily[dateKey] = { score: score };
        window.RovanProgress.addStars(10, "🎯");
        save(state);
        renderProgress();
        checkBadges();
        if (window.RovanAcademy) window.RovanAcademy.renderDaily();
      }
    },
    setLastActivity: function (type, id, label) {
      state.lastActivity = { type: type, id: id, label: label, at: Date.now() };
      save(state);
    },
    toggleHifz: function (name) {
      const i = state.hifz.indexOf(name);
      if (i >= 0) {
        state.hifz.splice(i, 1);
      } else {
        state.hifz.push(name);
        window.RovanProgress.addStars(5, "📖 " + name);
      }
      save(state);
      renderSurahs();
      renderProgress();
      checkBadges();
    },
    reset: function () {
      state = Object.assign({}, DEFAULTS);
      save(state);
      renderProgress();
      renderSurahs();
      if (window.RovanAcademy) {
        window.RovanAcademy.renderAcademy();
        window.RovanAcademy.renderDaily();
      }
      if (window.RovanStories) window.RovanStories.renderStories();
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
        toast("🏅 " + (b ? b.name : id));
        window.RovanSpeech.sfx.star();
      }
    }
    if (state.gamesPlayed.length >= 1) unlock("first-game");
    if (state.stars >= 10) unlock("stars-10");
    if (state.stars >= 30) unlock("stars-30");
    if (state.stars >= 50) unlock("stars-50");
    if (state.stars >= 100) unlock("stars-100");
    if (state.gamesPlayed.length >= D.games.length) unlock("all-games");
    if (state.hifz.length >= 1) unlock("hifz-1");
    if (state.hifz.length >= 5) unlock("hifz-5");
    if (state.hifz.length >= D.surahs.length) unlock("hifz-all");
    if (state.lessons.length >= 1) unlock("academy-1");
    if (state.lessons.length >= 5) unlock("academy-5");
    if (Object.keys(state.daily).length >= 1) unlock("daily-1");
    if (Object.keys(state.daily).length >= 7) unlock("daily-7");
    if (state.stories.length >= 1) unlock("story-1");
    if (state.stories.length >= D.stories.length) unlock("story-all");
    if (changed) {
      save(state);
      renderProgress();
    }
  }

  function renderProgress() {
    const box = document.getElementById("progressStats");
    const badgesBox = document.getElementById("badgesGrid");
    const levelBox = document.getElementById("levelInfo");
    const lv = levelInfo();
    if (levelBox) {
      levelBox.innerHTML =
        "<b>" + lv.name + "</b>" +
        '<div class="pbar" style="margin-top:10px;"><div class="fill" style="width:' + lv.pct + '%"></div></div>' +
        (lv.next ? "<p style=\"margin-top:8px;\">⭐ " + (lv.next.min - state.stars) + " → " + lv.next.name + "</p>"
          : '<p style="margin-top:8px;">🏆</p>');
    }
    /* شريط الأكاديمية */
    const ap = document.getElementById("academyProgress");
    if (ap) {
      ap.style.width = (state.lessons.length / D.academy.length * 100) + "%";
    }
    const ac = document.getElementById("academyCount");
    if (ac) ac.textContent = state.lessons.length + " / " + D.academy.length;
    if (!box || !badgesBox) return;
    box.innerHTML =
      '<div class="pstat"><b>' + state.stars + "</b><span>⭐</span></div>" +
      '<div class="pstat"><b>' + state.gamesPlayed.length + "</b><span>🎮</span></div>" +
      '<div class="pstat"><b>' + state.lessons.length + "</b><span>🎓</span></div>" +
      '<div class="pstat"><b>' + state.stories.length + "</b><span>📚</span></div>" +
      '<div class="pstat"><b>' + Object.keys(state.daily).length + "</b><span>🎯</span></div>" +
      '<div class="pstat"><b>' + state.hifz.length + "</b><span>📖</span></div>" +
      '<div class="pstat"><b>' + state.badges.length + "</b><span>🏅</span></div>";
    badgesBox.innerHTML = D.achievements.map(function (a) {
      const won = state.badges.indexOf(a.id) >= 0;
      const icon = a.name.split(" ").slice(-1)[0];
      return '<div class="badge' + (won ? " won" : "") + '">' +
        '<span class="bicon">' + (won ? icon : "🔒") + "</span>" +
        a.name.replace(/\s*\S+\s*$/, "") +
        "<small>" + a.desc + "</small></div>";
    }).join("");
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById("rovanToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "rovanToast";
      el.setAttribute("role", "status");
      el.style.cssText = "position:fixed; bottom:22px; right:22px; z-index:9998; background:#241B3E; color:#fff;" +
        "padding:14px 22px; border-radius:999px; font-weight:900; box-shadow:0 10px 30px rgba(0,0,0,.3); transition:.3s; max-width:82vw;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = "0"; }, 2800);
  }
  window.RovanUI = { toast: toast };

  /* ============================================================
     📱 التنقل
     ============================================================ */
  function initNav() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("mobileClose");
    const moreBtn = document.getElementById("moreBtn");
    const moreMenu = document.getElementById("moreMenu");
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        moreMenu.classList.toggle("open");
        moreBtn.setAttribute("aria-expanded", moreMenu.classList.contains("open") ? "true" : "false");
      });
      document.addEventListener("click", function () { moreMenu.classList.remove("open"); });
    }
    if (!toggle || !menu) return;
    function closeMenu() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      if (closeBtn) closeBtn.focus();
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeMenu(); toggle.focus(); });
    menu.addEventListener("click", function (e) { if (e.target === menu) closeMenu(); });
    menu.querySelectorAll(".mlink").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  function initSoundToggle() {
    const btn = document.getElementById("soundToggle");
    if (!btn) return;
    function paint() {
      const on = window.RovanSpeech.getSettings().speech;
      btn.textContent = on ? "🔊" : "🔇";
      btn.setAttribute("aria-pressed", String(on));
    }
    btn.addEventListener("click", function () {
      const next = !window.RovanSpeech.getSettings().speech;
      window.RovanSpeech.setSetting("speech", next);
      if (!next) window.RovanSpeech.stop();
      paint();
      if (next) window.RovanSpeech.sfx.click();
    });
    paint();
  }

  /* روابط قديمة (#games إلخ) → الصفحات الجديدة */
  function initHashRedirect() {
    const MAP = {
      games: "games.html", academy: "academy.html", stories: "stories.html",
      videos: "tv.html", quran: "quran.html", hadith: "quran.html",
      prophets: "quran.html", progress: "progress.html", settings: "progress.html",
      search: "index.html"
    };
    const h = location.hash.replace("#", "");
    if (h && MAP[h] && !document.getElementById(h)) {
      const target = MAP[h];
      const page = location.pathname.split("/").pop() || "index.html";
      if (target !== page) {
        location.replace(target + "#" + (h === "settings" ? "settings" : "main"));
        return;
      }
      if (h === "hadith" || h === "prophets") {
        location.replace("quran.html#" + h);
      }
    }
  }

  /* ============================================================
     🔍 البحث الشامل
     ============================================================ */
  function initSearchOverlay() {
    const overlay = document.getElementById("searchOverlay");
    const openBtn = document.getElementById("searchOpen");
    const closeBtn = document.getElementById("searchClose");
    const input = document.getElementById("siteSearch");
    const btn = document.getElementById("searchBtn");
    if (!overlay || !openBtn) return;
    openBtn.addEventListener("click", function () {
      overlay.classList.add("open");
      if (input) input.focus();
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { overlay.classList.remove("open"); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("open"); });
    let timer = null;
    if (input) {
      input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(doSearch, 250);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); doSearch(); }
        if (e.key === "Escape") overlay.classList.remove("open");
      });
    }
    if (btn) btn.addEventListener("click", doSearch);
  }

  function doSearch() {
    const input = document.getElementById("siteSearch");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = '<p class="search-note">' + t("search.hint") + "</p>";
      return;
    }
    const hits = [];
    D.games.forEach(function (g) {
      if ((g.name + " " + g.desc + " " + g.category).indexOf(q) >= 0) {
        hits.push({ type: "🎮", label: g.name, href: "games.html#g=" + g.id });
      }
    });
    D.academy.forEach(function (l) {
      if ((l.title + " " + l.desc + " " + l.category).indexOf(q) >= 0) {
        hits.push({ type: "🎓", label: l.title, href: "academy.html#l=" + l.id });
      }
    });
    D.stories.forEach(function (s) {
      if ((s.title + " " + s.desc).indexOf(q) >= 0) {
        hits.push({ type: "📚", label: s.title, href: "stories.html#s=" + s.id });
      }
    });
    D.playlists.forEach(function (p) {
      if (p.title.indexOf(q) >= 0) hits.push({ type: "📺", label: p.title, href: p.url });
    });
    D.fallbackVideos.forEach(function (v) {
      if (v.title.indexOf(q) >= 0) hits.push({ type: "🎬", label: v.title, href: "tv.html#v=" + v.id });
    });
    D.surahs.forEach(function (s) {
      if (s.name.indexOf(q) >= 0 || s.text.indexOf(q) >= 0) {
        hits.push({ type: "📖", label: "سورة " + s.name, href: "quran.html#surahs" });
      }
    });
    D.hadiths.forEach(function (h) {
      if ((h.text + h.meaning).indexOf(q) >= 0) {
        hits.push({ type: "🕌", label: h.text.slice(0, 46) + "…", href: "quran.html#hadith" });
      }
    });
    D.prophets.forEach(function (p) {
      if ((p.name + p.story).indexOf(q) >= 0) {
        hits.push({ type: "⭐", label: p.name, href: "quran.html#prophets" });
      }
    });

    if (!hits.length) {
      results.innerHTML = '<div class="empty">' + t("search.noResults") + " 🐱</div>";
      return;
    }
    results.innerHTML = hits.slice(0, 12).map(function (h, i) {
      return '<button type="button" class="sresult" data-i="' + i + '">' +
        '<span class="stype">' + h.type + "</span><span>" + esc(h.label) + "</span></button>";
    }).join("");
    results.querySelectorAll(".sresult").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const h = hits[Number(btn.dataset.i)];
        window.RovanSpeech.sfx.click();
        if (h.href.indexOf("http") === 0) {
          window.open(h.href, "_blank", "noopener");
        } else {
          location.href = h.href;
        }
      });
    });
  }

  /* ============================================================
     🎬 Rovan TV — الفيديوهات
     ============================================================ */
  const CACHE_KEY = "rovan_videos_cache_v3";
  const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;
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
    try {
      return new Date(d).toLocaleDateString(I18N.lang === "en" ? "en-US" : "ar-EG",
        { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return d; }
  }

  function buildChips() {
    const box = document.getElementById("filters");
    if (!box) return;
    const chips = ['<button class="chip' + (activePL === "all" ? " active" : "") + '" data-pl="all">All 🐾</button>'];
    ALL_PLAYLISTS.forEach(function (p) {
      chips.push('<button class="chip' + (activePL === p.id ? " active" : "") + '" data-pl="' + p.id + '" title="' + esc(p.title) + '">' +
        plEmoji(p.title) + " " + p.title + "</button>");
    });
    box.innerHTML = chips.join("");
    box.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        window.RovanSpeech.sfx.click();
        activePL = chip.dataset.pl;
        buildChips();
        renderVideos();
      });
    });
  }

  function vcard(v, i) {
    return '<button type="button" class="vcard" data-video="' + v.id + '" data-title="' +
      esc(v.title) + '" style="animation:popIn .5s ' + (i * 0.05) + 's both">' +
      '<div class="thumb">' +
      '<div class="fallback" aria-hidden="true">🐱</div>' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="فيديو: ' +
      esc(v.title) + '" onload="this.style.opacity=1" loading="lazy" width="480" height="360">' +
      '<div class="play" aria-hidden="true"><span>▶</span></div></div>' +
      '<div class="vinfo"><h3>' + v.title + "</h3>" +
      '<div class="vmeta"><span class="tag">📅 ' + fmtDate(v.date) + "</span></div></div></button>";
  }

  function renderVideos() {
    const full = document.getElementById("videoGrid");
    const mini = document.getElementById("videoGridMini");
    const grid = full || mini;
    const banner = document.getElementById("plBanner");
    if (!grid) return;
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
        if (banner) {
          banner.innerHTML = '<a class="pl-banner" href="' + p.url + '" target="_blank" rel="noopener">▶ ' +
            esc(p.title) + " (" + p.count + ")</a>";
        }
      }
    } else if (banner) {
      banner.innerHTML = "";
    }
    if (mini) list = list.slice(0, 3);
    if (!list.length) {
      grid.innerHTML = '<div class="empty">' + t("empty.videos") + "</div>";
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
      if (!r.ok) throw new Error("unavailable");
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
      const grid = document.getElementById("videoGrid");
      if (grid && !grid.querySelector(".vcard")) {
        grid.innerHTML = '<div class="empty">تعذر تحميل الفيديوهات 😿 <a href="' + D.channel.url +
          '" target="_blank" rel="noopener" style="color:var(--purple);font-weight:900;">YouTube</a></div>';
      }
    }
  }

  function openVideo(id, title) {
    window.RovanSpeech.sfx.click();
    const player = document.getElementById("player");
    if (!player) { location.href = "tv.html#v=" + id; return; }
    player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0" title="' + esc(title) +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    const mt = document.getElementById("modalTitle");
    if (mt) mt.textContent = title;
    const fallback = document.getElementById("videoFallback");
    if (fallback) {
      fallback.innerHTML = '<a href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener">▶ YouTube</a>';
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
    if (window.RovanStories) window.RovanStories.stopNarration();
  }
  window.openGameModal = function () { openModal("gameModal"); };

  /* ============================================================
     🎮 مكتبة الألعاب
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
      grid.innerHTML = '<div class="empty">' + t("empty.games") + "</div>";
      return;
    }
    grid.innerHTML = list.map(function (g, i) {
      return '<button type="button" class="game-card gc' + ((i % 8) + 1) + '" data-game="' + g.id + '">' +
        '<span class="gicon" aria-hidden="true">' + g.icon + "</span>" +
        "<h3>" + esc(g.name) + "</h3><p>" + esc(g.desc) + "</p>" +
        '<div class="gmeta"><span class="ages">' + esc(g.category) + " • " + esc(g.difficulty) + "</span>" +
        '<span class="ages">' + esc(g.grade) + "</span></div></button>";
    }).join("");
    grid.querySelectorAll(".game-card").forEach(function (card) {
      card.addEventListener("click", function () { openGame(card.dataset.game); });
    });
  }

  function openGame(type) {
    window.RovanSpeech.sfx.click();
    const area = document.getElementById("gameArea");
    if (!area) { location.href = "games.html#g=" + type; return; }
    const g = D.games.filter(function (x) { return x.id === type; })[0];
    const gt = document.getElementById("gameTitle");
    if (gt) gt.textContent = g ? g.icon + " " + g.name : "🎮";
    const inst = document.getElementById("gameInstructions");
    if (inst) {
      inst.innerHTML = g && g.instructions
        ? '<div class="mascot-guide" style="margin:0 0 18px;"><div class="bubble">📋 ' + esc(g.instructions) + "</div></div>"
        : "";
    }
    openModal("gameModal");
    area.innerHTML = '<div class="empty">' + t("loading") + "</div>";
    try {
      window.RovanGames.start(area, type);
      if (window.RovanProgress) window.RovanProgress.setLastActivity("game", type, g ? g.name : type);
    } catch (e) {
      area.innerHTML = '<div class="empty">😕</div>';
    }
  }
  function closeGame() {
    closeModal("gameModal");
    const area = document.getElementById("gameArea");
    if (area) area.innerHTML = "";
  }

  /* ============================================================
     📖 القرآن والأحاديث والأنبياء
     ============================================================ */
  function renderSurahs() {
    const grid = document.getElementById("surahGrid");
    if (!grid) return;
    const hifz = state.hifz;
    grid.innerHTML = D.surahs.map(function (s) {
      const done = hifz.indexOf(s.name) >= 0;
      return '<div class="surah-card' + (done ? " done" : "") + '">' +
        '<div class="surah-head"><h3><span class="surah-badge">' + s.num + "</span> سورة " + s.name + "</h3>" +
        '<span aria-hidden="true" style="font-size:1.6rem;">' + (done ? "⭐" : "🌙") + "</span></div>" +
        '<div class="surah-text">' + s.text + "</div>" +
        '<div class="surah-actions">' +
        '<button type="button" class="btn-sm btn-done' + (done ? " done" : "") + '" data-hifz="' + s.name + '">' +
        (done ? "✅" : "⭐") + "</button>" +
        '<a class="btn-sm btn-link" href="https://www.youtube.com/@RovanTheCat/search?q=' +
        encodeURIComponent("سورة " + s.name) + '" target="_blank" rel="noopener">▶</a>' +
        "</div></div>";
    }).join("");
    grid.querySelectorAll("[data-hifz]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.RovanSpeech.sfx.click();
        window.RovanProgress.toggleHifz(btn.dataset.hifz);
      });
    });
    const fill = document.getElementById("hifzFill");
    const text = document.getElementById("hifzText");
    const count = state.hifz.length;
    if (fill) fill.style.width = (count / D.surahs.length * 100) + "%";
    if (text) {
      text.textContent =
        count === 0 ? "🌙 0 / " + D.surahs.length :
        count === D.surahs.length ? "🎉 " + count + " / " + D.surahs.length :
        "⭐ " + count + " / " + D.surahs.length;
    }
  }

  function renderHadiths() {
    const grid = document.getElementById("hadithGrid");
    if (!grid) return;
    grid.innerHTML = D.hadiths.map(function (h) {
      return '<article class="hadith-card">' +
        '<div class="hadith-text">« ' + h.text + " »</div>" +
        '<div class="hadith-meaning"><b>يعني إيه؟</b> ' + h.meaning + "</div>" +
        '<div class="hadith-src">📖 ' + h.src + "</div></article>";
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
     ⚙️ إعدادات الصوت
     ============================================================ */
  function renderSettings() {
    const box = document.getElementById("settingsBox");
    if (!box) return;
    const s = window.RovanSpeech.getSettings();
    box.innerHTML =
      '<div class="settings-grid">' +
      '<div class="setting-item"><span>🔊</span>' +
      '<button type="button" class="btn-sm ' + (s.speech ? "btn-done" : "btn-quiet") + '" id="setSpeech">' + (s.speech ? "ON ✅" : "OFF") + "</button></div>" +
      '<div class="setting-item"><span>🎵</span>' +
      '<button type="button" class="btn-sm ' + (s.sfx ? "btn-done" : "btn-quiet") + '" id="setSfx">' + (s.sfx ? "ON ✅" : "OFF") + "</button></div>" +
      '<div class="setting-item"><span>🔉 <b id="volLabel">' + Math.round(s.volume * 100) + "%</b></span>" +
      '<input type="range" id="setVolume" min="0" max="100" value="' + Math.round(s.volume * 100) + '" aria-label="Volume"></div>' +
      '<div class="setting-item"><span>🌍</span>' +
      '<select id="setLang" aria-label="Speech language"><option value="ar"' + (s.lang === "ar" ? " selected" : "") + ">العربية</option><option value=\"en\"" + (s.lang === "en" ? " selected" : "") + ">English</option></select></div>" +
      '<div class="setting-item"><span>🐢</span>' +
      '<button type="button" class="btn-sm ' + (s.slow ? "btn-done" : "btn-quiet") + '" id="setSlow">' + (s.slow ? "ON ✅" : "OFF") + "</button></div>" +
      '<div class="setting-item"><span>🎙️</span><small>' + window.RovanSpeech.describeVoices() + "</small></div>" +
      "</div>" +
      '<div style="text-align:center; margin-top:18px;">' +
      '<button type="button" class="btn-sm btn-quiet" id="setTest">🔊</button> ' +
      '<button type="button" class="btn-sm btn-link" id="setReset">🔄</button></div>';

    box.querySelector("#setSpeech").addEventListener("click", function () {
      window.RovanSpeech.setSetting("speech", !window.RovanSpeech.getSettings().speech);
      if (!window.RovanSpeech.getSettings().speech) window.RovanSpeech.stop();
      renderSettings();
    });
    box.querySelector("#setSfx").addEventListener("click", function () {
      window.RovanSpeech.setSetting("sfx", !window.RovanSpeech.getSettings().sfx);
      renderSettings();
    });
    box.querySelector("#setVolume").addEventListener("input", function (e) {
      window.RovanSpeech.setSetting("volume", Number(e.target.value) / 100);
      box.querySelector("#volLabel").textContent = e.target.value + "%";
    });
    box.querySelector("#setLang").addEventListener("change", function (e) {
      window.RovanSpeech.setSetting("lang", e.target.value);
    });
    box.querySelector("#setSlow").addEventListener("click", function () {
      window.RovanSpeech.setSetting("slow", !window.RovanSpeech.getSettings().slow);
      renderSettings();
    });
    box.querySelector("#setTest").addEventListener("click", function () {
      window.RovanSpeech.speak(window.RovanSpeech.getSettings().lang === "en"
        ? "Hello! I am Rovan!" : "أنا روفان! صوتي وصل ليك؟ 😺");
    });
    box.querySelector("#setReset").addEventListener("click", function () {
      window.RovanSpeech.resetSettings();
      renderSettings();
      toast("✅");
    });
  }

  /* ============================================================
     🐱 المساعد + روفان تتحدث
     ============================================================ */
  function initAssistant() {
    const btn = document.getElementById("guideBtn");
    const panel = document.getElementById("guidePanel");
    const body = document.getElementById("guideBody");
    const closeBtn = document.getElementById("guideClose");
    if (!btn || !panel || !body) return;

    function renderPanel() {
      const lv = levelInfo();
      const la = state.lastActivity;
      body.innerHTML =
        '<div class="mascot-guide" style="margin:0 0 14px;"><img src="images/avatar.jpg" alt="Rovan">' +
        '<div class="bubble">' + esc(window.RovanSpeech.phrase("welcome")) + "</div></div>" +
        '<div class="guide-menu">' +
        '<a class="btn btn-play" href="games.html">🎮</a>' +
        '<a class="btn btn-play" href="academy.html">🎓</a>' +
        '<a class="btn btn-play" href="stories.html">📚</a>' +
        '<a class="btn btn-play" href="index.html#daily">🎯</a>' +
        "</div>" +
        '<p class="device-note" style="background:var(--wash); color:var(--ink-soft);">⭐ ' + state.stars + " • " + lv.name + "</p>" +
        (la ? '<button type="button" class="btn-sm btn-done" data-last="1">↩ ' + esc(la.label) + "</button>" : "");
      const lastBtn = body.querySelector("[data-last]");
      if (lastBtn) {
        lastBtn.addEventListener("click", function () {
          window.RovanSpeech.sfx.click();
          panel.classList.remove("open");
          const la2 = state.lastActivity;
          if (la2.type === "game") openGame(la2.id);
          else if (la2.type === "lesson" && window.RovanAcademy) window.RovanAcademy.openLesson(la2.id);
          else if (la2.type === "story" && window.RovanStories) window.RovanStories.openStory(la2.id);
          else if (la2.type === "video") openVideo(la2.id, la2.label);
        });
      }
    }

    btn.addEventListener("click", function () {
      window.RovanSpeech.sfx.click();
      renderPanel();
      panel.classList.add("open");
      window.RovanSpeech.say("welcome");
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { panel.classList.remove("open"); });
    panel.addEventListener("click", function (e) { if (e.target === panel) panel.classList.remove("open"); });
  }

  function initTalk() {
    const box = document.getElementById("talkBox");
    if (!box) return;
    const phrases = [
      ["welcome", "👋 ترحيب"], ["suggest", "💡 اقتراح"], ["correct", "🎉 تشجيع"],
      ["win", "🏆 فوز"], ["hint", "🧠 تلميح"], ["storyStart", "📚 قصة"]
    ];
    box.innerHTML =
      '<div class="talk-stage">' +
      '<div class="talk-mascot"><img src="images/avatar.jpg" alt="Rovan"></div>' +
      '<div style="flex:1; min-width:250px;">' +
      '<div class="bubble" id="talkBubble">' + esc(window.RovanSpeech.phrase("welcome")) + "</div>" +
      '<div class="phrase-chips">' +
      phrases.map(function (p) {
        return '<button type="button" class="phrase-chip" data-phrase="' + p[0] + '">' + p[1] + "</button>";
      }).join("") +
      '<button type="button" class="phrase-chip" id="talkStop">🔇</button>' +
      "</div></div></div>";
    box.querySelectorAll("[data-phrase]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        const phrase = window.RovanSpeech.phrase(chip.dataset.phrase);
        document.getElementById("talkBubble").textContent = phrase;
        window.RovanSpeech.speak(phrase);
      });
    });
    const stop = box.querySelector("#talkStop");
    if (stop) stop.addEventListener("click", function () { window.RovanSpeech.stop(); });
  }

  /* ============================================================
     ✍️ نموذج طلب القصة
     ============================================================ */
  function initRequestForm() {
    const form = document.getElementById("requestForm");
    if (!form) return;
    const msg = document.getElementById("formMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = {
        childName: (form.querySelector("#childName") || {}).value || "",
        parentEmail: (form.querySelector("#parentEmail") || {}).value || "",
        lang: (form.querySelector("#storyLang") || {}).value || "ar",
        type: (form.querySelector("#storyType") || {}).value || "",
        age: (form.querySelector("#storyAge") || {}).value || "",
        length: (form.querySelector("#storyLength") || {}).value || "",
        idea: (form.querySelector("#storyIdea") || {}).value || "",
        at: new Date().toISOString()
      };
      if (!data.childName.trim() || !data.parentEmail.trim()) {
        showMsg(t("request.error") + " — " + t("request.required"), false);
        return;
      }
      const endpoint = D.requestEndpoint || "";
      const btn = form.querySelector("#requestSubmit");
      if (btn) { btn.disabled = true; btn.classList.add("is-loading"); btn.textContent = t("request.sending"); }

      function finish(success, remote) {
        if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); btn.textContent = t("request.submit"); }
        if (success && remote) {
          showMsg(t("request.success"), true);
          form.reset();
        } else {
          /* حفظ محلي حقيقي + نسخ التفاصيل — بدون ادعاء إرسال */
          try {
            const q = JSON.parse(localStorage.getItem("rovan_requests_v1") || "[]");
            q.push(data);
            localStorage.setItem("rovan_requests_v1", JSON.stringify(q));
          } catch (err) { /* ok */ }
          showMsg(t("request.savedLocal"), true);
          const copyBtn = document.createElement("button");
          copyBtn.type = "button";
          copyBtn.className = "btn-sm btn-quiet";
          copyBtn.textContent = t("request.copy");
          copyBtn.addEventListener("click", function () {
            const summary = "طلب قصة — روفان\nالاسم: " + data.childName + "\nالبريد: " + data.parentEmail +
              "\nاللغة: " + data.lang + "\nالنوع: " + data.type + "\nالعمر: " + data.age +
              "\nالطول: " + data.length + "\nالفكرة: " + (data.idea || "-");
            if (navigator.clipboard) {
              navigator.clipboard.writeText(summary).then(function () {
                copyBtn.textContent = t("request.copied");
              });
            }
          });
          if (msg) { msg.appendChild(document.createElement("br")); msg.appendChild(copyBtn); }
        }
      }

      if (endpoint) {
        /* إرسال حقيقي إلى نقطة الاستلام المهيأة (FormSubmit/Formspree...) */
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (r.ok) finish(true, true);
          else finish(false, false);
        }).catch(function () { finish(false, false); });
      } else {
        setTimeout(function () { finish(false, false); }, 350);
      }
    });

    function showMsg(text, ok) {
      if (!msg) return;
      msg.className = "form-msg show " + (ok ? "success" : "error");
      msg.textContent = text;
    }
  }

  /* ============================================================
     🔀 روابط داخلية عميقة (games.html#g=...)
     ============================================================ */
  function initDeepLinks() {
    const params = location.hash.replace("#", "");
    if (params.indexOf("g=") === 0) {
      const id = params.slice(2);
      setTimeout(function () { openGame(id); }, 400);
    } else if (params.indexOf("l=") === 0 && window.RovanAcademy) {
      setTimeout(function () { window.RovanAcademy.openLesson(params.slice(2)); }, 400);
    } else if (params.indexOf("s=") === 0 && window.RovanStories) {
      setTimeout(function () { window.RovanStories.openStory(params.slice(2)); }, 400);
    } else if (params.indexOf("v=") === 0) {
      const id = params.slice(2);
      const v = D.fallbackVideos.filter(function (x) { return x.id === id; })[0];
      setTimeout(function () { openVideo(id, v ? v.title : "🎬"); }, 400);
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
      if (e.key === "Escape") {
        closeVideo(); closeGame();
        const ov = document.getElementById("searchOverlay");
        if (ov) ov.classList.remove("open");
      }
    });
  }

  function initFooterBits() {
    const resetBtn = document.getElementById("resetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (window.confirm("🤔")) {
          window.RovanProgress.reset();
          toast("🔄");
        }
      });
    }
  }

  /* ---------- التشغيل ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (I18N) I18N.apply();
    initChrome();
    initHashRedirect();
    initModals();
    initReveal();
    initFooterBits();
    initAssistant();
    initTalk();
    initRequestForm();
    renderGames();
    renderSurahs();
    renderHadiths();
    renderProphets();
    renderProgress();
    renderSettings();
    checkBadges();
    loadVideos();
    if (window.RovanAcademy) {
      window.RovanAcademy.renderAcademy();
      window.RovanAcademy.renderDaily();
    }
    if (window.RovanStories) window.RovanStories.renderStories();
    initDeepLinks();
  });
})();
