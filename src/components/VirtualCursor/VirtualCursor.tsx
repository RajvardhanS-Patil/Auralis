import { useEffect, useRef } from 'react';
import { useAuralisStore } from '../../stores/auralisStore';

export function VirtualCursor() {
  const cursorX = useAuralisStore((s) => s.cursorX);
  const cursorY = useAuralisStore((s) => s.cursorY);
  const isPinching = useAuralisStore((s) => s.isPinching);
  const isHandDetected = useAuralisStore((s) => s.isHandDetected);

  const prevPinching = useRef(isPinching);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect "click" when transitioning from not pinching to pinching
    if (isPinching && !prevPinching.current && cursorRef.current) {
      const rect = cursorRef.current.getBoundingClientRect();
      // Use the center of the cursor
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;

      // Find the element at the cursor position
      const elementUnderCursor = document.elementFromPoint(clickX, clickY);

      if (elementUnderCursor instanceof HTMLElement) {
        // Trigger a click event on that element
        elementUnderCursor.click();
        
        // Visual feedback for clicking
        cursorRef.current.classList.add('scale-75', 'bg-accent');
        setTimeout(() => {
          if (cursorRef.current) {
            cursorRef.current.classList.remove('scale-75', 'bg-accent');
          }
        }, 150);
      }
    }

    prevPinching.current = isPinching;
  }, [isPinching]);

  if (!isHandDetected) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed z-[9999] w-8 h-8 rounded-full border-2 transition-all duration-75 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
        isPinching
          ? 'border-accent bg-accent/20 scale-90'
          : 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)]'
      }`}
      style={{
        left: `${cursorX * 100}vw`,
        top: `${cursorY * 100}vh`,
      }}
    >
      {/* Inner dot */}
      <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full"></div>
    </div>
  );
}
