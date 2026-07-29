import { useRef, useEffect, useCallback } from 'react';
import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult, HandLandmarkerResult } from '@mediapipe/tasks-vision';

import { useAuralisStore } from './stores/auralisStore';
import { calculateBilateralEAR } from './core/vision/ear';
import { calculatePinchRatio, getCursorCoordinates } from './core/vision/handTracker';
import { BlinkDetector } from './core/vision/blinkDetector';
import { MorseEngine } from './core/morse/morseEngine';
import { TTSController } from './core/speech/ttsController';

import { OutputDisplay } from './components/OutputDisplay/OutputDisplay';
import { MorseBufferDisplay } from './components/MorseBuffer/MorseBufferDisplay';
import { StatusBar } from './components/StatusBar/StatusBar';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const blinkDetectorRef = useRef<BlinkDetector | null>(null);
  const pinchDetectorRef = useRef<BlinkDetector | null>(null);
  const morseEngineRef = useRef<MorseEngine | null>(null);
  const ttsControllerRef = useRef<TTSController | null>(null);
  const animFrameRef = useRef<number>(0);

  // Store actions
  const setAppPhase = useAuralisStore((s) => s.setAppPhase);
  const setCameraActive = useAuralisStore((s) => s.setCameraActive);
  const setFaceDetected = useAuralisStore((s) => s.setFaceDetected);
  const setHandDetected = useAuralisStore((s) => s.setHandDetected);
  const setCursorPosition = useAuralisStore((s) => s.setCursorPosition);
  const setIsPinching = useAuralisStore((s) => s.setIsPinching);
  const setMorseState = useAuralisStore((s) => s.setMorseState);
  const setMorseBuffer = useAuralisStore((s) => s.setMorseBuffer);
  const setLastBlinkType = useAuralisStore((s) => s.setLastBlinkType);
  const appendCharacter = useAuralisStore((s) => s.appendCharacter);
  const appendSpace = useAuralisStore((s) => s.appendSpace);
  const backspace = useAuralisStore((s) => s.backspace);
  const clearText = useAuralisStore((s) => s.clearText);
  const appPhase = useAuralisStore((s) => s.appPhase);

  const initMediaPipe = useCallback(async (): Promise<{ face: FaceLandmarker; hand: HandLandmarker }> => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    const face = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    const hand = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    });

    return { face, hand };
  }, []);

  const startCamera = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadeddata = () => resolve();
        }
      });
    }
    return stream;
  }, []);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const handLandmarker = handLandmarkerRef.current;
    const blinkDetector = blinkDetectorRef.current;
    const pinchDetector = pinchDetectorRef.current;

    if (!video || !faceLandmarker || !handLandmarker || !blinkDetector || !pinchDetector || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const now = performance.now();
    const faceResult: FaceLandmarkerResult = faceLandmarker.detectForVideo(video, now);
    const handResult: HandLandmarkerResult = handLandmarker.detectForVideo(video, now);

    // Process Face
    if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = faceResult.faceLandmarks[0];
      const ear = calculateBilateralEAR(landmarks);

      if (ear >= 0) {
        blinkDetector.process(ear);
      }
    } else {
      setFaceDetected(false);
    }

    // Process Hand
    if (handResult.landmarks && handResult.landmarks.length > 0) {
      setHandDetected(true);
      const landmarks = handResult.landmarks[0];
      
      const coords = getCursorCoordinates(landmarks);
      setCursorPosition(coords.x, coords.y);
      
      const pinchRatio = calculatePinchRatio(landmarks);
      if (pinchRatio >= 0) {
        // Pinch detector expects high values when open, low when closed (like EAR)
        pinchDetector.process(pinchRatio);
        setIsPinching(pinchRatio < 0.3); // Threshold for visual feedback
      }
    } else {
      setHandDetected(false);
      setIsPinching(false);
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [setFaceDetected, setHandDetected, setCursorPosition, setIsPinching]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setAppPhase('loading');

        ttsControllerRef.current = new TTSController();
        const blink = new BlinkDetector();
        blinkDetectorRef.current = blink;
        const pinch = new BlinkDetector();
        pinchDetectorRef.current = pinch;
        const morse = new MorseEngine();
        morseEngineRef.current = morse;

        // Shared handler for both eye blinks and hand pinches
        const handleInputEvent = (event: any) => {
          if (event.type === 'blink_start') {
            morse.onBlinkStart(event.timestamp);
          } else if (event.type === 'blink_end' && event.duration) {
            morse.onBlinkEnd(event.timestamp, event.duration);
            if (event.duration <= 300) setLastBlinkType('dot');
            else setLastBlinkType('dash');
            setTimeout(() => setLastBlinkType(null), 300);
          }
        };

        blink.onBlink(handleInputEvent);
        pinch.onBlink(handleInputEvent);

        morse.on((event) => {
          switch (event.type) {
            case 'character': appendCharacter(event.char); break;
            case 'word_space': appendSpace(); break;
            case 'state_change': setMorseState(event.state); break;
            case 'buffer_update': setMorseBuffer(event.buffer); break;
            case 'command':
              if (event.command === 'BACKSPACE') backspace();
              if (event.command === 'CLEAR_ALL') clearText();
              if (event.command === 'SPEAK') {
                ttsControllerRef.current?.speak(useAuralisStore.getState().outputText);
              }
              break;
            case 'emergency':
              ttsControllerRef.current?.speakEmergency('I need help');
              setAppPhase('emergency');
              setTimeout(() => setAppPhase('active'), 5000);
              break;
          }
        });

        const models = await initMediaPipe();
        if (!mounted) return;
        faceLandmarkerRef.current = models.face;
        handLandmarkerRef.current = models.hand;

        await startCamera();
        if (!mounted) return;
        setCameraActive(true);

        blink.setCalibration(0.30);
        pinch.setCalibration(0.50); // Hand pinch ratio usually higher
        morse.forceArm();
        setAppPhase('active');

        detectLoop();
      } catch (err) {
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setCameraActive(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(animFrameRef.current);
      faceLandmarkerRef.current?.close();
      handLandmarkerRef.current?.close();
      morseEngineRef.current?.destroy();
      ttsControllerRef.current?.destroy();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${appPhase === 'emergency' ? 'shadow-[inset_0_0_40px_rgba(255,23,68,0.3)] animate-pulse' : ''}`}>

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-tighter flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">neurology</span> Auralis
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-secondary uppercase tracking-widest">System</span>
              <span className="text-[10px] font-bold text-clinical-active px-2 py-0.5 rounded-full bg-clinical-active/10 border border-clinical-active/20">OPTIMAL</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-secondary">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col pt-16 pb-24">
        <OutputDisplay />
        <MorseBufferDisplay />
      </main>

      {/* Bottom Diagnostic Footer */}
      <StatusBar videoRef={videoRef} />
    </div>
  );
}

export default App;
