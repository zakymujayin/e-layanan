"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

/** Signs out the user after `timeoutMs` ms of no activity. */
export function IdleLogout({ timeoutMs = 2 * 60 * 60 * 1000 }: { timeoutMs?: number }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => signOut({ callbackUrl: "/login?reason=idle" }),
      timeoutMs
    );
  }

  useEffect(() => {
    reset();
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
