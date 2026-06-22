export function calculateYudisium(nilaiFinal: number): string {
  if (nilaiFinal >= 3.51) return "pujian";
  if (nilaiFinal >= 3.01) return "sangat_memuaskan";
  if (nilaiFinal >= 2.76) return "memuaskan";
  return "";
}
