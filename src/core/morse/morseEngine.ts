/**
 * Morse Code State Machine — Converts blink events into characters.
 *
 * States: IDLE → ARMED → BLINKING → EVALUATING → CHAR_COMPLETE / WORD_COMPLETE
 *
 * See ALGORITHM_DESIGN.md §5 for the full state diagram.
 */

import { translateMorse, matchCommand } from '../../data/morseDictionary';

/** Timing configuration (all values in milliseconds) */
export interface MorseTimingConfig {
  /** Max duration for a DOT blink */
  dotMaxMs: number;
  /** Min duration for a DASH blink */
  dashMinMs: number;
  /** Max duration for a DASH (beyond this = discard or command) */
  dashMaxMs: number;
  /** Eyes-open pause to finalize a character */
  charSpaceMs: number;
  /** Eyes-open pause to insert a word space */
  wordSpaceMs: number;
  /** Sustained eye closure for emergency */
  emergencyMs: number;
  /** Debounce window after a blink */
  debounceMs: number;
}

/** Default timing values */
export const DEFAULT_MORSE_TIMING: MorseTimingConfig = {
  dotMaxMs: 300,
  dashMinMs: 400,
  dashMaxMs: 1500,
  charSpaceMs: 800,
  wordSpaceMs: 2000,
  emergencyMs: 5000,
  debounceMs: 50,
};

/** FSM states */
export type MorseState = 'IDLE' | 'ARMED' | 'BLINKING' | 'EVALUATING';

/** Events emitted by the Morse engine */
export type MorseEvent =
  | { type: 'dot' }
  | { type: 'dash' }
  | { type: 'character'; char: string }
  | { type: 'word_space' }
  | { type: 'command'; command: string }
  | { type: 'emergency' }
  | { type: 'state_change'; state: MorseState }
  | { type: 'buffer_update'; buffer: string };

/**
 * MorseEngine processes blink duration events and translates them
 * into Morse code characters and commands.
 */
export class MorseEngine {
  private config: MorseTimingConfig;
  private state: MorseState = 'IDLE';
  private buffer: string = ''; // Current dots/dashes accumulator
  private lastBlinkEndTime: number = 0;
  private activationBlinks: number[] = []; // Timestamps for activation sequence
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private onEvent: ((event: MorseEvent) => void) | null = null;

  constructor(config: Partial<MorseTimingConfig> = {}) {
    this.config = { ...DEFAULT_MORSE_TIMING, ...config };
  }

  /**
   * Registers a callback for Morse events.
   * @param callback - Function called on every Morse event
   */
  on(callback: (event: MorseEvent) => void): void {
    this.onEvent = callback;
  }

  /** Returns the current FSM state */
  getState(): MorseState {
    return this.state;
  }

  /** Returns the current dot/dash buffer */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Sets the timing configuration (e.g., from user's calibration profile).
   * @param config - Partial config to merge
   */
  setTiming(config: Partial<MorseTimingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Called when a blink starts (eyes close).
   * @param timestamp - performance.now() timestamp
   */
  onBlinkStart(timestamp: number): void {
    if (this.state === 'IDLE') {
      this.checkActivationSequence(timestamp);
      return;
    }

    if (this.state === 'ARMED' || this.state === 'EVALUATING') {
      this.setState('BLINKING');
      this.stopTick();
    }
  }

  /**
   * Called when a blink ends (eyes open).
   * @param timestamp - performance.now() timestamp
   * @param duration - How long the blink lasted in ms
   */
  onBlinkEnd(timestamp: number, duration: number): void {
    if (this.state === 'IDLE') {
      this.checkActivationSequence(timestamp);
      return;
    }

    if (this.state !== 'BLINKING') return;

    // Check for emergency
    if (duration >= this.config.emergencyMs) {
      this.emit({ type: 'emergency' });
      this.buffer = '';
      this.setState('ARMED');
      return;
    }

    // Classify blink as DOT or DASH
    if (duration <= this.config.dotMaxMs) {
      this.buffer += '.';
      this.emit({ type: 'dot' });
    } else if (duration >= this.config.dashMinMs && duration <= this.config.dashMaxMs) {
      this.buffer += '-';
      this.emit({ type: 'dash' });
    }
    // Blinks between dotMax and dashMin are ambiguous — discard

    this.emit({ type: 'buffer_update', buffer: this.buffer });
    this.lastBlinkEndTime = timestamp;
    this.setState('EVALUATING');
    this.startTick();
  }

  /**
   * Forces the system into ARMED state (bypasses activation sequence).
   * Useful for UI "Start" button during development.
   */
  forceArm(): void {
    this.setState('ARMED');
    this.buffer = '';
    this.activationBlinks = [];
  }

  /**
   * Forces the system back to IDLE (deactivates).
   */
  forceIdle(): void {
    this.stopTick();
    this.buffer = '';
    this.setState('IDLE');
    this.activationBlinks = [];
  }

  /** Destroys the engine and clears timers */
  destroy(): void {
    this.stopTick();
    this.onEvent = null;
  }

  // --- Private methods ---

  /**
   * Checks for the activation sequence (3 rapid blinks within 2 seconds).
   */
  private checkActivationSequence(timestamp: number): void {
    this.activationBlinks.push(timestamp);

    // Remove blinks older than 2 seconds
    this.activationBlinks = this.activationBlinks.filter(
      (t) => timestamp - t < 2000
    );

    if (this.activationBlinks.length >= 3) {
      this.activationBlinks = [];
      if (this.state === 'IDLE') {
        this.setState('ARMED');
      } else {
        this.setState('IDLE');
      }
    }
  }

  /**
   * Starts the tick timer that monitors pauses between blinks.
   */
  private startTick(): void {
    this.stopTick();
    this.tickTimer = setInterval(() => this.tick(), 50);
  }

  /**
   * Stops the tick timer.
   */
  private stopTick(): void {
    if (this.tickTimer !== null) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  /**
   * Called every 50ms while in EVALUATING state.
   * Checks if enough time has passed to finalize a character or word.
   */
  private tick(): void {
    if (this.state !== 'EVALUATING' || this.lastBlinkEndTime === 0) return;

    const idleTime = performance.now() - this.lastBlinkEndTime;

    if (idleTime > this.config.wordSpaceMs) {
      // Word boundary — finalize character AND add space
      this.finalizeCharacter();
      this.emit({ type: 'word_space' });
      this.stopTick();
      this.setState('ARMED');
    } else if (idleTime > this.config.charSpaceMs && this.buffer.length > 0) {
      // Character boundary — finalize the current buffer
      this.finalizeCharacter();
      this.stopTick();
      this.setState('ARMED');
    }
  }

  /**
   * Translates the current buffer into a character or command and emits it.
   */
  private finalizeCharacter(): void {
    if (this.buffer.length === 0) return;

    // Check for Auralis commands first
    const command = matchCommand(this.buffer);
    if (command) {
      this.emit({ type: 'command', command });
      this.buffer = '';
      this.emit({ type: 'buffer_update', buffer: '' });
      return;
    }

    // Translate Morse to character
    const char = translateMorse(this.buffer);
    if (char) {
      this.emit({ type: 'character', char });
    }

    this.buffer = '';
    this.emit({ type: 'buffer_update', buffer: '' });
  }

  /** Transitions to a new state and emits the change */
  private setState(newState: MorseState): void {
    this.state = newState;
    this.emit({ type: 'state_change', state: newState });
  }

  /** Emits an event to the registered callback */
  private emit(event: MorseEvent): void {
    this.onEvent?.(event);
  }
}
