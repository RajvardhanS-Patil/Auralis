/**
 * Blink Detector — Uses EAR values with Kalman filtering, adaptive baseline,
 * and hysteresis (Schmitt Trigger) to detect intentional blinks.
 *
 * See ALGORITHM_DESIGN.md §2 for the full signal processing pipeline.
 */

// @ts-expect-error kalmanjs has no type declarations
import KalmanFilter from 'kalmanjs';

/** Configuration for the blink detector */
export interface BlinkDetectorConfig {
  /** Kalman filter measurement noise (lower = trust measurement more) */
  kalmanR: number;
  /** Kalman filter process noise (higher = allow fast changes) */
  kalmanQ: number;
  /** EMA smoothing factor for adaptive baseline (0.01 = slow, stable) */
  baselineAlpha: number;
  /** Lower threshold multiplier (EAR must drop below baseline * this to enter blink) */
  thresholdLow: number;
  /** Upper threshold multiplier (EAR must rise above baseline * this to exit blink) */
  thresholdHigh: number;
  /** Minimum blink duration in ms to count (reject < this as noise) */
  minBlinkDurationMs: number;
}

/** Default configuration values */
export const DEFAULT_BLINK_CONFIG: BlinkDetectorConfig = {
  kalmanR: 0.01,
  kalmanQ: 3,
  baselineAlpha: 0.01,
  thresholdLow: 0.55,
  thresholdHigh: 0.75,
  minBlinkDurationMs: 80,
};

/** Events emitted by the blink detector */
export interface BlinkEvent {
  type: 'blink_start' | 'blink_end';
  timestamp: number;
  ear: number;
  /** Duration in ms (only for blink_end events) */
  duration?: number;
}

/**
 * BlinkDetector processes raw EAR values and detects intentional blinks
 * using a three-stage signal processing pipeline.
 */
export class BlinkDetector {
  private config: BlinkDetectorConfig;
  private kalman: KalmanFilter;
  private baseline: number = 0.30; // Will be set during calibration
  private isBlinking: boolean = false;
  private blinkStartTime: number = 0;
  private isCalibrated: boolean = false;
  private calibrationSamples: number[] = [];
  private onBlinkEvent: ((event: BlinkEvent) => void) | null = null;

  constructor(config: Partial<BlinkDetectorConfig> = {}) {
    this.config = { ...DEFAULT_BLINK_CONFIG, ...config };
    this.kalman = new KalmanFilter({
      R: this.config.kalmanR,
      Q: this.config.kalmanQ,
    });
  }

  /**
   * Registers a callback for blink events.
   * @param callback - Function called on blink_start and blink_end
   */
  onBlink(callback: (event: BlinkEvent) => void): void {
    this.onBlinkEvent = callback;
  }

  /**
   * Feeds a raw EAR value from calibration.
   * Call this during the "keep eyes open" calibration phase.
   * @param rawEAR - Raw bilateral EAR value
   */
  addCalibrationSample(rawEAR: number): void {
    if (rawEAR > 0) {
      this.calibrationSamples.push(rawEAR);
    }
  }

  /**
   * Finalizes calibration and sets the baseline.
   * @returns The computed baseline EAR value
   */
  finalizeCalibration(): number {
    if (this.calibrationSamples.length < 10) {
      // Not enough samples, use default
      this.baseline = 0.30;
    } else {
      const sum = this.calibrationSamples.reduce((a, b) => a + b, 0);
      this.baseline = sum / this.calibrationSamples.length;
    }
    this.isCalibrated = true;
    this.calibrationSamples = [];
    return this.baseline;
  }

  /**
   * Allows manually setting calibration data (e.g., from saved profile).
   * @param baseline - Previously calibrated baseline EAR
   */
  setCalibration(baseline: number): void {
    this.baseline = baseline;
    this.isCalibrated = true;
  }

  /** Returns whether calibration has been completed */
  getIsCalibrated(): boolean {
    return this.isCalibrated;
  }

  /** Returns the current adaptive baseline */
  getBaseline(): number {
    return this.baseline;
  }

  /**
   * Processes a single raw EAR value through the full pipeline.
   * This is the main method — call it on every frame.
   *
   * Pipeline: Raw EAR → Kalman Filter → Adaptive Baseline → Hysteresis → Blink Events
   *
   * @param rawEAR - Raw bilateral EAR from calculateBilateralEAR()
   * @returns The smoothed EAR value
   */
  process(rawEAR: number): number {
    if (rawEAR < 0) return rawEAR; // Invalid input

    // Stage 1: Kalman filter smoothing
    const smoothedEAR: number = this.kalman.filter(rawEAR);

    // Stage 2: Adaptive baseline (only update when eyes are open)
    const dynamicThresholdHigh = this.baseline * this.config.thresholdHigh;
    if (smoothedEAR > dynamicThresholdHigh) {
      this.baseline =
        this.config.baselineAlpha * smoothedEAR +
        (1 - this.config.baselineAlpha) * this.baseline;
    }

    // Stage 3: Hysteresis (Schmitt Trigger)
    const thresholdLow = this.baseline * this.config.thresholdLow;
    const thresholdHigh = this.baseline * this.config.thresholdHigh;
    const now = performance.now();

    if (!this.isBlinking && smoothedEAR < thresholdLow) {
      // Blink started
      this.isBlinking = true;
      this.blinkStartTime = now;
      this.onBlinkEvent?.({
        type: 'blink_start',
        timestamp: now,
        ear: smoothedEAR,
      });
    } else if (this.isBlinking && smoothedEAR > thresholdHigh) {
      // Blink ended
      const duration = now - this.blinkStartTime;
      this.isBlinking = false;

      // Reject blinks shorter than minimum duration (involuntary)
      if (duration >= this.config.minBlinkDurationMs) {
        this.onBlinkEvent?.({
          type: 'blink_end',
          timestamp: now,
          ear: smoothedEAR,
          duration,
        });
      }
    }

    return smoothedEAR;
  }

  /** Resets the detector state (for re-calibration) */
  reset(): void {
    this.isBlinking = false;
    this.blinkStartTime = 0;
    this.isCalibrated = false;
    this.calibrationSamples = [];
    this.baseline = 0.30;
    this.kalman = new KalmanFilter({
      R: this.config.kalmanR,
      Q: this.config.kalmanQ,
    });
  }
}
