import React, { useContext, useEffect } from 'react';
import SimulationContext from '../state/SimulationContext.jsx';
import { useCirculationAnimation } from '../engine/useCirculationAnimation.js';

/**
 * HiDPI HTML5 Canvas overlay synchronized with `CirculationSVG` (`1000 x 760`).
 * Works both when controlled via explicit props or automatically via `SimulationContext`.
 *
 * @param {object} props
 * @param {boolean} [props.isPlaying]
 * @param {0.5|1|2} [props.speed]
 * @param {'all'|'pulmonary'|'systemic'|'blood_type'} [props.mode]
 * @param {string|null} [props.selectedNodeId]
 * @param {string[]} [props.activeStepOrder]
 * @param {(nodeId: string) => void} [props.onSelectNode]
 * @param {(phase: string) => void} [props.onCardiacPhaseChange]
 * @param {(progress: number) => void} [props.onCardiacProgressChange]
 * @param {(api: object) => void} [props.onEngineReady]
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 */
export function BloodFlowCanvas({
  isPlaying: propIsPlaying,
  speed: propSpeed,
  mode: propMode,
  selectedNodeId: propSelectedNodeId,
  activeStepOrder: propActiveStepOrder,
  onSelectNode: propOnSelectNode,
  onCardiacPhaseChange: propOnCardiacPhaseChange,
  onCardiacProgressChange: propOnCardiacProgressChange,
  onEngineReady,
  className = '',
  style,
}) {
  const simCtx = useContext(SimulationContext);

  const isPlaying = propIsPlaying !== undefined ? propIsPlaying : (simCtx?.isPlaying ?? true);
  const speed = propSpeed !== undefined ? propSpeed : (simCtx?.speed ?? 1);
  const mode = propMode !== undefined ? propMode : (simCtx?.mode ?? 'all');
  const selectedNodeId =
    propSelectedNodeId !== undefined ? propSelectedNodeId : (simCtx?.selectedNodeId ?? null);
  const activeStepOrder = propActiveStepOrder ?? simCtx?.activeStepOrder;

  const onSelectNode = propOnSelectNode ?? simCtx?.setSelectedNodeId;
  const onCardiacPhaseChange = propOnCardiacPhaseChange ?? simCtx?.setCardiacPhase;
  const onCardiacProgressChange = propOnCardiacProgressChange ?? simCtx?.setCardiacProgress;

  const {
    canvasRef,
    engineRef,
    cardiacPhase,
    cardiacProgress,
    nextStep,
    prevStep,
    reset,
    redraw,
  } = useCirculationAnimation({
    isPlaying,
    speed,
    mode,
    selectedNodeId,
    activeStepOrder,
    onSelectNode,
    onCardiacPhaseChange,
    onCardiacProgressChange,
  });

  useEffect(() => {
    if (onEngineReady) {
      onEngineReady({
        engineRef,
        nextStep,
        prevStep,
        reset,
        redraw,
      });
    }
  }, [onEngineReady, engineRef, nextStep, prevStep, reset, redraw]);

  return (
    <canvas
      ref={canvasRef}
      className={`blood-flow-canvas ${className}`.trim()}
      data-cardiac-phase={cardiacPhase}
      data-cardiac-progress={cardiacProgress.toFixed(2)}
      data-mode={mode}
      aria-label="Blood flow red blood cell particle simulation layer"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

export default BloodFlowCanvas;
