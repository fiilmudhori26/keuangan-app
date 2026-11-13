"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "register"; googleEnabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Masukkan email yang valid.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "login"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name.trim() });

      if (result.error) {
        setError(
          mode === "login"
            ? "Email atau kata sandi salah."
            : (result.error.message ?? "Pendaftaran gagal. Coba email lain."),
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" ? (
          <Field label="Nama" htmlFor="name">
            <Input
              id="name"
              value={name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field
          label="Kata sandi"
          htmlFor="password"
          hint={mode === "register" ? "Minimal 8 karakter." : undefined}
        >
          <Input
            id="password"
            type="password"
            value={password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        {error ? (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={pending}>
          {mode === "login" ? "Masuk" : "Daftar"}
        </Button>
      </form>

      {googleEnabled ? (
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            void authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
          }}
        >
          Lanjut dengan Google
        </Button>
      ) : null}

      <p className="text-center text-[14px] text-muted-foreground">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Masuk
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
