import type { Currency, ExchangeInfo, Product, Salary, TimeCostLevel } from './types';

const HOURS_PER_DAY = 8; // Work hours per day
const DAYS_PER_MONTH = 20; // Work days per month
const MONTHS_PER_YEAR = 12; // Work months per year

const VITE_PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? '.';
const RATES_URL = `${VITE_PUBLIC_URL}/rates.json`;

type ExchangeRates = {
  rates: Record<string, number>;
  updatedAt: string;
};

/**
 * Calculate salary per hour
 * @param salary salary
 * @returns salary per hour
 */
export function calculateSalaryPerHour(salary: Salary): number {
  const { amount, type } = salary;
  switch (type) {
    case 'hourly':
      return amount;
    case 'monthly':
      return amount / DAYS_PER_MONTH / HOURS_PER_DAY;
    case 'yearly':
      return amount / MONTHS_PER_YEAR / DAYS_PER_MONTH / HOURS_PER_DAY;
    default:
      throw new Error('Invalid salary type');
  }
}

/**
 * Get cached rates from local json file
 * Update rates via Github Actions
 * @returns rates
 */
export async function getCachedRates(): Promise<Record<string, number>> {
  const res = await fetch(RATES_URL);
  const data = (await res.json()) as ExchangeRates;
  return data.rates;
}

// Helper to convert any amount to TWD and return the rate
async function convertAmountAndRateToTWD(amount: number, currency: Currency) {
  const rates = await getCachedRates();
  if (currency === 'TWD') return { amount, rate: 1 };
  const rate = rates[currency];
  if (!rate) throw new Error(`No rate for currency: ${currency}`);
  return { amount: amount / rate, rate: 1 / rate };
}

/**
 * Calculate the time required to purchase a product, including hours, days, or years
 * Also returns salary and product price in TWD, and the TWD rate for both currencies
 * @param params salary, product
 */
export async function calculateProductTime(params: {
  salary: Salary;
  product: Product;
}): Promise<ExchangeInfo> {
  const { salary, product } = params;

  // Calculate salary per hour in original currency, then convert to TWD
  const salaryPerHour = calculateSalaryPerHour(salary);
  const [salaryTWDResult, productTWDResult] = await Promise.all([
    convertAmountAndRateToTWD(salaryPerHour, salary.currency),
    convertAmountAndRateToTWD(product.price, product.currency),
  ]);

  // Calculate total hours needed to buy the product
  const totalHours = +(productTWDResult.amount / salaryTWDResult.amount).toFixed(1);

  const years = Math.floor(totalHours / (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR));
  const months = Math.floor(
    (totalHours % (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR)) /
      (HOURS_PER_DAY * DAYS_PER_MONTH)
  );
  const days = Math.floor((totalHours % (HOURS_PER_DAY * DAYS_PER_MONTH)) / HOURS_PER_DAY);
  const hours = +(totalHours % HOURS_PER_DAY).toFixed(1);

  return {
    timeCost: {
      years,
      months,
      days,
      hours,
      totalHours,
    },
    salaryCurrency: salary.currency,
    productCurrency: product.currency,
    salaryPerHourTWD: +salaryTWDResult.amount.toFixed(2),
    productPriceTWD: +productTWDResult.amount.toFixed(2),
    salaryCurrencyToTWD: +salaryTWDResult.rate.toFixed(2),
    productCurrencyToTWD: +productTWDResult.rate.toFixed(2),
  };
}

/**
 * Get the time cost level
 * @param totalHours total hours
 * @returns time cost level
 */
export const getTimeCostLevel = (totalHours: number): TimeCostLevel => {
  const levels: [number, TimeCostLevel][] = [
    [0.5, 'instant'],
    [1, 'quick'],
    [2, 'a-fewHours'],
    [4, 'halfDay'],
    [8, 'oneDay'],
    [16, 'severalDays'],
    [40, 'oneWeek'],
    [120, 'coupleOfWeeks'],
    [160, 'severalWeeks'],
    [200, 'oneMonth'],
    [480, 'coupleOfMonths'],
    [960, 'severalMonths'],
    [1920, 'manyMonths'],
  ];

  for (const [threshold, label] of levels) {
    if (totalHours <= threshold) return label;
  }
  return 'a-yearPlus';
};
