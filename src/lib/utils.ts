import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amountInSmallestUnit: number, currencyCode: string = 'USD') {
  const currency = currencyCode.toUpperCase();
  
  // Currencies that don't have sub-units (cents)
  const zeroDecimalCurrencies = [
    'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
  ];

  const isZeroDecimal = zeroDecimalCurrencies.includes(currency);
  const majorUnitAmount = isZeroDecimal ? amountInSmallestUnit : amountInSmallestUnit / 100;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(majorUnitAmount);
  } catch (e) {
    // Fallback if currency code is invalid
    return `${currency} ${majorUnitAmount.toFixed(isZeroDecimal ? 0 : 2)}`;
  }
}
