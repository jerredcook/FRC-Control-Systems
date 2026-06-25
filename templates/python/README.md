# Robot starter templates (Python / RobotPy)

The same paste-ready subsystems as the [Java templates](../), written for
**RobotPy + CTRE Phoenix 6** (the `phoenix6` package). These are the capstone
code from *Closing the Loop*, as complete modules you can drop into your robot
project and fill in.

| File | Mechanism | Control | Lesson |
|------|-----------|---------|--------|
| `elevator.py` | Elevator / lift | Position, Motion Magic | Part IV.1 |
| `arm.py`      | Pivoting arm     | Position, ARM_COSINE gravity + FusedCANcoder | Part IV.2 |
| `flywheel.py` | Shooter wheel    | Velocity, kV-dominant | Part IV.3 |
| `constants.py`| -                | One home for ids, ratios, and gains | Part II.1 |

## Setup (one time)

RobotPy is the official Python WPILib. Install it and the vendor libraries your
robot uses:

```bash
pip install robotpy
# add CTRE Phoenix 6 (and any other vendor libs) to your project:
robotpy add-vendor-deps   # or list them in pyproject.toml under [tool.robotpy]
robotpy sync              # downloads the right versions for the season
```

Your robot's dependencies live in **`pyproject.toml`** (this replaces the Java
`vendordeps/*.json` files). `robotpy sync` reads it and fetches everything.

## How to use them

> **Before you start:** this assumes you have a RobotPy project and have seen
> command-based basics (Deploy Part 3, or Closing the Loop II.1). New to that?
> Start there first, then come back.

1. **Copy** the subsystem(s) you need into your project's `subsystems/` folder
   (and `constants.py` next to your `robot.py`).
2. **Search for `# TODO`** and replace every value with your robot's own:
   - CAN ids and gear ratios (Lessons II.2 + III.2)
   - Current limits for your motor/breaker (Lesson III.2)
   - Motion Magic cruise velocity & acceleration (Lesson III.4)
3. **Get the gains from SysId**, don't guess them (Lessons I.7 + III.5). Run the
   characterization, let Tuner X fit kS/kG/kV/kA, paste them in, then trim kP.
4. **Bind a command** in `robotcontainer.py` and validate on the real robot
   (Lesson IV.1): hit every setpoint repeatably, hold under load, no oscillation.

```python
# in RobotContainer.__init__:
self.elevator = Elevator()

self.driver.a().onTrue(self.elevator.go_to(24.0))   # rotations
self.driver.b().onTrue(self.elevator.go_to(0.0))
```

## The tuning order (don't skip it)

> **Configure -> Characterize (feedforward) -> add kP -> Motion Magic -> validate.**

Feedforward *before* feedback, always. With kS/kG/kV/kA doing the heavy lifting,
kP only trims a small leftover error, so it's easy to tune and stays stable.

## Java to Python, at a glance

| Java (WPILib / Phoenix 6) | Python (RobotPy / phoenix6) |
|---|---|
| `class X extends SubsystemBase` | `class X(Subsystem)` |
| `new TalonFX(id)` | `TalonFX(id)` |
| `motor.setControl(req.withPosition(r))` | `motor.set_control(req.with_position(r))` |
| `motor.getPosition().getValueAsDouble()` | `motor.get_position().value` |
| `cfg.Slot0.kP = 12.0` | `cfg.slot0.k_p = 12.0` |
| `GravityTypeValue.Arm_Cosine` | `GravityTypeValue.ARM_COSINE` |
| `run(() -> setGoal(r)).until(...)` | `self.run(lambda: self.set_goal(r)).until(...)` |
| camelCase methods | snake_case methods, UPPER_CASE enum values |

## Notes

- These target **Phoenix 6** and a current RobotPy season. APIs evolve year to
  year, if something doesn't resolve, check your installed `phoenix6` version
  against the [CTRE Phoenix 6 docs](https://v6.docs.ctr-electronics.com/) and the
  [RobotPy docs](https://robotpy.readthedocs.io/).
- Gains are in **mechanism rotations** (because `sensor_to_mechanism_ratio` /
  `rotor_to_sensor_ratio` is set): kV is volts per rotation-per-second, kP is
  volts per rotation of error, etc.
- They're intentionally minimal, no logging, simulation, or limit-switch
  handling. Add those for competition; this is the control core.

*Part of [Closing the Loop](../../closing-the-loop.html), the control course of the FRC Academy.*
