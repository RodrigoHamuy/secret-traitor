import type { ReactNode } from 'react';

export interface HintBannerProps {
  children: ReactNode;
}

/** Hint banner — an aged ribbon with a bobbing pointing hand. Sits in normal
 * flow at the bottom of the phone so it never covers buttons. */
export function HintBanner({ children }: HintBannerProps) {
  return (
    <div className="z-[2] mx-3.5 mb-3.5 flex flex-none items-center gap-2.5 rounded-lg border border-gold-edge bg-linear-to-b from-[#efe3c6] to-[#dcc99c] px-4 py-3 font-display text-[13px] font-semibold tracking-[.02em] text-[#3a2a12] shadow-[0_6px_18px_rgba(0,0,0,.5),inset_0_0_0_1px_rgba(122,93,40,.35)]">
      <span className="animate-bob text-[22px] leading-none text-[#5e3b14]">☞</span>
      <span>{children}</span>
    </div>
  );
}
