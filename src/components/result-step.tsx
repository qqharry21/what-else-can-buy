import { QuoteIcon, RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getTimeCostLevel } from '@/lib/calculator';
import { type FormSchema } from '@/lib/schema';
import type { Alternative, ExchangeInfo, TimeCost } from '@/lib/types';
import { sortByUnitPrice } from '@/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';

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

const TimeCostResponse = ({ timeCost }: { timeCost: TimeCost }) => {
  const { t } = useTranslation();
  const level = getTimeCostLevel(timeCost);
  // 取得對應陣列
  const responses = t(`timeCostResponses.${level}`, { returnObjects: true }) as string[];
  // 隨機選一句
  const response = responses[Math.floor(Math.random() * responses.length)];

  return (
    <div className='text-center p-4 bg-neutral-200 rounded-md flex items-start justify-center gap-4'>
      <QuoteIcon className='w-3 h-3 text-neutral-900' />
      <p className='text-sm text-neutral-800'>{response}</p>
      <QuoteIcon className='w-3 h-3 text-neutral-900' />
    </div>
  );
};

type AlternativeTabs = 'food' | 'cool' | 'travel';

const AlternativeTabs = ({ productPrice }: { productPrice: number }) => {
  const { t } = useTranslation();
  const alternatives = t('alternatives', { returnObjects: true }) as Record<
    AlternativeTabs,
    Alternative[]
  >;

  return (
    <Tabs
      defaultValue='food'
      className='w-full flex-1'>
      <TabsList className='grid w-full grid-cols-3 mb-2'>
        <TabsTrigger
          value='food'
          title='Food'>
          🍔
        </TabsTrigger>
        <TabsTrigger
          value='cool'
          title='Cool stuff'>
          😎
        </TabsTrigger>
        <TabsTrigger
          value='travel'
          title='Travel'>
          ✈️
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value='food'
        className='mt-0 grid grid-cols-2 gap-4'>
        {sortByUnitPrice(alternatives.food).map((item) => (
          <AlternativeCard
            key={item.label}
            item={item}
            productPrice={productPrice}
          />
        ))}
      </TabsContent>
      <TabsContent
        value='cool'
        className='mt-0 grid grid-cols-2 gap-4'>
        {sortByUnitPrice(alternatives.cool).map((item) => (
          <AlternativeCard
            key={item.label}
            item={item}
            productPrice={productPrice}
          />
        ))}
      </TabsContent>
      <TabsContent
        value='travel'
        className='mt-0 grid grid-cols-2 gap-4'>
        {sortByUnitPrice(alternatives.travel).map((item) => (
          <AlternativeCard
            key={item.label}
            item={item}
            productPrice={productPrice}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
};

const AlternativeCard = ({ item, productPrice }: { item: Alternative; productPrice: number }) => {
  const quantity = Math.floor(productPrice / item.unitPrice);
  const isZero = quantity === 0;
  if (isZero) return null;

  return (
    <Card className='p-0 overflow-hidden'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <p className='text-2xl text-muted-foreground'>{item.icon}</p>
          <div className='flex-1'>
            <div className='flex justify-between items-start'>
              <h3 className='font-medium text-sm line-clamp-1'>{item.label}</h3>
            </div>
            <p className='text-neutral-900 font-bold text-xl'>
              {quantity}
              {item.unit && (
                <span className='ml-2 text-neutral-600 font-medium text-sm'>{item.unit}</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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
        <TimeCostResponse timeCost={result.timeCost} />
      </div>

      <h3 className='text-lg mb-4 text-center text-pretty font-medium'>
        {t('result.alternatives.title')}
      </h3>
      <AlternativeTabs productPrice={result.productPriceTWD} />

      <div className='flex mt-4 justify-center gap-4'>
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
