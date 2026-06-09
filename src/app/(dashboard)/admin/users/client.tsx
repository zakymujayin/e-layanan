"use client";

import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, toggleUserActive, deleteUser, updateUserEmail, resetUserPassword } from "@/actions/admin";
import { useState } from "react";

const ROLES = [
  "super_admin",
  "dosen",
  "kaprodi",
  "sekprodi",
  "wakil_dekan_1",
  "dekan",
  "kepala_lab",
  "staff_prodi",
  "staff_akademik",
  "kabag",
  "mahasiswa",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Tambah User"}
    </Button>
  );
}

// --- Edit User Modal ---

function EditUserForm({ user, onClose }: { user: any; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="mt-3 border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Edit User: {user.email}</p>
      <form
        action={(fd) => startTransition(async () => { await updateUserEmail(user.id, fd); onClose(); })}
        className="flex items-end gap-2"
      >
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Email Baru</label>
          <Input name="email" type="email" defaultValue={user.email} required className="mt-1 h-8 text-sm" />
        </div>
        <Button type="submit" size="sm" disabled={pending}>Ubah Email</Button>
      </form>
      <form
        action={(fd) => startTransition(async () => { await resetUserPassword(user.id, fd); onClose(); })}
        className="flex items-end gap-2"
      >
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Password Baru (min. 8 karakter)</label>
          <Input name="new_password" type="password" required minLength={8} placeholder="••••••••" className="mt-1 h-8 text-sm" />
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={pending}>Reset Password</Button>
      </form>
      <Button variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
    </div>
  );
}

// --- Users Table ---

export function UsersTable({ users }: { users: any[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-sm">{user.email}</TableCell>
              <TableCell className="text-sm">{user.system_role}</TableCell>
              <TableCell>
                {user.is_active ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">Aktif</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">Nonaktif</Badge>
                )}
              </TableCell>
              <TableCell>
                <ActionButtons
                  userId={user.id}
                  isActive={user.is_active}
                  isSuperAdmin={user.system_role === "super_admin"}
                  onEdit={() => setEditingId(editingId === user.id ? null : user.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingId !== null && (
        <EditUserForm
          user={users.find(u => u.id === editingId)!}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function ActionButtons({
  userId,
  isActive,
  isSuperAdmin,
  onEdit,
}: {
  userId: number;
  isActive: boolean;
  isSuperAdmin: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => toggleUserActive(userId))}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>
      {!isSuperAdmin && (
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => deleteUser(userId))}
        >
          Hapus
        </Button>
      )}
    </div>
  );
}

// --- Create User Form ---

export function CreateUserForm({ prodi }: { prodi: { id: number; nama: string }[] }) {
  return (
    <form action={createUser} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
          <Input id="nama_lengkap" name="nama_lengkap" type="text" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="system_role">System Role</Label>
          <Select name="system_role">
            <SelectTrigger id="system_role">
              <SelectValue placeholder="Pilih Role..." />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nidn">NIDN (untuk dosen)</Label>
          <Input id="nidn" name="nidn" type="text" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nip">NIP (untuk pegawai)</Label>
          <Input id="nip" name="nip" type="text" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nim">NIM (untuk mahasiswa)</Label>
          <Input id="nim" name="nim" type="text" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prodi_id">Prodi (untuk mahasiswa)</Label>
          <Select name="prodi_id">
            <SelectTrigger id="prodi_id">
              <SelectValue placeholder="Pilih Prodi..." />
            </SelectTrigger>
            <SelectContent>
              {prodi.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
