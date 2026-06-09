"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-6">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <div>
        <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sistem mengalami gangguan sementara. Silakan coba kembali.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        Coba Lagi
      </Button>
    </div>
  );
}
