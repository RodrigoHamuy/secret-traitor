export interface HourglassProps {
  /** How long the sand takes to drain, in seconds. */
  durationSeconds: number;
}

const SAND = 'absolute inset-x-0 bottom-0 bg-linear-to-b from-gold-bright to-gold';
const CAP = 'h-[7px] w-[78px] rounded-[4px] bg-linear-to-b from-gold-bright to-gold shadow-[0_1px_0_#5e4720]';

/** Debate hourglass — the sand drains from the top bulb into the bottom one
 * over `durationSeconds`, with a faint glittering stream between them. */
export function Hourglass({ durationSeconds }: HourglassProps) {
  return (
    <div className="relative mx-auto mt-[18px] mb-2 flex w-[78px] flex-col items-center">
      <span className={CAP} />
      <span className="relative h-[46px] w-16 overflow-hidden bg-white/5 [clip-path:polygon(0_0,100%_0,50%_100%)]">
        <span className={SAND} style={{ animation: `hg-drain ${durationSeconds}s linear forwards` }} />
      </span>
      <span className="relative h-[46px] w-16 overflow-hidden bg-white/5 [clip-path:polygon(50%_0,0_100%,100%_100%)]">
        <span className={SAND} style={{ animation: `hg-fill ${durationSeconds}s linear forwards` }} />
      </span>
      <span className={CAP} />
      <span
        aria-hidden
        className="absolute top-[calc(50%+10px)] left-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 animate-hg-stream bg-linear-to-b from-gold-bright to-gold-bright/0"
      />
    </div>
  );
}
