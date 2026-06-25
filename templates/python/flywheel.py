"""
Flywheel / shooter - VELOCITY control.

From "Closing the Loop" Part IV.3. The big difference from position
mechanisms: kV does almost all the work, kP is deliberately SMALL (a large
kP makes the speed hunt), and there is no kG (gravity doesn't slow a wheel).

Spin up, wait for at_speed(), THEN shoot - and let it recover between shots.

RobotPy + CTRE Phoenix 6 (the phoenix6 package).
"""

from commands2 import Subsystem, Command
from phoenix6.hardware import TalonFX
from phoenix6.controls import VelocityVoltage, NeutralOut
from phoenix6.configs import TalonFXConfiguration
from phoenix6.signals import NeutralModeValue


class Flywheel(Subsystem):
    MOTOR_CAN_ID = 12       # TODO
    STATOR_LIMIT = 60.0     # TODO amps

    kS, kV, kA = 0.10, 0.12, 0.0   # TODO from SysId
    kP, kI, kD = 0.18, 0.0, 0.0    # keep kP small!

    TOLERANCE_RPS = 1.0     # TODO close enough, rot/sec

    def __init__(self) -> None:
        super().__init__()
        self.motor = TalonFX(self.MOTOR_CAN_ID)
        self.request = VelocityVoltage(0).with_slot(0)
        self.neutral = NeutralOut()
        self.target_rps = 0.0

        cfg = TalonFXConfiguration()

        cfg.motor_output.neutral_mode = NeutralModeValue.COAST  # let it spin down freely
        cfg.current_limits.stator_current_limit = self.STATOR_LIMIT
        cfg.current_limits.stator_current_limit_enable = True

        cfg.slot0.k_s = self.kS
        cfg.slot0.k_v = self.kV
        cfg.slot0.k_a = self.kA
        cfg.slot0.k_p = self.kP
        cfg.slot0.k_i = self.kI
        cfg.slot0.k_d = self.kD
        # no gravity_type - a flywheel has no gravity load

        self.motor.configurator.apply(cfg)

    def set_speed(self, rps: float) -> None:
        """Hold a target speed, in rotations per second."""
        self.target_rps = rps
        self.motor.set_control(self.request.with_velocity(rps))

    def stop(self) -> None:
        self.target_rps = 0.0
        self.motor.set_control(self.neutral)

    def get_speed_rps(self) -> float:
        return self.motor.get_velocity().value

    def at_speed(self) -> bool:
        return self.target_rps > 0.0 and abs(self.get_speed_rps() - self.target_rps) < self.TOLERANCE_RPS

    def spin_up(self, rps: float) -> Command:
        """Spin up and hold (runs until interrupted)."""
        return self.run(lambda: self.set_speed(rps))

    def stop_cmd(self) -> Command:
        return self.runOnce(self.stop)
