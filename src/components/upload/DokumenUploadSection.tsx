"use client";

import { useState, useEffect, useCallback } from "react";
import { FileInput } from "./FileInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DokumenInfo {
  id: number;
  nama_dokumen: string;
  format_diizinkan: string[];
  ukuran_max_mb: number;
  is_required: boolean;
}

interface DokumenUploadSectionProps {
  layananKode: string;
  onFilesChange: (uploadedIds: number[]) => void;
}

export function DokumenUploadSection({ layananKode, onFilesChange }: DokumenUploadSectionProps) {
  const [dokumenList, setDokumenList] = useState<DokumenInfo[]>([]);
  const [uploadedIds, setUploadedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchDokumen = async () => {
      try {
        const res = await fetch(`/api/dokumen-persyaratan?layanan_kode=${encodeURIComponent(layananKode)}`);
        if (res.ok) {
          const data = await res.json();
          setDokumenList(data.dokumen || []);
        }
      } catch {
        // silent
      }
    };
    fetchDokumen();
  }, [layananKode]);

  const handleFileUploaded = useCallback((dokumenId: number) => (data: { id: number } | null) => {
    setUploadedIds(prev => {
      const next = new Set(prev);
      if (data) {
        next.add(data.id);
      } else {
        // removed, don't remove from set (keep last uploaded)
      }
      onFilesChange(Array.from(next));
      return next;
    });
  }, [onFilesChange]);

  if (dokumenList.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokumen Persyaratan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {dokumenList.map((dok) => (
          <FileInput
            key={dok.id}
            dokumenPersyaratanId={dok.id}
            namaDokumen={dok.nama_dokumen}
            formatDiizinkan={dok.format_diizinkan as string[]}
            ukuranMaxMb={dok.ukuran_max_mb}
            isRequired={dok.is_required}
            onUploaded={handleFileUploaded(dok.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
