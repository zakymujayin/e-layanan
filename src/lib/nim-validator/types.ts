export interface NimValidationResult {
  valid: boolean;
  nama: string;
  prodi: string;
  angkatan: number;
}

export interface NimValidator {
  validate(nim: string): Promise<NimValidationResult>;
}
