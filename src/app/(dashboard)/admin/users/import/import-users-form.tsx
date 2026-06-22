"use client";

import { useRef, useState } from "react";
import { importUsersFromCsv } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ImportResult = {
  success: number;
  failed: Array<{ row: number; email: string; error: string }>;
};

export function ImportUsersForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await importUsersFromCsv(formData);
      setResult(res);
      formRef.current?.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Pengguna dari CSV</CardTitle>
          <CardDescription>
            Upload file CSV untuk menambahkan banyak pengguna sekaligus.{" "}
            <a
              href="/templates/import-users-template.csv"
              download
              className="underline text-primary"
            >
              Download template CSV
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
          >
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Mengupload..." : "Upload"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Kolom wajib: <code>email, password, system_role, nama_lengkap, identifier</code>.
            Kolom opsional: <code>prodi_kode</code> (wajib untuk mahasiswa/dosen), <code>angkatan</code> (untuk mahasiswa).
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Import</CardTitle>
            <CardDescription>
              {result.success} berhasil · {result.failed.length} gagal
            </CardDescription>
          </CardHeader>
          {result.success > 0 && (
            <CardContent className="pb-0">
              <div className="rounded bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
                {result.success} pengguna berhasil diimpor.
              </div>
            </CardContent>
          )}
          {result.failed.length > 0 && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4 font-medium">Baris</th>
                      <th className="pb-2 pr-4 font-medium">Email</th>
                      <th className="pb-2 font-medium">Alasan Gagal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failed.map((f) => (
                      <tr key={f.row} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-muted-foreground">{f.row}</td>
                        <td className="py-2 pr-4">{f.email || "-"}</td>
                        <td className="py-2 text-red-600">{f.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
