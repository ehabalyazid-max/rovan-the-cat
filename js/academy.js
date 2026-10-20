/* ============================================================
   🎓 القطة روفان — الأكاديمية التعليمية + التحدي اليومي (academy.js)
   دروس تفاعلية (ليست صفحات نصية) + اختبار قصير بعد كل درس
   + تحدٍ يومي بثبات حسب تاريخ الجهاز (بدون خلفية)
   ============================================================ */
(function () {
  "use strict";
  const D = window.ROVAN;

  /* ---------- مساعدات ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function speak(text, lang) {
    return window.RovanSpeech.speak(text, lang ? { lang: lang } : undefined);
  }
  function sfx(name) {
    const f = window.RovanSpeech.sfx[name];
    if (f) f();
  }
  function confetti(n) {
    if (window.RovanConfetti) window.RovanConfetti(n);
  }
  function toast(msg) {
    if (window.RovanUI && window.RovanUI.toast) window.RovanUI.toast(msg);
  }

  /* ============================================================
     🎓 دروس الأكاديمية
     ============================================================ */
  function renderAcademy() {
    const grid = document.getElementById("academyGrid");
    if (!grid) return;
    const done = (window.RovanProgress && window.RovanProgress.getState().lessons) || [];
    grid.innerHTML = D.academy.map(function (l, i) {
      const isDone = done.indexOf(l.id) >= 0;
      return '<button type="button" class="game-card gc' + ((i % 8) + 1) + '" data-lesson="' + l.id + '">' +
        '<span class="gicon" aria-hidden="true">' + l.icon + "</span>" +
        "<h3>" + l.title + (isDone ? ' <span aria-label="مكتمل">✅</span>' : "") + "</h3>" +
        "<p>" + l.desc + "</p>" +
        '<div class="gmeta"><span class="ages">' + l.category + " • " + l.grade + "</span>" +
        '<span class="ages">' + l.items.length + " خطوات</span></div></button>";
    }).join("");
    grid.querySelectorAll("[data-lesson]").forEach(function (card) {
      card.addEventListener("click", function () {
        sfx("click");
        openLesson(card.dataset.lesson);
      });
    });
  }

  function openLesson(id) {
    const lesson = D.academy.filter(function (l) { return l.id === id; })[0];
    if (!lesson) return;
    const area = document.getElementById("gameArea");
    document.getElementById("gameTitle").textContent = lesson.icon + " " + lesson.title;
    const inst = document.getElementById("gameInstructions");
    if (inst) {
      inst.innerHTML = '<div class="mascot-guide" style="margin:0 0 18px;"><div class="bubble">🎓 ' +
        esc(lesson.desc) + ' — اضغط 🔊 تسمع، والأسهم تنقل بين الخطوات!</div></div>';
    }
    if (window.RovanProgress) window.RovanProgress.setLastActivity("lesson", id, lesson.title);
    if (window.openGameModal) window.openGameModal();
    renderLessonStep(area, lesson, 0);
    speak(window.RovanSpeech.phrase("welcome"));
  }

  function renderLessonStep(area, lesson, idx) {
    const item = lesson.items[idx];
    const langEn = lesson.id === "en-letters" || lesson.id === "words" || lesson.id === "listen";
    area.innerHTML =
      '<div class="quiz-top">' +
      "<span>الدرس: " + esc(lesson.title) + "</span>" +
      "<span>الخطوة " + (idx + 1) + " / " + lesson.items.length + "</span>" +
      "</div>" +
      '<div class="lesson-step">' +
      '<div class="lesson-emoji" aria-hidden="true">' + item.emoji + "</div>" +
      '<div class="lesson-letter">' + esc(item.letter) + "</div>" +
      '<div class="lesson-word">' + esc(item.word) + (item.ar ? " • " + esc(item.ar) : "") + "</div>" +
      '<div class="lesson-actions">' +
      '<button type="button" class="btn btn-play" id="lessonSpeak">🔊 اسمع</button>' +
      (langEn ? '<button type="button" class="btn-sm btn-quiet" id="lessonSpeakEn">🔊 English</button>' : "") +
      "</div></div>" +
      '<div style="text-align:center; margin-top:20px;">' +
      '<button type="button" class="btn-sm btn-quiet" id="lessonPrev"' + (idx === 0 ? " disabled" : "") + ">➡️ السابق</button> " +
      (idx < lesson.items.length - 1
        ? '<button type="button" class="btn btn-play" id="lessonNext">التالي ⬅️</button>'
        : '<button type="button" class="btn btn-yt" id="lessonQuiz">📝 ابدأ الاختبار!</button>') +
      "</div>";

    area.querySelector("#lessonSpeak").addEventListener("click", function () {
      sfx("click");
      speak(item.letter + " — " + item.word.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, ""), langEn ? "ar" : undefined);
    });
    const enBtn = area.querySelector("#lessonSpeakEn");
    if (enBtn) {
      enBtn.addEventListener("click", function () {
        sfx("click");
        speak(item.word, "en");
      });
    }
    const prev = area.querySelector("#lessonPrev");
    if (prev && idx > 0) {
      prev.addEventListener("click", function () {
        sfx("page");
        renderLessonStep(area, lesson, idx - 1);
      });
    }
    const next = area.querySelector("#lessonNext");
    if (next) {
      next.addEventListener("click", function () {
        sfx("page");
        renderLessonStep(area, lesson, idx + 1);
        speak(item.word.replace(/[^\u0621-\u064Aa-zA-Z0-9 ]/g, ""));
      });
    }
    const quizBtn = area.querySelector("#lessonQuiz");
    if (quizBtn) {
      quizBtn.addEventListener("click", function () {
        sfx("click");
        runQuiz(area, lesson.quiz, {
          title: "📝 اختبار " + lesson.title,
          onDone: function (score, total) {
            const passed = score >= Math.ceil(total / 2);
            if (passed) {
              if (window.RovanProgress) window.RovanProgress.markLesson(lesson.id);
            }
            return {
              icon: passed ? "🎓🎉" : "💪🐱",
              msg: passed
                ? "أكملت درس " + lesson.title + " بنجاح!"
                : "محاولة كويسة! راجع الدرس وجرب تاني."
            };
          }
        });
      });
    }
    /* نطق تلقائي للكلمة بعد فتح الخطوة (فقط إن كان الصوت مفعّل) */
    speak(item.letter + "", langEn && lesson.id === "en-letters" ? "en" : undefined);
  }

  /* ============================================================
     📝 مشغل اختبار قصير (مشترك: الدروس + التحدي اليومي)
     ============================================================ */
  function runQuiz(area, questions, cfg) {
    cfg = cfg || {};
    const state = { idx: 0, score: 0 };
    const total = questions.length;

    function renderQ() {
      const q = questions[state.idx];
      if (!q) {
        const res = cfg.onDone ? cfg.onDone(state.score, total) : { icon: "🎉", msg: "أحسنت!" };
        confetti(state.score >= total / 2 ? 60 : 25);
        sfx("win");
        if (state.score >= total / 2) speak(window.RovanSpeech.phrase("win"));
        area.innerHTML =
          '<div class="win-box"><span class="big">' + res.icon + "</span>" +
          "<h3>النتيجة: " + state.score + " من " + total + "</h3>" +
          "<p>" + esc(res.msg) + "</p>" +
          '<button type="button" class="btn btn-play btn-big" id="quizRetry">🔄 العب تاني</button></div>';
        area.querySelector("#quizRetry").addEventListener("click", function () {
          sfx("click");
          state.idx = 0; state.score = 0;
          renderQ();
        });
        return;
      }
      area.innerHTML =
        '<div class="quiz-top"><span>' + esc(cfg.title || "اختبار") + " — السؤال " + (state.idx + 1) + "/" + total + "</span>" +
        "<span>النتيجة: " + state.score + " ✅</span></div>" +
        (q.listen
          ? '<div class="game-q">🎧 اسمع الكلمة واختار الصورة' +
            '<div style="margin-top:10px;"><button type="button" class="btn btn-play" id="listenBtn">🔊 اسمع تاني</button></div></div>'
          : '<div class="quiz-q">' + esc(q.q) + "</div>") +
        '<div class="quiz-opts">' +
        q.opts.map(function (o, i) {
          return '<button type="button" class="qopt" data-i="' + i + '">' + esc(o) + "</button>";
        }).join("") +
        "</div>";

      if (q.listen) {
        const lb = area.querySelector("#listenBtn");
        lb.addEventListener("click", function () { sfx("click"); speak(q.listen); });
        speak(q.listen); /* النطق بعد تفاعل المستخدم (فتح الاختبار) */
      } else {
        speak(q.q);
      }
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.i);
          const opts = area.querySelectorAll(".qopt");
          opts.forEach(function (o) { o.disabled = true; });
          if (i === q.a) {
            btn.classList.add("correct");
            state.score++;
            sfx("correct");
            speak(window.RovanSpeech.phrase("correct"));
            setTimeout(function () { state.idx++; renderQ(); }, 850);
          } else {
            btn.classList.add("wrong");
            opts[q.a].classList.add("correct");
            sfx("wrong");
            speak(window.RovanSpeech.phrase("wrong"));
            setTimeout(function () { state.idx++; renderQ(); }, 1500);
          }
        });
      });
      const first = area.querySelector(".qopt");
      if (first) first.focus();
    }
    renderQ();
  }

  /* ============================================================
     🎯 التحدي اليومي (بثبات حسب تاريخ الجهاز المحلي)
     ============================================================ */
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function todaysQuestions() {
    const key = todayKey();
    const start = hashStr(key) % D.dailyBank.length;
    const qs = [];
    for (let i = 0; i < 3; i++) qs.push(D.dailyBank[(start + i * 7) % D.dailyBank.length]);
    return qs;
  }

  function renderDaily() {
    const box = document.getElementById("dailyBox");
    if (!box) return;
    const key = todayKey();
    const state = (window.RovanProgress && window.RovanProgress.getState().daily) || {};
    const doneToday = !!state[key];
    const days = Object.keys(state).length;

    box.innerHTML =
      '<div class="daily-card' + (doneToday ? " done" : "") + '">' +
      '<div class="daily-icon" aria-hidden="true">🎯</div>' +
      "<h3>" + (window.RovanI18n && window.RovanI18n.lang === "en" ? "Today's Challenge" : "تحدي النهارده") +
      " (" + key.split("-").reverse().join("/") + ")</h3>" +
      "<p>" + (doneToday
        ? "🎉 " + (window.RovanI18n && window.RovanI18n.lang === "en"
          ? "Challenge completed! Score: " + state[key].score + "/3 — replay for fun."
          : "أكملت تحدي النهارده! نتيجتك: " + state[key].score + "/3 — تعال العب تاني للمرح.")
        : (window.RovanI18n && window.RovanI18n.lang === "en"
          ? "3 surprise questions every day! 🌟 Finish and earn <b>10 stars</b> (once a day)."
          : "3 أسئلة مفاجأة كل يوم! 🌟 أكمل التحدي واكسب <b>10 نجوم</b> (مرة واحدة كل يوم).")) + "</p>" +
      '<p class="device-note" style="background:rgba(255,255,255,.2);">🗓️ ' +
      (window.RovanI18n && window.RovanI18n.lang === "en" ? "The challenge follows your device date — completed: " : "التحدي بيتغير حسب تاريخ جهازك — التحديات المكتملة: ") +
      "<b>" + days + "</b></p>" +
      '<button type="button" class="btn ' + (doneToday ? "btn-white" : "btn-play") + ' btn-big" id="dailyStart">' +
      (doneToday ? "🔄" : "🚀 " + (window.RovanI18n && window.RovanI18n.lang === "en" ? "Start!" : "ابدأ التحدي!")) + "</button>" +
      "</div>";

    box.querySelector("#dailyStart").addEventListener("click", function () {
      sfx("click");
      runQuiz(box, todaysQuestions(), {
        title: "🎯 تحدي اليوم",
        onDone: function (score) {
          /* القاعدة تُفحص وقت النتيجة نفسها (وليس وقت الضغط) — مكافأة واحدة يوميًا */
          const alreadyDone = window.RovanProgress && window.RovanProgress.getState().daily[key];
          if (!alreadyDone && window.RovanProgress) {
            window.RovanProgress.markDaily(key, score);
          }
          return {
            icon: score === 3 ? "🏆🎯" : score >= 2 ? "🎉🎯" : "💪🎯",
            msg: alreadyDone
              ? "لعبت للمرح! 🎈 المكافأة اليومية بتتاخد مرة واحدة كل يوم."
              : score === 3
                ? "إجابات كاملة! +10 نجوم لحسابك 🌟"
                : "أكملت التحدي! +10 نجوم 🌟 — جرّب تجيب 3/3 بكرة!"
          };
        }
      });
    });
  }

  /* ---------- تصدير ---------- */
  window.RovanAcademy = {
    renderAcademy: renderAcademy,
    renderDaily: renderDaily,
    openLesson: openLesson,
    todayKey: todayKey
  };
})();
