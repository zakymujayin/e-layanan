import { renderPersetujuanJudul } from "./persetujuan-judul";
import { renderBypassJudul } from "./bypass-judul";
import { renderSkPembimbing } from "./sk-pembimbing";
import { renderSeminarProposal } from "./seminar-proposal";
import type { DocumentContext } from "../context-builder";

export type TemplateFn = (ctx: DocumentContext) => string;

export function selectTemplate(layananKode: string, isFinal: boolean): TemplateFn {
  switch (layananKode) {
    case "TA-01": return isFinal ? renderPersetujuanJudul : renderBypassJudul;
    case "TA-02": return renderSkPembimbing;
    case "TA-03": return renderSeminarProposal;
    default: throw new Error(`No template for layanan: ${layananKode}`);
  }
}
