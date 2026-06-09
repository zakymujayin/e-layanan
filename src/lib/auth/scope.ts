export type ScopeFilter = {
  level: "all" | "fakultas" | "prodi" | "own";
  fakultasId?: number;
  prodiId?: number;
  userId?: number;
};

export function getAccessibleScope(user: { id: number; systemRole: string }): ScopeFilter {
  switch (user.systemRole) {
    case "super_admin": return { level: "all" };
    case "mahasiswa": return { level: "own", userId: user.id };
    // staff_prodi scope is at fakultas level — no explicit prodi relation on Pegawai yet.
    // Prodi-specific filtering is handled via structural_positions in dashboard/pengajuan queries.
    case "staff_prodi": return { level: "fakultas" };
    case "staff_akademik": case "kabag": return { level: "fakultas" };
    case "dosen": return { level: "all" }; // dosen access depends on assignments
    default: throw new Error("Unknown system role");
  }
}
