import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Alternative } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortByUnitPrice(items: Alternative[]) {
  return items.sort((a, b) => a.unitPrice - b.unitPrice);
}
