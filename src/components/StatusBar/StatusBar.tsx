/**
 * StatusBar — Bottom bar showing system state, camera PiP, EAR value, and fatigue meter.
 */

import { useAuralisStore } from '../../stores/auralisStore';
import './StatusBar.css';

/**
 * Props for the StatusBar component.
 */
interface StatusBarProps {
  /** Reference to the video element for PiP display */
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Renders the status bar with camera preview, system state, and diagnostics.
 */
export function StatusBar({ videoRef }: StatusBarProps) {
  const morseState = useAuralisStore((s) => s.morseState);
  const isFaceDetected = useAuralisStore((s) => s.isFaceDetected);
  const isCameraActive = useAuralisStore((s) => s.isCameraActive);
  const cameraPreviewEnabled = useAuralisStore((s) => s.cameraPreviewEnabled);

  /**
   * Returns the status indicator label and CSS class.
   */
  function getStatusInfo(): { label: string; className: string } {
    if (!isCameraActive) return { label: 'Camera Off', className: 'status--inactive' };
    if (!isFaceDetected) return { label: 'No Face', className: 'status--warning' };
    if (morseState === 'IDLE') return { label: 'Sleeping', className: 'status--idle' };
    if (morseState === 'ARMED') return { label: 'Listening', className: 'status--active' };
    if (morseState === 'BLINKING') return { label: 'Blink...', className: 'status--active' };
    if (morseState === 'EVALUATING') return { label: 'Processing', className: 'status--active' };
    return { label: 'Ready', className: 'status--idle' };
  }

  const statusInfo = getStatusInfo();

  return (
    <footer className="status-bar" aria-label="System status">
      {/* Camera PiP */}
      {cameraPreviewEnabled && (
        <div className={`status-bar__camera ${isFaceDetected ? 'status-bar__camera--detected' : 'status-bar__camera--lost'}`}>
          <video
            ref={videoRef}
            className="status-bar__video"
            autoPlay
            playsInline
            muted
          />
        </div>
      )}

      {/* Status indicator */}
      <div className={`status-bar__indicator ${statusInfo.className}`}>
        <div className="status-bar__dot" />
        <span className="status-bar__label">{statusInfo.label}</span>
      </div>

      {/* Instructions hint */}
      <div className="status-bar__hint">
        {morseState === 'IDLE' && isFaceDetected && (
          <span>Blink 3× quickly to activate</span>
        )}
        {morseState === 'ARMED' && (
          <span>Blink to type in Morse code</span>
        )}
        {!isCameraActive && (
          <span>Camera access required</span>
        )}
      </div>
    </footer>
  );
}
