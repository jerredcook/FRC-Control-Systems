# FRC Academy

**Learn to build robots.** An interactive, browser-based academy that takes you
from never having touched a robot to designing, programming, and tuning a
competition FRC machine. Every lesson is hands-on, starts from zero, and runs
with no install.

### 🌐 Live: https://jerredcook.github.io/FRC-Control-Systems/

Three courses - three pillars - **103 interactive lessons, all complete:**

| | Course | Covers | Status |
|---|--------|--------|--------|
| 🎯 **Control** | **Closing the Loop** | Feedback, PID, feedforward, CTRE Phoenix 6, tuning, swerve, vision, state-space | ✅ **Complete - 24 lessons** + glossary, certificate, worksheet, field guide |
| 🎮 **Code** | **Deploy** | Toolchain, Java, command-based robots, hardware, autonomous, vision, pro practices | ✅ **Complete - 36 lessons** across 8 parts |
| 🔧 **Build** | **Fabricate** | CAD, motors & gearboxes, drivetrains, mechanisms, electrical, pneumatics, battery & power, manufacturing | ✅ **Complete - 43 lessons** across 8 parts |

The pillars connect: **Deploy**'s "Make It Move" unit *is* the **Closing the Loop**
course, so the control material is shared rather than rebuilt.

## ▶ Start here

Open **`index.html`** (the academy landing) in any browser, or visit the live
site. Pick a course:

- **`code.html`** - the Code course hub: **Deploy** (36 lessons).
- **`build.html`** - the Build course hub: **Fabricate** (43 lessons).
- **`closing-the-loop.html`** - the Control course hub: **Closing the Loop** (24 lessons).

No install, no build step, no internet required. Progress is saved per-course in
your browser; finishing a lesson's quiz marks it done automatically.

## Closing the Loop - for your robot

The Control course ships with companions that turn lessons into real code:

- **[Tuning worksheet](worksheet.html)** - enter your mechanism's numbers → paste-ready Phoenix 6 Java + a printable gains record.
- **[Java templates](templates/)** - complete `Elevator`, `Arm`, `Flywheel` subsystems with `// TODO` markers.
- **[Glossary](glossary.html)** · **[Certificate](certificate.html)** · **[Troubleshooting field guide](closing-the-loop-troubleshooting.html)**

## How it's built

- Plain HTML/CSS/JavaScript - **no dependencies, no build tools, no framework**.
- Each lesson is one self-contained file; simulations are hand-written `<canvas>`
  physics (elevator, arm, flywheel, swerve, vision, and more).
- Each course hub is **data-driven**: a `COURSE` array at the top of its script
  defines every part and lesson, so adding one is an entry plus a file.
- Code examples target **WPILib (Java)** and **CTRE Phoenix 6**, current season.

## Publishing (GitHub Pages)

Served as a static site via GitHub Pages (main branch, root). `index.html` at the
repo root is the academy landing page.

## License

See `LICENSE` if present. Educational use is encouraged.

---

*FRC Academy · Build · Code · Control.*
