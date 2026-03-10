import { clsx, type ClassValue } from "clsx";
import { format, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateLike?: Date | string | null) {
  if (!dateLike) return "未設定";

  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (!isValid(date)) return "未設定";

  return format(date, "PPP p", { locale: ja });
}

export function formatDuration(minutes?: number | null) {
  if (!minutes || Number.isNaN(minutes)) return "未算出";
  if (minutes < 1) return `${Math.round(minutes * 60)}秒`;
  return `${minutes.toFixed(minutes >= 10 ? 0 : 1)}分`;
}

export function average(numbers: number[]) {
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toTitleCaseWords(value: string) {
  return value
    .split("_")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
