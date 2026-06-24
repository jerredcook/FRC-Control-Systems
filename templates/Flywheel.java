package frc.robot.subsystems;

import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.NeutralOut;
import com.ctre.phoenix6.controls.VelocityVoltage;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.NeutralModeValue;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

/**
 * Flywheel / shooter - VELOCITY control.
 *
 * From "Closing the Loop" Part IV.3. The big difference from position
 * mechanisms: kV does almost all the work, kP is deliberately SMALL (a large
 * kP makes the speed hunt), and there is no kG (gravity doesn't slow a wheel).
 *
 * Spin up, wait for atSpeed(), THEN shoot - and let it recover between shots.
 */
public class Flywheel extends SubsystemBase {
  private static final int    MOTOR_CAN_ID = 12;   // TODO
  private static final double STATOR_LIMIT = 60.0; // TODO amps

  private static final double kS = 0.10, kV = 0.12, kA = 0.0; // TODO from SysId
  private static final double kP = 0.18, kI = 0.0,  kD = 0.0; // keep kP small!

  private static final double TOLERANCE_RPS = 1.0; // TODO close enough, rot/sec

  private final TalonFX motor = new TalonFX(MOTOR_CAN_ID);
  private final VelocityVoltage request = new VelocityVoltage(0).withSlot(0);
  private final NeutralOut neutral = new NeutralOut();
  private double targetRps = 0.0;

  public Flywheel() {
    var cfg = new TalonFXConfiguration();

    cfg.MotorOutput.NeutralMode = NeutralModeValue.Coast; // let it spin down freely
    cfg.CurrentLimits.StatorCurrentLimit = STATOR_LIMIT;
    cfg.CurrentLimits.StatorCurrentLimitEnable = true;

    cfg.Slot0.kS = kS; cfg.Slot0.kV = kV; cfg.Slot0.kA = kA;
    cfg.Slot0.kP = kP; cfg.Slot0.kI = kI; cfg.Slot0.kD = kD;
    // no GravityType - a flywheel has no gravity load

    motor.getConfigurator().apply(cfg);
  }

  /** Hold a target speed, in rotations per second. */
  public void setSpeed(double rps) {
    targetRps = rps;
    motor.setControl(request.withVelocity(rps));
  }

  public void stop() {
    targetRps = 0.0;
    motor.setControl(neutral);
  }

  public double getSpeedRps() {
    return motor.getVelocity().getValueAsDouble();
  }

  public boolean atSpeed() {
    return targetRps > 0.0 && Math.abs(getSpeedRps() - targetRps) < TOLERANCE_RPS;
  }

  /** Spin up and hold (runs until interrupted). */
  public Command spinUp(double rps) {
    return run(() -> setSpeed(rps));
  }

  public Command stopCmd() {
    return runOnce(this::stop);
  }
}
