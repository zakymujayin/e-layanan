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
    case "staff_prodi": return { level: "prodi", prodiId: 1 }; // TODO: get actual prodi_id from pegawai
    case "staff_akademik": case "kabag": return { level: "fakultas", fakultasId: 1 };
    case "dosen": return { level: "all" }; // dosen access depends on assignments, simplified for now
    default: throw new Error("Unknown system role");
  }
}
