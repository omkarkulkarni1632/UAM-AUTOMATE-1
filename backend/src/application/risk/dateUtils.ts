export function differenceInDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

