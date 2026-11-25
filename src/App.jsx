import React, { useEffect } from 'react';
import { useSimulation } from './state/SimulationContext';
import DashboardLayout from './components/DashboardLayout';
import CirculationSVG from './components/CirculationSVG';
import BloodFlowCanvas from './components/BloodFlowCanvas';
import MicroViewModal from './components/MicroViewModal';
import MisconceptionModal from './components/MisconceptionModal';
import FormativeQuizModal from './components/FormativeQuizModal';

/**
 * Root application component wiring the 3-pane classroom dashboard,
 * interactive SVG + 60fps Canvas blood-flow simulation, and teacher modals.
 */
export function App() {
  const {
    mode,
    selectedNodeId,
    setSelectedNodeId,
    cardiacPhase,
    blindMode,
    revealedLabels,
    toggleBlindLabel,
    microViewTarget,
    setMicroViewTarget,
    openMicroView,
    closeMicroView,
    showMisconceptionModal,
    setShowMisconceptionModal,
    showQuizModal,
    setShowQuizModal,
    stepNext,
    stepPrev,
  } = useSimulation();

  const hasModalOpen =
    Boolean(microViewTarget) || showMisconceptionModal || showQuizModal;

  useEffect(() => {
    if (hasModalOpen) return undefined;

    const handleKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasModalOpen, stepNext, stepPrev]);

  return (
    <>
      <DashboardLayout>
        <CirculationSVG
          mode={mode}
          selectedNodeId={selectedNodeId}
          cardiacPhase={cardiacPhase}
          blindMode={blindMode}
          revealedLabels={revealedLabels}
          onSelectNode={setSelectedNodeId}
          onToggleBlindLabel={toggleBlindLabel}
          onOpenMicroView={openMicroView}
        >
          <BloodFlowCanvas />
        </CirculationSVG>
      </DashboardLayout>

      <MicroViewModal
        isOpen={Boolean(microViewTarget)}
        target={microViewTarget}
        onChangeTarget={setMicroViewTarget}
        onClose={closeMicroView}
      />

      <MisconceptionModal
        isOpen={showMisconceptionModal}
        onClose={() => setShowMisconceptionModal(false)}
      />

      <FormativeQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
      />
    </>
  );
}

export default App;
