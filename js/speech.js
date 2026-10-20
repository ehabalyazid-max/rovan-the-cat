/* ============================================================
   🔊 القطة روفان — محرك الصوت والنطق (speech.js)
   - النطق: Web Speech API (SpeechSynthesis) — مجاني بدون API keys
   - المؤثرات: Web Audio API
   - إعدادات: كلام/مؤثرات/مستوى الصوت/اللغة/البطء — تُحفظ محليًا
   - فشل الصوت لا يوقف أي لعبة أو نشاط
   ============================================================ */
window.RovanSpeech = (function () {
  "use strict";

  const SETTINGS_KEY = "rovan_settings_v1";
  const DEFAULTS = { speech: true, sfx: true, volume: 0.8, lang: "ar", slow: false };
  const supported = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);

  let settings = loadSettings();
  let voicesCache = [];
  let warnedNoVoice = false;

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (!raw || typeof raw !== "object") return Object.assign({}, DEFAULTS);
      return {
        speech: raw.speech !== false,
        sfx: raw.sfx !== false,
        volume: (typeof raw.volume === "number" && raw.volume >= 0 && raw.volume <= 1) ? raw.volume : 0.8,
        lang: raw.lang === "en" ? "en" : "ar",
        slow: raw.slow === true
      };
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ok */ }
  }

  function refreshVoices() {
    try { voicesCache = window.speechSynthesis.getVoices() || []; }
    catch (e) { voicesCache = []; }
    return voicesCache;
  }
  if (supported) {
    refreshVoices();
    try {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    } catch (e) { /* ok */ }
  }

  function voicesFor(lang) {
    const all = voicesCache.length ? voicesCache : refreshVoices();
    const prefix = lang === "en" ? "en" : "ar";
    return all.filter(function (v) {
      return (v.lang || "").toLowerCase().indexOf(prefix) === 0;
    });
  }

  function pickVoice(lang) {
    const list = voicesFor(lang);
    if (!list.length) return null;
    /* تفضيل الأصوات المحلية ثم الافتراضية */
    const pref = list.find(function (v) { return v.localService; }) || list[0];
    return pref;
  }

  /* ---------- النطق ---------- */
  function speak(text, opts) {
    if (!supported || !settings.speech || !text) {
      if (!supported && !warnedNoVoice) {
        warnedNoVoice = true;
        if (window.RovanUI && window.RovanUI.toast) {
          window.RovanUI.toast("🔇 متصفحك لا يدعم النطق الصوتي — النص ظاهر لك عادي!");
        }
      }
      return false;
    }
    try {
      window.speechSynthesis.cancel(); /* أوقف أي كلام سابق قبل الجديد */
      const u = new SpeechSynthesisUtterance(String(text).slice(0, 300));
      const lang = (opts && opts.lang) || settings.lang;
      u.lang = lang === "en" ? "en-US" : "ar-SA";
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.volume = settings.volume;
      u.rate = (opts && opts.slow) || settings.slow ? 0.62 : 1;
      u.pitch = 1.15; /* صوت مرح مناسب للأطفال */
      if (opts && typeof opts.onEnd === "function") {
        u.onend = opts.onEnd;
        u.onerror = opts.onEnd;
      }
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  function stop() {
    if (supported) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ok */ }
    }
  }

  /* ---------- المؤثرات الصوتية (خفيفة) ---------- */
  let audioCtx = null;
  function beep(freq, dur, type, when) {
    if (!settings.sfx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = 0.11 * settings.volume;
      o.connect(g); g.connect(audioCtx.destination);
      const t = audioCtx.currentTime + (when || 0);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* الصوت اختياري */ }
  }

  const sfx = {
    click: function () { beep(560, 0.07, "triangle"); },
    correct: function () { beep(660, 0.12); beep(880, 0.14, "sine", 0.09); beep(1170, 0.2, "sine", 0.2); },
    wrong: function () { beep(200, 0.18, "square"); beep(150, 0.24, "square", 0.11); },
    win: function () { [523, 659, 784, 1046, 1318, 1568].forEach(function (f, i) { beep(f, 0.2, "triangle", i * 0.11); }); },
    star: function () { beep(988, 0.1, "triangle"); beep(1319, 0.16, "triangle", 0.08); },
    page: function () { beep(740, 0.06, "sine"); }
  };

  /* ---------- عبارات روفان (متنوعة حسب الموقف) ---------- */
  const phrases = {
    welcome: [
      "أهلاً بيك في عالمي! أنا روفان، يلا نلعب ونتعلم مع بعض!",
      "هلا والله! أنا القطة روفان، مستنياك نبدأ مغامرة جديدة!",
      "مرحبًا يا بطل! أنا روفان، النهارده هنستمتع ونتعلم حاجات حلوة!"
    ],
    suggest: [
      "إيه رأيك نجرب لعبة الذاكرة؟ أنا بحبها أوي!",
      "جرب التحدي اليومي! كل يوم فيه حاجة جديدة وممتعة.",
      "تعال نتعلم حروف جديدة في الأكاديمية، هتعجبك!",
      "عايز تسمع قصة حلوة؟ عندي ليك قصة عن الكنز المفقود!"
    ],
    correct: ["أحسنت يا بطل!", "إجابة صحيحة! برافو!", "ماشاء الله عليك!", "رائع! كمّل كده!"],
    wrong: ["مفيش مشكلة، جرّب تاني أنت تقدر!", "قريب أوي! ركّز كويس هتلاقيها.", "الغلط بيمدحنا، جرّب مرة تانية!"],
    win: ["يااااي كسبت! أنت ذكي جدًا!", "فوز رائع! أنا فخورة بيك!", "الله عليك! نجمة جديدة في سماك!"],
    hint: ["بص كويس على الاختيارات، الإجابة معاك!", "خد وقتك، أنا مستنياك.", "فكر في المعلومة اللي اتعلمناها مع بعض."],
    levelUp: ["ماشاء الله! وصلت مستوى جديد!", "يا بطل! مستواك بيعلى وبيعلى!"],
    storyStart: ["يلا نسمع القصة مع بعض!", "استعد للمغامرة! القصة هتبدأ دلوقتي."],
    storyEnd: ["القصة خلصت! عجبتك؟ تعال نلعب لعبة.", "أحسنت إنك سمعت القصة كلها!"]
  };

  function phrase(group) {
    const list = phrases[group] || phrases.suggest;
    return list[Math.floor(Math.random() * list.length)];
  }
  function say(group, opts) {
    return speak(phrase(group), opts);
  }

  /* ---------- الإعدادات ---------- */
  function getSettings() { return Object.assign({}, settings); }
  function setSetting(key, value) {
    if (key === "speech" || key === "sfx" || key === "slow") settings[key] = !!value;
    else if (key === "lang") settings.lang = value === "en" ? "en" : "ar";
    else if (key === "volume") {
      const v = Number(value);
      if (isFinite(v) && v >= 0 && v <= 1) settings.volume = v;
    }
    saveSettings();
  }
  function resetSettings() {
    settings = Object.assign({}, DEFAULTS);
    saveSettings();
    stop();
  }
  function describeVoices() {
    const ar = voicesFor("ar").length, en = voicesFor("en").length;
    return "الأصوات المتاحة على جهازك — العربية: " + ar + " • الإنجليزية: " + en;
  }

  return {
    supported: supported,
    speak: speak,
    stop: stop,
    say: say,
    phrase: phrase,
    sfx: sfx,
    voicesFor: voicesFor,
    describeVoices: describeVoices,
    getSettings: getSettings,
    setSetting: setSetting,
    resetSettings: resetSettings
  };
})();

/* توافق مع الكود القديم */
window.RovanSound = window.RovanSpeech.sfx;
window.RovanSound.enabled = true;
