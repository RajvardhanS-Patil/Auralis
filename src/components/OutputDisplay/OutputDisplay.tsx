/**
 * OutputDisplay — The main text output area where the user's composed text appears.
 * This is the largest, most prominent element on the screen.
 */

import { useAuralisStore } from '../../stores/auralisStore';
import './OutputDisplay.css';

/**
 * Renders the main output text with a blinking cursor.
 */
export function OutputDisplay() {
  const outputText = useAuralisStore((s) => s.outputText);
  const appPhase = useAuralisStore((s) => s.appPhase);

  return (
    <section className="output-display" aria-live="polite" aria-label="Communication output">
      <div className="output-display__text-area">
        {outputText ? (
          <p className="output-display__text">{outputText}</p>
        ) : (
          <p className="output-display__placeholder">
            {appPhase === 'active'
              ? 'Start blinking to type...'
              : appPhase === 'calibrating'
              ? 'Calibrating...'
              : 'Welcome to Auralis'}
          </p>
        )}
        <span className="output-display__cursor" aria-hidden="true">
          █
        </span>
      </div>
    </section>
  );
}
