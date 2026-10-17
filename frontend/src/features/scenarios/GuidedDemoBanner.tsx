import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, SkipForward, X, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const DEMO_STEPS = [
  {
    step: 0,
    title: '1. Baseline Data & Sensor Ingestion',
    route: '/console',
    description: 'Real-time telemetry loaded from KSNDMC rain gauges and BBMP stormwater drain alignments in Bellandur basin.',
  },
  {
    step: 1,
    title: '2. Rainfall Spike (72 mm/h)',
    route: '/console/cascade',
    description: 'Convective storm cell exceeds catchment threshold; surface runoff accelerates into valley depressions.',
  },
  {
    step: 2,
    title: '3. Critical Road Disruption',
    route: '/console/cascade',
    description: 'Ecospace underpass on Outer Ring Road floods, cutting bidirectional arterial carriage.',
  },
  {
    step: 3,
    title: '4. Cascade Spread & Facility Isolation',
    route: '/console/cascade',
    description: 'Disruption cascades onto Kadubeesanahalli junctions; Sakra World Hospital emergency entrance restricted.',
  },
  {
    step: 4,
    title: '5. Counterfactual Response Comparison',
    route: '/console/lab',
    description: 'Response Lab compares 3 operational alternatives against unmanaged baseline across transit delay and access.',
  },
  {
    step: 5,
    title: '6. Top Recommendation Explained',
    route: '/console/lab',
    description: 'Alternative A recommended: HAL Old Airport detour saves 18 min transit delay with verified decision trace.',
  },
  {
    step: 6,
    title: '7. Data Limits & Verification Gate',
    route: '/console/evidence',
    description: 'Trust gate verifies sensor freshness, algorithm runtime architecture (s390x), and explicit model boundaries.',
  },
];

export const GuidedDemoBanner: React.FC = () => {
  const navigate = useNavigate();
  const { guidedDemo, nextDemoStep, skipDemoStep, endGuidedDemo, tickDemoTimer } = useAppStore();

  useEffect(() => {
    if (!guidedDemo.isActive) return;

    // Timer interval
    const timer = setInterval(() => {
      tickDemoTimer();
    }, 1000);

    // Keyboard listener: Space or Right Arrow for skip/next, Escape for end
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        skipDemoStep();
      } else if (e.key === 'Escape') {
        endGuidedDemo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [guidedDemo.isActive, tickDemoTimer, skipDemoStep, endGuidedDemo]);

  // Navigate when step changes
  useEffect(() => {
    if (guidedDemo.isActive) {
      const current = DEMO_STEPS[guidedDemo.currentStep] || DEMO_STEPS[0];
      navigate(current.route);
    }
  }, [guidedDemo.currentStep, guidedDemo.isActive, navigate]);

  if (!guidedDemo.isActive) return null;

  const currentStepData = DEMO_STEPS[guidedDemo.currentStep] || DEMO_STEPS[0];
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round((guidedDemo.elapsedSeconds / guidedDemo.totalSeconds) * 100);

  return (
    <aside
      aria-label="Guided demo walkthrough"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-navy-950/95 backdrop-blur-xl border border-cyan-400/50 text-white rounded-card shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(0,229,255,0.25)] p-4 animate-in slide-in-from-bottom duration-200"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Step details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-signal-blue text-navy-950 font-black text-sm shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            {guidedDemo.currentStep + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-400">
                Guided Demo Walkthrough
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-navy-900 text-slate-300 font-mono border border-navy-800">
                Step {guidedDemo.currentStep + 1} of {DEMO_STEPS.length}
              </span>
            </div>
            <h4 className="text-sm md:text-base font-bold text-white mt-0.5 font-mono">
              {currentStepData.title}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Controls and Timer */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-navy-900 px-3 py-1.5 rounded-xl border border-navy-750">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {formatTime(guidedDemo.elapsedSeconds)} / {formatTime(guidedDemo.totalSeconds)}
            </span>
          </div>

          {/* Next / Skip button */}
          <button
            type="button"
            onClick={nextDemoStep}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-signal-blue hover:bg-signal-blue-hover text-navy-950 text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all active:scale-95"
            title="Press ArrowRight or Space to proceed"
          >
            <span>Next step</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* End Demo */}
          <button
            type="button"
            onClick={endGuidedDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
            title="End guided demo (Esc)"
            aria-label="End guided demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-navy-900 rounded-full h-1.5 overflow-hidden border border-navy-800">
        <div
          className="bg-signal-blue h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,229,255,0.8)]"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
    </aside>
  );
};
