import type { ReactNode } from 'react';

export interface ScreenProps {
  children: ReactNode;
  /** Call-to-action buttons, always anchored to the bottom of the screen. */
  footer?: ReactNode;
}

/** A scene: scrollable content above a pinned CTA footer (the static app's
 * `.app` + `.app-content` + `.cta-footer` split done by `layoutScreen()`). */
export function Screen({ children, footer }: ScreenProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-[30px]">
      <div className="no-scrollbar flex min-h-0 flex-1 animate-fade flex-col overflow-y-auto">
        {children}
      </div>
      {footer && <div className="flex-none">{footer}</div>}
    </main>
  );
}
