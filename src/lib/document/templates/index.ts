import { renderPersetujuanJudul } from "./persetujuan-judul";
import { renderBypassJudul } from "./bypass-judul";
import { renderSkPembimbing } from "./sk-pembimbing";
import { renderSeminarProposal } from "./seminar-proposal";
import { renderUjianKomprehensif } from "./ujian-komprehensif";
import { renderUjianSkripsi } from "./ujian-skripsi";
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

export function selectTemplate(layananKode: string, isFinal: boolean): TemplateFn {
  switch (layananKode) {
    case "TA-01": return isFinal ? renderPersetujuanJudul : renderBypassJudul;
    case "TA-02": return renderSkPembimbing;
    case "TA-03": return renderSeminarProposal;
    case "TA-04": return renderUjianKomprehensif;
    case "TA-05": return renderUjianSkripsi;
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
