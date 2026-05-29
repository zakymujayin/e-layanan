import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending_staff_prodi: "bg-amber-100 text-amber-800",
  pending_pa: "bg-blue-100 text-blue-800",
  pending_kaprodi: "bg-purple-100 text-purple-800",
  pending_wd1: "bg-indigo-100 text-indigo-800",
  pending_dekan: "bg-indigo-100 text-indigo-800",
  pending_sekprodi: "bg-teal-100 text-teal-800",
  pending_kabag: "bg-orange-100 text-orange-800",
  pending_staff_akademik: "bg-amber-100 text-amber-800",
  pending_kepala_lab: "bg-cyan-100 text-cyan-800",
  revision_required: "bg-red-100 text-red-800",
  selesai: "bg-green-100 text-green-800",
  terminated: "bg-gray-100 text-gray-800",
  bypass_active: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<string, string> = {
  pending_staff_prodi: "Menunggu Staff Prodi",
  pending_pa: "Menunggu PA",
  pending_kaprodi: "Menunggu Kaprodi",
  pending_wd1: "Menunggu Wakil Dekan 1",
  pending_dekan: "Menunggu Dekan",
  pending_sekprodi: "Menunggu Sekprodi",
  pending_kabag: "Menunggu Kabag",
  pending_staff_akademik: "Menunggu Staff Akademik",
  pending_kepala_lab: "Menunggu Kepala Lab",
  revision_required: "Perlu Revisi",
  selesai: "Selesai",
  terminated: "Dibatalkan",
  bypass_active: "Mode Bypass",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
      {statusLabels[status] || status}
    </Badge>
  );
}
