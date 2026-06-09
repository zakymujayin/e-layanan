"use client";

import { useTransition } from "react";
import { setActiveSemester } from "@/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Semester = {
  id: number;
  label: string;
  isActive: boolean;
};

type Props = {
  semesters: Semester[];
  selectedId: number;
};

export function SemesterSelector({ semesters, selectedId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(() => {
      setActiveSemester(Number(value));
    });
  }

  return (
    <Select
      value={String(selectedId)}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[200px] text-sm">
        <SelectValue placeholder="Pilih Semester" />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((s) => (
          <SelectItem key={s.id} value={String(s.id)}>
            {s.label}{s.isActive ? " (Aktif)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
