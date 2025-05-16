import type { TimeCost } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export const TimeCostGrid = ({ timeCost }: { timeCost: TimeCost }) => {
  const { t } = useTranslation();
  return (
    <div className='flex items-center gap-2 justify-center w-full mx-auto max-w-[400px]'>
      <TimeCostCard
        cost={timeCost.years}
        label={t('years')}
      />
      <TimeCostCard
        cost={timeCost.months}
        label={t('months')}
      />
      <TimeCostCard
        cost={timeCost.days}
        label={t('days')}
      />
      <TimeCostCard
        cost={timeCost.hours}
        label={t('hours')}
      />
    </div>
  );
};

const TimeCostCard = ({ cost, label }: { cost: number; label: string }) => {
  const isZero = cost === 0;
  if (isZero) return null;

  return (
    <div className='flex items-center self-stretch gap-2 justify-center flex-col p-4 bg-neutral-200 rounded-md aspect-square w-1/4 '>
      <div className='text-center font-bold text-xl text-neutral-950'>{cost}</div>
      <div className='text-center text-sm text-neutral-700'>{label}</div>
    </div>
  );
};
