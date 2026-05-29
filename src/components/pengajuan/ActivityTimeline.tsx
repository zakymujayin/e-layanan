import { prisma } from "@/lib/prisma";

const actionLabels: Record<string, string> = {
  submit: "Pengajuan diajukan",
  approve: "Disetujui",
  reject_to_submitter: "Ditolak — dikembalikan ke mahasiswa",
  reject_to_step: "Ditolak — dikembalikan ke step sebelumnya",
  select_judul: "Judul dipilih",
  sign: "Ditandatangani",
};

export async function ActivityTimeline({ pengajuanId }: { pengajuanId: number }) {
  const logs = await prisma.pengajuanLog.findMany({
    where: { pengajuan_id: pengajuanId },
    orderBy: { created_at: "desc" },
  });

  if (!logs.length) return <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>;

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 border-l-2 border-muted pl-4">
          <div>
            <p className="text-sm font-medium">{actionLabels[log.action_code] || log.action_code}</p>
            {log.alasan && <p className="text-xs text-muted-foreground">Alasan: {log.alasan}</p>}
            <p className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
