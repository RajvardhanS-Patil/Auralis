import { useAuralisStore } from '../../stores/auralisStore';

export function OutputDisplay() {
  const outputText = useAuralisStore((s) => s.outputText);
  const appPhase = useAuralisStore((s) => s.appPhase);

  const placeholder = appPhase === 'active'
    ? 'Start blinking to type...'
    : appPhase === 'calibrating'
    ? 'Calibrating...'
    : 'Welcome to Auralis';

  return (
    <section className="flex-[5] flex flex-col items-center justify-center px-container-padding">
      <div className="w-full max-w-6xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight px-12 py-20 rounded-[2rem] glass-panel inline-block min-w-[90%]">
          {outputText || <span className="text-secondary/50 italic font-light">{placeholder}</span>}
          <span className="cursor-blink ml-2"></span>
        </h1>
      </div>
    </section>
  );
}
