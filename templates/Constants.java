package frc.robot;

/**
 * One home for CAN ids, gear ratios, and tuned gains — so you change a number
 * in exactly one place. From "Closing the Loop" Part II.1.
 *
 * The subsystem templates inline their constants for clarity; this file is the
 * "grown-up" version once your robot has several mechanisms. Move the values
 * here and reference Constants.ElevatorK.kP, etc.
 *
 * Replace every // TODO with your robot's measured numbers (see Part III.5).
 */
public final class Constants {
  private Constants() {}

  public static final class ElevatorK {
    public static final int    MOTOR_ID   = 10;     // TODO
    public static final double GEAR_RATIO = 12.0;   // TODO motor turns : output turns
    public static final double STATOR_A   = 60.0;   // TODO current limit (amps)
    // gains in mechanism-rotation units, from SysId:
    public static final double kS = 0.14, kG = 0.31, kV = 0.115, kA = 0.004; // TODO
    public static final double kP = 12.0, kD = 0.2;                          // TODO
    public static final double MM_CRUISE = 80.0, MM_ACCEL = 200.0;           // TODO
  }

  public static final class ArmK {
    public static final int    MOTOR_ID    = 11;    // TODO
    public static final int    CANCODER_ID = 21;    // TODO
    public static final double GEAR_RATIO  = 50.0;  // TODO rotor : sensor
    public static final double STATOR_A    = 40.0;  // TODO
    // 0 rotations must be HORIZONTAL for Arm_Cosine to work:
    public static final double kS = 0.10, kG = 0.40, kV = 0.9, kA = 0.02;    // TODO
    public static final double kP = 60.0, kD = 0.5;                          // TODO
    public static final double MM_CRUISE = 2.0, MM_ACCEL = 4.0;              // TODO
  }

  public static final class FlywheelK {
    public static final int    MOTOR_ID = 12;       // TODO
    public static final double STATOR_A = 60.0;     // TODO
    // velocity loop: kV dominant, kP SMALL, no kG:
    public static final double kS = 0.10, kV = 0.12;                         // TODO
    public static final double kP = 0.18;                                    // keep small!
    public static final double TARGET_RPS = 60.0;   // TODO shooter speed
  }
}
