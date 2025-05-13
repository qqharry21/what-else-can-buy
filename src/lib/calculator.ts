import type { Currency, Product, Salary, TimeCost } from './types';

const HOURS_PER_DAY = 8; // Work hours per day
const DAYS_PER_MONTH = 20; // Work days per month
const MONTHS_PER_YEAR = 12; // Work months per year

const VITE_PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL;
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
 * Convert product price to salary currency
 * @param product product
 * @param salaryCurrency salary currency
 * @returns product price, rate
 */
async function convertProductPriceToSalaryCurrency(product: Product, salaryCurrency: Currency) {
  if (product.currency === salaryCurrency) {
    return { price: product.price, rate: 1 };
  }
  const rates = await getCachedRates();
  const rate = rates[product.currency];
  return { price: product.price * rate, rate };
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

/**
 * Calculate the time required to purchase a product, including hours, days, or years
 * @param params salary, product
 */
export async function calculateProductTime(params: {
  salary: Salary;
  product: Product;
}): Promise<TimeCost> {
  const { salary, product } = params;

  // Convert product price to salary currency
  const { price: productPriceInSalaryCurrency, rate } = await convertProductPriceToSalaryCurrency(
    product,
    salary.currency
  );
  console.log('🚨 - productPriceInSalaryCurrency', productPriceInSalaryCurrency);
  console.log('🚨 - rate', rate);

  const salaryPerHour = calculateSalaryPerHour(salary);
  console.log('🚨 - salaryPerHour', salaryPerHour);

  return {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    totalHours: 0,
  };
}
