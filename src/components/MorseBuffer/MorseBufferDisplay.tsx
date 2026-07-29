import { useAuralisStore } from '../../stores/auralisStore';

export function MorseBufferDisplay() {
  const morseBuffer = useAuralisStore((s) => s.morseBuffer);
  const lastCharacter = useAuralisStore((s) => s.lastCharacter);
  const lastBlinkType = useAuralisStore((s) => s.lastBlinkType);
  const morseState = useAuralisStore((s) => s.morseState);

  return (
    <section className="flex-[4] flex flex-col items-center justify-start gap-stack-md px-container-padding">
      
      {/* Morse Buffer Display */}
      <div className="glass-panel rounded-2xl px-16 py-8 flex items-center gap-16">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-3">Input Buffer</span>
          <span className="font-mono text-5xl text-primary font-medium tracking-[0.3em]">
            {morseBuffer || (morseState === 'ARMED' ? '—' : '...')}
          </span>
        </div>
        
        <div className="h-16 w-px bg-white/10"></div>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-3">Translation</span>
          <span className="text-4xl text-accent font-bold">
            {lastCharacter !== ' ' ? lastCharacter : '-'}
          </span>
        </div>
      </div>

      {/* Visual Feedback Indicators */}
      <div className="flex gap-4">
        <div className={`flex items-center gap-3 px-8 py-2.5 bg-white/5 border border-white/10 rounded-full transition-all-200 ${lastBlinkType === 'dot' ? 'active-selection' : ''}`}>
          <div className={`w-3 h-3 rounded-full ${lastBlinkType === 'dot' ? 'bg-accent shadow-[0_0_12px_rgba(167,139,250,0.8)]' : 'bg-white/30'}`}></div>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Dot</span>
        </div>
        
        <div className={`flex items-center gap-3 px-8 py-2.5 bg-white/5 border border-white/10 rounded-full transition-all-200 ${lastBlinkType === 'dash' ? 'active-selection' : ''}`}>
          <div className={`w-8 h-3 rounded-full ${lastBlinkType === 'dash' ? 'bg-accent shadow-[0_0_12px_rgba(167,139,250,0.8)]' : 'bg-white/30'}`}></div>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Dash</span>
        </div>
      </div>

      {/* Prediction Cards (Placeholder for future feature) */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-6 mt-8">
        <button className="glass-panel group transition-all-200 p-10 rounded-2xl flex flex-col items-center hover:bg-white/[0.08] hover:-translate-y-1">
          <span className="text-[9px] font-bold text-secondary mb-4 uppercase tracking-[0.2em]">Option [1]</span>
          <span className="text-3xl text-primary font-medium">water</span>
        </button>
        <button className="glass-panel active-selection p-10 rounded-2xl flex flex-col items-center">
          <span className="text-[9px] font-bold text-accent mb-4 uppercase tracking-[0.2em]">Focus [2]</span>
          <span className="text-4xl text-primary font-bold tracking-tight">want</span>
        </button>
        <button className="glass-panel group transition-all-200 p-10 rounded-2xl flex flex-col items-center hover:bg-white/[0.08] hover:-translate-y-1">
          <span className="text-[9px] font-bold text-secondary mb-4 uppercase tracking-[0.2em]">Option [3]</span>
          <span className="text-3xl text-primary font-medium">wash</span>
        </button>
      </div>

    </section>
  );
}
