/**
 * MorseBufferDisplay — Shows the current Morse code buffer (dots/dashes)
 * and provides visual feedback for each registered blink.
 */

import { useAuralisStore } from '../../stores/auralisStore';
import './MorseBufferDisplay.css';

/**
 * Renders the Morse code buffer and blink feedback indicators.
 */
export function MorseBufferDisplay() {
  const morseBuffer = useAuralisStore((s) => s.morseBuffer);
  const lastCharacter = useAuralisStore((s) => s.lastCharacter);
  const lastBlinkType = useAuralisStore((s) => s.lastBlinkType);
  const morseState = useAuralisStore((s) => s.morseState);

  return (
    <section className="morse-buffer" aria-label="Morse code buffer">
      <div className="morse-buffer__content">
        {/* Blink feedback indicators */}
        <div className="morse-buffer__indicators">
          <div
            className={`morse-buffer__dot-indicator ${
              lastBlinkType === 'dot' ? 'morse-buffer__dot-indicator--active' : ''
            }`}
            aria-hidden="true"
          />
          <div
            className={`morse-buffer__dash-indicator ${
              lastBlinkType === 'dash' ? 'morse-buffer__dash-indicator--active' : ''
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Current buffer display */}
        <div className="morse-buffer__sequence">
          <span className="morse-buffer__label">Morse:</span>
          <span className="morse-buffer__code">
            {morseBuffer || (morseState === 'ARMED' ? '—' : '...')}
          </span>
        </div>

        {/* Last resolved character */}
        {lastCharacter && lastCharacter !== ' ' && (
          <div className="morse-buffer__resolved">
            <span className="morse-buffer__label">Last:</span>
            <span className="morse-buffer__char">{lastCharacter}</span>
          </div>
        )}
      </div>
    </section>
  );
}
