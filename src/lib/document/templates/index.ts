import { renderPersetujuanJudul } from "./persetujuan-judul";
import { renderBypassJudul } from "./bypass-judul";
import { renderSkPembimbing } from "./sk-pembimbing";
import {
  renderSeminarProposalSuratTugas,
  renderSeminarProposalBeritaAcara,
} from "./seminar-proposal";
import {
  renderUjianKomprehensifSuratTugas,
  renderUjianKomprehensifBeritaAcara,
} from "./ujian-komprehensif";
import {
  renderUjianSkripsiSuratTugas,
  renderUjianSkripsiBeritaAcara,
} from "./ujian-skripsi";
import { renderCekTurnitin } from "./cek-turnitin";
import { renderSuratAktifKuliah } from "./keterangan-aktif-kuliah";
import { renderSuratMasihKuliah } from "./keterangan-masih-kuliah";
import { renderSuratPernahKuliah } from "./keterangan-pernah-kuliah";
import { renderPengantarObservasi } from "./pengantar-observasi";
import { renderPengantarPenelitian } from "./pengantar-penelitian";
import { renderPermohonanMagang } from "./permohonan-magang";
import { renderSuratRekomendasi } from "./rekomendasi";
import type { DocumentContext } from "../context-builder";

export type TemplateFn = (ctx: DocumentContext) => string;
export type JenisDokumen = "surat_tugas" | "berita_acara";

export function selectTemplate(
  layananKode: string,
  isFinal: boolean,
  jenis: JenisDokumen = "surat_tugas"
): TemplateFn {
  if (jenis === "berita_acara") {
    switch (layananKode) {
      case "TA-03": return renderSeminarProposalBeritaAcara;
      case "TA-04": return renderUjianKomprehensifBeritaAcara;
      case "TA-05": return renderUjianSkripsiBeritaAcara;
      default: throw new Error(`No Berita Acara template for layanan: ${layananKode}`);
    }
  }

  switch (layananKode) {
    case "TA-01": return isFinal ? renderPersetujuanJudul : renderBypassJudul;
    case "TA-02": return renderSkPembimbing;
    case "TA-03": return renderSeminarProposalSuratTugas;
    case "TA-04": return renderUjianKomprehensifSuratTugas;
    case "TA-05": return renderUjianSkripsiSuratTugas;
    case "TA-06": return renderCekTurnitin;
    case "AK-01": return renderSuratAktifKuliah;
    case "AK-02": return renderSuratMasihKuliah;
    case "AK-03": return renderSuratPernahKuliah;
    case "AK-04": return renderPengantarObservasi;
    case "AK-05": return renderPengantarPenelitian;
    case "AK-06": return renderPermohonanMagang;
    case "AK-07": return renderSuratRekomendasi;
    default: throw new Error(`No template for layanan: ${layananKode}`);
  }
}
