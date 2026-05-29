import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Sistem Informasi Layanan Akademik Fakultas
          Ushuluddin dan Adab
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pengajuan Aktif" value="0" />
        <StatCard label="Menunggu Tindakan" value="0" />
        <StatCard label="Selesai Bulan Ini" value="0" />
        <StatCard label="Status TA Terkini" value="—" />
      </div>
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="Belum ada pengajuan"
        description="Anda dapat mengajukan layanan akademik melalui menu Pengajuan."
      />
    </div>
  );
}
