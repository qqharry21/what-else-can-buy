export type Currency = 'USD' | 'TWD' | 'JPY';
export type Category = 'food' | 'fun' | 'travel';

export type SalaryType = 'hourly' | 'monthly' | 'yearly';
export type Salary = {
  amount: number;
  type: SalaryType;
  currency: Currency;
};

export type Product = {
  price: number;
  currency: Currency;
};

export interface TimeCost {
  years: number;
  months: number;
  days: number;
  hours: number;
  totalHours: number;
}

export type ExchangeInfo = {
  timeCost: TimeCost;
  salaryCurrency: Currency;
  productPriceTWD: number;
  productCurrency: Currency;
  salaryCurrencyToTWD: number;
  productCurrencyToTWD: number;
  salaryPerHourTWD: number;
};

export type Alternative = {
  label: string;
  unitPrice: number;
  icon: string;
  unit?: string;
};

export type TimeCostLevel =
  | 'instant'
  | 'quick'
  | 'a-fewHours'
  | 'halfDay'
  | 'oneDay'
  | 'severalDays'
  | 'oneWeek'
  | 'coupleOfWeeks'
  | 'severalWeeks'
  | 'oneMonth'
  | 'coupleOfMonths'
  | 'severalMonths'
  | 'manyMonths'
  | 'a-yearPlus';
