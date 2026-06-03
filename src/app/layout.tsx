import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SILA — Sistem Informasi Layanan Akademik",
    template: "%s | SILA FUDA",
  },
  description:
    "Portal layanan akademik digital Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten. Ajukan dan pantau layanan tugas akhir serta surat keterangan secara online.",
  keywords: ["layanan akademik", "FUDA", "UIN Banten", "tugas akhir", "surat keterangan", "SILA"],
  authors: [{ name: "FUDA UIN SMH Banten" }],
  openGraph: {
    title: "SILA — Sistem Informasi Layanan Akademik",
    description: "Portal layanan akademik digital Fakultas Ushuluddin dan Adab UIN SMH Banten",
    type: "website",
    locale: "id_ID",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
