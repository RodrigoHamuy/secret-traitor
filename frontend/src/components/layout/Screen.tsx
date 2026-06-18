import type { ReactNode } from 'react';

export interface ScreenProps {
  children: ReactNode;
  footer?: ReactNode;
}

// Scrollable content above a pinned CTA footer (static app's layoutScreen()).
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
