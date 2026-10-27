import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function defaultVariant<T extends { isDefault: boolean }>(variants: T[]): T | undefined {
  return variants.find((v) => v.isDefault) ?? variants[0];
}

export const ASK_SIZE = "Ask about sizes";

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(iso));
}
