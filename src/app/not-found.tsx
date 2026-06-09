import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-6">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg font-semibold">Halaman tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants()}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
