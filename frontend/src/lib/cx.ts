/** Joins truthy class names — keeps conditional Tailwind class lists readable. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
