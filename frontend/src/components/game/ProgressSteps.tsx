import { Fragment } from 'react';

import { cx } from '../../lib/cx';

export interface ProgressStepsProps {
  /** e.g. ['Vote', 'Assassinate'] */
  steps: string[];
  /** Index of the current step; earlier steps render as done. */
  active: number;
}

/** 2-step "Vote › Special" progress hint for the Assassin/Guardian turn. */
export function ProgressSteps({ steps, active }: ProgressStepsProps) {
  return (
    <div className="mx-auto mt-2 mb-0.5 flex items-center justify-center gap-2 font-display text-[11px] font-semibold tracking-[.08em] uppercase">
      {steps.map((label, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'pending';
        return (
          <Fragment key={label}>
            {i > 0 && <span className="text-line">›</span>}
            <span
              className={cx(
                'inline-flex items-center gap-1.5',
                state === 'active' && 'text-gold-bright',
                state === 'done' && 'text-gold opacity-85',
                state === 'pending' && 'text-muted opacity-55',
              )}
            >
              <span
                className={cx(
                  'inline-flex size-[18px] items-center justify-center rounded-full border text-[10px]',
                  state === 'active' && 'border-gold-bright bg-gold-bright text-btn-ink',
                  state === 'done' && 'border-gold text-gold',
                  state === 'pending' && 'border-line text-muted',
                )}
              >
                {i + 1}
              </span>
              {label}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
