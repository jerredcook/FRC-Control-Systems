/* FRC Academy - service worker (installable + offline).
 *
 * The app shell (home, hubs, companions, scripts, icons) is precached on
 * install. Every other same-origin page/asset - lessons, checkpoints - is
 * cached the first time it is opened, so a lesson works offline after one
 * online visit (stale-while-revalidate).
 *
 * Cross-origin requests are never intercepted: the Supabase library and any
 * external documentation links go straight to the network, so accounts still
 * work online and can never break the offline experience.
 *
 * Full offline: precache-manifest.js (a generated list of every page) is
 * warmed in the background after activation, in small chunks, skipping
 * anything already cached - so the entire academy works offline right after
 * install, and an interrupted warm resumes on the next page visit (account.js
 * posts a "frc-warm" message on load).
 *
 * Bump VERSION to ship a new shell and evict the old cache.
 */
var VERSION = "frc-academy-v3";

try { importScripts("precache-manifest.js"); } catch (e) { /* manifest optional */ }

var SHELL = [
  "index.html",
  "closing-the-loop.html", "code.html", "build.html", "systemcore.html",
  "glossary.html", "review.html", "certificate.html", "worksheet.html",
  "account-config.js", "account.js",
  "manifest.webmanifest", "offline.html",
  "icons/icon-192.png", "icons/icon-512.png",
  "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // add each shell item on its own so one 404 can't fail the whole install
      return Promise.all(SHELL.map(function (u) {
        return cache.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

// Warm the full-site list in the background: fetch anything not yet cached,
// a few files at a time, each failure swallowed. Idempotent, so it can be
// re-triggered any time to resume where an interrupted warm left off.
var warming = false;
function warmAll() {
  var list = (self.FRC_PRECACHE || []).slice();
  if (!list.length || warming) return Promise.resolve();
  warming = true;
  return caches.open(VERSION).then(function (cache) {
    var i = 0, CHUNK = 5;
    function next() {
      var batch = list.slice(i, i + CHUNK);
      if (!batch.length) return Promise.resolve();
      i += CHUNK;
      return Promise.all(batch.map(function (u) {
        return cache.match(u).then(function (hit) {
          if (hit) return;
          return fetch(u).then(function (res) {
            if (res && res.status === 200 && res.type === "basic") return cache.put(u, res);
          }).catch(function () {});
        });
      })).then(next);
    }
    return next();
  }).then(function () { warming = false; }, function () { warming = false; });
}

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
      .then(function () { return warmAll(); })
  );
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "frc-warm") {
    if (e.waitUntil) e.waitUntil(warmAll());
    else warmAll();
  }
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && res.status === 200 && res.type === "basic") {
            cache.put(req, res.clone());
          }
          return res;
        }).catch(function () {
          if (req.mode === "navigate") {
            return cache.match("offline.html").then(function (o) {
              return o || cache.match("index.html");
            });
          }
          return cached; // may be undefined for an uncached asset
        });
        // serve cache-first for speed and offline, revalidate in the background
        return cached || network;
      });
    })
  );
});
