'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  completed: boolean;
}

export function GeneratingModal() {
  const [stages, setStages] = useState<Stage[]>([
    { id: 'slack', label: 'Analyzing Slack conversations', completed: false },
    { id: 'logs', label: 'Processing error logs', completed: false },
    { id: 'metrics', label: 'Correlating metrics and alerts', completed: false },
    { id: 'root-cause', label: 'Identifying root cause', completed: false },
    { id: 'recommendations', label: 'Generating recommendations', completed: false },
  ]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive stage completion
    const stageTimings = [2000, 3000, 4000, 5500, 7000]; // Cumulative times
    
    stageTimings.forEach((time, index) => {
      setTimeout(() => {
        setStages(prev => 
          prev.map((stage, i) => 
            i <= index ? { ...stage, completed: true } : stage
          )
        );
        setProgress(((index + 1) / stages.length) * 100);
      }, time);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        {/* Title */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600/20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Generating Postmortem</h2>
          <p className="mt-2 text-sm text-slate-400">
            AI is analyzing your incident data...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="font-semibold text-violet-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center gap-3 text-sm"
            >
              {stage.completed ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
              ) : (
                <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-700" />
              )}
              <span
                className={`transition-colors ${
                  stage.completed ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Estimated time: 10-15 seconds
        </div>
      </div>
    </div>
  );
}
