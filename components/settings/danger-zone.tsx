"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAccountAction } from "@/app/actions/profile";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Hapus akun dan semua data
      </Button>
      <ConfirmDialog
        open={open}
        title="Hapus akun?"
        description="Seluruh dompet, transaksi, anggaran, dan foto struk akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus akun"
        loading={pending}
        onClose={() => setOpen(false)}
        onConfirm={() => startTransition(async () => {
          await deleteAccountAction();
        })}
      />
    </div>
  );
}
