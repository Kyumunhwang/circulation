import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const CANONICAL_STEP_ORDER = [
  'right_ventricle',
  'pulmonary_valve',
  'pulmonary_artery',
  'pulmonary_capillaries',
  'pulmonary_vein',
  'left_atrium',
  'bicuspid_valve',
  'left_ventricle',
  'aortic_valve',
  'aorta',
  'systemic_capillaries',
  'vena_cava',
  'right_atrium',
  'tricuspid_valve',
];

export const PULMONARY_STEP_ORDER = [
  'right_ventricle',
  'pulmonary_valve',
  'pulmonary_artery',
  'pulmonary_capillaries',
  'pulmonary_vein',
  'left_atrium',
];

export const SYSTEMIC_STEP_ORDER = [
  'left_ventricle',
  'aortic_valve',
  'aorta',
  'systemic_capillaries',
  'vena_cava',
  'right_atrium',
];

export const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [mode, setModeState] = useState('all'); // 'all' | 'pulmonary' | 'systemic' | 'blood_type'
  const [selectedNodeId, setSelectedNodeId] = useState('right_ventricle');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 0.5 | 1 | 2
  const [blindMode, setBlindMode] = useState(false);
  const [revealedLabels, setRevealedLabels] = useState([]);
  const [microViewTarget, setMicroViewTarget] = useState(null); // null | 'pulmonary_capillaries' | 'systemic_capillaries'
  const [showMisconceptionModal, setShowMisconceptionModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [cardiacPhase, setCardiacPhase] = useState('ventricular_systole'); // 'atrial_systole' | 'ventricular_systole' | 'diastole'
  const [cardiacProgress, setCardiacProgress] = useState(0);

  const activeStepOrder = useMemo(() => {
    if (mode === 'pulmonary') return PULMONARY_STEP_ORDER;
    if (mode === 'systemic') return SYSTEMIC_STEP_ORDER;
    return CANONICAL_STEP_ORDER;
  }, [mode]);

  const setMode = useCallback((nextMode) => {
    setModeState(nextMode);
    if (nextMode === 'pulmonary') {
      setSelectedNodeId((prev) => (PULMONARY_STEP_ORDER.includes(prev) ? prev : 'right_ventricle'));
    } else if (nextMode === 'systemic') {
      setSelectedNodeId((prev) => (SYSTEMIC_STEP_ORDER.includes(prev) ? prev : 'left_ventricle'));
    }
  }, []);

  const stepNext = useCallback(() => {
    setSelectedNodeId((prev) => {
      const idx = activeStepOrder.indexOf(prev);
      if (idx === -1) return activeStepOrder[0];
      return activeStepOrder[(idx + 1) % activeStepOrder.length];
    });
  }, [activeStepOrder]);

  const stepPrev = useCallback(() => {
    setSelectedNodeId((prev) => {
      const idx = activeStepOrder.indexOf(prev);
      if (idx === -1) return activeStepOrder[0];
      return activeStepOrder[(idx - 1 + activeStepOrder.length) % activeStepOrder.length];
    });
  }, [activeStepOrder]);

  const toggleBlindLabel = useCallback((id) => {
    if (!id) return;
    setRevealedLabels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const revealAllLabels = useCallback(() => {
    setRevealedLabels([...CANONICAL_STEP_ORDER]);
  }, []);

  const hideAllLabels = useCallback(() => {
    setRevealedLabels([]);
  }, []);

  const toggleBlindMode = useCallback(() => {
    setBlindMode((prev) => {
      const next = !prev;
      if (next) {
        setRevealedLabels([]);
      }
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const openMicroView = useCallback((target = 'pulmonary_capillaries') => {
    setMicroViewTarget(
      target === 'systemic_capillaries' ? 'systemic_capillaries' : 'pulmonary_capillaries'
    );
  }, []);

  const closeMicroView = useCallback(() => {
    setMicroViewTarget(null);
  }, []);

  const isLabelRevealed = useCallback(
    (id) => !blindMode || revealedLabels.includes(id),
    [blindMode, revealedLabels]
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selectedNodeId,
      setSelectedNodeId,
      isPlaying,
      setIsPlaying,
      togglePlay,
      speed,
      setSpeed,
      blindMode,
      setBlindMode,
      toggleBlindMode,
      revealedLabels,
      setRevealedLabels,
      isLabelRevealed,
      toggleBlindLabel,
      revealAllLabels,
      hideAllLabels,
      microViewTarget,
      setMicroViewTarget,
      openMicroView,
      closeMicroView,
      showMisconceptionModal,
      setShowMisconceptionModal,
      showQuizModal,
      setShowQuizModal,
      cardiacPhase,
      setCardiacPhase,
      cardiacProgress,
      setCardiacProgress,
      stepOrder: CANONICAL_STEP_ORDER,
      activeStepOrder,
      stepNext,
      stepPrev,
    }),
    [
      mode,
      setMode,
      selectedNodeId,
      isPlaying,
      togglePlay,
      speed,
      blindMode,
      toggleBlindMode,
      revealedLabels,
      isLabelRevealed,
      toggleBlindLabel,
      revealAllLabels,
      hideAllLabels,
      microViewTarget,
      openMicroView,
      closeMicroView,
      showMisconceptionModal,
      showQuizModal,
      cardiacPhase,
      cardiacProgress,
      activeStepOrder,
      stepNext,
      stepPrev,
    ]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
}

export default SimulationContext;
