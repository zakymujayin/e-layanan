import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* KIRI: Brand Panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-emerald-700 flex-col justify-center items-center text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute top-[-120px] right-[-120px] w-[450px] h-[450px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.06]" />

        <GraduationCap className="h-24 w-24 mb-8 relative z-10" strokeWidth={1} />
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 relative z-10">SILA</h1>
        <p className="text-xl font-medium opacity-90 relative z-10">
          Sistem Informasi Layanan Akademik
        </p>
        <div className="w-20 h-[2px] bg-white/30 rounded-full my-5" />
        <p className="text-base opacity-70 relative z-10">
          Fakultas Ushuluddin dan Adab
        </p>
        <p className="text-sm opacity-50 mt-1 relative z-10">
          UIN Sultan Maulana Hasanuddin Banten
        </p>
      </div>

      {/* KANAN: Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-sm">
          {/* Mobile logo (visible only < lg) */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <GraduationCap className="h-12 w-12 text-primary mb-3" strokeWidth={1.5} />
            <h1 className="text-2xl font-extrabold tracking-tight">SILA</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Sistem Informasi Layanan Akademik<br />FUDA UIN SMH Banten
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
