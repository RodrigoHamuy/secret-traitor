import type { AvatarData } from '../components/game/Avatar';

/** Inline SVG portrait placeholder so photo stories need no network. */
export const SAMPLE_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
      "<rect width='100' height='100' fill='#dccaa1'/>" +
      "<circle cx='50' cy='38' r='18' fill='#6b5026'/>" +
      "<path d='M20 100 Q50 58 80 100 Z' fill='#6b5026'/>" +
      '</svg>',
  );

export const PLAYERS: AvatarData[] = [
  { name: 'Isabella', photoUrl: SAMPLE_PHOTO },
  { name: 'Lorenzo' },
  { name: 'Caterina' },
  { name: 'Niccolò' },
  { name: 'Bianca' },
  { name: 'Matteo' },
];

export const [ISABELLA, LORENZO, CATERINA, NICCOLO, BIANCA, MATTEO] = PLAYERS;
