import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { themeInitScript } from "@/components/theme-provider";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Keuangan — Catatan Keuangan Pribadi",
  description:
    "PWA pencatatan pemasukan dan pengeluaran pribadi: multi dompet, anggaran bulanan, laporan, dan scan struk.",
  applicationName: "Keuangan",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Keuangan" },
  icons: {
    icon: [
      { url: "/icons/logo-mark.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B7A4B" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1210" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={interTight.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
