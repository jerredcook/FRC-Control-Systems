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
