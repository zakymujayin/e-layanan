import { NimValidator, NimValidationResult } from "./types";

const MOCK_DATA: Record<string, Omit<NimValidationResult, "valid">> = {
  "221360001": {
    nama: "Aini Fitri Utami",
    prodi: "Ilmu Hadis",
    angkatan: 2022,
  },
  "221360002": {
    nama: "Budi Santoso",
    prodi: "Ilmu Al-Quran dan Tafsir",
    angkatan: 2022,
  },
};

export class LocalNimValidator implements NimValidator {
  async validate(nim: string): Promise<NimValidationResult> {
    const data = MOCK_DATA[nim];
    if (!data) return { valid: false, nama: "", prodi: "", angkatan: 0 };
    return { valid: true, ...data };
  }
}

export const nimValidator: NimValidator = new LocalNimValidator();
