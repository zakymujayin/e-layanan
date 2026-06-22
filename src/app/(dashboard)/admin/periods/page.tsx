import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createAcademicPeriod, setActivePeriod, deletePeriod } from "@/actions/admin";

function PeriodBadge({ status }: { status: string }) {
  if (status === "active") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aktif</Badge>;
  }
  if (status === "upcoming") {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Upcoming</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Completed</Badge>;
}

function SetActiveButton({ periodId }: { periodId: number }) {
  return (
    <form action={setActivePeriod.bind(null, periodId)}>
      <Button type="submit" variant="outline" size="sm">
        Set Aktif
      </Button>
    </form>
  );
}

function DeleteButton({ periodId }: { periodId: number }) {
  return (
    <form action={deletePeriod.bind(null, periodId)}>
      <Button type="submit" variant="destructive" size="sm">
        Hapus
      </Button>
    </form>
  );
}

function AddPeriodForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Periode</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createAcademicPeriod} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama_semester">Nama Semester</Label>
              <Input id="nama_semester" name="nama_semester" type="text" placeholder="Ganjil 2026/2027" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tahun_akademik">Tahun Akademik</Label>
              <Input id="tahun_akademik" name="tahun_akademik" type="text" placeholder="2026/2027" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tipe">Tipe</Label>
              <Select name="tipe" defaultValue="ganjil">
                <SelectTrigger id="tipe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Ganjil</SelectItem>
                  <SelectItem value="genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <Input id="tanggal_mulai" name="tanggal_mulai" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tanggal_berakhir">Tanggal Berakhir</Label>
              <Input id="tanggal_berakhir" name="tanggal_berakhir" type="date" required />
            </div>
          </div>
          <Button type="submit">Simpan Periode</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function AdminPeriodsPage() {
  const periods = await prisma.academicPeriod.findMany({
    orderBy: { tanggal_mulai: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Periode Akademik</h1>
        <p className="text-muted-foreground">Atur periode semester aktif dan daftar periode</p>
      </div>

      <div className="space-y-3">
        {periods.map((period) => (
          <Card key={period.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <CardTitle>{period.nama_semester}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {period.tahun_akademik} · {period.tipe === "ganjil" ? "Ganjil" : "Genap"} ·{" "}
                    {period.tanggal_mulai.toLocaleDateString("id-ID")}
                    {period.tanggal_berakhir ? ` – ${period.tanggal_berakhir.toLocaleDateString("id-ID")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <PeriodBadge status={period.status} />
                  {period.status !== "active" && (
                    <>
                      <SetActiveButton periodId={period.id} />
                      <DeleteButton periodId={period.id} />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {periods.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada periode akademik. Tambahkan periode di bawah.
          </CardContent>
        </Card>
      )}

      <AddPeriodForm />
    </div>
  );
}
