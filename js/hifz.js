/* ============================================================
   js/hifz.js — الحفظ الصوتي (everyayah) + بوابة الحروف + قوائم بوب
   ============================================================ */
(function () {
  "use strict";
  var C = window.ROVAN_CONTENT || {};
  var D = window.ROVAN;
  var HIFZ = C.hifz || {};
  var currentAudio = null;
  var stopFlag = false;

  /* ---------- أدوات صوت ---------- */
  function stopAudio() {
    stopFlag = true;
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
  }

  function ayahFile(surahNum, ayahNum, folder) {
    var s = String(surahNum); while (s.length < 3) s = "0" + s;
    var a = String(ayahNum); while (a.length < 3) a = "0" + a;
    return (HIFZ.audioBase || "https://everyayah.com/data/") + folder + "/" + s + a + ".mp3";
  }

  function splitAyahs(text) {
    var parts = text.split(/﴿[^﴾]*﴾/);
    if (parts.length && parts[parts.length - 1].trim() === "") parts.pop();
    return parts.map(function (p) { return p.trim(); });
  }

  /* نطق حر بكلغة */
  window.speakLang = function (text, lang, rate) {
    try {
      if (!("speechSynthesis" in window)) return false;
      if (window.RovanSound && window.RovanSound.enabled === false) return false;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "ar-EG";
      u.rate = rate || 0.85;
      var vs = speechSynthesis.getVoices();
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang && vs[i].lang.indexOf(u.lang.slice(0, 2)) === 0) { u.voice = vs[i]; break; }
      }
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };

  /* ============================================================
     🎧 مشغّل الحفظ — آية-بآية مع التكرار
     ============================================================ */
  window.HifzBox = {
    render: function (container) {
      if (!container || !D) return;
      var surahs = D.surahs || [];
      var reciters = HIFZ.reciters || [];
      var html = '<div class="hifz-wrap">' +
        '<div class="hifz-controls">' +
        '<label>🎙️ القارئ: <select id="hifzReciter">' +
        reciters.map(function (r) { return '<option value="' + r.folder + '">' + r.name + "</option>"; }).join("") +
        "</select></label>" +
        '<label>🔁 التكرار: <select id="hifzRepeat"><option value="1">مرة</option><option value="3" selected>3 مرات</option><option value="5">5 مرات</option></select></label>' +
        '<button type="button" class="btn btn-primary" id="hifzStop">⏹️ إيقاف</button>' +
        "</div>" +
        '<div class="hifz-surger" role="list">' +
        surahs.map(function (s, i) {
          return '<button type="button" class="hifz-surah-card" role="listitem" data-si="' + i + '">' +
            "<span>📖</span><b>سورة " + s.name + "</b><small>" + splitAyahs(s.text).length + " آيات</small></button>";
        }).join("") +
        "</div>" +
        '<div class="hifz-ayahs" id="hifzAyahs" aria-live="polite"></div>' +
        '<div class="hifz-yt">' +
        "<h3>🎬 دروس حفظ مرئية (منشورة على يوتيوب)</h3>" +
        '<div class="hifz-pl">' + (HIFZ.playlists || []).map(function (p) {
          return '<button type="button" class="hifz-pl-card" data-plid="' + p.id + '" data-title="' + p.title + '">' +
            "<span>" + p.icon + "</span><b>" + p.title + "</b><small>" + p.desc + "</small></button>";
        }).join("") + "</div></div>" +
        '<div class="hifz-tips">' + "<h3>💡 نصائح الحفظ</h3><ul>" +
        (HIFZ.tips || []).map(function (t) { return "<li>" + t + "</li>"; }).join("") +
        "</ul></div></div>";
      container.innerHTML = html;

      var self = this;
      container.querySelectorAll(".hifz-surah-card").forEach(function (b) {
        b.addEventListener("click", function () {
          container.querySelectorAll(".hifz-surah-card").forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          self.showAyahs(surahs[+b.getAttribute("data-si")]);
        });
      });
      container.querySelectorAll(".hifz-pl-card").forEach(function (b) {
        b.addEventListener("click", function () {
          window.openPlaylistPopup(b.getAttribute("data-plid"), b.getAttribute("data-title"));
        });
      });
      var stopBtn = container.querySelector("#hifzStop");
      if (stopBtn) stopBtn.addEventListener("click", function () { stopAudio(); });
      // تشغيل أول سورة افتراضيًا
      if (surahs[0]) this.showAyahs(surahs[0]);
    },

    showAyahs: function (surah) {
      var box = document.getElementById("hifzAyahs");
      if (!box) return;
      stopAudio();
      var ayahs = splitAyahs(surah.text);
      box.innerHTML = '<h3>🎧 استمع واحفظ — سورة ' + surah.name + "</h3>" +
        '<button type="button" class="btn btn-green" id="hifzPlayAll">▶️ شغّل السورة كلها (مع التكرار)</button> ' +
        '<button type="button" class="btn btn-primary" id="hifzRepeatMode">🔁 كرّر معي (اسمع ثم احفظ)</button>' +
        '<div class="ayah-list">' + ayahs.map(function (t, i) {
          return '<div class="ayah-row" id="ayahRow' + i + '">' +
            '<span class="ayah-num">' + (i + 1) + "</span>" +
            '<p class="ayah-text">' + t + "</p>" +
            '<button type="button" class="ayah-play" data-i="' + i + '" aria-label="استمع للآية ' + (i + 1) + '">▶️</button></div>';
        }).join("") + "</div>";
      var self = this, folder = this.reciterFolder();
      box.querySelectorAll(".ayah-play").forEach(function (b) {
        b.addEventListener("click", function () {
          stopAudio(); stopFlag = false;
          self.playAyahFile(surah, +b.getAttribute("data-i"), folder, +document.getElementById("hifzRepeat").value);
        });
      });
      var pa = document.getElementById("hifzPlayAll");
      if (pa) pa.addEventListener("click", function () {
        stopAudio(); stopFlag = false;
        self.playRange(surah, 0, ayahs.length - 1, folder, +document.getElementById("hifzRepeat").value, false);
      });
      var rm = document.getElementById("hifzRepeatMode");
      if (rm) rm.addEventListener("click", function () {
        stopAudio(); stopFlag = false;
        self.playRange(surah, 0, ayahs.length - 1, folder, 1, true);
      });
    },

    reciterFolder: function () {
      var sel = document.getElementById("hifzReciter");
      return sel ? sel.value : ((HIFZ.reciters && HIFZ.reciters[0]) ? HIFZ.reciters[0].folder : "Alafasy_128kbps");
    },

    highlight: function (i) {
      document.querySelectorAll(".ayah-row").forEach(function (r) { r.classList.remove("current"); });
      var row = document.getElementById("ayahRow" + i);
      if (row) { row.classList.add("current"); }
    },

    playAyahFile: function (surah, i, folder, times) {
      var self = this;
      times = times || 1;
      var count = 0;
      var url = ayahFile(surah.num, i + 1, folder);
      function once() {
        if (stopFlag) return;
        var a = new Audio(url);
        currentAudio = a;
        a.onended = function () {
          count++;
          if (count < times && !stopFlag) once();
        };
        a.onerror = function () {
          var box = document.getElementById("hifzAyahs");
          if (box && !box.querySelector(".audio-err")) {
            var p = document.createElement("div");
            p.className = "audio-err";
            p.textContent = "⚠️ تعذّر تشغيل الصوت — تأكد من اتصال الإنترنت (الصوت من everyayah.com).";
            box.insertBefore(p, box.firstChild);
          }
        };
        self.highlight(i);
        a.play().catch(function () {});
      }
      once();
    },

    playRange: function (surah, from, to, folder, times, teachMode) {
      var self = this, i = from;
      function next() {
        if (stopFlag || i > to) return;
        self.playAyahFile(surah, i, folder, times);
        // انتظر انتهاء الآية ثم مهلة الحفظ
        var wait = setInterval(function () {
          if (stopFlag) { clearInterval(wait); return; }
          if (!currentAudio || currentAudio.ended || currentAudio.paused && !currentAudio.src) {
            clearInterval(wait);
            if (teachMode && !stopFlag && i <= to) {
              window.showTalk ? window.showTalk("🕐 دورك! اقرأ الآية " + (i + 1) + " بصوت عالٍ") : null;
            }
            setTimeout(function () { i++; next(); }, teachMode ? 2600 : 400);
          }
        }, 300);
      }
      next();
    }
  };

  /* ============================================================
     🗣️ بوابة الحروف بثلاث لغات
     ============================================================ */
  window.LettersHub = {
    open: function () {
      var L = C.letters || {};
      var tabs = [["ar", "العربي 🇸🇦"], ["en", "الإنجليزي 🇬🇧"], ["fr", "الفرنسي 🇫🇷"]];
      var html = '<div class="letters-hub">' +
        '<div class="hub-tabs" role="tablist">' +
        tabs.map(function (t, i) {
          return '<button type="button" class="hub-tab' + (i === 0 ? " active" : "") + '" data-lang="' + t[0] + '" role="tab">' + t[1] + "</button>";
        }).join("") + "</div>" +
        '<div class="hub-grid" id="hubGrid"></div>' +
        '<p class="hub-hint">اضغط على أي حرف عشان تسمعه 🔊</p></div>';
      window.openGameModal && window.openGameModal("🗣️ نطق الحروف بثلاث لغات", html);
      this.fill("ar");
      var self = this;
      document.querySelectorAll(".hub-tab").forEach(function (t) {
        t.addEventListener("click", function () {
          document.querySelectorAll(".hub-tab").forEach(function (x) { x.classList.remove("active"); });
          t.classList.add("active");
          self.fill(t.getAttribute("data-lang"));
        });
      });
    },
    fill: function (lang) {
      var grid = document.getElementById("hubGrid");
      if (!grid) return;
      var L = C.letters || {};
      var list = L[lang] || [];
      var sayFn = lang === "ar"
        ? function (it) { return "حرف " + it.name + ". " + it.l + ". " + it.word; }
        : lang === "en"
          ? function (it) { return it.l + ". " + it.word + "."; }
          : function (it) { return it.l + " comme " + it.word + "."; };
      grid.innerHTML = list.map(function (it, i) {
        return '<button type="button" class="hub-letter" data-i="' + i + '">' +
          '<span class="hl">' + it.l + "</span>" +
          '<span class="he">' + (it.emoji || "") + "</span>" +
          '<small>' + (lang === "ar" ? it.name : it.word) + "</small></button>";
      }).join("");
      var speechLang = lang === "ar" ? "ar-EG" : lang === "en" ? "en-US" : "fr-FR";
      grid.querySelectorAll(".hub-letter").forEach(function (b) {
        b.addEventListener("click", function () {
          var it = list[+b.getAttribute("data-i")];
          window.speakLang(sayFn(it), speechLang, 0.8);
          grid.querySelectorAll(".hub-letter").forEach(function (x) { x.classList.remove("speaking"); });
          b.classList.add("speaking");
        });
      });
    }
  };

  /* ============================================================
     📂 قوائم التشغيل — نافذة بوب منسقة
     ============================================================ */
  function getModal() {
    var modal = document.getElementById("gameModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "gameModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<div class="modal-box light"><div class="modal-title">' +
      '<h2 id="gmTitle">📺</h2><button type="button" class="modal-x" id="gmX" aria-label="إغلاق">✕</button></div>' +
      '<div class="modal-body" id="gmBody"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.id === "gmX") {
        var b = document.getElementById("gmBody");
        if (b) b.innerHTML = "";
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      }
    });
    return modal;
  }

  window.openPlaylistPopup = function (plid, title) {
    var modal = getModal();
    var gmT = document.getElementById("gmTitle");
    var gmB = document.getElementById("gmBody");
    if (gmT) gmT.textContent = "📺 " + (title || "قائمة تشغيل");
    if (gmB) {
      gmB.innerHTML = '<div class="pl-popup">' +
        '<iframe class="pl-frame" src="https://www.youtube-nocookie.com/embed/videoseries?list=' + plid + '" ' +
        'title="' + (title || "قائمة تشغيل") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen loading="lazy"></iframe>' +
        '<a class="btn btn-yt" target="_blank" rel="noopener" href="https://www.youtube.com/playlist?list=' + plid + '">افتح في يوتيوب ↗</a>' +
        "</div>";
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  };

  /* نافذة قوائم الحفظ المرتبة */
  window.openHifzMenu = function () {
    var modal = getModal();
    var gmT = document.getElementById("gmTitle");
    var gmB = document.getElementById("gmBody");
    if (gmT) gmT.textContent = "🎧 دروس الحفظ المنشورة";
    if (gmB) {
      gmB.innerHTML = '<div class="pl-menu">' + (HIFZ.playlists || []).map(function (p) {
        return '<button type="button" class="pl-menu-card" data-plid="' + p.id + '" data-title="' + p.title + '">' +
          "<span>" + p.icon + "</span><div><b>" + p.title + "</b><small>" + p.desc + "</small></div></button>";
      }).join("") + "</div>" +
      '<h3 class="pl-sub">🎬 فيديوهات تكرار مميزة</h3><div class="pl-menu">' +
      (HIFZ.videos || []).map(function (v) {
        return '<button type="button" class="pl-menu-card" data-vid="' + v.id + '" data-title="' + v.title + '">' +
          "<span>▶️</span><div><b>" + v.title + "</b><small>" + (v.ch || "") + "</small></div></button>";
      }).join("") + "</div>";
      gmB.querySelectorAll(".pl-menu-card").forEach(function (b) {
        b.addEventListener("click", function () {
          var plid = b.getAttribute("data-plid"), vid = b.getAttribute("data-vid");
          if (plid) window.openPlaylistPopup(plid, b.getAttribute("data-title"));
          else {
            gmB.innerHTML = '<div class="pl-popup"><iframe class="pl-frame" src="https://www.youtube-nocookie.com/embed/' + vid + '" ' +
              'title="' + b.getAttribute("data-title") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
          }
        });
      });
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  };
})();
