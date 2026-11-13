"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/theme-provider";
import { saveProfileAction } from "@/app/actions/profile";
import type { Profile, ThemePreference } from "@/lib/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const { push } = useToast();
  const { setTheme } = useTheme();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [monthStartDay, setMonthStartDay] = useState(profile.monthStartDay);
  const [theme, setThemeState] = useState<ThemePreference>(profile.theme);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileAction({
        displayName,
        currency: "IDR",
        monthStartDay,
        theme,
      });
      if (result.ok) {
        setTheme(theme);
        push(result.message ?? "Pengaturan disimpan");
        router.refresh();
      } else {
        setError(result.message ?? "Pengaturan gagal disimpan.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Email" htmlFor="email" hint="Email tidak dapat diubah.">
        <Input id="email" value={email} readOnly disabled />
      </Field>
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
          <Input id="currency" value="IDR — Rupiah" readOnly disabled />
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

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-muted-foreground">Tema</legend>
        <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-muted p-1">
          {(
            [
              ["system", "Ikuti sistem"],
              ["light", "Terang"],
              ["dark", "Gelap"],
            ] as Array<[ThemePreference, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => {
                setThemeState(value);
                setTheme(value);
              }}
              className={`h-11 rounded-[8px] text-[14px] font-semibold ${
                theme === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

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
