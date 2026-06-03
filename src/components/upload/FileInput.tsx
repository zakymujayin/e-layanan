"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Upload, FileText, Loader2, Check } from "lucide-react";

interface FileInputProps {
  dokumenPersyaratanId: number;
  namaDokumen: string;
  formatDiizinkan: string[];
  ukuranMaxMb: number;
  isRequired: boolean;
  onUploaded: (data: { id: number; file_name: string; serve_url: string; size: number } | null) => void;
  existingFile?: { id: number; file_name: string; serve_url: string } | null;
}

type UploadState = "idle" | "uploading" | "done" | "error";

export function FileInput({
  dokumenPersyaratanId,
  namaDokumen,
  formatDiizinkan,
  ukuranMaxMb,
  isRequired,
  onUploaded,
  existingFile,
}: FileInputProps) {
  const [state, setState] = useState<UploadState>(existingFile ? "done" : "idle");
  const [fileName, setFileName] = useState(existingFile?.file_name ?? "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = ukuranMaxMb * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`Ukuran file maksimal ${ukuranMaxMb}MB`);
      setState("error");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExts = formatDiizinkan.map(f => f.toLowerCase());
    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      setErrorMsg(`Format harus ${formatDiizinkan.join("/")}`);
      setState("error");
      return;
    }

    setState("uploading");
    setFileName(file.name);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("dokumen_persyaratan_id", String(dokumenPersyaratanId));

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload gagal");
      }

      setState("done");
      onUploaded(data);
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.message);
      onUploaded(null);
    }
  }, [dokumenPersyaratanId, ukuranMaxMb, formatDiizinkan, onUploaded]);

  const handleRemove = useCallback(() => {
    setState(existingFile ? "done" : "idle");
    setFileName(existingFile?.file_name ?? "");
    setErrorMsg("");
    onUploaded(existingFile ? { id: existingFile.id, file_name: existingFile.file_name, serve_url: existingFile.serve_url, size: 0 } : null);
  }, [existingFile, onUploaded]);

  return (
    <div className="space-y-2">
      <Label>
        {namaDokumen}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {state === "uploading" && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Mengupload {fileName}...</span>
        </div>
      )}

      {state === "done" && (
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{fileName}</span>
          </div>
          {!existingFile && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setState("idle"); setErrorMsg(""); }}>
            Coba Lagi
          </Button>
        </div>
      )}

      {(state === "idle") && (
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept={formatDiizinkan.map(f => `.${f.toLowerCase()}`).join(",")}
            onChange={handleFileChange}
            className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Format: {formatDiizinkan.join(", ")} • Maks: {ukuranMaxMb}MB
      </p>
    </div>
  );
}
