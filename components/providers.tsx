"use client";

import { ToastProvider } from "./ui/toast";
import { ThemeProvider } from "./theme-provider";
import { ServiceWorkerRegister } from "./service-worker-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
        <ServiceWorkerRegister />
      </ToastProvider>
    </ThemeProvider>
  );
}
