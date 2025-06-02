import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPublicIdImage = (url: string): string => {
  const result = "asm1-sdn/" + url.split("/").pop()?.split(".")[0];
  return result;
};
