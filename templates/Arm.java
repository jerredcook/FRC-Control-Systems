package frc.robot.subsystems;

import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.controls.NeutralOut;
import com.ctre.phoenix6.hardware.CANcoder;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.FeedbackSensorSourceValue;
import com.ctre.phoenix6.signals.GravityTypeValue;
import com.ctre.phoenix6.signals.NeutralModeValue;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

/**
 * Arm - position control with cosine gravity feedforward.
 *
 * From "Closing the Loop" Part IV.2. The only real differences from the
 * elevator: GravityType.Arm_Cosine (kG is scaled by cos(angle)) and a
 * FusedCANcoder so the arm knows its absolute angle the instant it powers on.
 *
 * IMPORTANT: zero the CANcoder (its MagnetOffset) so that 0 rotations means the
 * arm is HORIZONTAL - that's where gravity is strongest and cos(0) = 1.
 */
public class Arm extends SubsystemBase {
  private static final int    MOTOR_CAN_ID    = 11;   // TODO
  private static final int    CANCODER_CAN_ID = 21;   // TODO
  private static final double ROTOR_TO_SENSOR = 50.0; // TODO motor turns : arm turns
  private static final double STATOR_LIMIT    = 40.0; // TODO amps

  private static final double kS = 0.10, kG = 0.40, kV = 0.9, kA = 0.02; // TODO from SysId
  private static final double kP = 60.0, kD = 0.5;                       // TODO trim

  private static final double MM_CRUISE_VEL = 2.0;  // TODO rotations / sec
  private static final double MM_ACCEL      = 4.0;  // TODO rotations / sec^2
  private static final double TOLERANCE_ROT = 0.02; // TODO close enough, in rotations

  private final TalonFX motor = new TalonFX(MOTOR_CAN_ID);
  private final CANcoder cancoder = new CANcoder(CANCODER_CAN_ID);
  private final MotionMagicVoltage request = new MotionMagicVoltage(0).withSlot(0);
  private final NeutralOut neutral = new NeutralOut();

  public Arm() {
    var cfg = new TalonFXConfiguration();

    cfg.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    cfg.CurrentLimits.StatorCurrentLimit = STATOR_LIMIT;
    cfg.CurrentLimits.StatorCurrentLimitEnable = true;

    // absolute angle from the CANcoder, fused with the fast internal rotor
    cfg.Feedback.FeedbackSensorSource = FeedbackSensorSourceValue.FusedCANcoder;
    cfg.Feedback.FeedbackRemoteSensorID = cancoder.getDeviceID();
    cfg.Feedback.RotorToSensorRatio = ROTOR_TO_SENSOR;

    cfg.Slot0.kS = kS; cfg.Slot0.kG = kG; cfg.Slot0.kV = kV; cfg.Slot0.kA = kA;
    cfg.Slot0.kP = kP; cfg.Slot0.kD = kD;
    cfg.Slot0.GravityType = GravityTypeValue.Arm_Cosine; // kG * cos(angle)

    cfg.MotionMagic.MotionMagicCruiseVelocity = MM_CRUISE_VEL;
    cfg.MotionMagic.MotionMagicAcceleration   = MM_ACCEL;

    motor.getConfigurator().apply(cfg);
  }

  /** @param rotations arm angle in mechanism rotations (0 = horizontal). */
  public void setAngleRotations(double rotations) {
    motor.setControl(request.withPosition(rotations));
  }

  public double getAngleRotations() {
    return motor.getPosition().getValueAsDouble();
  }

  public boolean atGoal(double targetRotations) {
    return Math.abs(getAngleRotations() - targetRotations) < TOLERANCE_ROT;
  }

  public Command goTo(double rotations) {
    return run(() -> setAngleRotations(rotations)).until(() -> atGoal(rotations));
  }

  public Command stopCmd() {
    return runOnce(() -> motor.setControl(neutral));
  }
}
