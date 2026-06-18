import type { ReactNode } from 'react';

export interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative flex h-full w-full max-w-[400px] flex-col overflow-hidden rounded-[26px] border border-[#3a2c17] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(201,162,74,.16),transparent_60%),linear-gradient(180deg,var(--color-chamber-from),var(--color-chamber-to))] shadow-phone">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 animate-flicker bg-[radial-gradient(60%_45%_at_50%_8%,rgba(232,200,115,.12),transparent_70%)]"
      />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
