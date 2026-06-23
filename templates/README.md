# Robot starter templates

Real, paste-ready **WPILib (Java) + CTRE Phoenix 6** subsystems — the capstone
code from *Closing the Loop*, as complete files you can drop into your robot
project and fill in. They turn "I understand it" into "it's on our robot."

| File | Mechanism | Control | Lesson |
|------|-----------|---------|--------|
| `Elevator.java` | Elevator / lift | Position, Motion Magic | Part IV.1 |
| `Arm.java`      | Pivoting arm     | Position, `Arm_Cosine` gravity + FusedCANcoder | Part IV.2 |
| `Flywheel.java` | Shooter wheel    | Velocity, kV-dominant | Part IV.3 |
| `Constants.java`| —                | One home for ids, ratios, and gains | Part II.1 |

## How to use them

1. **Copy** the subsystem(s) you need into `src/main/java/frc/robot/subsystems/`
   (and `Constants.java` into `src/main/java/frc/robot/`).
2. **Search for `// TODO`** and replace every value with your robot's own:
   - CAN ids and gear ratios (Lessons II.2 + III.2)
   - Current limits for your motor/breaker (Lesson III.2)
   - Motion Magic cruise velocity & acceleration (Lesson III.4)
3. **Get the gains from SysId**, don't guess them (Lessons I.7 + III.5). Run the
   characterization, let Tuner X fit kS/kG/kV/kA, paste them in, then trim kP.
4. **Bind a command** in `RobotContainer` and validate on the real robot
   (Lesson IV.1): hit every setpoint repeatably, hold under load, no oscillation.

```java
// in RobotContainer:
private final Elevator elevator = new Elevator();

driver.a().onTrue(elevator.goTo(/* rotations */ 24.0));
driver.b().onTrue(elevator.goTo(0.0));
```

## The tuning order (don't skip it)

> **Configure → Characterize (feedforward) → add kP → Motion Magic → validate.**

Feedforward *before* feedback, always. With kS/kG/kV/kA doing the heavy lifting,
kP only trims a small leftover error — so it's easy to tune and stays stable.

## Notes

- These target **Phoenix 6** and a current WPILib season. APIs evolve year to
  year — if something doesn't resolve, check your installed vendordep version
  against the [CTRE Phoenix 6 docs](https://v6.docs.ctr-electronics.com/) and
  the [WPILib docs](https://docs.wpilib.org/).
- Gains are in **mechanism rotations** (because `SensorToMechanismRatio` /
  `RotorToSensorRatio` is set): kV is volts per rotation-per-second, kP is volts
  per rotation of error, etc.
- They're intentionally minimal — no logging, simulation, or limit-switch
  handling. Add those for competition; this is the control core.

*Part of [Closing the Loop](../index.html) — a control systems course for FRC.*
