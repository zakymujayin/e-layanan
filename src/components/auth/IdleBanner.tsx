"use client";

import { useSearchParams } from "next/navigation";

export function IdleBanner() {
  const sp = useSearchParams();
  if (sp.get("reason") !== "idle") return null;
  return (
    <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
      Sesi Anda berakhir karena tidak ada aktivitas. Silakan login kembali.
    </p>
  );
}
