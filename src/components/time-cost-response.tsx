import { getTimeCostLevel } from '@/lib/calculator';
import { QuoteIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const TimeCostResponse = ({ totalHours }: { totalHours: number }) => {
  const { t } = useTranslation();
  const level = useMemo(() => getTimeCostLevel(totalHours), [totalHours]);
  const responses = t(`timeCostResponses.${level}`, { returnObjects: true }) as string[];
  const response = responses[Math.floor(Math.random() * responses.length)];

  return (
    <div className='text-center p-4 bg-neutral-200 rounded-md flex items-start justify-center gap-4'>
      <QuoteIcon className='w-3 h-3 text-neutral-900 scale-[-1_1]' />
      <p className='text-sm font-medium text-neutral-800'>{response}</p>
      <QuoteIcon className='w-3 h-3 text-neutral-900' />
    </div>
  );
};
