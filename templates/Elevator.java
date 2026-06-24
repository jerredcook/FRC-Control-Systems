package frc.robot.subsystems;

import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.controls.NeutralOut;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.GravityTypeValue;
import com.ctre.phoenix6.signals.NeutralModeValue;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

/**
 * Elevator - position control on a Kraken/TalonFX with Motion Magic.
 *
 * Straight out of "Closing the Loop" Part IV.1 (the end-to-end elevator).
 * Fill in every // TODO with YOUR robot's numbers:
 *   1. CAN id and gear ratio                          (Lesson III.2 + II.2)
 *   2. Slot0 gains kS/kG/kV/kA from SysId             (Lesson III.5)
 *   3. kP/kD trimmed for crisp tracking               (Lesson I.5)
 *   4. Motion Magic cruise velocity + acceleration    (Lesson III.4)
 *   5. Validate on the real robot                      (Lesson IV.1)
 */
public class Elevator extends SubsystemBase {
  // ---- 1. device + ratio -------------------------------------------------
  private static final int    MOTOR_CAN_ID = 10;    // TODO your CAN id
  private static final double GEAR_RATIO   = 12.0;  // TODO motor turns : output turns
  private static final double STATOR_LIMIT = 60.0;  // TODO amps

  // ---- 2 & 3. gains (mechanism-rotation units) ---------------------------
  private static final double kS = 0.14, kG = 0.31, kV = 0.115, kA = 0.004; // TODO from SysId
  private static final double kP = 12.0, kI = 0.0,  kD = 0.2;               // TODO trim

  // ---- 4. Motion Magic ---------------------------------------------------
  private static final double MM_CRUISE_VEL = 80.0;  // TODO rotations / sec
  private static final double MM_ACCEL      = 200.0; // TODO rotations / sec^2

  private static final double TOLERANCE_ROT = 0.1;   // TODO "close enough", in rotations

  private final TalonFX motor = new TalonFX(MOTOR_CAN_ID);
  private final MotionMagicVoltage request = new MotionMagicVoltage(0).withSlot(0);
  private final NeutralOut neutral = new NeutralOut();

  public Elevator() {
    var cfg = new TalonFXConfiguration();

    cfg.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    cfg.CurrentLimits.StatorCurrentLimit = STATOR_LIMIT;
    cfg.CurrentLimits.StatorCurrentLimitEnable = true;

    // gearbox handled here, so getPosition() returns mechanism rotations
    cfg.Feedback.SensorToMechanismRatio = GEAR_RATIO;

    cfg.Slot0.kS = kS; cfg.Slot0.kG = kG; cfg.Slot0.kV = kV; cfg.Slot0.kA = kA;
    cfg.Slot0.kP = kP; cfg.Slot0.kI = kI; cfg.Slot0.kD = kD;
    cfg.Slot0.GravityType = GravityTypeValue.Elevator_Static; // constant gravity

    cfg.MotionMagic.MotionMagicCruiseVelocity = MM_CRUISE_VEL;
    cfg.MotionMagic.MotionMagicAcceleration   = MM_ACCEL;

    motor.getConfigurator().apply(cfg);
  }

  /** Command the elevator to a height, in mechanism rotations. */
  public void setGoalRotations(double rotations) {
    motor.setControl(request.withPosition(rotations));
  }

  public double getPositionRotations() {
    return motor.getPosition().getValueAsDouble();
  }

  public boolean atGoal(double targetRotations) {
    return Math.abs(getPositionRotations() - targetRotations) < TOLERANCE_ROT;
  }

  /** Go to a height and finish once arrived - handy for autos and button binds. */
  public Command goTo(double rotations) {
    return run(() -> setGoalRotations(rotations)).until(() -> atGoal(rotations));
  }

  /** Let the motor coast/brake to a stop. */
  public Command stopCmd() {
    return runOnce(() -> motor.setControl(neutral));
  }
}
