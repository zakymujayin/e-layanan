import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ImportUsersForm } from "./import-users-form";

export default function ImportUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Daftar Pengguna
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Import Pengguna</h1>
      <ImportUsersForm />
    </div>
  );
}
