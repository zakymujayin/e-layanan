export function placeholder(
  value: string | null | undefined,
  label: string
): string {
  if (value) return value;
  return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
}

export function reserved(
  value: string | null | undefined,
  label: string
): string {
  if (!value) {
    return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
  }
  return `<span style="background:#FFD700;padding:0 2px;" title="Nomor sudah di-reserve, menunggu finalisasi">${value}</span>`;
}
