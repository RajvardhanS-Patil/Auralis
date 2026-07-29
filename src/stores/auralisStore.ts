/**
 * Auralis Application Store — Central state management using Zustand.
 *
 * Separates high-frequency state (EAR values, processed via refs)
 * from low-frequency state (text, settings) managed via React re-renders.
 */

import { create } from 'zustand';
import type { MorseState } from '../core/morse/morseEngine';

/** Application-level state */
interface AuralisState {
  // --- System State ---
  /** Current phase of the app lifecycle */
  appPhase: 'loading' | 'calibrating' | 'ready' | 'active' | 'emergency';
  /** Morse engine state */
  morseState: MorseState;
  /** Whether camera is active and face is detected */
  isCameraActive: boolean;
  /** Whether face is currently detected */
  isFaceDetected: boolean;

  // --- Communication State ---
  /** The accumulated output text */
  outputText: string;
  /** Current Morse buffer (dots and dashes being accumulated) */
  morseBuffer: string;
  /** The last resolved character */
  lastCharacter: string;

  // --- Hand Tracking State ---
  /** Whether a hand is currently detected */
  isHandDetected: boolean;
  /** Virtual cursor X coordinate (0 to 1) */
  cursorX: number;
  /** Virtual cursor Y coordinate (0 to 1) */
  cursorY: number;
  /** Whether the user is currently pinching (clicking) */
  isPinching: boolean;

  // --- Feedback State ---
  /** Last registered blink type for visual feedback */
  lastBlinkType: 'dot' | 'dash' | null;
  /** Timestamp of last blink for animation timing */
  lastBlinkTime: number;

  // --- Settings ---
  /** Whether audio feedback is enabled */
  audioFeedbackEnabled: boolean;
  /** Whether camera preview is shown */
  cameraPreviewEnabled: boolean;

  // --- Actions ---
  setAppPhase: (phase: AuralisState['appPhase']) => void;
  setMorseState: (state: MorseState) => void;
  setCameraActive: (active: boolean) => void;
  setFaceDetected: (detected: boolean) => void;
  setHandDetected: (detected: boolean) => void;
  setCursorPosition: (x: number, y: number) => void;
  setIsPinching: (pinching: boolean) => void;
  appendCharacter: (char: string) => void;
  appendSpace: () => void;
  backspace: () => void;
  clearText: () => void;
  setMorseBuffer: (buffer: string) => void;
  setLastBlinkType: (type: 'dot' | 'dash' | null) => void;
  setOutputText: (text: string) => void;
  toggleAudioFeedback: () => void;
  toggleCameraPreview: () => void;
}

/**
 * Main application store.
 */
export const useAuralisStore = create<AuralisState>((set) => ({
  // --- Initial State ---
  appPhase: 'loading',
  morseState: 'IDLE',
  isCameraActive: false,
  isFaceDetected: false,
  outputText: '',
  morseBuffer: '',
  lastCharacter: '',
  
  isHandDetected: false,
  cursorX: 0.5,
  cursorY: 0.5,
  isPinching: false,

  lastBlinkType: null,
  lastBlinkTime: 0,
  audioFeedbackEnabled: true,
  cameraPreviewEnabled: true,

  // --- Actions ---
  setAppPhase: (phase) => set({ appPhase: phase }),
  setMorseState: (morseState) => set({ morseState }),
  setCameraActive: (isCameraActive) => set({ isCameraActive }),
  setFaceDetected: (isFaceDetected) => set({ isFaceDetected }),
  setHandDetected: (isHandDetected) => set({ isHandDetected }),
  setCursorPosition: (cursorX, cursorY) => set({ cursorX, cursorY }),
  setIsPinching: (isPinching) => set({ isPinching }),

  appendCharacter: (char) =>
    set((s) => ({
      outputText: s.outputText + char,
      lastCharacter: char,
    })),

  appendSpace: () =>
    set((s) => ({
      outputText: s.outputText.trimEnd() + ' ',
      lastCharacter: ' ',
    })),

  backspace: () =>
    set((s) => ({
      outputText: s.outputText.slice(0, -1),
      lastCharacter: '',
    })),

  clearText: () => set({ outputText: '', lastCharacter: '' }),

  setMorseBuffer: (morseBuffer) => set({ morseBuffer }),

  setLastBlinkType: (type) =>
    set({ lastBlinkType: type, lastBlinkTime: performance.now() }),

  setOutputText: (outputText) => set({ outputText }),

  toggleAudioFeedback: () =>
    set((s) => ({ audioFeedbackEnabled: !s.audioFeedbackEnabled })),

  toggleCameraPreview: () =>
    set((s) => ({ cameraPreviewEnabled: !s.cameraPreviewEnabled })),
}));
