"""
One home for CAN ids, gear ratios, and tuned gains - so you change a number
in exactly one place. From "Closing the Loop" Part II.1.

The subsystem templates inline their constants for clarity; this file is the
"grown-up" version once your robot has several mechanisms. Move the values
here and reference ElevatorK.kP, etc.

Replace every # TODO with your robot's measured numbers (see Part III.5).
"""


class ElevatorK:
    MOTOR_ID = 10       # TODO
    GEAR_RATIO = 12.0   # TODO motor turns : output turns
    STATOR_A = 60.0     # TODO current limit (amps)
    # gains in mechanism-rotation units, from SysId:
    kS, kG, kV, kA = 0.14, 0.31, 0.115, 0.004   # TODO
    kP, kD = 12.0, 0.2                           # TODO
    MM_CRUISE, MM_ACCEL = 80.0, 200.0            # TODO


class ArmK:
    MOTOR_ID = 11       # TODO
    CANCODER_ID = 21    # TODO
    GEAR_RATIO = 50.0   # TODO rotor : sensor
    STATOR_A = 40.0     # TODO
    # 0 rotations must be HORIZONTAL for ARM_COSINE to work:
    kS, kG, kV, kA = 0.10, 0.40, 0.9, 0.02   # TODO
    kP, kD = 60.0, 0.5                        # TODO
    MM_CRUISE, MM_ACCEL = 2.0, 4.0            # TODO


class FlywheelK:
    MOTOR_ID = 12       # TODO
    STATOR_A = 60.0     # TODO
    # velocity loop: kV dominant, kP SMALL, no kG:
    kS, kV = 0.10, 0.12     # TODO
    kP = 0.18               # keep small!
    TARGET_RPS = 60.0       # TODO shooter speed
