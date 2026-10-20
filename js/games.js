/* ============================================================
   🎮 القطة روفان — محركات الألعاب (games.js)
   منطق الألعاب منفصل عن الواجهة — كل لعبة فيها تعليمات
   ونقاط وتصحيح فوري وإعادة لعب
   ============================================================ */
window.RovanSound = (function () {
  "use strict";
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }
  function beep(freq, dur, type, when) {
    if (window.RovanSound && !window.RovanSound.enabled) return;
    try {
      const a = ensure();
      if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = 0.09;
      o.connect(g); g.connect(a.destination);
      const t = a.currentTime + (when || 0);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* الصوت اختياري — لا نوقف اللعبة */ }
  }
  return {
    enabled: true,
    click: function () { beep(560, 0.07, "triangle"); },
    correct: function () { beep(660, 0.12); beep(880, 0.14, "sine", 0.09); beep(1170, 0.2, "sine", 0.2); },
    wrong: function () { beep(200, 0.18, "square"); beep(150, 0.24, "square", 0.11); },
    win: function () { [523, 659, 784, 1046, 1318, 1568].forEach(function (f, i) { beep(f, 0.2, "triangle", i * 0.11); }); }
  };
})();

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
  const sound = window.RovanSound;

  /* ---------- مساعدات ---------- */
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
  function winScreen(area, icon, title, msg, stars, restart) {
    window.RovanConfetti(stars >= 5 ? 70 : 30);
    sound.win();
    award(stars, title);
    area.innerHTML =
      '<div class="win-box">' +
      '<span class="big">' + icon + "</span>" +
      "<h3>" + esc(title) + "</h3>" +
      "<p>" + esc(msg) + "</p>" +
      '<p style="font-size:1.3rem;">+' + stars + " نجمة ⭐</p>" +
      '<button class="btn btn-play btn-big" id="gameRestart">🔄 العب تاني</button>' +
      "</div>";
    const btn = area.querySelector("#gameRestart");
    if (btn) btn.addEventListener("click", restart);
    btn && btn.focus();
  }

  /* ============================================================
     🎨 لعبة التلوين
     ============================================================ */
  const PALETTE = ["#FF5A6E", "#FF7A5C", "#FFC93C", "#6BCB77", "#2ED3B7", "#5CC8FF", "#7C5CFF", "#FF8FAB", "#8D6E63", "#2B2140"];
  let currentColor = "#FF5A6E";

  function startColoring(area) {
    area.innerHTML =
      '<p class="search-note" style="margin-bottom:14px; font-size:1.15rem;">🎨 اختار لون ودوس على أي حتة في الصورة تلوّنها!</p>' +
      '<div class="paint-tools" id="paintTools">' +
      PALETTE.map(function (c, i) {
        return '<button type="button" class="color-dot' + (i === 0 ? " selected" : "") +
          '" style="background:' + c + '" data-color="' + c + '" aria-label="لون ' + c + '"></button>';
      }).join("") +
      "</div>" +
      '<div style="text-align:center; margin-bottom:16px;">' +
      '<button class="btn-sm btn-done" id="paintRandom">🌈 ألوان عشوائية</button> ' +
      '<button class="btn-sm btn-link" id="paintReset">🧽 مسح الكل</button> ' +
      '<button class="btn-sm btn-quiet" id="paintFinish">✅ أنهيت اللوحة (+3 نجوم)</button>' +
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
        area.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("selected"); });
        dot.classList.add("selected");
        sound.click();
      });
    });

    function paint(el) {
      el.setAttribute("fill", currentColor);
      sound.click();
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
      sound.correct();
    });
    area.querySelector("#paintReset").addEventListener("click", function () {
      area.querySelectorAll("#paintSvg .fillable").forEach(function (el) { el.setAttribute("fill", "#fff"); });
      sound.click();
    });
    area.querySelector("#paintFinish").addEventListener("click", function () {
      winScreen(area, "🎨🐱", "لوحتك تحفة!", "روفان أعجبها اللون! جرّب تلوينها بألوان تانية.", 3,
        function () { startColoring(area); });
    });
  }

  /* ============================================================
     🧠 لعبة الذاكرة
     ============================================================ */
  let memState = null;

  function startMemory(area, setName) {
    setName = setName || "animals";
    const set = D.memorySets[setName] || D.memorySets.animals;
    const cards = [];
    set.pairs.forEach(function (p, i) {
      cards.push({ key: i, display: p[0], label: p[0] });
      cards.push({ key: i, display: p[1], label: p[1] });
    });
    const shuffled = shuffle(cards);
    memState = { flipped: [], matched: 0, moves: 0, lock: false, setName: setName };

    area.innerHTML =
      '<div class="filters" style="margin-bottom:14px;">' +
      Object.keys(D.memorySets).map(function (k) {
        return '<button class="chip' + (k === setName ? " active" : "") + '" data-set="' + k + '">' + D.memorySets[k].name + "</button>";
      }).join("") +
      "</div>" +
      '<div class="mem-stats" id="memStats">المحاولات: 0 • الازواج: 0/6</div>' +
      '<div class="mem-grid" id="memGrid" role="group" aria-label="كروت الذاكرة">' +
      shuffled.map(function (c, i) {
        return '<button type="button" class="mcard" data-key="' + c.key + '" data-i="' + i + '" aria-label="كرت رقم ' + (i + 1) + '">' +
          '<div class="mcard-inner">' +
          '<div class="mface mback" aria-hidden="true">🐱</div>' +
          '<div class="mface mfront">' + esc(c.display) + "</div>" +
          "</div></button>";
      }).join("") +
      "</div>";

    markPlayed("memory");

    area.querySelectorAll("[data-set]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        sound.click();
        startMemory(area, chip.dataset.set);
      });
    });
    area.querySelectorAll(".mcard").forEach(function (card) {
      card.addEventListener("click", function () { flipCard(card); });
    });
  }

  function flipCard(el) {
    if (!memState || memState.lock || el.classList.contains("flipped") || el.classList.contains("matched")) return;
    sound.click();
    el.classList.add("flipped");
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
        sound.correct();
        if (memState.matched === 6) {
          const moves = memState.moves, setName = memState.setName;
          const stars = Math.max(3, 8 - Math.floor(moves / 4));
          setTimeout(function () {
            winScreen(document.getElementById("gameArea"), "🧠🎉", "أحسنت يا بطل!",
              "خلصت اللعبة في " + moves + " محاولة — روفان فخورة بيك!", stars,
              function () { startMemory(document.getElementById("gameArea"), setName); });
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
          sound.wrong();
        }, 750);
      }
      const stats = document.getElementById("memStats");
      if (stats) stats.textContent = "المحاولات: " + memState.moves + " • الازواج: " + memState.matched + "/6";
    }
  }

  /* ============================================================
     ✅ محرك اختيار من متعدد (مشترك بين 5 ألعاب)
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
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () { answer(Number(btn.dataset.i)); });
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
        sound.correct();
        setTimeout(function () { state.idx++; renderQ(); }, 750);
      } else {
        opts[i].classList.add("wrong");
        opts[q.a].classList.add("correct"); /* صح موسومة باللون + الشكل — مش اللون لوحده */
        sound.wrong();
        setTimeout(function () { state.idx++; renderQ(); }, 1350);
      }
    }

    renderQ();
    markPlayed(cfg.gameId);
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

  /* ---------- واجهة فتح الألعاب ---------- */
  const TITLES = {};
  D.games.forEach(function (g) { TITLES[g.id] = g.icon + " " + g.name; });

  function start(area, type) {
    if (type === "coloring") return startColoring(area);
    if (type === "memory") return startMemory(area, "animals");
    if (type === "quiz") return runChoice(area, {
      gameId: "quiz", bank: D.quizBank, rounds: 10, starsPerCorrect: 1
    });
    if (type === "animals") return runChoice(area, {
      gameId: "animals", bank: D.animalBank, rounds: 8, starsPerCorrect: 1
    });
    if (type === "counting") return runChoice(area, {
      gameId: "counting", bank: countingBank(), rounds: 8, starsPerCorrect: 1
    });
    if (type === "letters") return runChoice(area, {
      gameId: "letters", bank: D.letterBank, rounds: 8, starsPerCorrect: 1
    });
    if (type === "shapes") return runChoice(area, {
      gameId: "shapes", bank: D.shapesBank, rounds: 8, starsPerCorrect: 1
    });
    if (type === "words") return runChoice(area, {
      gameId: "words", bank: D.wordsBank, rounds: 8, starsPerCorrect: 1
    });
    area.innerHTML = '<div class="empty">العبة دي مش متاحة دلوقتي 😿</div>';
    return false;
  }

  return { start: start, titles: TITLES };
})();
