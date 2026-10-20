/* ============================================================
   🎮 القطة روفان — محركات الألعاب (games.js)
   كل لعبة: بداية ونهاية + نجاح/خطأ واضح + تعليمات + إعادة لعب
   + نطق اختياري عبر RovanSpeech — فشل الصوت لا يوقف اللعبة
   ============================================================ */
window.RovanConfetti = function (n) {
  "use strict";
  const box = document.getElementById("confettiBox");
  if (!box) return;
  const colors = ["#FF7A5C", "#7C5CFF", "#2ED3B7", "#FFC93C", "#FF8FAB", "#5CC8FF"];
  for (let i = 0; i < (n || 50); i++) {
    const c = document.createElement("div");
    c.className = "confetti-piece";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[i % colors.length];
    c.style.animationDelay = Math.random() * 0.9 + "s";
    if (i % 3 === 0) c.style.borderRadius = "50%";
    box.appendChild(c);
    setTimeout(function () { c.remove(); }, 4200);
  }
};

window.RovanGames = (function () {
  "use strict";
  const D = window.ROVAN;
  const S = window.RovanSpeech;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function award(stars, note) {
    if (window.RovanProgress) window.RovanProgress.addStars(stars, note);
  }
  function markPlayed(id) {
    if (window.RovanProgress) window.RovanProgress.markGamePlayed(id);
  }
  function say(group) { S.say(group); }

  function winScreen(area, icon, title, msg, stars, restart) {
    window.RovanConfetti(stars >= 5 ? 70 : 30);
    S.sfx.win();
    say("win");
    award(stars, title);
    area.innerHTML =
      '<div class="win-box">' +
      '<span class="big">' + icon + "</span>" +
      "<h3>" + esc(title) + "</h3>" +
      "<p>" + esc(msg) + "</p>" +
      '<p style="font-size:1.3rem;">+' + stars + " نجمة ⭐</p>" +
      '<button type="button" class="btn btn-play btn-big" id="gameRestart">🔄 العب تاني</button>' +
      "</div>";
    const btn = area.querySelector("#gameRestart");
    if (btn) {
      btn.addEventListener("click", restart);
      btn.focus();
    }
  }

  /* ============================================================
     🎨 التلوين (مع حفظ اللوحة كصورة)
     ============================================================ */
  const PALETTE = ["#FF5A6E", "#FF7A5C", "#FFC93C", "#6BCB77", "#2ED3B7", "#5CC8FF", "#7C5CFF", "#FF8FAB", "#8D6E63", "#2B2140"];
  const COLOR_NAMES = ["أحمر", "برتقالي", "أصفر", "أخضر", "أزرق مخضرّ", "أزرق", "بنفسجي", "وردي", "بني", "أسود"];
  let currentColor = "#FF5A6E";
  let currentColorName = "أحمر";

  function startColoring(area) {
    area.innerHTML =
      '<p class="search-note" style="margin-bottom:14px; font-size:1.15rem;">🎨 اختار لون ودوس على أي حتة في الصورة تلوّنها!</p>' +
      '<div class="paint-tools" id="paintTools">' +
      PALETTE.map(function (c, i) {
        return '<button type="button" class="color-dot' + (i === 0 ? " selected" : "") +
          '" style="background:' + c + '" data-color="' + c + '" data-name="' + COLOR_NAMES[i] +
          '" aria-label="لون ' + COLOR_NAMES[i] + '"></button>';
      }).join("") +
      "</div>" +
      '<div style="text-align:center; margin-bottom:16px;">' +
      '<button type="button" class="btn-sm btn-done" id="paintRandom">🌈 ألوان عشوائية</button> ' +
      '<button type="button" class="btn-sm btn-link" id="paintReset">🧽 مسح الكل</button> ' +
      '<button type="button" class="btn-sm btn-quiet" id="paintSave">💾 احفظ اللوحة</button> ' +
      '<button type="button" class="btn-sm btn-done" id="paintFinish">✅ أنهيت اللوحة (+3 نجوم)</button>' +
      "</div>" +
      '<svg class="paint-svg paint" id="paintSvg" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="لوحة تلوين القطة روفان">' +
      '<rect x="0" y="0" width="640" height="430" fill="#FFFFFF"/>' +
      '<rect class="fillable" x="0" y="0" width="640" height="300" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="السماء"/>' +
      '<circle class="fillable" cx="90" cy="80" r="46" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="الشمس"/>' +
      '<ellipse class="fillable" cx="480" cy="80" rx="60" ry="30" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="سحابة"/>' +
      '<ellipse class="fillable" cx="530" cy="95" rx="42" ry="22" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="سحابة صغيرة"/>' +
      '<path class="fillable" d="M0,300 Q160,230 320,300 T640,300 L640,430 L0,430 Z" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="التراب"/>' +
      '<polygon class="fillable" points="250,180 275,120 300,180" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="أذن روفان اليسرى"/>' +
      '<polygon class="fillable" points="340,180 365,120 390,180" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="أذن روفان اليمنى"/>' +
      '<circle class="fillable" cx="320" cy="235" r="72" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="وش روفان"/>' +
      '<circle cx="295" cy="222" r="9" fill="#2B2140"/><circle cx="345" cy="222" r="9" fill="#2B2140"/>' +
      '<polygon class="fillable" points="320,240 310,252 330,252" fill="#fff" stroke="#2B2140" stroke-width="3" tabindex="0" role="button" aria-label="منخار روفان"/>' +
      '<path d="M300,262 Q320,272 340,262" stroke="#2B2140" stroke-width="4" fill="none"/>' +
      '<ellipse class="fillable" cx="320" cy="360" rx="85" ry="58" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جسم روفان"/>' +
      '<path class="fillable" d="M405,360 Q470,330 455,270 Q445,240 415,255" fill="none" stroke="#2B2140" stroke-width="16" stroke-linecap="round" tabindex="0" role="button" aria-label="ديل روفان"/>' +
      '<line x1="215" y1="235" x2="175" y2="222" stroke="#2B2140" stroke-width="3"/><line x1="215" y1="248" x2="175" y2="252" stroke="#2B2140" stroke-width="3"/>' +
      '<line x1="425" y1="235" x2="465" y2="222" stroke="#2B2140" stroke-width="3"/><line x1="425" y1="248" x2="465" y2="252" stroke="#2B2140" stroke-width="3"/>' +
      '<line x1="120" y1="330" x2="120" y2="430" stroke="#2B2140" stroke-width="6"/>' +
      '<circle class="fillable" cx="120" cy="315" r="18" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="زهرة"/>' +
      '<circle class="fillable" cx="95" cy="335" r="18" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="بتلة"/>' +
      '<circle class="fillable" cx="145" cy="335" r="18" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="بتلة"/>' +
      '<circle class="fillable" cx="120" cy="355" r="18" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="بتلة"/>' +
      '<circle class="fillable" cx="120" cy="333" r="11" fill="#fff" stroke="#2B2140" stroke-width="3" tabindex="0" role="button" aria-label="قلب الزهرة"/>' +
      '<ellipse class="fillable" cx="545" cy="330" rx="34" ry="22" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جناح فراشة"/>' +
      '<ellipse class="fillable" cx="590" cy="330" rx="34" ry="22" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جناح فراشة"/>' +
      '<ellipse class="fillable" cx="545" cy="375" rx="30" ry="20" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جناح فراشة"/>' +
      '<ellipse class="fillable" cx="590" cy="375" rx="30" ry="20" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جناح فراشة"/>' +
      '<ellipse class="fillable" cx="567" cy="352" rx="14" ry="26" fill="#fff" stroke="#2B2140" stroke-width="4" tabindex="0" role="button" aria-label="جسم الفراشة"/>' +
      "</svg>";

    markPlayed("coloring");

    area.querySelectorAll(".color-dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        currentColor = dot.dataset.color;
        currentColorName = dot.dataset.name;
        area.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("selected"); });
        dot.classList.add("selected");
        S.sfx.click();
        S.speak(currentColorName); /* 🔊 نطق اسم اللون */
      });
    });

    function paint(el) {
      el.setAttribute("fill", currentColor);
      S.sfx.click();
    }
    area.querySelectorAll("#paintSvg .fillable").forEach(function (el) {
      el.addEventListener("click", function () { paint(el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); paint(el); }
      });
    });

    area.querySelector("#paintRandom").addEventListener("click", function () {
      area.querySelectorAll("#paintSvg .fillable").forEach(function (el) {
        el.setAttribute("fill", PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      });
      S.sfx.correct();
    });
    area.querySelector("#paintReset").addEventListener("click", function () {
      area.querySelectorAll("#paintSvg .fillable").forEach(function (el) { el.setAttribute("fill", "#fff"); });
      S.sfx.click();
    });
    area.querySelector("#paintSave").addEventListener("click", function () {
      S.sfx.click();
      downloadPainting(area);
    });
    area.querySelector("#paintFinish").addEventListener("click", function () {
      winScreen(area, "🎨🐱", "لوحتك تحفة!", "روفان أعجبها اللون! جرّب تلوينها بألوان تانية.", 3,
        function () { startColoring(area); });
    });
  }

  function downloadPainting(area) {
    try {
      const svg = document.getElementById("paintSvg");
      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = 1280; canvas.height = 860;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1280, 860);
        ctx.drawImage(img, 0, 0, 1280, 860);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (b) {
          if (!b) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = "لوحة-القطة-روفان.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          if (window.RovanUI) window.RovanUI.toast("💾 اتحفظت اللوحة! شاركها مع أهلك 🎨");
        }, "image/png");
      };
      img.onerror = function () {
        if (window.RovanUI) window.RovanUI.toast("حصلت مشكلة في الحفظ 😿 جرّب تاني!");
      };
      img.src = url;
    } catch (e) {
      if (window.RovanUI) window.RovanUI.toast("الحفظ غير متاح على هذا الجهاز 😿");
    }
  }

  /* ============================================================
     🧠 الذاكرة (مستويات صعوبة + مؤقت + نطق)
     ============================================================ */
  let memState = null;
  let memTimer = null;

  function buildPairs(setName, level) {
    const set = D.memorySets[setName] || D.memorySets.animals;
    let pairs = set.pairs.slice();
    if (level === "easy") pairs = pairs.slice(0, 3);
    if (level === "hard") {
      const extra = Object.keys(D.memorySets)
        .filter(function (k) { return k !== setName; })
        .reduce(function (acc, k) { return acc.concat(D.memorySets[k].pairs); }, [])
        .slice(0, 2);
      pairs = pairs.concat(extra);
    }
    return pairs;
  }

  function startMemory(area, setName, level) {
    setName = setName || "animals";
    level = level || "medium";

    /* شاشة اختيار المستوى — وقف هنا حتى يختار المستخدم */
    if (!memState || memState.chooseLevel) {
      area.innerHTML =
        '<div class="filters" style="margin-bottom:16px;">' +
        '<button type="button" class="chip" data-memlevel="easy">😊 سهل (3 أزواج)</button>' +
        '<button type="button" class="chip active" data-memlevel="medium">🙂 متوسط (6 أزواج)</button>' +
        '<button type="button" class="chip" data-memlevel="hard">😈 صعب (8 أزواج + مؤقت)</button>' +
        "</div>";
      area.querySelectorAll("[data-memlevel]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          S.sfx.click();
          memState = { chooseLevel: false };
          startMemory(area, setName, chip.dataset.memlevel);
        });
      });
      return;
    }

    const pairs = buildPairs(setName, level);
    const cards = [];
    pairs.forEach(function (p, i) {
      cards.push({ key: i, display: p[0] });
      cards.push({ key: i, display: p[1] });
    });
    const shuffled = shuffle(cards);
    memState = {
      flipped: [], matched: 0, moves: 0, lock: false,
      setName: setName, level: level, seconds: 0, chooseLevel: false
    };

    const levelLabel = { easy: "سهل", medium: "متوسط", hard: "صعب" }[level] || level;
    area.innerHTML =
      '<div class="filters" style="margin-bottom:14px;">' +
      '<button type="button" class="chip" id="memChangeLevel">⚙️ تغيير المستوى</button>' +
      Object.keys(D.memorySets).map(function (k) {
        return '<button type="button" class="chip' + (k === setName ? " active" : "") + '" data-set="' + k + '">' + D.memorySets[k].name + "</button>";
      }).join("") +
      "</div>" +
      '<div class="mem-stats" id="memStats">المستوى: ' + levelLabel + " • المحاولات: 0 • الوقت: 0ث • الازواج: 0/" + pairs.length + "</div>" +
      '<div class="mem-grid" id="memGrid" role="group" aria-label="كروت الذاكرة">' +
      shuffled.map(function (c, i) {
        return '<button type="button" class="mcard" data-key="' + c.key + '" data-i="' + i + '" data-display="' + esc(c.display) + '" aria-label="كرت رقم ' + (i + 1) + '">' +
          '<div class="mcard-inner">' +
          '<div class="mface mback" aria-hidden="true">🐱</div>' +
          '<div class="mface mfront">' + esc(c.display) + "</div>" +
          "</div></button>";
      }).join("") +
      "</div>";

    markPlayed("memory");
    clearInterval(memTimer);
    memTimer = setInterval(function () {
      if (!memState) { clearInterval(memTimer); return; }
      memState.seconds++;
      const stats = document.getElementById("memStats");
      if (stats) {
        stats.textContent = "المستوى: " + levelLabel + " • المحاولات: " + memState.moves +
          " • الوقت: " + memState.seconds + "ث • الازواج: " + memState.matched + "/" + pairs.length;
      }
    }, 1000);

    area.querySelector("#memChangeLevel").addEventListener("click", function () {
      S.sfx.click();
      clearInterval(memTimer);
      memState = { chooseLevel: true };
      startMemory(area, setName, level);
    });
    area.querySelectorAll("[data-set]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        S.sfx.click();
        clearInterval(memTimer);
        memState = { chooseLevel: false };
        startMemory(area, chip.dataset.set, level);
      });
    });
    area.querySelectorAll(".mcard").forEach(function (card) {
      card.addEventListener("click", function () { flipCard(card, pairs.length); });
    });
  }

  function flipCard(el, totalPairs) {
    if (!memState || memState.lock || el.classList.contains("flipped") || el.classList.contains("matched")) return;
    S.sfx.click();
    el.classList.add("flipped");
    S.speak(el.dataset.display.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, "")); /* 🔊 نطق الكرت */
    memState.flipped.push(el);
    if (memState.flipped.length === 2) {
      memState.moves++;
      memState.lock = true;
      const pair = memState.flipped;
      const a = pair[0], b = pair[1];
      if (a.dataset.key === b.dataset.key) {
        a.classList.add("matched"); b.classList.add("matched");
        a.disabled = true; b.disabled = true;
        memState.matched++;
        memState.flipped = [];
        memState.lock = false;
        S.sfx.correct();
        if (memState.matched === totalPairs) {
          clearInterval(memTimer);
          const moves = memState.moves, seconds = memState.seconds;
          const setName = memState.setName, level = memState.level;
          const stars = level === "hard" ? 8 : level === "medium" ? 5 : 3;
          setTimeout(function () {
            winScreen(document.getElementById("gameArea"), "🧠🎉", "أحسنت يا بطل!",
              "خلصت في " + moves + " محاولة و" + seconds + " ثانية!", stars,
              function () { memState = { chooseLevel: false }; startMemory(document.getElementById("gameArea"), setName, level); });
          }, 450);
        }
      } else {
        setTimeout(function () {
          pair.forEach(function (c) {
            c.classList.remove("flipped");
            c.classList.add("shake");
            setTimeout(function () { c.classList.remove("shake"); }, 400);
          });
          memState.flipped = [];
          memState.lock = false;
          S.sfx.wrong();
        }, 800);
      }
    }
  }

  /* ============================================================
     ✅ محرك اختيار من متعدد (مع نطق)
     ============================================================ */
  function runChoice(area, cfg) {
    const questions = shuffle(cfg.bank).slice(0, cfg.rounds || 8);
    const state = { idx: 0, score: 0 };

    function renderQ() {
      const q = questions[state.idx];
      if (!q) {
        const pct = state.score / questions.length;
        const stars = Math.max(1, Math.round(state.score * (cfg.starsPerCorrect || 1) + (pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1)));
        winScreen(area, pct >= 0.8 ? "🏆🐱" : pct >= 0.5 ? "🎉🐱" : "💪🐱",
          "النتيجة: " + state.score + " من " + questions.length,
          pct >= 0.8 ? "واااو! أنت عبقري زي روفان!" : pct >= 0.5 ? "أداء جميل! جرّب تاني تجيب الدرجة الكاملة 💪" : "مفيش مشكلة، جرّب تاني — روفان معاك!",
          stars,
          function () { runChoice(area, cfg); });
        return;
      }
      const starsShown = "⭐".repeat(Math.min(3, state.score)) + "☆".repeat(Math.max(0, 3 - Math.min(3, state.score)));
      area.innerHTML =
        '<div class="quiz-top">' +
        "<span>السؤال " + (state.idx + 1) + " / " + questions.length +
        (q.tag ? ' <small style="color:#8D7BA8">(' + esc(q.tag) + ")</small>" : "") + "</span>" +
        '<span class="stars" aria-hidden="true">' + starsShown + "</span>" +
        "<span>النتيجة: " + state.score + " ✅</span>" +
        "</div>" +
        '<div class="quiz-q">' + esc(q.q) +
        (q.display ? '<div class="emoji-row">' + q.display + "</div>" : q.sound ? '<div class="emoji-row">' + q.sound + "</div>" : "") +
        "</div>" +
        '<div class="quiz-opts" id="quizOpts" role="group" aria-label="الاختيارات">' +
        q.opts.map(function (o, i) {
          return '<button type="button" class="qopt" data-i="' + i + '">' + esc(o) + "</button>";
        }).join("") +
        "</div>";
      if (q.speak && window.speakLang && q.speakLang) window.speakLang(q.speak, q.speakLang, 0.8);
      else S.speak(q.q);
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          S.speak(btn.textContent.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, ""));
          answer(Number(btn.dataset.i));
        });
      });
      const first = area.querySelector(".qopt");
      if (first) first.focus();
    }

    function answer(i) {
      const q = questions[state.idx];
      const opts = area.querySelectorAll(".qopt");
      opts.forEach(function (o) { o.disabled = true; });
      if (i === q.a) {
        opts[i].classList.add("correct");
        state.score++;
        S.sfx.correct();
        say("correct");
        setTimeout(function () { state.idx++; renderQ(); }, 800);
      } else {
        opts[i].classList.add("wrong");
        opts[q.a].classList.add("correct");
        S.sfx.wrong();
        say("wrong");
        S.speak(opts[q.a].textContent.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, "")); /* نطق الإجابة الصح */
        setTimeout(function () { state.idx++; renderQ(); }, 1500);
      }
    }

    renderQ();
    markPlayed(cfg.gameId);
  }

  /* ============================================================
     🧩 الألغاز (تلميحات + شرح الإجابة)
     ============================================================ */
  function startRiddles(area) {
    const items = shuffle(D.riddles).slice(0, 5);
    const state = { idx: 0, score: 0, hinted: false };

    function renderQ() {
      const r = items[state.idx];
      if (!r) {
        winScreen(area, "🧩🎉", "النتيجة: " + state.score + " من " + items.length,
          "ألغاز صعبة وجميلة! روفان معجبة بيك.", Math.max(2, state.score),
          function () { startRiddles(area); });
        return;
      }
      area.innerHTML =
        '<div class="quiz-top"><span>اللغز ' + (state.idx + 1) + " / " + items.length + "</span>" +
        "<span>النتيجة: " + state.score + " ✅</span></div>" +
        '<div class="game-q">🧩 ' + esc(r.q) + "</div>" +
        '<div id="hintBox" class="search-note" style="margin-bottom:12px;"></div>' +
        '<div style="text-align:center; margin-bottom:14px;"><button type="button" class="btn-sm btn-quiet" id="hintBtn">💡 تلميح</button></div>' +
        '<div class="quiz-opts">' + r.opts.map(function (o, i) {
          return '<button type="button" class="qopt" data-i="' + i + '">' + esc(o) + "</button>";
        }).join("") + "</div>";
      S.speak(r.q);
      area.querySelector("#hintBtn").addEventListener("click", function () {
        S.sfx.click();
        state.hinted = true;
        area.querySelector("#hintBox").textContent = "💡 التلميح: " + r.hint;
        S.speak(r.hint);
      });
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.i);
          const opts = area.querySelectorAll(".qopt");
          opts.forEach(function (o) { o.disabled = true; });
          if (i === r.a) {
            btn.classList.add("correct");
            state.score++;
            S.sfx.correct();
            say("correct");
          } else {
            btn.classList.add("wrong");
            opts[r.a].classList.add("correct");
            S.sfx.wrong();
            say("wrong");
          }
          /* شرح الإجابة التعليمي دائمًا */
          area.querySelector("#hintBox").innerHTML = "📖 " + esc(r.explain);
          S.speak(r.explain);
          setTimeout(function () { state.idx++; renderQ(); }, 1800);
        });
      });
    }
    renderQ();
    markPlayed("riddles");
  }

  /* ============================================================
     🔤 ترتيب الحروف
     ============================================================ */
  function startLetterOrder(area) {
    const words = shuffle(D.letterOrder).slice(0, 5);
    const state = { idx: 0, score: 0, built: [] };

    function renderQ() {
      const w = words[state.idx];
      if (!w) {
        winScreen(area, "🔤🎉", "النتيجة: " + state.score + " من " + words.length,
          "ترتيب الحروف بقى سهل عليك!", Math.max(2, state.score),
          function () { startLetterOrder(area); });
        return;
      }
      state.built = [];
      const tiles = shuffle(w.letters);
      area.innerHTML =
        '<div class="quiz-top"><span>رتب حروف الكلمة — ' + (state.idx + 1) + " / " + words.length + "</span>" +
        "<span>النتيجة: " + state.score + " ✅</span></div>" +
        '<div class="game-q"><div class="emoji-row">' + w.emoji + "</div>رتب حروف الكلمة دي:</div>" +
        '<div class="letter-build" id="letterBuild" aria-live="polite"></div>' +
        '<div class="letter-tiles" id="letterTiles">' +
        tiles.map(function (ch, i) {
          return '<button type="button" class="letter-tile" data-ch="' + esc(ch) + '" data-i="' + i + '" aria-label="حرف ' + esc(ch) + '">' + esc(ch) + "</button>";
        }).join("") +
        "</div>" +
        '<div style="text-align:center; margin-top:16px;">' +
        '<button type="button" class="btn-sm btn-quiet" id="orderUndo">↩️ تراجع</button> ' +
        '<button type="button" class="btn-sm btn-quiet" id="orderSpeak">🔊 اسمع الكلمة</button>' +
        "</div>";

      area.querySelector("#orderSpeak").addEventListener("click", function () {
        S.sfx.click();
        S.speak(w.word.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, ""));
      });
      area.querySelector("#orderUndo").addEventListener("click", function () {
        S.sfx.click();
        const last = state.built.pop();
        if (last) {
          const tile = area.querySelector('.letter-tile[data-i="' + last.i + '"]');
          if (tile) tile.disabled = false;
          area.querySelector("#letterBuild").textContent = state.built.map(function (b) { return b.ch; }).join(" ");
        }
      });
      area.querySelectorAll(".letter-tile").forEach(function (tile) {
        tile.addEventListener("click", function () {
          tile.disabled = true;
          state.built.push({ ch: tile.dataset.ch, i: tile.dataset.i });
          S.sfx.click();
          S.speak(tile.dataset.ch);
          area.querySelector("#letterBuild").textContent = state.built.map(function (b) { return b.ch; }).join(" ");
          if (state.built.length === w.letters.length) {
            const built = state.built.map(function (b) { return b.ch; }).join("");
            const correct = w.letters.join("");
            if (built === correct) {
              state.score++;
              S.sfx.correct();
              S.speak(w.word.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, ""));
              if (window.RovanUI) window.RovanUI.toast("✅ صح! " + w.word);
              setTimeout(function () { state.idx++; renderQ(); }, 900);
            } else {
              S.sfx.wrong();
              say("wrong");
              if (window.RovanUI) window.RovanUI.toast("قريب! ترتيب الحروف الصح: " + w.letters.join(""));
              setTimeout(function () { renderQ(); }, 1400);
            }
          }
        });
      });
    }
    renderQ();
    markPlayed("letter-order");
  }

  /* ============================================================
     🔍 اكتشف المختلف
     ============================================================ */
  function startOddOne(area) {
    const rounds = shuffle(D.oddOneOut).slice(0, 6);
    const state = { idx: 0, score: 0 };

    function renderQ() {
      const r = rounds[state.idx];
      if (!r) {
        winScreen(area, "🔍🎉", "النتيجة: " + state.score + " من " + rounds.length,
          "عينك ذكية جدًا! اكتشفت المختلف في كل مرة.", Math.max(2, state.score),
          function () { startOddOne(area); });
        return;
      }
      area.innerHTML =
        '<div class="quiz-top"><span>اكتشف المختلف — ' + (state.idx + 1) + " / " + rounds.length + "</span>" +
        "<span>النتيجة: " + state.score + " ✅</span></div>" +
        '<div class="game-q">' + esc(r.say) + "</div>" +
        '<div class="quiz-opts" style="grid-template-columns:repeat(' + r.items.length + ',1fr);">' +
        r.items.map(function (it, i) {
          return '<button type="button" class="qopt" data-i="' + i + '" style="font-size:2.4rem;">' + it + "</button>";
        }).join("") +
        "</div>";
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.i);
          const opts = area.querySelectorAll(".qopt");
          opts.forEach(function (o) { o.disabled = true; });
          if (i === r.odd) {
            btn.classList.add("correct");
            state.score++;
            S.sfx.correct();
            say("correct");
          } else {
            btn.classList.add("wrong");
            opts[r.odd].classList.add("correct");
            S.sfx.wrong();
            say("wrong");
          }
          setTimeout(function () { state.idx++; renderQ(); }, 1000);
        });
      });
    }
    renderQ();
    markPlayed("odd-one");
  }

  /* ---------- مولد أسئلة العد ---------- */
  function countingBank() {
    const emojis = ["⭐", "🐟", "🎈", "🌸", "🍎", "🦋", "🌻", "🐠"];
    const bank = [];
    for (let r = 0; r < 8; r++) {
      const n = Math.floor(Math.random() * 8) + 1;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const optsSet = {};
      optsSet[n] = true;
      while (Object.keys(optsSet).length < 3) {
        const cand = Math.max(1, Math.min(10, n + Math.floor(Math.random() * 5) - 2));
        optsSet[cand] = true;
      }
      const opts = shuffle(Object.keys(optsSet).map(Number));
      bank.push({
        q: "كم مرة شفت دي؟",
        display: emoji.repeat(n),
        opts: opts.map(String),
        a: opts.indexOf(n),
        tag: "عد"
      });
    }
    return bank;
  }

  /* ============================================================
     🌟 محركات الحزمة الضخمة (المناهج + الحروف بـ3 لغات)
     ============================================================ */
  const CV = (window.ROVAN_CONTENT || {}).curriculum || {};
  const LG = (window.ROVAN_CONTENT || {}).letters || {};

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function genMathAdd() {
    const bank = [];
    for (let r = 0; r < 8; r++) {
      const a = randInt(1, 5), b = randInt(1, 5);
      const opts = shuffle([a + b, Math.max(1, a + b - 1), a + b + 1].map(String));
      bank.push({ q: "كم يساوي؟", display: "🍎".repeat(a) + " + " + "🍎".repeat(b), opts: opts, a: opts.indexOf(String(a + b)), tag: "جمع" });
    }
    return bank;
  }
  function genMathSub() {
    const bank = [];
    for (let r = 0; r < 8; r++) {
      const a = randInt(3, 10), b = randInt(1, a - 1);
      const opts = shuffle([a - b, Math.max(0, a - b - 1), a - b + 1].map(String));
      bank.push({ q: "اطرح واختار الناتج", display: "⭐".repeat(a) + " − " + "⭐".repeat(b), opts: opts, a: opts.indexOf(String(a - b)), tag: "طرح" });
    }
    return bank;
  }
  function genCompare() {
    const bank = [];
    for (let r = 0; r < 8; r++) {
      const a = randInt(1, 20), b = randInt(1, 20);
      const ans = a > b ? "أكبر" : a < b ? "أصغر" : "يساوي";
      bank.push({ q: "قارن: " + a + " و " + b, display: "⚖️", opts: shuffle(["أكبر", "أصغر", "يساوي"]), a: 0, tag: "مقارنة" });
      const last = bank[bank.length - 1];
      last.a = last.opts.indexOf(ans);
    }
    return bank;
  }
  function genMathQuiz() {
    const lv = pick([["KG1", "أرقام صغيرة"], ["KG2", "حتى 10"], ["G1", "حتى 20"], ["G2", "حتى 100"]]);
    const cfg = (CV.mathLevels || {})[lv[0]] || { max: 10, ops: ["+"] };
    const bank = [];
    for (let r = 0; r < 8; r++) {
      const op = pick(cfg.ops);
      let a, b, ans, txt;
      if (op === "×") {
        a = randInt(2, 5); b = randInt(2, 5); ans = a * b; txt = a + " × " + b;
      } else if (op === "-") {
        a = randInt(2, cfg.max); b = randInt(1, a); ans = a - b; txt = a + " − " + b;
      } else {
        a = randInt(1, cfg.max); b = randInt(1, cfg.max); ans = a + b; txt = a + " + " + b;
      }
      const opts = shuffle([ans, Math.max(0, ans - 1), ans + 2].map(String));
      bank.push({ q: "احسب: " + txt, opts: opts, a: opts.indexOf(String(ans)), tag: "رياضيات " + lv[1] });
    }
    return bank;
  }
  function genShapesPick() {
    return (CV.shapes || []).map(function (s) {
      const others = shuffle((CV.shapes || []).filter(function (x) { return x.name !== s.name; })).slice(0, 2).map(function (x) { return x.emoji + " " + x.name; });
      const opts = shuffle([s.emoji + " " + s.name].concat(others));
      return { q: "أين الشكل: " + s.name + "؟", opts: opts, a: opts.indexOf(s.emoji + " " + s.name), tag: "أشكال" };
    }).slice(0, 8);
  }
  function genColorsPick() {
    return shuffle((CV.colors || []).map(function (c) {
      const others = shuffle((CV.colors || []).filter(function (x) { return x.name !== c.name; })).slice(0, 2).map(function (x) { return x.name; });
      const opts = shuffle([c.name].concat(others));
      return { q: "اختر اللون: " + c.name, display: c.emoji, opts: opts, a: opts.indexOf(c.name), tag: "ألوان" };
    })).slice(0, 8);
  }
  function genBodyParts() {
    return shuffle((CV.body || []).map(function (p) {
      const others = shuffle((CV.body || []).filter(function (x) { return x.name !== p.name; })).slice(0, 2).map(function (x) { return x.name; });
      const opts = shuffle([p.name].concat(others));
      return { q: "أين " + p.name + "؟", opts: opts, a: opts.indexOf(p.name), tag: "جسم الإنسان" };
    })).slice(0, 8);
  }
  function genAnimalSound() {
    return shuffle((CV.animalSounds || []).map(function (s) {
      const others = shuffle((CV.animalSounds || []).filter(function (x) { return x.animal !== s.animal; })).slice(0, 2).map(function (x) { return x.animal; });
      const opts = shuffle([s.animal].concat(others));
      return { q: "من صاحب صوت: " + s.sound + "؟", display: "🔊", opts: opts, a: opts.indexOf(s.animal), tag: "أصوات الحيوانات" };
    })).slice(0, 8);
  }
  function genScience() {
    const sc = CV.science || {};
    const keys = Object.keys(sc);
    let pool = [];
    keys.forEach(function (k) {
      (sc[k] || []).forEach(function (q) {
        pool.push({ q: q.q, opts: shuffle(q.c.slice()), a: 0, tag: "علوم " + k });
        const last = pool[pool.length - 1];
        last.a = last.opts.indexOf(q.c[q.a]);
      });
    });
    return shuffle(pool).slice(0, 8);
  }
  function genPhonicsEn() {
    return shuffle((LG.en || []).map(function (it) {
      const others = shuffle((LG.en || []).filter(function (x) { return x.l !== it.l; })).slice(0, 2).map(function (x) { return x.l; });
      const opts = shuffle([it.l].concat(others));
      return { q: "استمع واختر الحرف الصحيح 🔊", display: it.emoji + " " + it.word, opts: opts, a: opts.indexOf(it.l), tag: "English", speak: it.l + ". " + it.word + ".", speakLang: "en-US" };
    })).slice(0, 8);
  }
  function genLettersFr() {
    return shuffle((LG.fr || []).map(function (it) {
      const others = shuffle((LG.fr || []).filter(function (x) { return x.l !== it.l; })).slice(0, 2).map(function (x) { return x.l; });
      const opts = shuffle([it.l].concat(others));
      return { q: "استمع واختر الحرف 🔊", display: it.emoji + " " + it.word, opts: opts, a: opts.indexOf(it.l), tag: "Français", speak: it.l + " comme " + it.word + ".", speakLang: "fr-FR" };
    })).slice(0, 8);
  }

  /* ---------- كوّن الكلمة ---------- */
  function runSpell(area) {
    const words = shuffle(CV.spell || []).slice(0, 6);
    const state = { idx: 0, score: 0, picked: [] };
    function render() {
      const w = words[state.idx];
      if (!w) {
        const stars = Math.max(1, Math.round(state.score * 1.2 + 1));
        winScreen(area, "🧩🐱", "النتيجة: " + state.score + " من " + words.length,
          state.score >= words.length * 0.8 ? "بطل الكلمات! روفان فخور بيك!" : "كويس! جرّب تاني تجيب الكلمات كلها 💪",
          stars, function () { runSpell(area); });
        return;
      }
      const shuffledLetters = shuffle(w.letters.slice());
      state.picked = [];
      area.innerHTML =
        '<div class="quiz-top"><span>الكلمة ' + (state.idx + 1) + " / " + words.length + '</span><span>النتيجة: ' + state.score + " ✅</span></div>" +
        '<div class="quiz-q">كوّن كلمة: ' + w.word + '<div class="emoji-row">' + w.emoji + "</div></div>" +
        '<div class="spell-slots" id="spellSlots">' + w.letters.map(function () { return '<span class="spell-slot">_</span>'; }).join("") + "</div>" +
        '<div class="quiz-opts" id="spellTiles">' + shuffledLetters.map(function (ch, i) {
          return '<button type="button" class="qopt spell-tile" data-ch="' + ch + '">' + ch + "</button>";
        }).join("") + "</div>";
      S.speak(w.word);
      area.querySelectorAll(".spell-tile").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const ch = btn.getAttribute("data-ch");
          const need = w.letters[state.picked.length];
          if (ch === need) {
            state.picked.push(ch);
            btn.disabled = true; btn.classList.add("correct");
            S.sfx.correct();
            const slots = area.querySelectorAll(".spell-slot");
            if (slots[state.picked.length - 1]) slots[state.picked.length - 1].textContent = ch;
            if (state.picked.length === w.letters.length) {
              state.score++;
              say("correct");
              S.speak(w.word);
              setTimeout(function () { state.idx++; render(); }, 900);
            }
          } else {
            btn.classList.add("wrong");
            S.sfx.wrong();
            setTimeout(function () { btn.classList.remove("wrong"); }, 500);
          }
        });
      });
    }
    render();
    markPlayed("spell-word");
  }

  /* ---------- رتّب الأرقام ---------- */
  function runNumbersOrder(area) {
    const state = { idx: 0, score: 0 };
    function render() {
      if (state.idx >= 6) {
        const stars = Math.max(1, Math.round(state.score * 1.2 + 1));
        winScreen(area, "🔢🐱", "النتيجة: " + state.score + " من 6",
          state.score >= 5 ? "متسلسل الأرقام الأول!" : "جرّب تاني — الترتيب سهل لما تركز 💪",
          stars, function () { runNumbersOrder(area); });
        return;
      }
      const start = randInt(0, 20);
      const nums = [start, start + 1, start + 2, start + 3, start + 4];
      const shuffled = shuffle(nums.slice());
      let nextI = 0;
      area.innerHTML =
        '<div class="quiz-top"><span>الجولة ' + (state.idx + 1) + ' / 6</span><span>النتيجة: ' + state.score + " ✅</span></div>" +
        '<div class="quiz-q">اضغط الأرقام بالترتيب من الأصغر للأكبر ⬆️</div>' +
        '<div class="quiz-opts">' + shuffled.map(function (n) {
          return '<button type="button" class="qopt" data-n="' + n + '">' + n + "</button>";
        }).join("") + "</div>";
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const n = Number(btn.getAttribute("data-n"));
          if (n === nums[nextI]) {
            btn.classList.add("correct"); btn.disabled = true;
            S.sfx.correct();
            nextI++;
            if (nextI === nums.length) {
              state.score++;
              setTimeout(function () { state.idx++; render(); }, 700);
            }
          } else {
            btn.classList.add("wrong");
            S.sfx.wrong();
            setTimeout(function () { btn.classList.remove("wrong"); }, 450);
          }
        });
      });
    }
    render();
    markPlayed("numbers-order");
  }

  /* ---------- بوابة الحروف بـ3 لغات ---------- */
  function runLettersHub(area) {
    const tabs = [["ar", "العربي 🇸🇦"], ["en", "الإنجليزي 🇬🇧"], ["fr", "الفرنسي 🇫🇷"]];
    area.innerHTML =
      '<div class="letters-hub">' +
      '<div class="hub-tabs" role="tablist">' +
      tabs.map(function (t, i) { return '<button type="button" class="hub-tab' + (i === 0 ? " active" : "") + '" data-lang="' + t[0] + '" role="tab">' + t[1] + "</button>"; }).join("") +
      "</div>" +
      '<div class="hub-grid" id="hubGrid"></div>' +
      '<p class="hub-hint">اضغط على أي حرف عشان تسمعه 🔊 (النطق العربي والإنجليزي والفرنسي)</p></div>';
    function fill(lang) {
      const grid = area.querySelector("#hubGrid");
      const list = (LG[lang] || []);
      const sayFn = lang === "ar"
        ? function (it) { return "حرف " + it.name + ". " + it.l + ". " + it.word; }
        : lang === "en" ? function (it) { return it.l + ". " + it.word + "."; }
          : function (it) { return it.l + " comme " + it.word + "."; };
      const speechLang = lang === "ar" ? "ar-EG" : lang === "en" ? "en-US" : "fr-FR";
      grid.innerHTML = list.map(function (it, i) {
        return '<button type="button" class="hub-letter" data-i="' + i + '">' +
          '<span class="hl">' + it.l + "</span>" + '<span class="he">' + (it.emoji || "") + "</span>" +
          "<small>" + (lang === "ar" ? it.name : it.word) + "</small></button>";
      }).join("");
      grid.querySelectorAll(".hub-letter").forEach(function (b) {
        b.addEventListener("click", function () {
          const it = list[+b.getAttribute("data-i")];
          if (window.speakLang) window.speakLang(sayFn(it), speechLang, 0.8);
          else S.speak(sayFn(it));
          grid.querySelectorAll(".hub-letter").forEach(function (x) { x.classList.remove("speaking"); });
          b.classList.add("speaking");
        });
      });
    }
    area.querySelectorAll(".hub-tab").forEach(function (t) {
      t.addEventListener("click", function () {
        area.querySelectorAll(".hub-tab").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        fill(t.getAttribute("data-lang"));
      });
    });
    fill("ar");
    markPlayed("letters-hub");
  }

  /* ---------- واجهة فتح الألعاب ---------- */
  function start(area, type) {
    if (type === "coloring") return startColoring(area);
    if (type === "memory") { memState = { chooseLevel: true }; return startMemory(area, "animals", "medium"); }
    if (type === "quiz") return runChoice(area, { gameId: "quiz", bank: D.quizBank, rounds: 10, starsPerCorrect: 1 });
    if (type === "animals") return runChoice(area, { gameId: "animals", bank: D.animalBank, rounds: 8, starsPerCorrect: 1 });
    if (type === "counting") return runChoice(area, { gameId: "counting", bank: countingBank(), rounds: 8, starsPerCorrect: 1 });
    if (type === "letters") return runChoice(area, { gameId: "letters", bank: D.letterBank, rounds: 8, starsPerCorrect: 1 });
    if (type === "shapes") return runChoice(area, { gameId: "shapes", bank: D.shapesBank, rounds: 8, starsPerCorrect: 1 });
    if (type === "words") return runChoice(area, { gameId: "words", bank: D.wordsBank, rounds: 8, starsPerCorrect: 1 });
    if (type === "riddles") return startRiddles(area);
    if (type === "letter-order") return startLetterOrder(area);
    if (type === "odd-one") return startOddOne(area);
    /* 🌟 الحزمة الضخمة */
    if (type === "math-add") return runChoice(area, { gameId: "math-add", bank: genMathAdd(), rounds: 8, starsPerCorrect: 1 });
    if (type === "math-sub") return runChoice(area, { gameId: "math-sub", bank: genMathSub(), rounds: 8, starsPerCorrect: 1 });
    if (type === "compare") return runChoice(area, { gameId: "compare", bank: genCompare(), rounds: 8, starsPerCorrect: 1 });
    if (type === "math-quiz") return runChoice(area, { gameId: "math-quiz", bank: genMathQuiz(), rounds: 8, starsPerCorrect: 1 });
    if (type === "shapes-pick") return runChoice(area, { gameId: "shapes-pick", bank: genShapesPick(), rounds: 8, starsPerCorrect: 1 });
    if (type === "colors-pick") return runChoice(area, { gameId: "colors-pick", bank: genColorsPick(), rounds: 8, starsPerCorrect: 1 });
    if (type === "body-parts") return runChoice(area, { gameId: "body-parts", bank: genBodyParts(), rounds: 8, starsPerCorrect: 1 });
    if (type === "animal-sound") return runChoice(area, { gameId: "animal-sound", bank: genAnimalSound(), rounds: 8, starsPerCorrect: 1 });
    if (type === "science-quiz") return runChoice(area, { gameId: "science-quiz", bank: genScience(), rounds: 8, starsPerCorrect: 1 });
    if (type === "phonics-en") return runChoice(area, { gameId: "phonics-en", bank: genPhonicsEn(), rounds: 8, starsPerCorrect: 1 });
    if (type === "letters-fr") return runChoice(area, { gameId: "letters-fr", bank: genLettersFr(), rounds: 8, starsPerCorrect: 1 });
    if (type === "spell-word") return runSpell(area);
    if (type === "numbers-order") return runNumbersOrder(area);
    if (type === "letters-hub") return runLettersHub(area);
    area.innerHTML = '<div class="empty">العبة دي مش متاحة دلوقتي 😿</div>';
    return false;
  }

  return { start: start };
})();
