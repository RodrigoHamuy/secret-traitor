export interface CardBackProps {
  /** 🤫 for role cards, 🗳️ for ballots. */
  glyph: string;
  label?: string;
}

/** Face-down side of a flip card: a glowing glyph and a "Tap to reveal" prompt. */
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
