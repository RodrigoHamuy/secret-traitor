import { cx } from '../../lib/cx';

export interface AvatarData {
  name: string;
  /** Falls back to an initials token when absent. */
  photoUrl?: string;
  /** Initials-token background; derived from the name when not given. */
  color?: string;
  /** banished → greyed out; slain → greyed + blood tint. */
  fate?: 'banished' | 'slain';
  /** Gilt shimmer while the selfie is repainted into a period portrait. */
  enhancing?: boolean;
}

export interface AvatarProps extends AvatarData {
  /** xs 28px (vote rows) · sm 36px (default) · xl 112px (gate) · fill (square cards). */
  size?: 'xs' | 'sm' | 'xl' | 'fill';
  className?: string;
  /** Animate the fate drain instead of showing it statically. */
  animateFate?: boolean;
}

const COLORS = ['#e8c468', '#9fc06f', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a',
                '#5ad2c0', '#d08fb0', '#b0c070', '#7fa6e0', '#e0a25a', '#90d0a0'];

function colorFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return COLORS[h % COLORS.length];
}

const initialsOf = (name: string) => name.trim().slice(0, 2).toUpperCase() || '??';

const SIZES = {
  xs: 'size-7 rounded-full text-[11px]',
  sm: 'size-9 rounded-full text-[13px]',
  xl: 'size-28 rounded-full text-[42px] shadow-medallion-lg!',
  fill: 'aspect-square w-full rounded-lg text-[40px]',
};

export function Avatar({
  name,
  photoUrl,
  color,
  fate,
  enhancing = false,
  size = 'sm',
  className,
  animateFate = false,
}: AvatarProps) {
  const fateFilter =
    fate === 'banished'
      ? animateFate
        ? 'animate-drain-grey'
        : 'grayscale-50'
      : fate === 'slain'
        ? animateFate
          ? 'animate-drain-slain'
          : 'brightness-[.92] grayscale contrast-[.95]'
        : undefined;
  return (
    <span
      className={cx(
        'relative grid flex-none place-items-center overflow-hidden font-display font-bold text-ink shadow-medallion',
        SIZES[size],
        fateFilter,
        enhancing && 'animate-enhance',
        className,
      )}
      style={photoUrl ? undefined : { background: color ?? colorFor(name) }}
    >
      {photoUrl ? (
        <img className="block h-full w-full object-cover" src={photoUrl} alt="" />
      ) : (
        initialsOf(name)
      )}
      {fate === 'slain' && (
        <span
          aria-hidden
          className={cx(
            'pointer-events-none absolute inset-0 rounded-[inherit] bg-[rgba(120,18,18,.30)] mix-blend-multiply',
            animateFate && 'animate-fade-in-slow',
          )}
        />
      )}
    </span>
  );
}
