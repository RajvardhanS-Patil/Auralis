/**
 * App.tsx — Root application component for Auralis AAC.
 *
 * Orchestrates the camera, MediaPipe inference, blink detection,
 * Morse code engine, and TTS — connecting them to the UI.
 */

import { useRef, useEffect, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

import { useAuralisStore } from './stores/auralisStore';
import { calculateBilateralEAR } from './core/vision/ear';
import { BlinkDetector } from './core/vision/blinkDetector';
import { MorseEngine } from './core/morse/morseEngine';
import { TTSController } from './core/speech/ttsController';

import { OutputDisplay } from './components/OutputDisplay/OutputDisplay';
import { MorseBufferDisplay } from './components/MorseBuffer/MorseBufferDisplay';
import { StatusBar } from './components/StatusBar/StatusBar';

import './App.css';

/**
 * Root application component.
 */
function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const blinkDetectorRef = useRef<BlinkDetector | null>(null);
  const morseEngineRef = useRef<MorseEngine | null>(null);
  const ttsControllerRef = useRef<TTSController | null>(null);
  const animFrameRef = useRef<number>(0);

  // Store actions
  const setAppPhase = useAuralisStore((s) => s.setAppPhase);
  const setCameraActive = useAuralisStore((s) => s.setCameraActive);
  const setFaceDetected = useAuralisStore((s) => s.setFaceDetected);
  const setMorseState = useAuralisStore((s) => s.setMorseState);
  const setMorseBuffer = useAuralisStore((s) => s.setMorseBuffer);
  const setLastBlinkType = useAuralisStore((s) => s.setLastBlinkType);
  const appendCharacter = useAuralisStore((s) => s.appendCharacter);
  const appendSpace = useAuralisStore((s) => s.appendSpace);
  const backspace = useAuralisStore((s) => s.backspace);
  const clearText = useAuralisStore((s) => s.clearText);
  const appPhase = useAuralisStore((s) => s.appPhase);

  /**
   * Initializes MediaPipe Face Landmarker.
   */
  const initMediaPipe = useCallback(async (): Promise<FaceLandmarker> => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
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

    return landmarker;
  }, []);

  /**
   * Starts the webcam video stream.
   */
  const startCamera = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
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

  /**
   * Main detection loop — runs on every animation frame.
   */
  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = faceLandmarkerRef.current;
    const blinkDetector = blinkDetectorRef.current;

    if (!video || !landmarker || !blinkDetector || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const result: FaceLandmarkerResult = landmarker.detectForVideo(
      video,
      performance.now()
    );

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = result.faceLandmarks[0];
      const ear = calculateBilateralEAR(landmarks);

      if (ear >= 0) {
        blinkDetector.process(ear);
      }
    } else {
      setFaceDetected(false);
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [setFaceDetected]);

  /**
   * Main initialization effect — sets up everything on mount.
   */
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setAppPhase('loading');

        // Initialize TTS
        ttsControllerRef.current = new TTSController();

        // Initialize Blink Detector
        const blink = new BlinkDetector();
        blinkDetectorRef.current = blink;

        // Initialize Morse Engine
        const morse = new MorseEngine();
        morseEngineRef.current = morse;

        // Wire blink detector → morse engine
        blink.onBlink((event) => {
          if (event.type === 'blink_start') {
            morse.onBlinkStart(event.timestamp);
          } else if (event.type === 'blink_end' && event.duration) {
            morse.onBlinkEnd(event.timestamp, event.duration);

            // Visual feedback
            if (event.duration <= 300) {
              setLastBlinkType('dot');
            } else {
              setLastBlinkType('dash');
            }

            // Clear visual feedback after 300ms
            setTimeout(() => setLastBlinkType(null), 300);
          }
        });

        // Wire morse engine → app state
        morse.on((event) => {
          switch (event.type) {
            case 'character':
              appendCharacter(event.char);
              break;
            case 'word_space':
              appendSpace();
              break;
            case 'state_change':
              setMorseState(event.state);
              break;
            case 'buffer_update':
              setMorseBuffer(event.buffer);
              break;
            case 'command':
              if (event.command === 'BACKSPACE') backspace();
              if (event.command === 'CLEAR_ALL') clearText();
              if (event.command === 'SPEAK') {
                const text = useAuralisStore.getState().outputText;
                ttsControllerRef.current?.speak(text);
              }
              break;
            case 'emergency':
              ttsControllerRef.current?.speakEmergency('I need help');
              setAppPhase('emergency');
              setTimeout(() => setAppPhase('active'), 5000);
              break;
          }
        });

        // Initialize MediaPipe
        const landmarker = await initMediaPipe();
        if (!mounted) return;
        faceLandmarkerRef.current = landmarker;

        // Start camera
        await startCamera();
        if (!mounted) return;
        setCameraActive(true);

        // Skip calibration for now — use defaults and auto-arm
        blink.setCalibration(0.30);
        morse.forceArm();
        setAppPhase('active');

        // Start detection loop
        detectLoop();
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setCameraActive(false);
          }
        }
      }
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(animFrameRef.current);
      faceLandmarkerRef.current?.close();
      morseEngineRef.current?.destroy();
      ttsControllerRef.current?.destroy();

      // Stop camera stream
      const video = videoRef.current;
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`app ${appPhase === 'emergency' ? 'app--emergency' : ''}`}>
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__logo" aria-hidden="true">🧠</span>
          Auralis
        </h1>
      </header>

      <main className="app__main">
        <OutputDisplay />
        <MorseBufferDisplay />
      </main>

      <StatusBar videoRef={videoRef} />
    </div>
  );
}

export default App;
