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
| 🎮 Code | **Deploy** | `code.html` | `deploy-lesson-{1..36}.html` | 36 | indigo |
| 🔧 Build | **Fabricate** | `build.html` | `build-lesson-{1..43}.html` | 43 | amber |

`index.html` is the academy landing page that links to all three hubs.

**The pillars connect:** Deploy's Part 5 ("Make It Move") is a single card that
links straight into the Closing the Loop course rather than re-teaching control. So
the control material is shared, not duplicated.

### Filename ↔ course-name gotcha

The course *name* and its *file prefix* don't always match. Keep this map handy:

- Control → course "**Closing the Loop**" → hub `closing-the-loop.html`, lessons `closing-the-loop-lesson-N.html`
- Code → course "**Deploy**" → hub `code.html`, lessons `deploy-lesson-N.html`
- Build → course "**Fabricate**" → hub `build.html`, lessons `build-lesson-N.html`

### Companions (Control course)

- `glossary.html` - terms reference
- `certificate.html` - completion certificate
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
- **Lessons auto-mark done**: when every quiz question in a lesson is answered
  (all `.opt` elements `locked`), the lesson writes its filename into the course's
  `done` map. See the small trailing `<script>` in each lesson (`KEY=...`, `mark()`).
- Hubs read the map to render progress bars, stats, and a Reset button. `index.html`
  reflects Control-course progress on its card.

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
