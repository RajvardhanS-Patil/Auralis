import { useAuralisStore } from '../../stores/auralisStore';

interface StatusBarProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function StatusBar({ videoRef }: StatusBarProps) {
  const morseState = useAuralisStore((s) => s.morseState);
  const isFaceDetected = useAuralisStore((s) => s.isFaceDetected);
  const isCameraActive = useAuralisStore((s) => s.isCameraActive);
  const cameraPreviewEnabled = useAuralisStore((s) => s.cameraPreviewEnabled);

  function getStatusInfo() {
    if (!isCameraActive) return { label: 'Camera Off', color: 'bg-red-500', shadow: 'shadow-red-500/60' };
    if (!isFaceDetected) return { label: 'No Face', color: 'bg-yellow-500', shadow: 'shadow-yellow-500/60' };
    if (morseState === 'IDLE') return { label: 'Sleeping', color: 'bg-secondary', shadow: '' };
    if (morseState === 'ARMED') return { label: 'Listening', color: 'bg-accent', shadow: 'shadow-[0_0_12px_rgba(167,139,250,0.6)] pulse-accent' };
    if (morseState === 'BLINKING') return { label: 'Blinking', color: 'bg-accent', shadow: 'shadow-[0_0_12px_rgba(167,139,250,0.6)]' };
    if (morseState === 'EVALUATING') return { label: 'Processing', color: 'bg-accent', shadow: 'shadow-[0_0_12px_rgba(167,139,250,0.6)]' };
    return { label: 'Ready', color: 'bg-secondary', shadow: '' };
  }

  const statusInfo = getStatusInfo();

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-24 status-bar">
      
      {/* Left: Diagnostic Camera */}
      <div className="flex items-center gap-6">
        {cameraPreviewEnabled && (
          <div className={`relative w-36 h-20 rounded-xl overflow-hidden border bg-black/40 transition-all-200 ${isFaceDetected ? 'border-clinical-active' : 'border-red-500/50'}`}>
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-all duration-500 ${!isFaceDetected ? 'grayscale opacity-50' : 'opacity-80'}`}
              style={{ transform: 'scaleX(-1)' }} // Mirror the camera
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-1 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full text-[8px] font-bold text-white border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isFaceDetected ? 'bg-clinical-active pulse-accent' : 'bg-red-500'}`}></div>
              {isFaceDetected ? 'LIVE' : 'LOST'}
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Sensor Stream</span>
          <span className="text-sm font-medium text-primary">Biometric Sync</span>
          <span className={`text-[10px] font-medium ${isFaceDetected ? 'text-clinical-active' : 'text-red-500'}`}>
            {isFaceDetected ? 'TRACKING FACE' : 'SEARCHING'}
          </span>
        </div>
      </div>

      {/* Center: Operational Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="flex items-center gap-3 px-10 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color} ${statusInfo.shadow}`}></div>
          <span className="text-[10px] font-bold text-accent tracking-[0.4em] uppercase">{statusInfo.label}</span>
        </div>
        <span className="text-[9px] font-medium text-secondary/60 mt-2 uppercase tracking-widest">
          {morseState === 'IDLE' && isFaceDetected ? 'Blink 3× quickly to activate' : 'Precision Morse v4.2'}
        </span>
      </div>

      {/* Right: Metrics Dashboard */}
      <div className="flex items-center gap-12">
        <div className="flex flex-col items-end gap-2">
          <div className="flex justify-between w-40 items-baseline">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Fatigue</span>
            <span className="text-[9px] font-bold text-clinical-active">OPTIMAL</span>
          </div>
          <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-clinical-active w-1/5 rounded-full"></div>
          </div>
        </div>
        
        <div className="h-10 w-px bg-white/5"></div>
        
        <div className="flex flex-col items-center min-w-[48px]">
          <span className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-0.5">WPM</span>
          <span className="text-2xl text-primary font-light">--</span>
        </div>
      </div>
      
    </footer>
  );
}
