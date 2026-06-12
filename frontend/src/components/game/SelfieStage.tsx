import type { ReactNode } from 'react';

export interface SelfieStageProps {
  /** The live `<video>` feed (mirrored) or a `<SelfiePreview>`. */
  children: ReactNode;
}

/** Rounded dark frame for the selfie camera feed / photo preview. */
export function SelfieStage({ children }: SelfieStageProps) {
  return (
    <div className="mx-auto my-4 size-60 max-h-[72vw] max-w-[72vw] overflow-hidden rounded-2xl bg-rim shadow-[0_0_0_1px_var(--color-line),0_8px_24px_rgba(0,0,0,.45)] [&>video]:block [&>video]:h-full [&>video]:w-full [&>video]:-scale-x-100 [&>video]:object-cover">
      {children}
    </div>
  );
}
