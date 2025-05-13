import type { Category, Currency } from '@/contexts/global-context';

export const alternatives: Record<Category, { label: string; unitPrice: number; icon: string }[]> =
  {
    food: [
      { label: 'Bubble tea', unitPrice: 50, icon: '🧋' },
      { label: 'Fast food meal', unitPrice: 120, icon: '🍔' },
      { label: 'Ramen bowl', unitPrice: 250, icon: '🍜' },
      { label: 'Braised pork rice', unitPrice: 100, icon: '🍚' },
    ],
    fun: [
      { label: 'Movie ticket', unitPrice: 280, icon: '🎬' },
      { label: 'KTV hour', unitPrice: 400, icon: '🎤' },
      { label: 'Escape room', unitPrice: 800, icon: '🕵️' },
    ],
    travel: [
      {
        label: 'Japan flight',
        unitPrice: 15000,
        icon: '🇯🇵',
      },
      {
        label: 'Korea flight',
        unitPrice: 10000,
        icon: '🇰🇷',
      },
    ],
  };

export const exchangeRates: Record<Currency, number> = {
  TWD: 1,
  USD: 30,
  JPY: 0.22,
};
