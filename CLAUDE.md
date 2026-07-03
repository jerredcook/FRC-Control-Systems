# FRC Academy

A free, interactive, browser-based academy that teaches kids to **build, code, and
control** an FRC (FIRST Robotics Competition) robot from zero. Static site, no
install, hosted on GitHub Pages: https://jerredcook.github.io/FRC-Control-Systems/

## What this is

Three self-contained courses (the three pillars: **Build · Code · Control**), plus
an academy landing page and a set of companion tools. Everything is plain
HTML/CSS/JavaScript: **no dependencies, no build step, no framework, no internet
required.** Every file opens directly in a browser.

| Pillar | Course | Hub file | Lesson files | Count | Accent |
|--------|--------|----------|--------------|-------|--------|
| 🎯 Control | **Closing the Loop** | `closing-the-loop.html` | `closing-the-loop-lesson-{1..24}.html` | 24 | teal |
| 🎮 Code | **Deploy** | `code.html` | `deploy-lesson-{1..37}.html` | 37 | indigo |
| 🔧 Build | **Fabricate** | `build.html` | `build-lesson-{1..44}.html` | 44 | amber |

`index.html` is the academy landing page that links to all three hubs.

**Plus an alpha preview course:** **SystemCore** (`systemcore.html` hub +
`systemcore-lesson-1..9.html`, key `systemcore:done`, coral accent) covers the 2027
control system that replaces the roboRIO. It is deliberately framed as **provisional
and subject to change** (every lesson opens with a red "Alpha preview" banner; the
hub has a standing alpha notice and a sources list). It is researched from official
FIRST/WPILib sources, not authoritative, so re-verify facts before relying on them.
`systemcore-2027.html` is a redirect stub to `systemcore.html` (the old single-page
preview that the course replaced).

**The pillars connect:** Deploy's Part 5 ("Make It Move") is a single card that
links straight into the Closing the Loop course rather than re-teaching control. So
the control material is shared, not duplicated.

**Deploy's capstone (Part 9):** `deploy-lesson-37.html` (+ `-py` twin) is a hands-on
capstone that runs the same WPILib command-based code on a real, low-cost **XRP**
robot (runs in simulation on the laptop, talking to the XRP over WiFi). It is wired
as a `{code:"9", title:"Capstone"}` part in `code.html`'s `COURSE`, and the hub
render skips a checkpoint card for it (the condition excludes part codes `5` and `9`).
It hands the exact, current setup to the official WPILib XRP/Romi guides.

### Filename ↔ course-name gotcha

The course *name* and its *file prefix* don't always match. Keep this map handy:

- Control → course "**Closing the Loop**" → hub `closing-the-loop.html`, lessons `closing-the-loop-lesson-N.html`
- Code → course "**Deploy**" → hub `code.html`, lessons `deploy-lesson-N.html`
- Build → course "**Fabricate**" → hub `build.html`, lessons `build-lesson-N.html`

### Companions (Control course)

- `glossary.html` - academy-wide terms reference (Build + Code + Control, filterable by
  course and topic; linked from all three hubs, not just Control)
- `certificate.html` - completion certificate; academy-wide with a course selector
  (Control / Code / Build / Academy). Counts real per-course progress (excludes
  checkpoints, normalizes `-py` twins); the Academy tab certifies all three courses
  (105 lessons). Linked from all three hubs. Name persists under `frc:name`.
- `review.html` - academy-wide "review what you missed" page. Re-tests, with the
  mastery handler, every quiz question the student first got wrong; answering one
  correctly clears it. Filterable by course. Linked from all three hubs. Reads the
  `frc:review` pool (see review capture below); localStorage-only, no backend needed.
- `worksheet.html` - interactive tuning worksheet: enter a mechanism's numbers → paste-ready Phoenix 6 Java + a printable gains record
- `closing-the-loop-troubleshooting.html` - troubleshooting field guide
- `templates/` - complete, paste-ready WPILib + CTRE Phoenix 6 Java subsystems (`Elevator.java`, `Arm.java`, `Flywheel.java`, `Constants.java`) with `// TODO` markers, capstone code from Part IV

## Architecture & conventions

### Java / Python parallel track

The **Deploy** and **Closing the Loop** code lessons exist in two languages as
**separate files**: the Java lesson `deploy-lesson-N.html` has a Python twin
`deploy-lesson-N-py.html` (same for `closing-the-loop-lesson-N-py.html`). Python =
**RobotPy + phoenix6 + commands2**; templates in [templates/python/](templates/python/).

- Each course hub (`code.html`, `closing-the-loop.html`) has a **Java/Python toggle**.
  The chosen language is saved in `localStorage` under the shared key **`frc:lang`**
  (so it carries across both courses). `render()` computes the active file via
  `activeFile(L)` = `L.file.replace(/\.html$/,"-py.html")` when Python is selected.
  Progress is tracked per-language (the `-py` filename is a separate done-key).
- Every Python lesson has a "switch to Java" link in its hero and threads its nav to
  `-py` siblings. To add/keep parity: a Java lesson change needs the same change in
  its `-py` twin.
- Fabricate (Build) is Java-adjacent only where it shows code; it has no Python track.

### Course hubs are data-driven

Each hub (`closing-the-loop.html`, `code.html`, `build.html`) has a `COURSE` array
at the top of its inline `<script>`. Each entry is a *part*; each part has a
`lessons` array. The hub renders cards from this array, so:

> **To add a lesson: add one entry to the `COURSE` array + create one lesson file.** Nothing else.

Lesson entries look like:
```js
{n:1, title:"...", desc:"...", file:"deploy-lesson-1.html"}
```
- `file:` → a real, available lesson (renders as an "Open" card).
- omit `file` → renders as a "Planned" card (greyed out).
- `link:` instead of `file:` → a cross-course card (e.g. Deploy Part 5 → Closing the Loop), set `control:true` on the part.

Part codes differ by course: Control uses Roman numerals (`I` to `V`); Deploy and
Fabricate use numbers (`1` to `8`).

### Progress persistence

- Each course stores progress in `localStorage` under its own key:
  `closing-the-loop:done`, `deploy:done`, `build:done`.
- The value is a map `{ "lesson-filename.html": true }`.
- **Mastery completion**: a quiz question locks only when the **correct** option is
  clicked (a wrong answer turns red and stays retryable). The trailing mark-done
  `<script>` gates on `.opt.locked`, so a lesson auto-marks done only when **every
  question is answered correctly**. (Older "any answer marks done" behavior was
  replaced; the handler is identical across all quiz pages.)
- Hubs read the map to render progress bars, stats, and a Reset button. `index.html`
  reflects Control-course progress on its card.

### Per-Part cumulative checkpoints

Each Part has a standalone **checkpoint** quiz page that cumulatively re-tests that
Part (and interleaves earlier parts): `build-checkpoint-{1..8}.html`,
`deploy-checkpoint-{1,2,3,4,6,7,8}.html` (Part 5 is the control-course link, no
checkpoint), `closing-the-loop-checkpoint-{1..5}.html` (1..5 = Parts I..V). They use
the mastery quiz handler and mark themselves done in the course's `done` map (so the
filename appears alongside lessons). The hubs **derive** the checkpoint filename from
the part code in `render()` and append a green `.card.checkpoint` card after each
part's lessons; there is no `checkpoint` field in the `COURSE` array. Checkpoints are
not counted in the lesson totals.

### Predict-first on interactive sims

Every lesson with a manipulable sim (canvas or slider, 118 pages counting `-py`
twins) has a `<div class="quiz predict" id="predict">` block immediately **before**
its `<div class="demo" ...>`: a single "Predict first" question (3 options,
`data-correct`) tied to the sim's key dynamic. The student commits a guess, the
answer reveals, then they run the sim. It is wired by a small isolated `<script>`
(`querySelector('#predict .q')`) added just before `</body>`. The `#predict` id keeps
it fully separate from the lesson's `#quiz` (predictions never affect completion),
and it reveals on **any** click (formative, not mastery-gated). The `-py` twins share
the identical block and handler.

### Accounts and progress sync (optional backend)

The site is still fully static and works with no backend. An **optional** Supabase
layer adds student accounts, cross-device progress, and a mentor dashboard. It is
**off until configured** and degrades gracefully.

- `account-config.js` holds `FRC_SUPABASE_URL` / `FRC_SUPABASE_ANON_KEY`. **Blank =
  disabled** (anonymous, localStorage-only, exactly as before). The anon key is
  public by design; row-level security protects the data.
- `account.js` is a plain `<script>` (loaded on every page, after the sweep) that,
  when configured and signed in, merges remote progress into `localStorage`, pushes
  local progress up, and **hooks `localStorage.setItem`** so any `*:done` write syncs
  with no change to the 200+ lesson files. It exposes `window.FRCAccount` and never
  throws into the page. It dispatches `frc:progresssynced` (hubs/index re-render on
  it) and `frc:authchange`.
- `login.html` = sign up / sign in / join a team by code. `mentor.html` = the
  dashboard (role-gated; admins manage teams + roles). Each member row expands to a
  per-student drill-down (per-course lessons + which checkpoints are passed/stuck,
  per-course last-active, a recent-activity timeline) plus a class-readiness summary
  strip. All derived client-side from the existing `progress` rows - no schema change.
- `supabase/schema.sql` = tables (`teams`, `profiles` with role student/mentor/admin,
  `progress`), RLS, and `SECURITY DEFINER` helpers/RPCs. `BACKEND-SETUP.md` is the
  turnkey setup guide. Data model: progress rows are `(user_id, course, item_key,
  done)`; the dashboard normalizes `-py` twins to one lesson.
- Every page includes `account-config.js` + `account.js` before `</body>`. New pages
  must keep that include.
- **Review capture**: `account.js` begins with a small, always-on IIFE (runs even with
  no backend, before the disabled-mode return) that records missed quiz questions. It
  attaches one delegated listener to `#quiz`, reads the same `.q[data-correct]` markup
  the mastery handler uses, works out right/wrong itself, and on a first wrong answer
  writes the question (prompt, options, correct index, explanation, course) into the
  `frc:review` localStorage map - keyed `filename.html#qN`. It skips once a question is
  solved (`.opt.locked`/`.correct` present) and records each question at most once per
  page load. No change to the 200+ lesson files. `review.html` consumes this pool.

### Installable app (PWA)

The site is an installable, offline-capable Progressive Web App - still static, no
build step, no dependencies.

- `manifest.webmanifest` (name, icons, `display:standalone`, dark theme). All paths
  are **relative** because GitHub Pages serves the site under a project subpath
  (`/FRC-Control-Systems/`); absolute `/` paths would break. `icons/` holds the PNGs,
  generated from `icons/icon.svg` (the glowing loop + three pillar dots).
- `service-worker.js` precaches an app **shell** (home, hubs, companions, scripts,
  icons, `offline.html`) and then **runtime-caches** every other same-origin page the
  first time it is opened (stale-while-revalidate). So a lesson works offline after
  one online visit. It **never intercepts cross-origin** requests, so the Supabase
  library (`esm.sh`) and external doc links are untouched and can't break offline use.
  Bump `VERSION` to ship a new shell and evict the old cache.
- **No per-file change**: `account.js` (already on every page) injects the manifest
  link, theme-color, apple-touch icon/metas, and registers the service worker - the
  same "don't touch the 200+ lesson files" trick used for review capture. New pages
  get PWA behavior for free just by keeping the `account.js` include.
- `offline.html` is the fallback shown when navigating offline to an uncached page.
- **Play Store (TWA) later**: needs a Digital Asset Links file at the *origin root*
  (`/.well-known/assetlinks.json`), which a project subpath can't serve - so it
  requires a custom domain or the user-root Pages repo first, then PWABuilder/
  Bubblewrap. The browser-install PWA works as-is on the current subpath.

### Lesson file anatomy

Each lesson is one standalone HTML file:
- Shared design system via CSS `:root` variables (`--bg`, `--panel`, `--teal`,
  `--amber`, `--indigo`, `--ink`, mono + sans font stacks). Per-course accent color.
- Hand-written `<canvas>` physics simulations (elevator, arm, flywheel, swerve,
  vision, etc.), no libraries.
- A **"Going further · optional"** `.note` box before the quiz, holding stretch
  content for advanced students. Every lesson has one; it reuses the course-accent
  `.note` variant (`teal` for Control, `indigo` for Code/Build). This is how the
  site serves all ability levels: recaps/glossary for strugglers, this box for the
  advanced.
- A quiz block (`#quiz` with `.q` / `.opt` / `data-correct` / `.explain`).
- An "Up next" card linking the following lesson, and a `.coursenav` footer linking
  back to the hub ("map").
- The trailing auto-mark-done script.

### Code examples

Target **WPILib (Java)** and **CTRE Phoenix 6**, current season. Tuning philosophy
(see `templates/README.md`): **Configure → Characterize (feedforward) → add kP →
Motion Magic → validate.** Feedforward before feedback, always.

## Writing style (important)

- **No em dashes anywhere.** Use a hyphen with spaces, a comma, or a period instead.
- **Don't rely on double spaces between sentences** in HTML, they collapse. Single space.
- **Audience is kids who don't drive yet.** Prefer bike and everyday analogies over
  car/driving analogies.

## Working on this project

- No build/test/lint tooling. To preview, open the HTML file in a browser (or
  `open <file>.html` on macOS).
- When editing inline `<script>` JS, you can sanity-check syntax by extracting the
  script and running `node --check`.
- Keep new lessons consistent with the existing design system and the conventions
  above (data-driven hub entry, quiz-driven mark-done, accent color, writing style).

## Publishing

Served as a static site via GitHub Pages from the `main` branch root. `index.html`
at the repo root is the landing page. Commit + push to `main` to publish.
