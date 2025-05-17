import type { ExchangeInfo } from '@/lib/types';
import { RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useStepContext } from '@/hooks/useStepContext';

import { AlternativeTabs } from '@/components/alternative-tabs';
import { CurrencyRate } from '@/components/currency-rate';
import { TimeCostGrid } from '@/components/time-cost-grid';
import { TimeCostResponse } from '@/components/time-cost-response';
import { Button } from '@/components/ui/button';

import { type FormSchema } from '@/lib/schema';

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

export const ResultStep = ({ result }: { result: ExchangeInfo | null }) => {
  const { t } = useTranslation();
  const { reset } = useFormContext<FormSchema>();
  const { setStep } = useStepContext();

  const handleTryAgain = useCallback(async () => {
    const { salary } = await chrome.storage.sync.get('salary');
    console.log('🚨 - salary', salary);
    reset({
      amount: salary.amount,
      salaryType: salary.salaryType,
      currency: salary.currency,
    });
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
