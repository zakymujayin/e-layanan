import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateConfig } from "@/actions/admin";

function ConfigForm({ config }: { config: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi Sistem</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateConfig} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="app_name">Nama Aplikasi</Label>
              <Input
                id="app_name"
                name="app_name"
                type="text"
                defaultValue={config.app_name || ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo_url">URL Logo</Label>
              <Input
                id="logo_url"
                name="logo_url"
                type="text"
                defaultValue={config.logo_url || ""}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Textarea
                id="footer_text"
                name="footer_text"
                defaultValue={config.footer_text || ""}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="turnitin_threshold">Turnitin Threshold %</Label>
              <Input
                id="turnitin_threshold"
                name="turnitin_threshold"
                type="number"
                defaultValue={config.turnitin_threshold || "25"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                name="smtp_host"
                type="text"
                defaultValue={config.smtp_host || ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                defaultValue={config.smtp_port || ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp_user">SMTP User</Label>
              <Input
                id="smtp_user"
                name="smtp_user"
                type="text"
                defaultValue={config.smtp_user || ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp_pass">SMTP Password</Label>
              <Input
                id="smtp_pass"
                name="smtp_pass"
                type="password"
                defaultValue={config.smtp_pass || ""}
              />
            </div>
          </div>
          <Button type="submit">Simpan Konfigurasi</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function AdminConfigPage() {
  const configs = await prisma.appConfig.findMany();
  const config: Record<string, string> = {};
  for (const c of configs) {
    config[c.key] = c.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Konfigurasi Sistem</h1>
        <p className="text-muted-foreground">Atur pengaturan aplikasi</p>
      </div>

      <ConfigForm config={config} />
    </div>
  );
}
