import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable, CreateUserForm } from "./client";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 20;

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { dosen: { nama_lengkap: { contains: q, mode: "insensitive" as const } } },
          { pegawai: { nama_lengkap: { contains: q, mode: "insensitive" as const } } },
          { mahasiswa: { nama_lengkap: { contains: q, mode: "insensitive" as const } } },
          { mahasiswa: { nim: { contains: q } } },
        ],
      }
    : {};

  const [users, total, prodi] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { created_at: "desc" }, skip, take: PAGE_SIZE }),
    prisma.user.count({ where }),
    prisma.prodi.findMany({ orderBy: { nama: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Daftar User</CardTitle>
            <span className="text-sm text-muted-foreground">{total} user</span>
          </div>
          <form method="GET" className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama, email, NIM..."
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
            />
            <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              className="h-9 rounded-md border border-input bg-background px-4 text-sm hover:bg-muted shrink-0"
            >
              Cari
            </button>
            {q && (
              <a href="/admin/users" className="h-9 flex items-center px-3 text-sm text-muted-foreground hover:text-foreground">
                Reset
              </a>
            )}
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Halaman {page} dari {totalPages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/users?q=${q}&page=${page - 1}`}
                    className="rounded-md border px-3 py-1 hover:bg-muted"
                  >
                    ← Sebelumnya
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/users?q=${q}&page=${page + 1}`}
                    className="rounded-md border px-3 py-1 hover:bg-muted"
                  >
                    Berikutnya →
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tambah User</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm prodi={prodi} />
        </CardContent>
      </Card>
    </div>
  );
}
