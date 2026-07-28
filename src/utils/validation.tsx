export function isValidGoals(value: string): boolean {
  if (value === "") return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 20;
}
