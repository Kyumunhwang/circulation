import { useCallback, useEffect, useRef, useState } from 'react';
import { CANONICAL_LOOP_ORDER, CANONICAL_VIEWBOX } from '../assets/circulationPaths.js';
import { CirculationEngine } from './CirculationEngine.js';

const PROGRESS_EMIT_INTERVAL_MS = 65;

/**
 * React hook driving the 60fps HTML5 Canvas blood-flow simulation with HiDPI scaling,
 * cardiac-phase synchronization, and step-navigation helpers.
 *
 * @param {object} [options]
 * @param {boolean} [options.isPlaying=true]
 * @param {number} [options.speed=1] - Playback multiplier (`0.5 | 1 | 2`).
 * @param {'all'|'pulmonary'|'systemic'|'blood_type'} [options.mode='all']
 * @param {string|null} [options.selectedNodeId=null]
 * @param {string[]} [options.activeStepOrder]
 * @param {(nodeId: string) => void} [options.onSelectNode]
 * @param {(phase: 'atrial_systole'|'ventricular_systole'|'diastole') => void} [options.onCardiacPhaseChange]
 * @param {(progress: number) => void} [options.onCardiacProgressChange]
 * @param {React.RefObject<HTMLCanvasElement>} [options.canvasRef]
 */
export function useCirculationAnimation(options = {}) {
  const {
    isPlaying = true,
    speed = 1,
    mode = 'all',
    selectedNodeId = null,
    activeStepOrder = CANONICAL_LOOP_ORDER,
    onSelectNode,
    onCardiacPhaseChange,
    onCardiacProgressChange,
    canvasRef: externalCanvasRef,
  } = options;

  const internalCanvasRef = useRef(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const engineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = new CirculationEngine({ speed, mode, selectedNodeId });
  }

  const [cardiacPhase, setCardiacPhase] = useState(engineRef.current.cardiacPhase);
  const [cardiacProgress, setCardiacProgress] = useState(engineRef.current.cardiacProgress);

  const callbacksRef = useRef({
    onSelectNode,
    onCardiacPhaseChange,
    onCardiacProgressChange,
  });
  callbacksRef.current = {
    onSelectNode,
    onCardiacPhaseChange,
    onCardiacProgressChange,
  };

  const sizeRef = useRef({
    width: CANONICAL_VIEWBOX.width,
    height: CANONICAL_VIEWBOX.height,
    dpr: 1,
  });

  /**
   * Synchronize canvas backing buffer to rendered CSS dimensions and devicePixelRatio,
   * preserving crisp HiDPI rendering over the `1000 x 760` SVG viewport.
   */
  const syncCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width > 1 ? rect.width : canvas.clientWidth || CANONICAL_VIEWBOX.width;
    const cssHeight = rect.height > 1 ? rect.height : canvas.clientHeight || CANONICAL_VIEWBOX.height;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);

    const targetWidth = Math.max(1, Math.round(cssWidth * dpr));
    const targetHeight = Math.max(1, Math.round(cssHeight * dpr));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    sizeRef.current = { width: targetWidth, height: targetHeight, dpr };
    return canvas;
  }, [canvasRef]);

  /**
   * Render one frame onto the HiDPI-scaled 2D canvas context.
   */
  const drawFrame = useCallback(() => {
    const canvas = syncCanvasResolution();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / CANONICAL_VIEWBOX.width;
    const scaleY = canvas.height / CANONICAL_VIEWBOX.height;

    ctx.save();
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    engineRef.current.render(ctx, CANONICAL_VIEWBOX.width, CANONICAL_VIEWBOX.height);
    ctx.restore();
  }, [syncCanvasResolution]);

  // Keep engine configuration synchronized with React props and redraw immediately
  useEffect(() => {
    const engine = engineRef.current;
    engine.setSpeed(speed);
    engine.setMode(mode);
    engine.setSelectedNodeId(selectedNodeId);
    drawFrame();
  }, [speed, mode, selectedNodeId, drawFrame]);

  // Observe container resizing & DPR changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    drawFrame();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        drawFrame();
      });
      resizeObserver.observe(canvas);
    }

    const handleWindowResize = () => drawFrame();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [canvasRef, drawFrame]);

  // Main 60fps requestAnimationFrame loop
  useEffect(() => {
    // Emit initial phase cleanly once mounted
    callbacksRef.current.onCardiacPhaseChange?.(engineRef.current.cardiacPhase);

    if (!isPlaying) {
      drawFrame();
      return undefined;
    }

    let rafId = 0;
    let lastTime = performance.now();
    let lastProgressEmitTime = lastTime;

    const tick = (now) => {
      const dtMs = now - lastTime;
      lastTime = now;

      const stepInfo = engineRef.current.step(dtMs);
      drawFrame();

      if (stepInfo.phaseChanged) {
        setCardiacPhase(stepInfo.cardiacPhase);
        callbacksRef.current.onCardiacPhaseChange?.(stepInfo.cardiacPhase);
      }

      if (now - lastProgressEmitTime >= PROGRESS_EMIT_INTERVAL_MS) {
        lastProgressEmitTime = now;
        setCardiacProgress(stepInfo.cardiacProgress);
        callbacksRef.current.onCardiacProgressChange?.(stepInfo.cardiacProgress);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [isPlaying, drawFrame]);

  const nextStep = useCallback(() => {
    const order = activeStepOrder && activeStepOrder.length > 0 ? activeStepOrder : CANONICAL_LOOP_ORDER;
    const idx = order.indexOf(selectedNodeId);
    const nextId = idx === -1 ? order[0] : order[(idx + 1) % order.length];
    engineRef.current.setSelectedNodeId(nextId);
    callbacksRef.current.onSelectNode?.(nextId);
    drawFrame();
    return nextId;
  }, [activeStepOrder, selectedNodeId, drawFrame]);

  const prevStep = useCallback(() => {
    const order = activeStepOrder && activeStepOrder.length > 0 ? activeStepOrder : CANONICAL_LOOP_ORDER;
    const idx = order.indexOf(selectedNodeId);
    const prevId = idx === -1 ? order[0] : order[(idx - 1 + order.length) % order.length];
    engineRef.current.setSelectedNodeId(prevId);
    callbacksRef.current.onSelectNode?.(prevId);
    drawFrame();
    return prevId;
  }, [activeStepOrder, selectedNodeId, drawFrame]);

  const reset = useCallback(() => {
    engineRef.current.reset();
    setCardiacPhase(engineRef.current.cardiacPhase);
    setCardiacProgress(engineRef.current.cardiacProgress);
    callbacksRef.current.onCardiacPhaseChange?.(engineRef.current.cardiacPhase);
    callbacksRef.current.onCardiacProgressChange?.(engineRef.current.cardiacProgress);
    drawFrame();
  }, [drawFrame]);

  return {
    canvasRef,
    engineRef,
    cardiacPhase,
    cardiacProgress,
    nextStep,
    prevStep,
    reset,
    redraw: drawFrame,
  };
}

export default useCirculationAnimation;
