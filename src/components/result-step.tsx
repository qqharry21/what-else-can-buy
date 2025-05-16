import { QuoteIcon, RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '@/components/ui/button';

import { getTimeCostLevel } from '@/lib/calculator';
import { type FormSchema } from '@/lib/schema';
import type { ExchangeInfo, TimeCost } from '@/lib/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlternativeTabs } from './alternative-tabs';

const TimeCostGrid = ({ timeCost }: { timeCost: TimeCost }) => {
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

const ResultEmpty = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className='flex-1 flex-col gap-8 flex items-center justify-center'>
      <p className='text-lg text-gray-500'>{t('result.empty.title')}</p>
      <Button
        type='button'
        variant='outline'
        onClick={onClick}>
        Try again <RefreshCwIcon className='w-4 h-4' />
      </Button>
    </div>
  );
};

type CurrencyWithRate = Pick<
  ExchangeInfo,
  'productCurrencyToTWD' | 'salaryCurrencyToTWD' | 'productCurrency' | 'salaryCurrency'
>;

const CurrencyRate = ({
  productCurrencyToTWD,
  salaryCurrencyToTWD,
  productCurrency,
  salaryCurrency,
}: CurrencyWithRate) => {
  const { t } = useTranslation();
  return (
    <div className='text-center text-sm text-neutral-500'>
      {productCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${productCurrencyToTWD} ${productCurrency}`}</p>}
      {salaryCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${salaryCurrencyToTWD} ${salaryCurrency}`}</p>}
      {productCurrencyToTWD === salaryCurrencyToTWD && <p>{t('result.same_currency')}</p>}
    </div>
  );
};

const TimeCostResponse = ({ totalHours }: { totalHours: number }) => {
  const { t } = useTranslation();
  const level = getTimeCostLevel(totalHours);
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

export const ResultStep = ({ result }: { result: ExchangeInfo | null }) => {
  const { t } = useTranslation();
  const { reset } = useFormContext<FormSchema>();
  const { setStep } = useStepContext();

  const handleTryAgain = useCallback(() => {
    reset();
    setStep(1);
  }, [reset, setStep]);

  if (!result) return <ResultEmpty onClick={handleTryAgain} />;

  return (
    <>
      <div className='text-center space-y-4 mb-4'>
        <h2 className='text-lg text-pretty font-medium'>{t('result.timeCost.title')}</h2>
        <TimeCostGrid timeCost={result.timeCost} />
        <CurrencyRate
          productCurrencyToTWD={result.productCurrencyToTWD}
          salaryCurrencyToTWD={result.salaryCurrencyToTWD}
          productCurrency={result.productCurrency}
          salaryCurrency={result.salaryCurrency}
        />
        <TimeCostResponse totalHours={result.timeCost.totalHours} />
      </div>

      <AlternativeTabs productPrice={result.productPriceTWD} />

      <div className='flex mt-8 justify-center gap-4'>
        <Button
          type='button'
          onClick={async () => {
            await navigator.share({
              title: t('share.title', {
                timeCost: result.timeCost.totalHours,
              }),
              text: t('share.text'),
            });
          }}>
          {t('share.button')} <ShareIcon className='w-4 h-4' />
        </Button>
        <Button
          type='reset'
          variant='outline'
          onClick={handleTryAgain}>
          {t('tryAgain')} <RefreshCwIcon className='w-4 h-4' />
        </Button>
      </div>
    </>
  );
};
