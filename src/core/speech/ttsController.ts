/**
 * Text-to-Speech Controller — Wraps the Web Speech API with
 * Auralis-specific features (emergency priority, audio feedback).
 */

/**
 * TTS configuration options
 */
export interface TTSConfig {
  /** Speech rate (0.1 to 10, default 1.0) */
  rate: number;
  /** Speech pitch (0 to 2, default 1.0) */
  pitch: number;
  /** Speech volume (0 to 1, default 1.0) */
  volume: number;
  /** Preferred voice name (or null for default) */
  voiceName: string | null;
}

/** Default TTS configuration */
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  voiceName: null,
};

/**
 * TTSController manages text-to-speech synthesis using the browser's
 * native Web Speech API.
 */
export class TTSController {
  private config: TTSConfig;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = { ...DEFAULT_TTS_CONFIG, ...config };
    this.synth = window.speechSynthesis;

    // Voices load asynchronously in some browsers
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
    this.loadVoices();
  }

  /**
   * Loads available voices from the browser.
   */
  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    if (this.config.voiceName) {
      this.selectedVoice =
        this.voices.find((v) => v.name === this.config.voiceName) ?? null;
    }
  }

  /**
   * Returns all available voices.
   * @returns Array of SpeechSynthesisVoice
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Sets the voice by name.
   * @param name - Voice name string
   */
  setVoice(name: string): void {
    this.config.voiceName = name;
    this.selectedVoice = this.voices.find((v) => v.name === name) ?? null;
  }

  /**
   * Updates TTS configuration.
   * @param config - Partial config to merge
   */
  setConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.voiceName) {
      this.selectedVoice =
        this.voices.find((v) => v.name === config.voiceName) ?? null;
    }
  }

  /**
   * Speaks the given text.
   * @param text - Text to speak
   * @param priority - If true, cancels current speech and speaks immediately
   */
  speak(text: string, priority: boolean = false): void {
    if (!text.trim()) return;

    if (priority) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Speaks an emergency phrase with highest priority.
   * Cancels all current speech and speaks at maximum volume.
   * @param phrase - Emergency text
   */
  speakEmergency(phrase: string): void {
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Max volume
    utterance.lang = 'en-US';

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Stops all current speech immediately.
   */
  stop(): void {
    this.synth.cancel();
  }

  /**
   * Returns whether the synth is currently speaking.
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Cleans up the controller.
   */
  destroy(): void {
    this.synth.cancel();
  }
}
