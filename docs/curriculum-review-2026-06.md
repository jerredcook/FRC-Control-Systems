# FRC Academy — Deep Review & Competitive Analysis

*Date: June 2026. A critical assessment of the FRC Academy content (the three courses
— Deploy / Closing the Loop / Fabricate — plus the battery unit and the SystemCore
alpha course), how high-school students will receive it, how much they will really
learn, and how it stacks up against the best FRC training that exists.*

> **How this was produced:** four adversarial reviewers (a veteran FRC software
> mentor, a learning scientist, two simulated students, and a build/electrical SME)
> were each told to find faults, not praise; two competitive-research sweeps mapped
> the FRC training landscape; findings were cross-checked. The reviewers agreed
> closely, which is why this is worth trusting.

---

## Headline verdict

A genuinely excellent, accurate, and unusually clear **front door** to FRC — the best
*interactive on-ramp* in the FRC world. It is **not** a replacement for hands-on
building, the authoritative docs, or a CAD/fabrication apprenticeship, and it should
not try to be. It produces **well-informed teammates, not yet contributors**. Made the
front door *and* wired to the best of the rest, it becomes the best overall *experience*
a team can have — fully owned by us.

**Is it better than everything else? No — and claiming so would not serve the team.**
But it is genuinely #1 on a real, ownable axis, and on two narrow things it may be the
single best resource that exists today.

---

## The four bars, scored

Nothing hits 100%. Read the bars as a direction, with a clear gap to close.

| Bar | Score | Verdict |
|---|---|---|
| **Accurate** | ~87 | Strong and current (real Phoenix 6; flags WPILib 2026 deprecations). Residual issues: a feedforward 2-arg/1-arg contradiction across control lessons 6 vs 8/12; example controllers lack output clamping/soft-limit notes; content drifts yearly without maintenance. |
| **Appropriate** | ~80 | Excellent level and tone for HS. Safety is "good as text, insufficient as preparation" — build-lesson-37 gamifies picking the lathe/mill before any hands-on sign-off. |
| **Useful** | ~50 | The weak bar, and structural. Reading-to-doing ratio ~95/5, and the 5% is thin (single-token fill-ins, watch-not-build sims, recall quizzes with joke distractors). Produces informed teammates, not contributors. Exception: the battery unit is genuinely operational. |
| **Understandable** | ~90 | The strongest bar, possibly best-in-class. One danger: always-converging sims + always-green quizzes create false confidence. |

**Concrete bug:** completion = "answered every quiz," and **wrong answers still mark a
lesson done.** The progress bar and certificate certify that a student clicked, not
that they learned.

---

## How students receive it, and how much they learn

From the two-student walkthrough:

- **"Maya" (rookie, no code):** loves the welcome and the hands-on demos, then **quits at
  the first real-code wall** (Deploy ~lesson 6–12, or any cosine/integral lesson). Survives
  longer in the build track. Predicted solo completion ~25%.
- **"Dev" (already codes):** **binges the Control course out of order** because it's dense and
  respects him (he'd cite the Phoenix 6 content over the docs), but **cherry-picks and skips
  the rest**, and finds SystemCore too gentle. The only thing that truly challenges him — the
  "Going further" questions — has no answers or payoff.

**How much will they really learn?** Reviewers converged: **concept/vocabulary ~80,
transferable hands-on skill ~20–25.** That is the honest ceiling of reading + watching +
clicking. Conceptual literacy is genuinely valuable (better, faster-onboarded teammates) —
it is just not the same as skill.

---

## Where we are genuinely best-in-class

- **Interactive, no-install, full-path, dual-language onboarding.** No other FRC resource
  combines hand-built in-browser simulations + a complete beginner→advanced sweep + Java *and*
  Python via a toggle. The combination is unique. This is the moat.
- **The battery/power unit** (build-lesson-41/42/43) — no interactive peer anywhere.
- **The SystemCore 2027 alpha course** — right now there is no beginner-friendly, structured
  teaching of SystemCore anywhere. We occupy genuinely empty space. Our most credible "#1" today.
- **Cohesive single-voice narrative across all three pillars** — the community equivalent is a
  scavenger hunt across a dozen sites.

## Where we are clearly beaten (the giants to stand on, not fight)

| Dimension | Who beats us | Why it isn't winnable head-on |
|---|---|---|
| Authority & currency | **WPILib docs** (docs.wpilib.org) | They write the libraries; versioned every January. Ours rots without maintenance. |
| Controls depth | **Tyler Veness, *Controls Engineering in the FIRST Robotics Competition*** | A WPILib core dev's free book; state-space/LQR/Kalman deeper than any beginner course should go. |
| Hands-on hardware | **FIRST official Java course + Romi/XRP** | Real little robots you deploy to. Sims can't replace it. |
| CAD skill | **FRCDesign.org** (official Onshape partner) | A full staged Onshape course → model a whole robot. Ours is one lesson. Beaten decisively. |
| Design math | **ReCalc (reca.lc) / JVN / ILITE** | The community sizes mechanisms with these. We teach ratio arithmetic, never load→motor→ratio. |
| Real fabrication | **REV/WCP/AndyMark build guides, Ri3D** | "Which bolt goes where" is physical; photos/video win. |
| Adoption / proof | **WPILib (universal), AdvantageKit (600+ teams), LearnFRC (new)** | Ours is unproven. LearnFRC is the live competitor for our niche. |

### The live competitor to watch: LearnFRC (learnfrc.systemerr.com)
Free, **all 11 FRC departments** (mechanical, CAD, programming, electrical, strategy,
business, outreach, Impact, safety…), **gamified** (XP, badges, global leaderboard,
profiles), **accounts + team join codes**, example-rich (real part numbers/code). Launched on
Chief Delphi this cycle. It is broader and more product-polished than us, but appears to lack
**true interactive simulations** and **dual-language Java+Python**, and its content is
AI-drafted (an accuracy risk). It competes directly for the "structured onboarding" niche.

---

## Strategy: own #1 where it's ours, stand on the giants elsewhere

You can credibly own #1 at the thing that is actually ours — the interactive, all-in-one,
dual-language **front door** — and on the battery unit and the SystemCore course we arguably
already do. "Better than everyone at everything" is neither winnable nor desirable: WPILib will
always be more authoritative (they ship the libraries), Veness deeper, FRCDesign better at CAD.
The winning move — the one that actually gives the team the best training while we keep
ownership — is to **own the unique pedagogy/onboarding layer and link out to the authorities**:
WPILib as the source of truth, FRCDesign for CAD, ReCalc for the numbers. We keep what nobody
else does well; we borrow authority instead of competing with it.

---

## Recommendations

### Quick wins (accuracy/safety — to actually hit the 100% bar)
1. Fix the feedforward 2-arg/1-arg contradiction (control lessons 6/8/12) and add output
   clamping / soft-limit notes to the example controllers.
2. De-gamify lathe/mill selection in build-lesson-37; front-load "this is theory; hands-on
   needs mentor sign-off."
3. Re-verify/soften the SystemCore claims: the "1,000+ offseason matches" and "~Oct 2026 retail"
   lines; do not state a hard cutover or imply MotionCore ships in the FRC-2027 kit (its role is
   FTC-focused / unconfirmed for FRC, and the roboRIO transition timeline is not finalized); add a
   "what does NOT carry over" beat (LabVIEW dropped; Shuffleboard/SmartDashboard/PathWeaver/
   RobotBuilder removed for 2027; Java namespace edu.wpi.first → org.wpilib).

### Higher-leverage upgrades (move "Useful" and real learning from ~50 toward best-in-class)
4. **Make completion mastery-based, not participation-based**, and add one cumulative/interleaved
   checkpoint per Part (reuses everything already built; injects the retention practice that is
   currently 0%).
5. **Turn every sim into predict → observe → explain** (commit a guess before the sliders unlock).
6. **Give the "Going further" questions real answers/challenges** — already the best content for
   advanced kids, currently the most wasted.
7. **Build the bridge to real doing:** a hardware-free capstone on the official XRP/Romi path, plus
   a mechanical "size-your-mechanism" worksheet (mirroring the control tuning worksheet) so the gear
   lessons actually do ReCalc-style math in our interactive style.
8. **Anchor / link out** to WPILib, FRCDesign, ReCalc, Veness, vendor build guides — own the front
   door, borrow the authority. Where possible, add a "go deeper with the experts" action at the end
   of each track.

---

## Key resources referenced

- WPILib docs: https://docs.wpilib.org · Zero-to-Robot + XRP/Romi: https://docs.wpilib.org/en/stable/docs/zero-to-robot/introduction.html
- FIRST official Java Programming course (Romi/XRP): https://training.firstinspires.org/courses/java-programming-part-1
- Tyler Veness, *Controls Engineering in FRC*: https://controls-in-frc.link
- FRCDesign.org (Onshape, FRC CAD): https://www.frcdesign.org · Onshape Learning Center: https://learn.onshape.com
- ReCalc (mechanism design math): https://www.reca.lc
- AdvantageKit / AdvantageScope (Team 6328): https://docs.advantagekit.org
- LearnFRC (competitor): https://learnfrc.systemerr.com · CD: https://www.chiefdelphi.com/t/learnfrc-a-free-onboarding-curriculum-for-every-frc-department-now-with-team-tools/522033
- Vendor build guides: REV https://docs.revrobotics.com · WCP https://docs.wcproducts.com · AndyMark https://docs.andymark.com
- PathPlanner https://pathplanner.dev · Choreo https://choreo.autos · RobotPy https://robotpy.readthedocs.io
- Chief Delphi: https://www.chiefdelphi.com
- WPILib 2027 removed features: https://docs.wpilib.org/en/2027/docs/yearly-overview/removed-features.html
