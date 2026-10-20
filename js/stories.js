/* ============================================================
   📚 القطة روفان — القصص التفاعلية (stories.js)
   قصص أصلية 100% بشخصية القطة روفان:
   مشاهد + خيارات + أسئلة + استماع صوتي + مكافأة
   ============================================================ */
(function () {
  "use strict";
  const D = window.ROVAN;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function t(key) {
    return (window.RovanI18n ? window.RovanI18n.t(key) : key);
  }
  function sfx(name) {
    const f = window.RovanSpeech.sfx[name];
    if (f) f();
  }

  let narrating = false;

  function renderStories() {
    const full = document.getElementById("storiesGrid");
    const mini = document.getElementById("storiesMini");
    const grid = full || mini;
    if (!grid) return;
    const isEn = window.RovanI18n && window.RovanI18n.lang === "en";
    const done = (window.RovanProgress && window.RovanProgress.getState().stories) || [];
    let list = D.stories;
    if (mini) list = list.slice(0, 3);
    grid.innerHTML = list.map(function (s) {
      const isDone = done.indexOf(s.id) >= 0;
      const title = (isEn && s.titleEn) ? s.titleEn : s.title;
      const desc = (isEn && s.descEn) ? s.descEn : s.desc;
      return '<button type="button" class="story-card' + (isDone ? " done" : "") + '" data-story="' + s.id + '">' +
        '<span class="story-icon" aria-hidden="true">' + s.icon + "</span>" +
        "<h3>" + esc(title) + (isDone ? " ✅" : "") + "</h3>" +
        "<p>" + esc(desc) + "</p>" +
        '<span class="ages">' + s.scenes.length + (isEn ? " scenes" : " مشاهد") + "</span>" +
        "</button>";
    }).join("");
    grid.querySelectorAll("[data-story]").forEach(function (card) {
      card.addEventListener("click", function () {
        sfx("click");
        openStory(card.dataset.story);
      });
    });
  }

  function stopNarration() {
    narrating = false;
    window.RovanSpeech.stop();
  }

  function openStory(id) {
    const story = D.stories.filter(function (s) { return s.id === id; })[0];
    if (!story) return;
    if (window.RovanProgress) window.RovanProgress.setLastActivity("story", id, story.title);
    if (window.openGameModal) window.openGameModal();
    document.getElementById("gameTitle").textContent = story.icon + " " + story.title;
    const inst = document.getElementById("gameInstructions");
    if (inst) {
      inst.innerHTML = '<div class="mascot-guide" style="margin:0 0 18px;"><div class="bubble">📚 ' +
        "القصة فيها مشاهد واختيارات — اضغط «التالي» تكمل، أو «🔊 استمع» تسمع القصة!</div></div>";
    }
    renderScene(document.getElementById("gameArea"), story, 0);
    window.RovanSpeech.say("storyStart");
  }

  function renderScene(area, story, idx) {
    stopNarration();
    const scene = story.scenes[idx];
    const isLast = idx >= story.scenes.length - 1;
    const isEn = window.RovanI18n && window.RovanI18n.lang === "en";
    const sceneText = (isEn && scene.textEn) ? scene.textEn : scene.text;
    const sceneTitle = (isEn && story.titleEn) ? story.titleEn : story.title;

    let choicesHtml = "";
    if (scene.choices) {
      choicesHtml = '<div class="story-choices">' + scene.choices.map(function (c, i) {
        const label = (isEn && c.labelEn) ? c.labelEn : c.label;
        return '<button type="button" class="btn btn-play" data-choice="' + i + '">' + esc(label) + "</button>";
      }).join("") + "</div>";
    }

    area.innerHTML =
      '<div class="quiz-top"><span>' + esc(sceneTitle) + "</span><span>" + (idx + 1) + " / " + story.scenes.length + "</span></div>" +
      '<div class="story-scene">' +
      '<div class="story-art" aria-hidden="true">' + (scene.art || story.icon) + "</div>" +
      '<p class="story-text" id="storyText">' + esc(sceneText) + "</p>" +
      "</div>" +
      '<div class="narration-bar">' +
      '<button type="button" class="btn-sm btn-play" id="narrPlay">🔊 ' + t("stories.listen") + "</button>" +
      '<button type="button" class="btn-sm btn-quiet" id="narrPause">⏸ ' + t("stories.pause") + "</button>" +
      '<button type="button" class="btn-sm btn-quiet" id="narrResume">▶ ' + t("stories.resume") + "</button>" +
      '<button type="button" class="btn-sm btn-quiet" id="narrStop">🔇 ' + t("stories.stop") + "</button>" +
      "</div>" +
      '<div class="story-nav">' +
      '<button type="button" class="btn-sm btn-quiet" id="storyPrev"' + (idx === 0 ? " disabled" : "") + ">➡️</button>" +
      (scene.choices ? "" :
        isLast
          ? '<button type="button" class="btn btn-yt" id="storyFinish">✨</button>'
          : '<button type="button" class="btn btn-play" id="storyNext">⬅️</button>') +
      "</div>" + choicesHtml;

    /* ===== التحكم في الاستماع (يمنع تداخل المشاهد) ===== */
    const textEl = area.querySelector("#storyText");
    function highlight(on) {
      if (textEl) textEl.classList.toggle("speaking", !!on);
    }
    area.querySelector("#narrPlay").addEventListener("click", function () {
      sfx("click");
      highlight(true);
      narrating = true;
      window.RovanSpeech.speak(sceneText, {
        lang: (isEn ? "en" : undefined),
        onEnd: function () { highlight(false); narrating = false; }
      });
    });
    area.querySelector("#narrPause").addEventListener("click", function () {
      sfx("click");
      try { window.speechSynthesis.pause(); } catch (e) { /* ok */ }
    });
    area.querySelector("#narrResume").addEventListener("click", function () {
      sfx("click");
      try { window.speechSynthesis.resume(); } catch (e) { /* ok */ }
    });
    area.querySelector("#narrStop").addEventListener("click", function () {
      sfx("click");
      stopNarration();
      highlight(false);
    });

    /* ===== التنقل ===== */
    const prev = area.querySelector("#storyPrev");
    if (prev && idx > 0) {
      prev.addEventListener("click", function () {
        sfx("page");
        renderScene(area, story, idx - 1);
      });
    }
    const next = area.querySelector("#storyNext");
    if (next) {
      next.addEventListener("click", function () {
        sfx("page");
        renderScene(area, story, idx + 1);
      });
    }
    const fin = area.querySelector("#storyFinish");
    if (fin) {
      fin.addEventListener("click", function () {
        sfx("click");
        renderStoryQuiz(area, story);
      });
    }
    if (scene.choices) {
      area.querySelectorAll("[data-choice]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          sfx("click");
          const c = scene.choices[Number(btn.dataset.choice)];
          renderScene(area, story, c.next);
        });
      });
    }
  }

  function renderStoryQuiz(area, story) {
    stopNarration();
    const lastScene = story.scenes[story.scenes.length - 1];
    const quiz = lastScene.quiz || [];
    let idx = 0, score = 0;

    function renderQ() {
      if (idx >= quiz.length) {
        if (window.RovanProgress) window.RovanProgress.markStory(story.id);
        if (window.RovanConfetti) window.RovanConfetti(60);
        window.RovanSpeech.sfx.win();
        window.RovanSpeech.say("storyEnd");
        area.innerHTML =
          '<div class="win-box"><span class="big">' + story.icon + "🎉</span>" +
          "<h3>خلصت قصة «" + esc(story.title) + "»!</h3>" +
          "<p>إجاباتك الصحيحة: " + score + " من " + quiz.length + " — +5 نجوم ⭐</p>" +
          '<button type="button" class="btn btn-play btn-big" id="storyAgain">🔄 اقرأ القصة تاني</button></div>';
        area.querySelector("#storyAgain").addEventListener("click", function () {
          sfx("click");
          renderScene(area, story, 0);
        });
        return;
      }
      const q = quiz[idx];
      area.innerHTML =
        '<div class="quiz-top"><span>أسئلة القصة — السؤال ' + (idx + 1) + "/" + quiz.length + "</span></div>" +
        '<div class="quiz-q">' + esc(q.q) + "</div>" +
        '<div class="quiz-opts">' + q.opts.map(function (o, i) {
          return '<button type="button" class="qopt" data-i="' + i + '">' + esc(o) + "</button>";
        }).join("") + "</div>";
      area.querySelectorAll(".qopt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.i);
          const opts = area.querySelectorAll(".qopt");
          opts.forEach(function (o) { o.disabled = true; });
          if (i === q.a) {
            btn.classList.add("correct");
            score++;
            window.RovanSpeech.sfx.correct();
            window.RovanSpeech.say("correct");
          } else {
            btn.classList.add("wrong");
            opts[q.a].classList.add("correct");
            window.RovanSpeech.sfx.wrong();
            window.RovanSpeech.say("wrong");
          }
          setTimeout(function () { idx++; renderQ(); }, 1100);
        });
      });
    }
    renderQ();
  }

  window.RovanStories = {
    renderStories: renderStories,
    openStory: openStory,
    stopNarration: stopNarration
  };
})();
