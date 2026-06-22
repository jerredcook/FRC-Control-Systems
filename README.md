# Closing the Loop

**An interactive control-systems course for FRC** — from the one idea behind all
control, to real WPILib code, to tuning a Kraken with CTRE Phoenix 6, and beyond.

### 🌐 Live: https://jerredcook.github.io/FRC-Control-Systems/

It's built for students who start at zero. Every lesson is hands-on: you feel the
control problem first (live physics simulations you can drive), then name it, then
see the code. No prior controls background required.

## ▶ Start here

Open **`index.html`** in any browser — that's the course map. Or, once published,
visit the live site (see *Publishing* below). No install, no build step, no internet
required: every lesson is a single self-contained HTML file.

Your progress (which lessons you've completed) is saved in your browser.

## Course outline

**Part I — The Idea** · *concepts, no code* — **available now**

| # | Lesson | What it covers |
|---|--------|----------------|
| 1 | Feedback & Control | The loop behind everything: measure → compare → correct |
| 2 | Proportional Control | `output = kP × error` |
| 3 | Integral Control | A memory that erases steady-state error |
| 4 | Derivative Control | Brakes that read your speed and kill overshoot |
| 5 | Tuning PID | A repeatable order for dialing in kP, kI, kD |
| 6 | Feedforward | Predicting the voltage a move needs (kS, kG, kV, kA) |
| 7 | System Identification | *Measuring* those gains from your real mechanism |
| 8 | The Complete Controller | Feedforward + feedback + motion profile, together |

**Coming next**

- **Part II — From Math to Code** (WPILib, Java): robot project anatomy, units & gear
  ratios, your first closed loop in code, feedforward in code, motion profiles
- **Part III — CTRE Phoenix 6**: the Kraken/TalonFX, configuration, on-motor closed
  loop, Motion Magic, SysId
- **Part IV — Tune a Real Mechanism**: an elevator, an arm, and a flywheel, each
  taken start-to-finish
- **Part V — Beyond**: swerve drive control, vision-assisted control, state-space & LQR

## How it's built

- Plain HTML/CSS/JavaScript — **no dependencies, no build tools, no framework**.
- Each lesson is one file; simulations are hand-written `<canvas>` physics.
- The course hub (`index.html`) is data-driven: the `COURSE` array near the top of its
  `<script>` defines every part and lesson, so adding a lesson is one entry plus the file.
- Code examples target **WPILib (Java)** and **CTRE Phoenix 6**.

## Publishing (GitHub Pages)

This repo serves as a static site via GitHub Pages (main branch, root folder). The
live course is at:

> **https://jerredcook.github.io/FRC-Control-Systems/**

`index.html` at the repo root is the landing page.

## License

See `LICENSE` if present. Educational use is encouraged.

---

*Closing the Loop · A control systems course for FRC.*
