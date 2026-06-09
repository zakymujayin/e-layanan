import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3003";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type CachedSmtp = { transporter: Transporter; from: string } | null;
let smtpCache: CachedSmtp | undefined = undefined;

async function getSmtp(): Promise<CachedSmtp> {
  if (smtpCache !== undefined) return smtpCache;

  const keys = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"];
  const rows = await prisma.appConfig.findMany({ where: { key: { in: keys } } });
  const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
    smtpCache = null;
    return null;
  }

  const port = parseInt(cfg.smtp_port ?? "587", 10) || 587;
  smtpCache = {
    transporter: nodemailer.createTransport({
      host: cfg.smtp_host,
      port,
      secure: port === 465,
      auth: { user: cfg.smtp_user, pass: decrypt(cfg.smtp_pass) },
    }),
    from: cfg.smtp_from ?? cfg.smtp_user,
  };
  return smtpCache;
}

export function buildEmailHtml(opts: {
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: number | null;
}): string {
  const entityId = Number(opts.entityId) || null;
  const linkHtml =
    opts.entityType === "pengajuan" && entityId
      ? `<p style="margin-top:16px"><a href="${BASE_URL}/pengajuan/${entityId}" style="background:#1d4ed8;color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:14px">Lihat Pengajuan →</a></p>`
      : "";
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
<h2 style="margin:0 0 8px;font-size:18px">${esc(opts.title)}</h2>
<p style="margin:0 0 12px;font-size:14px;color:#374151">${esc(opts.message)}</p>
${linkHtml}
<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
<p style="font-size:12px;color:#9ca3af">SILA — Sistem Layanan Akademik</p>
</body></html>`;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const smtp = await getSmtp();
    if (!smtp) return;
    await smtp.transporter.sendMail({ from: smtp.from, to, subject, html });
  } catch (err) {
    console.error("[Email] gagal kirim ke", to, err);
  }
}
