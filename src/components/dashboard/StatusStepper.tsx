'use client';

import React from 'react';
import { Check, Circle, Hourglass, Warning } from '@phosphor-icons/react';

export type StepState = 'completed' | 'current' | 'pending' | 'rejected';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
  state: StepState;
}

interface StatusStepperProps {
  steps: StepItem[];
  className?: string;
}

export function StatusStepper({ steps, className = '' }: StatusStepperProps) {
  return (
    <div className={`w-full overflow-x-auto py-2 ${className}`}>
      <div className="flex items-center min-w-[500px]">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle & label */}
              <div className="flex flex-col items-center text-center shrink-0 w-28">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step.state === 'completed'
                      ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40'
                      : step.state === 'current'
                      ? 'bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/20'
                      : step.state === 'rejected'
                      ? 'bg-destructive/20 text-destructive border border-destructive/40'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {step.state === 'completed' ? (
                    <Check size={18} weight="bold" />
                  ) : step.state === 'current' ? (
                    <Hourglass size={16} weight="bold" />
                  ) : step.state === 'rejected' ? (
                    <Warning size={16} weight="bold" />
                  ) : (
                    <span className="font-mono">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold ${
                    step.state === 'current'
                      ? 'text-primary'
                      : step.state === 'completed'
                      ? 'text-foreground'
                      : step.state === 'rejected'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {step.description}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 transition-colors -mt-6 mx-1 ${
                    step.state === 'completed' ? 'bg-[var(--success)]' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
