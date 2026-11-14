import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${crypto.randomUUID()}`;
}

/**
 * Warna teks/ikon di atas latar solid `color` (mis. lingkaran ikon kategori).
 * Rumus luminance relatif WCAG; ambang lum > 0,6 -> teks gelap `#262012`,
 * selain itu putih. Hex 3/6/8 digit; input bukan hex valid -> putih.
 */
export function contrastOn(color: string): "#FFFFFF" | "#262012" {
  const hex = color.trim().replace(/^#/, "");
  let r = 255;
  let g = 255;
  let b = 255;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return "#FFFFFF";
  }
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.6 ? "#262012" : "#FFFFFF";
}
