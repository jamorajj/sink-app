import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageId: string) {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${imageId}`;
}

export function shuffleArray(arr: any[]) {
  return arr.map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value); 
}
