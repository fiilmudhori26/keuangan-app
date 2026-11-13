"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { saveProfileAction } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [monthStartDay, setMonthStartDay] = useState(profile.monthStartDay);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileAction({
        displayName,
        currency: "IDR",
        monthStartDay,
        theme: profile.theme,
      });
      if (result.ok) {
        push(result.message ?? "Pengaturan disimpan");
        router.refresh();
      } else {
        setError(result.message ?? "Pengaturan gagal disimpan.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Nama tampilan" htmlFor="display-name">
        <Input
          id="display-name"
          value={displayName}
          maxLength={60}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mata uang" htmlFor="currency">
          <Input id="currency" value="IDR - Rupiah" readOnly disabled />
        </Field>
        <Field label="Awal bulan anggaran" htmlFor="month-start">
          <Select
            id="month-start"
            value={monthStartDay}
            onChange={(event) => setMonthStartDay(Number(event.target.value))}
          >
            {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
              <option key={day} value={day}>
                Tanggal {day}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}

      <Button onClick={submit} loading={pending}>
        Simpan pengaturan
      </Button>
    </div>
  );
}
