"""
Arm - position control with cosine gravity feedforward.

From "Closing the Loop" Part IV.2. The only real differences from the
elevator: gravity_type = ARM_COSINE (kG is scaled by cos(angle)) and a
FusedCANcoder so the arm knows its absolute angle the instant it powers on.

IMPORTANT: zero the CANcoder (its magnet_offset) so that 0 rotations means the
arm is HORIZONTAL - that's where gravity is strongest and cos(0) = 1.

RobotPy + CTRE Phoenix 6 (the phoenix6 package).
"""

from commands2 import Subsystem, Command
from phoenix6.hardware import TalonFX, CANcoder
from phoenix6.controls import MotionMagicVoltage, NeutralOut
from phoenix6.configs import TalonFXConfiguration
from phoenix6.signals import (
    FeedbackSensorSourceValue,
    GravityTypeValue,
    NeutralModeValue,
)


class Arm(Subsystem):
    MOTOR_CAN_ID = 11       # TODO
    CANCODER_CAN_ID = 21    # TODO
    ROTOR_TO_SENSOR = 50.0  # TODO motor turns : arm turns
    STATOR_LIMIT = 40.0     # TODO amps

    kS, kG, kV, kA = 0.10, 0.40, 0.9, 0.02   # TODO from SysId
    kP, kD = 60.0, 0.5                        # TODO trim

    MM_CRUISE_VEL = 2.0     # TODO rotations / sec
    MM_ACCEL = 4.0          # TODO rotations / sec^2
    TOLERANCE_ROT = 0.02    # TODO close enough, in rotations

    def __init__(self) -> None:
        super().__init__()
        self.motor = TalonFX(self.MOTOR_CAN_ID)
        self.cancoder = CANcoder(self.CANCODER_CAN_ID)
        self.request = MotionMagicVoltage(0).with_slot(0)
        self.neutral = NeutralOut()

        cfg = TalonFXConfiguration()

        cfg.motor_output.neutral_mode = NeutralModeValue.BRAKE
        cfg.current_limits.stator_current_limit = self.STATOR_LIMIT
        cfg.current_limits.stator_current_limit_enable = True

        # absolute angle from the CANcoder, fused with the fast internal rotor
        cfg.feedback.feedback_sensor_source = FeedbackSensorSourceValue.FUSED_CANCODER
        cfg.feedback.feedback_remote_sensor_id = self.cancoder.device_id
        cfg.feedback.rotor_to_sensor_ratio = self.ROTOR_TO_SENSOR

        cfg.slot0.k_s = self.kS
        cfg.slot0.k_g = self.kG
        cfg.slot0.k_v = self.kV
        cfg.slot0.k_a = self.kA
        cfg.slot0.k_p = self.kP
        cfg.slot0.k_d = self.kD
        cfg.slot0.gravity_type = GravityTypeValue.ARM_COSINE  # kG * cos(angle)

        cfg.motion_magic.motion_magic_cruise_velocity = self.MM_CRUISE_VEL
        cfg.motion_magic.motion_magic_acceleration = self.MM_ACCEL

        self.motor.configurator.apply(cfg)

    def set_angle_rotations(self, rotations: float) -> None:
        """rotations: arm angle in mechanism rotations (0 = horizontal)."""
        self.motor.set_control(self.request.with_position(rotations))

    def get_angle_rotations(self) -> float:
        return self.motor.get_position().value

    def at_goal(self, target_rotations: float) -> bool:
        return abs(self.get_angle_rotations() - target_rotations) < self.TOLERANCE_ROT

    def go_to(self, rotations: float) -> Command:
        return self.run(lambda: self.set_angle_rotations(rotations)).until(
            lambda: self.at_goal(rotations)
        )

    def stop_cmd(self) -> Command:
        return self.runOnce(lambda: self.motor.set_control(self.neutral))
