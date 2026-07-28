/* FRC Academy - accounts and progress sync.
 *
 * Loaded as a module on every page. If no Supabase URL/key is configured in
 * account-config.js, it does nothing at all: the page stays anonymous and
 * progress lives only in localStorage, exactly as it did before accounts.
 *
 * When configured and a student is signed in, it:
 *   - merges their saved progress down into localStorage so the hubs render it,
 *   - pushes any progress made while signed out up to their account,
 *   - watches localStorage for new lesson completions and saves them.
 *
 * It NEVER throws into the page: every remote call is wrapped so a backend
 * hiccup can't break a lesson.
 */

/* FRC Academy - review capture + spaced retrieval.
 *
 * Always on, no backend needed, and no change to the 200+ lesson files. It
 * reads the same "#quiz .q[data-correct]" markup the mastery handler uses,
 * works out right/wrong on its own, and records into localStorage under
 * "frc:review":
 *   - every question a student gets wrong (due for review immediately), and
 *   - every question answered right on the first try (scheduled to come back
 *     in 3 days - successful retrieval later is what makes memory stick).
 * review.html resurfaces whatever is due; answering there pushes the question
 * further out (3 -> 9 -> 27 days) until it graduates.
 */
(function () {
  "use strict";
  var KEY = "frc:review";
  var CAP = 800; // keep the pool bounded
  var DAY = 86400000;

  function fileName() {
    try { return (location.pathname.split("/").pop() || "index.html") || "index.html"; }
    catch (e) { return "index.html"; }
  }
  function courseOf(f) {
    if (f.indexOf("closing-the-loop") === 0) return "closing-the-loop";
    if (f.indexOf("deploy") === 0) return "deploy";
    if (f.indexOf("build") === 0) return "build";
    if (f.indexOf("systemcore") === 0) return "systemcore";
    return "other";
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(map) {
    try {
      var keys = Object.keys(map);
      if (keys.length > CAP) {
        keys.sort(function (a, b) { return (map[a].ts || 0) - (map[b].ts || 0); });
        keys.slice(0, keys.length - CAP).forEach(function (k) { delete map[k]; });
      }
      localStorage.setItem(KEY, JSON.stringify(map));
    } catch (e) {}
  }
  function txt(el) { return el ? (el.textContent || "").trim() : ""; }

  function entryFrom(q, qi, f) {
    return {
      file: f, course: courseOf(f), qi: qi,
      qn: txt(q.querySelector(".qn")),
      prompt: txt(q.querySelector(".qt")),
      opts: Array.prototype.map.call(q.querySelectorAll(".opt"), txt),
      correct: parseInt(q.getAttribute("data-correct"), 10) || 0,
      explain: txt(q.querySelector(".explain")),
      misses: 0
    };
  }

  // wrong answer: into the pool, due for review right away
  function record(q, qi) {
    try {
      var f = fileName(), id = f + "#q" + qi, map = load();
      var e = map[id] || entryFrom(q, qi, f);
      e.misses = (e.misses || 0) + 1;
      e.ts = Date.now();
      e.due = Date.now();
      e.ivl = 1;
      map[id] = e;
      save(map);
      try { window.dispatchEvent(new CustomEvent("frc:reviewupdated")); } catch (e2) {}
    } catch (e) {}
  }

  // right on the first try: schedule a future retrieval (never overrides a miss)
  function schedule(q, qi) {
    try {
      var f = fileName(), id = f + "#q" + qi, map = load();
      if (map[id]) return;
      var e = entryFrom(q, qi, f);
      e.ts = Date.now();
      e.due = Date.now() + 3 * DAY;
      e.ivl = 3;
      map[id] = e;
      save(map);
    } catch (e) {}
  }

  function attach() {
    var quiz = document.getElementById("quiz");
    if (!quiz) return;
    var qs = Array.prototype.slice.call(quiz.querySelectorAll(".q"));
    if (!qs.length) return;
    var recorded = {}; // first fumble per question per page load only
    quiz.addEventListener("click", function (ev) {
      var t = ev.target;
      var opt = t && t.closest ? t.closest(".opt") : null;
      if (!opt || !quiz.contains(opt)) return;
      var q = opt.closest(".q"); if (!q) return;
      var qi = qs.indexOf(q); if (qi < 0) return;
      // ignore clicks once the question is already solved
      if (q.querySelector(".opt.locked") || q.querySelector(".opt.correct")) return;
      var correct = parseInt(q.getAttribute("data-correct"), 10);
      var sibs = opt.parentNode ? opt.parentNode.querySelectorAll(".opt") : [];
      var idx = Array.prototype.indexOf.call(sibs, opt);
      if (recorded[qi]) return;
      recorded[qi] = true;
      if (idx !== correct) record(q, qi);
      else schedule(q, qi);
    }, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
  else attach();
})();

/* FRC Academy - completion moment.
 *
 * Finishing a lesson used to be silent: the mark-done script wrote localStorage
 * and nothing happened on screen. This standalone block (works with or without
 * the backend) watches for the current page's own filename being added to a
 * course's :done map and celebrates with a small toast offering the next lesson
 * (read from the page's existing .coursenav forward link) and the course map.
 * No change to any lesson file.
 */
(function () {
  "use strict";
  var here = (location.pathname.split("/").pop() || "").toLowerCase();
  if (!/lesson-\d|checkpoint-\d/.test(here)) return;
  var isCheckpoint = /checkpoint/.test(here);
  var shown = false;

  function navLinks() {
    var next = null, map = null;
    var links = document.querySelectorAll(".coursenav a");
    Array.prototype.forEach.call(links, function (a) {
      if (a.classList.contains("map")) { map = a; return; }
      if (/→\s*$/.test(a.textContent)) next = a;
    });
    return { next: next, map: map };
  }

  function celebrate() {
    if (shown) return;
    shown = true;
    try {
      var nav = navLinks();
      var css = document.createElement("style");
      css.textContent =
        ".frc-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,16px);opacity:0;" +
        "z-index:9999;background:#10192e;border:1px solid #34d6c0;border-radius:14px;padding:16px 18px;" +
        "box-shadow:0 18px 50px -18px rgba(0,0,0,.85);max-width:min(92vw,430px);" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif;" +
        "transition:transform .35s ease,opacity .35s ease}" +
        ".frc-toast.on{transform:translate(-50%,0);opacity:1}" +
        "@media (prefers-reduced-motion: reduce){.frc-toast{transition:none}}" +
        ".frc-toast .t-eyebrow{font-family:ui-monospace,Menlo,monospace;font-size:10.5px;letter-spacing:.22em;" +
        "text-transform:uppercase;color:#34d6c0;margin-bottom:4px}" +
        ".frc-toast .t-msg{color:#e8edf7;font-size:15px;font-weight:700;letter-spacing:-.01em}" +
        ".frc-toast .t-sub{color:#92a2be;font-size:12.5px;margin-top:2px}" +
        ".frc-toast .t-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}" +
        ".frc-toast a{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.08em;" +
        "text-transform:uppercase;text-decoration:none;border-radius:8px;padding:9px 12px}" +
        ".frc-toast a.t-next{background:linear-gradient(180deg,#6ff0dd,#34d6c0);color:#06121f;font-weight:700}" +
        ".frc-toast a.t-map{border:1px solid #33415e;color:#92a2be}" +
        ".frc-toast button{position:absolute;top:6px;right:9px;background:none;border:none;color:#5e6f8e;" +
        "font-size:15px;cursor:pointer;padding:4px}";
      document.head.appendChild(css);

      var box = document.createElement("div");
      box.className = "frc-toast";
      box.setAttribute("role", "status");
      var eyebrow = isCheckpoint ? "Checkpoint cleared" : "Lesson complete";
      var who = "";
      try { who = (localStorage.getItem("frc:name") || "").trim().split(" ")[0]; } catch (e) {}
      var msg = isCheckpoint
        ? "\u2605 You just proved the whole Part - every question, cold."
        : "\u2713 " + (who ? who + ", you" : "You") + " got every one right. This lesson is yours now.";
      var sub = isCheckpoint
        ? "Before it fades: explain one of those questions to a teammate in your own words. Teaching it locks it in."
        : "It is saved on your map. Whenever you are ready, the next one is waiting.";
      var row = "";
      if (nav.next) row += '<a class="t-next" href="' + nav.next.getAttribute("href") + '">Next lesson →</a>';
      if (nav.map) row += '<a class="t-map" href="' + nav.map.getAttribute("href") + '">Course map</a>';
      box.innerHTML =
        '<button aria-label="Dismiss">✕</button>' +
        '<div class="t-eyebrow">' + eyebrow + "</div>" +
        '<div class="t-msg">' + msg + "</div>" +
        '<div class="t-sub">' + sub + "</div>" +
        (row ? '<div class="t-row">' + row + "</div>" : "");
      document.body.appendChild(box);
      box.querySelector("button").addEventListener("click", function () { box.remove(); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("on"); }); });
    } catch (e) { /* never break a page over a celebration */ }
  }

  try {
    var prev = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      var before = null;
      if (/:done$/.test(String(k))) {
        try { before = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { before = {}; }
      }
      prev.call(localStorage, k, v);
      if (before === null) return;
      try {
        var after = JSON.parse(v) || {};
        if (after[here] && !before[here]) {
          try {
            var lg = JSON.parse(localStorage.getItem("frc:log")) || [];
            lg.push({ f: here, c: String(k).replace(/:done$/, ""), ts: Date.now() });
            if (lg.length > 400) lg = lg.slice(lg.length - 400);
            prev.call(localStorage, "frc:log", JSON.stringify(lg));
          } catch (e2) {}
          celebrate();
        }
      } catch (e) {}
    };
  } catch (e) {}
})();

/* FRC Academy - hub extras: review warm-up + team momentum.
 *
 * Injected onto the course hubs (any page with a .progress-card) with no hub
 * file changes - the same trick as review capture and the PWA glue.
 *  - Warm-up chip: reads the frc:review pool and, when questions are due,
 *    offers a one-tap jump into review.html.
 *  - Team strip: when accounts are configured, the student is signed in, and
 *    they belong to a team, shows the team's collective progress in this
 *    course (via the team_progress RPC). Collective momentum, never rankings.
 * Both fail silent: no backend, no RPC, or no team just means no strip.
 */
(function () {
  "use strict";
  var installEvt = null;
  try {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      installEvt = e;
    });
  } catch (e) {}
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  onReady(function () {
    try {
      var card = document.querySelector(".progress-card");
      if (!card) return;

      var css = document.createElement("style");
      css.textContent =
        ".frc-extra{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:10px 0 0;" +
        "border:1px solid rgba(70,214,160,0.35);background:rgba(70,214,160,0.06);border-radius:10px;" +
        "padding:11px 15px;text-decoration:none}" +
        ".frc-extra .xa{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.16em;" +
        "text-transform:uppercase;color:#46d6a0;font-weight:700;white-space:nowrap}" +
        ".frc-extra .xw{font-size:14px;color:#aeb9d1}" +
        ".frc-extra .xw b{color:#e8edf7}" +
        "a.frc-extra:hover{border-color:#46d6a0}";
      document.head.appendChild(css);

      // ---- warm-up chip (pure localStorage, works offline) ----
      var due = 0;
      try {
        var pool = JSON.parse(localStorage.getItem("frc:review")) || {};
        var now = Date.now();
        Object.keys(pool).forEach(function (k) {
          var e = pool[k];
          if (e && e.opts && (!e.due || e.due <= now)) due++;
        });
      } catch (e) {}
      if (due > 0) {
        var chip = document.createElement("a");
        chip.className = "frc-extra";
        chip.href = "review.html";
        chip.innerHTML = '<span class="xa">🧠 Warm-up</span><span class="xw"><b>' + due +
          "</b> question" + (due === 1 ? "" : "s") + " due for review - clear them while they're fresh</span>";
        card.parentNode.insertBefore(chip, card.nextSibling);
      }

      // ---- milestone + this-week strip (reads the write-only reward keys) ----
      try {
        var page2 = (location.pathname.split("/").pop() || "").toLowerCase();
        var prefix = page2 === "code.html" ? "deploy-" : page2 === "build.html" ? "build-"
          : page2 === "closing-the-loop.html" ? "closing-the-loop-" : page2 === "systemcore.html" ? "systemcore-" : null;
        if (prefix) {
          function countKeys(storeKey) {
            try {
              var m2 = JSON.parse(localStorage.getItem(storeKey)) || {};
              return Object.keys(m2).filter(function (k) { return k.indexOf(prefix) === 0; }).length;
            } catch (e) { return 0; }
          }
          var golds = countKeys("frc:gold"), missions = countKeys("frc:missions");
          var week = 0;
          try {
            var log = JSON.parse(localStorage.getItem("frc:log")) || [];
            var cutoff = Date.now() - 7 * 86400000;
            var courseId = prefix.slice(0, -1);
            week = log.filter(function (e) { return e && e.ts > cutoff && e.c === courseId; }).length;
          } catch (e) {}
          var pr = null;
          try { pr = JSON.parse(localStorage.getItem("frc:predict")); } catch (e) {}
          var bits = [];
          if (golds > 0) bits.push("\u2605 <b>" + golds + "</b> gold");
          if (missions > 0) bits.push("<b>" + missions + "</b> missions cleared");
          if (week > 0) bits.push("<b>" + week + "</b> lesson" + (week === 1 ? "" : "s") + " this week");
          if (pr && (pr.r + pr.w) >= 5) bits.push("prediction record <b>" + pr.r + "/" + (pr.r + pr.w) + "</b>");
          if (bits.length) {
            var ms = document.createElement("div");
            ms.className = "frc-extra";
            ms.innerHTML = '<span class="xa">\ud83c\udfc5 Your record</span><span class="xw">' + bits.join(" \u00b7 ") + "</span>";
            card.parentNode.insertBefore(ms, card.nextSibling);
          }
        }
      } catch (e) {}

      // ---- install chip: surface the offline superpower ----
      try {
        var standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
        if (!standalone) {
          if (installEvt) {
            var ic = document.createElement("a");
            ic.className = "frc-extra";
            ic.href = "#";
            ic.innerHTML = '<span class="xa">\ud83d\udcf2 Install</span><span class="xw">Put the academy on your home screen - <b>every lesson works offline</b>, even in the pit</span>';
            ic.addEventListener("click", function (ev) {
              ev.preventDefault();
              try { installEvt.prompt(); } catch (e) {}
            });
            card.parentNode.insertBefore(ic, card.nextSibling);
          } else if (/iPhone|iPad/.test(navigator.userAgent) && !localStorage.getItem("frc:iostip")) {
            var it = document.createElement("div");
            it.className = "frc-extra";
            it.innerHTML = '<span class="xa">\ud83d\udcf2 Tip</span><span class="xw">Add the academy to your home screen (Share \u2192 Add to Home Screen) - <b>it works offline</b> <a href="#" style="color:#75829e;margin-left:8px">dismiss</a></span>';
            it.querySelector("a").addEventListener("click", function (ev) {
              ev.preventDefault();
              try { localStorage.setItem("frc:iostip", "1"); } catch (e) {}
              it.remove();
            });
            card.parentNode.insertBefore(it, card.nextSibling);
          }
        }
      } catch (e) {}

      // ---- team momentum strip (needs configured backend + team) ----
      var courseKey = null;
      var page = (location.pathname.split("/").pop() || "").toLowerCase();
      if (page === "code.html") courseKey = "deploy";
      else if (page === "build.html") courseKey = "build";
      else if (page === "closing-the-loop.html") courseKey = "closing-the-loop";
      else if (page === "systemcore.html") courseKey = "systemcore";
      if (!courseKey) return;

      function renderTeam() {
        try {
          var acct = window.FRCAccount;
          if (!acct || !acct.enabled || !acct.user || !acct.profile || !acct.profile.team_id) return;
          if (document.querySelector(".frc-team-strip")) return;
          acct.raw().rpc("team_progress").then(function (res) {
            try {
              if (!res || res.error || !res.data || !res.data.length) return;
              var rows = res.data;
              var mine = null, total = 0;
              rows.forEach(function (r) { total += r.items || 0; if (r.course === courseKey) mine = r; });
              var members = rows[0].members || 0, name = rows[0].team_name || "your team";
              if (members < 2) return; // momentum needs company
              var strip = document.createElement("div");
              strip.className = "frc-extra frc-team-strip";
              var here = mine ? mine.items : 0;
              strip.innerHTML = '<span class="xa">🏁 Team ' + String(name).replace(/[<>&]/g, "") + "</span>" +
                '<span class="xw">together you have cleared <b>' + here + "</b> item" + (here === 1 ? "" : "s") +
                " in this course and <b>" + total + "</b> across the academy (" + members + " members)</span>";
              var chipEl = document.querySelector("a.frc-extra");
              var anchor = chipEl || card;
              anchor.parentNode.insertBefore(strip, anchor.nextSibling);
            } catch (e) {}
          }).catch(function () {});
        } catch (e) {}
      }
      if (window.FRCAccount && window.FRCAccount.enabled) {
        window.FRCAccount.ready.then(renderTeam).catch(function () {});
        window.addEventListener("frc:authchange", renderTeam);
      }
    } catch (e) { /* extras must never break a hub */ }
  });
})();

/* FRC Academy - mobile comfort.
 *
 * One injected stylesheet + a code-wrap toggle, so phones get comfortable
 * touch targets and readable code without editing any lesson file. The
 * coarse-pointer rules keep the thin desktop look everywhere else.
 */
(function () {
  "use strict";
  try {
    var css = document.createElement("style");
    css.textContent =
      "@media (pointer:coarse){" +
        "input[type=range]{height:28px;background:linear-gradient(var(--line-2,#33415e) 0 0) center/100% 5px no-repeat}" +
        "input[type=range]::-webkit-slider-thumb{width:26px;height:26px}" +
        ".blank,input[type=text],input[type=email],input[type=password]{font-size:16px}" +
        "summary{padding:8px 0}" +
      "}" +
      "@media (max-width:480px){pre.code{padding:12px}}" +
      "pre.frc-wrap{white-space:pre-wrap!important;overflow-wrap:anywhere}" +
      ".frc-wrapbtn{display:block;margin:0 0 5px auto;font-family:ui-monospace,Menlo,monospace;" +
      "font-size:10px;letter-spacing:.06em;padding:5px 9px;border-radius:7px;" +
      "border:1px solid #33415e;background:rgba(11,19,34,.85);color:#92a2be;cursor:pointer}";
    document.head.appendChild(css);

    function addWrapChips() {
      try {
        if (window.innerWidth > 560) return;
        var pres = document.querySelectorAll("pre.code");
        Array.prototype.forEach.call(pres, function (p) {
          if (p.scrollWidth <= p.clientWidth + 8) return; // nothing hidden
          if (p.previousElementSibling && p.previousElementSibling.className === "frc-wrapbtn") return;
          var b = document.createElement("button");
          b.className = "frc-wrapbtn";
          b.textContent = "\u2194 wrap lines";
          b.addEventListener("click", function () {
            var on = p.classList.toggle("frc-wrap");
            b.textContent = on ? "\u2192 scroll instead" : "\u2194 wrap lines";
          });
          p.parentNode.insertBefore(b, p);
        });
      } catch (e) {}
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addWrapChips);
    else addWrapChips();
  } catch (e) {}
})();

/* FRC Academy - PWA glue.
 *
 * Makes every page installable and offline-capable with no per-file change:
 * injects the manifest link, theme color, and app icons, then registers the
 * service worker. All paths are relative so they work under the GitHub Pages
 * project subpath. Registration is a no-op on file:// or older browsers.
 */
(function () {
  "use strict";
  try {
    var head = document.head || document.getElementsByTagName("head")[0];
    if (head) {
      function addEl(tag, attrs) {
        var el = document.createElement(tag);
        for (var a in attrs) el.setAttribute(a, attrs[a]);
        head.appendChild(el);
      }
      if (!document.querySelector('link[rel="manifest"]'))
        addEl("link", { rel: "manifest", href: "manifest.webmanifest" });
      if (!document.querySelector('meta[name="theme-color"]'))
        addEl("meta", { name: "theme-color", content: "#090d15" });
      if (!document.querySelector('link[rel="apple-touch-icon"]'))
        addEl("link", { rel: "apple-touch-icon", href: "icons/apple-touch-icon.png" });
      if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
        addEl("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
        addEl("meta", { name: "mobile-web-app-capable", content: "yes" });
        addEl("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
        addEl("meta", { name: "apple-mobile-web-app-title", content: "FRC Academy" });
      }
    }
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("service-worker.js").catch(function () {});
        // nudge the worker to warm (or resume warming) the full offline set,
        // once the page is idle so it never competes with lesson load
        var nudge = function () {
          try {
            navigator.serviceWorker.ready.then(function (reg) {
              if (reg && reg.active) reg.active.postMessage({ type: "frc-warm" });
            }).catch(function () {});
          } catch (e) {}
        };
        if ("requestIdleCallback" in window) requestIdleCallback(nudge, { timeout: 8000 });
        else setTimeout(nudge, 4000);
      });
    }
  } catch (e) { /* never break a page over install glue */ }
})();

(function () {
  "use strict";

  var URL = (window.FRC_SUPABASE_URL || "").trim();
  var KEY = (window.FRC_SUPABASE_ANON_KEY || "").trim();

  // The four courses and their localStorage progress keys.
  var COURSES = ["deploy", "closing-the-loop", "build", "systemcore"];
  function lsKey(course) { return course + ":done"; }
  function courseFromLsKey(k) {
    var m = /^(.*):done$/.exec(k);
    return m ? m[1] : null;
  }

  // ---- disabled mode: no backend configured -----------------------------
  if (!URL || !KEY) {
    window.FRCAccount = {
      enabled: false,
      ready: Promise.resolve(),
      user: null,
      profile: null,
      onChange: function () {},
      signIn: notConfigured, signUp: notConfigured, signOut: notConfigured,
      joinTeam: notConfigured, setDisplayName: notConfigured,
      getProfile: function () { return Promise.resolve(null); }
    };
    function notConfigured() {
      return Promise.reject(new Error("Accounts are not set up yet. See BACKEND-SETUP.md."));
    }
    return;
  }

  // ---- enabled mode ------------------------------------------------------
  var supabase = null;
  var user = null;        // current auth user or null
  var profile = null;     // current profile row or null
  var synced = {};        // course -> Set of item_keys we have already saved
  var listeners = [];     // auth-change callbacks

  function readLocal(course) {
    try { return JSON.parse(localStorage.getItem(lsKey(course))) || {}; }
    catch (e) { return {}; }
  }
  function trueKeys(map) {
    return Object.keys(map || {}).filter(function (k) { return !!map[k]; });
  }
  function notify() {
    var snap = { user: user, profile: profile };
    listeners.forEach(function (cb) { try { cb(snap); } catch (e) {} });
    try { window.dispatchEvent(new CustomEvent("frc:authchange", { detail: snap })); } catch (e) {}
  }

  // Save a course's local progress up to the account, diffing against what we
  // last saved so we only write what changed (and remove un-marked items).
  function pushCourse(course) {
    if (!user) return;
    var map = readLocal(course);
    var now = trueKeys(map);
    var nowSet = {}; now.forEach(function (k) { nowSet[k] = true; });
    var prev = synced[course] || {};
    var added = now.filter(function (k) { return !prev[k]; });
    var removed = Object.keys(prev).filter(function (k) { return !nowSet[k]; });

    if (added.length) {
      var rows = added.map(function (k) {
        return { user_id: user.id, course: course, item_key: k, done: true };
      });
      supabase.from("progress").upsert(rows, { onConflict: "user_id,item_key" })
        .then(function (r) { if (r && r.error) console.warn("progress save:", r.error.message); });
    }
    if (removed.length) {
      supabase.from("progress").delete().eq("user_id", user.id).in("item_key", removed)
        .then(function (r) { if (r && r.error) console.warn("progress clear:", r.error.message); });
    }
    synced[course] = nowSet;
  }

  // Pull the account's progress down, union it with what's in this browser,
  // write the union back to localStorage, then push anything local-only up.
  function syncOnLogin() {
    if (!user) return Promise.resolve();
    return supabase.from("progress").select("course,item_key,done").eq("user_id", user.id)
      .then(function (res) {
        var remote = {}; COURSES.forEach(function (c) { remote[c] = {}; });
        (res && res.data ? res.data : []).forEach(function (row) {
          if (row.done && remote[row.course]) remote[row.course][row.item_key] = true;
        });
        COURSES.forEach(function (course) {
          var local = readLocal(course);
          var union = {};
          trueKeys(remote[course]).forEach(function (k) { union[k] = true; });
          trueKeys(local).forEach(function (k) { union[k] = true; });
          try { localStorage.setItem.__orig
                ? localStorage.setItem.__orig.call(localStorage, lsKey(course), JSON.stringify(union))
                : localStorage.setItem(lsKey(course), JSON.stringify(union)); } catch (e) {}
          synced[course] = {};
          Object.keys(remote[course]).forEach(function (k) { synced[course][k] = true; });
          // push local-only items (made while signed out) up to the account
          pushCourse(course);
        });
        try { window.dispatchEvent(new CustomEvent("frc:progresssynced")); } catch (e) {}
      })
      .catch(function (e) { console.warn("progress sync:", e && e.message); });
  }

  // Intercept localStorage writes so a lesson marking itself done also saves
  // to the account, with no change to the 200+ lesson files.
  function hookLocalStorage() {
    var orig = localStorage.setItem.bind(localStorage);
    var wrapped = function (k, v) {
      orig(k, v);
      var course = courseFromLsKey(k);
      if (course && user) { try { pushCourse(course); } catch (e) {} }
    };
    wrapped.__orig = orig;
    try { localStorage.setItem = wrapped; } catch (e) {}
  }

  function setSessionUser(u) {
    user = u || null;
    if (!user) { profile = null; synced = {}; notify(); return Promise.resolve(); }
    return loadProfile().then(syncOnLogin).then(notify);
  }
  function loadProfile() {
    if (!user) { profile = null; return Promise.resolve(null); }
    return supabase.from("profiles").select("id,display_name,role,team_id").eq("id", user.id).maybeSingle()
      .then(function (r) { profile = (r && r.data) || null; return profile; })
      .catch(function () { profile = null; return null; });
  }

  var ready = (async function init() {
    try {
      var mod = await import("https://esm.sh/@supabase/supabase-js@2");
      supabase = mod.createClient(URL, KEY);
      hookLocalStorage();
      var sess = await supabase.auth.getSession();
      await setSessionUser(sess && sess.data && sess.data.session ? sess.data.session.user : null);
      supabase.auth.onAuthStateChange(function (_event, session) {
        setSessionUser(session ? session.user : null);
      });
    } catch (e) {
      console.warn("FRC accounts disabled (init failed):", e && e.message);
    }
  })();

  // ---- public API -------------------------------------------------------
  window.FRCAccount = {
    enabled: true,
    ready: ready,
    get user() { return user; },
    get profile() { return profile; },
    onChange: function (cb) { listeners.push(cb); if (user || profile) cb({ user: user, profile: profile }); },
    signUp: function (email, password, displayName) {
      return supabase.auth.signUp({
        email: email, password: password,
        options: { data: { display_name: displayName || "" } }
      });
    },
    signIn: function (email, password) {
      return supabase.auth.signInWithPassword({ email: email, password: password });
    },
    signOut: function () { return supabase.auth.signOut(); },
    getProfile: function () { return loadProfile(); },
    joinTeam: function (code) { return supabase.rpc("join_team", { p_code: code }).then(thenReload); },
    setDisplayName: function (name) { return supabase.rpc("set_display_name", { p_name: name }).then(thenReload); },
    adminCreateTeam: function (name, code) { return supabase.rpc("admin_create_team", { p_name: name, p_code: code }); },
    adminSetMember: function (userId, role, teamId) {
      return supabase.rpc("admin_set_member", { p_user: userId, p_role: role || null, p_team: teamId || null });
    },
    raw: function () { return supabase; }
  };
  function thenReload(r) { return loadProfile().then(function () { notify(); return r; }); }
})();
