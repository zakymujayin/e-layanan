import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const NAV_GROUPS = [
  {
    label: "Pengguna",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/dosen", label: "Dosen" },
      { href: "/admin/pegawai", label: "Pegawai" },
    ],
  },
  {
    label: "Akademik",
    links: [
      { href: "/admin/prodi", label: "Program Studi" },
      { href: "/admin/periods", label: "Periode" },
      { href: "/admin/positions", label: "Jabatan" },
    ],
  },
  {
    label: "Layanan",
    links: [
      { href: "/admin/layanan", label: "Jenis Layanan" },
      { href: "/admin/kode-klasifikasi", label: "Kode Klasifikasi" },
      { href: "/admin/penomoran", label: "Penomoran Surat" },
    ],
  },
  {
    label: "Sistem",
    links: [
      { href: "/admin/config", label: "Konfigurasi" },
      { href: "/admin/monitoring", label: "Monitoring" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (user?.system_role !== "super_admin") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold mb-3">Admin Panel</h1>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className="flex items-center gap-x-1">
              {gi > 0 && (
                <span className="text-muted-foreground/40 select-none mx-1">|</span>
              )}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
                {group.label}:
              </span>
              {group.links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm hover:underline underline-offset-4 px-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
