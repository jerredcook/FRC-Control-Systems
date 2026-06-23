# Closing the Loop

**An interactive control-systems course for FRC** — from the one idea behind all
control, to real WPILib code, to tuning a Kraken with CTRE Phoenix 6, and beyond.

### 🌐 Live: https://jerredcook.github.io/FRC-Control-Systems/

It's built for students who start at zero. Every lesson is hands-on: you feel the
control problem first (live physics simulations you can drive), then name it, then
see the code. No prior controls background required. **24 lessons, all complete.**

## ▶ Start here

Open **`index.html`** in any browser — that's the course map. Or visit the live
site above. No install, no build step, no internet required: every lesson is a
single self-contained HTML file. Your progress is saved in your browser.

## Course outline — all 24 lessons

**Part I — The Idea** · *concepts, no code*
1. Feedback & Control · 2. Proportional · 3. Integral · 4. Derivative ·
5. Tuning PID · 6. Feedforward · 7. System Identification · 8. The Complete Controller

**Part II — From Math to Code** · *WPILib, Java*
1. Robot Code Anatomy · 2. Units, Gears & Conversions · 3. Your First Closed Loop in Code ·
4. Feedforward in Code · 5. Motion Profiles

**Part III — CTRE Phoenix 6**
1. Meet Phoenix 6 & the Kraken · 2. Configuring a TalonFX · 3. On-Motor Closed Loop ·
4. Motion Magic · 5. SysId on Phoenix 6

**Part IV — Tune a Real Mechanism**
1. The Elevator, End to End · 2. The Arm · 3. The Flywheel

**Part V — Beyond**
1. Swerve Drive Control · 2. Vision-Assisted Control · 3. State-Space & LQR

## For your robot

Two companions turn the lessons into real, running code:

- **[Tuning worksheet](worksheet.html)** — enter your mechanism's CAN id, gear
  ratio, and SysId gains; it generates paste-ready Phoenix 6 Java plus a
  printable tuning record. Saved in your browser.
- **[Java templates](templates/)** — complete `Elevator`, `Arm`, and `Flywheel`
  command-based subsystems (plus a `Constants`), straight from Part IV, with
  `// TODO` markers for your team's own numbers.

## How it's built

- Plain HTML/CSS/JavaScript — **no dependencies, no build tools, no framework**.
- Each lesson is one file; simulations are hand-written `<canvas>` physics
  (elevator, arm, flywheel, swerve, vision, and more).
- The course hub (`index.html`) is data-driven: the `COURSE` array near the top
  of its `<script>` defines every part and lesson, so adding or reordering a
  lesson is one entry plus the file.
- Code examples target **WPILib (Java)** and **CTRE Phoenix 6**, current season.

## Publishing (GitHub Pages)

This repo serves as a static site via GitHub Pages (main branch, root folder).
The live course is at:

> **https://jerredcook.github.io/FRC-Control-Systems/**

`index.html` at the repo root is the landing page.

## License

See `LICENSE` if present. Educational use is encouraged.

---

*Closing the Loop · A control systems course for FRC.*
