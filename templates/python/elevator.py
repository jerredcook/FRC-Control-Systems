"""
Elevator - position control on a Kraken/TalonFX with Motion Magic.

Straight out of "Closing the Loop" Part IV.1 (the end-to-end elevator).
Fill in every # TODO with YOUR robot's numbers:
  1. CAN id and gear ratio                          (Lesson III.2 + II.2)
  2. slot0 gains kS/kG/kV/kA from SysId             (Lesson III.5)
  3. kP/kD trimmed for crisp tracking               (Lesson I.5)
  4. Motion Magic cruise velocity + acceleration    (Lesson III.4)
  5. Validate on the real robot                      (Lesson IV.1)

RobotPy + CTRE Phoenix 6 (the phoenix6 package). Gains are in mechanism
rotations because sensor_to_mechanism_ratio is set.
"""

from commands2 import Subsystem, Command
from phoenix6.hardware import TalonFX
from phoenix6.controls import MotionMagicVoltage, NeutralOut
from phoenix6.configs import TalonFXConfiguration
from phoenix6.signals import GravityTypeValue, NeutralModeValue


class Elevator(Subsystem):
    # ---- 1. device + ratio ---------------------------------------------
    MOTOR_CAN_ID = 10       # TODO your CAN id
    GEAR_RATIO = 12.0       # TODO motor turns : output turns
    STATOR_LIMIT = 60.0     # TODO amps

    # ---- 2 & 3. gains (mechanism-rotation units) -----------------------
    kS, kG, kV, kA = 0.14, 0.31, 0.115, 0.004   # TODO from SysId
    kP, kI, kD = 12.0, 0.0, 0.2                  # TODO trim

    # ---- 4. Motion Magic -----------------------------------------------
    MM_CRUISE_VEL = 80.0    # TODO rotations / sec
    MM_ACCEL = 200.0        # TODO rotations / sec^2

    TOLERANCE_ROT = 0.1     # TODO "close enough", in rotations

    def __init__(self) -> None:
        super().__init__()
        self.motor = TalonFX(self.MOTOR_CAN_ID)
        self.request = MotionMagicVoltage(0).with_slot(0)
        self.neutral = NeutralOut()

        cfg = TalonFXConfiguration()

        cfg.motor_output.neutral_mode = NeutralModeValue.BRAKE
        cfg.current_limits.stator_current_limit = self.STATOR_LIMIT
        cfg.current_limits.stator_current_limit_enable = True

        # gearbox handled here, so get_position() returns mechanism rotations
        cfg.feedback.sensor_to_mechanism_ratio = self.GEAR_RATIO

        cfg.slot0.k_s = self.kS
        cfg.slot0.k_g = self.kG
        cfg.slot0.k_v = self.kV
        cfg.slot0.k_a = self.kA
        cfg.slot0.k_p = self.kP
        cfg.slot0.k_i = self.kI
        cfg.slot0.k_d = self.kD
        cfg.slot0.gravity_type = GravityTypeValue.ELEVATOR_STATIC  # constant gravity

        cfg.motion_magic.motion_magic_cruise_velocity = self.MM_CRUISE_VEL
        cfg.motion_magic.motion_magic_acceleration = self.MM_ACCEL

        self.motor.configurator.apply(cfg)

    def set_goal_rotations(self, rotations: float) -> None:
        """Command the elevator to a height, in mechanism rotations."""
        self.motor.set_control(self.request.with_position(rotations))

    def get_position_rotations(self) -> float:
        return self.motor.get_position().value

    def at_goal(self, target_rotations: float) -> bool:
        return abs(self.get_position_rotations() - target_rotations) < self.TOLERANCE_ROT

    def go_to(self, rotations: float) -> Command:
        """Go to a height and finish once arrived - handy for autos and button binds."""
        return self.run(lambda: self.set_goal_rotations(rotations)).until(
            lambda: self.at_goal(rotations)
        )

    def stop_cmd(self) -> Command:
        """Let the motor coast/brake to a stop."""
        return self.runOnce(lambda: self.motor.set_control(self.neutral))
