export interface CardBackProps {
  glyph: string;
  label?: string;
}

export function CardBack({ glyph, label = 'Tap to reveal' }: CardBackProps) {
  return (
    <>
      <div className="mb-4 font-body text-[58px] [text-shadow:0_0_18px_rgba(232,200,115,.6)]">
        {glyph}
      </div>
      <div className="font-display text-3xl font-bold tracking-[.08em]">{label}</div>
    </>
  );
}
