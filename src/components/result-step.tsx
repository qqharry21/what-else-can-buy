import { RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { alternatives, exchangeRates } from '@/lib/data';
import { type FormSchema } from '@/lib/schema';
import type { ExchangeInfo, TimeCost } from '@/lib/types';
import { useCallback } from 'react';

const TimeCostGrid = ({ timeCost }: { timeCost: TimeCost }) => {
  return (
    <div className='flex items-center gap-2 justify-center w-full mx-auto max-w-[400px]'>
      <TimeCostCard
        cost={timeCost.years}
        label='Years'
      />
      <TimeCostCard
        cost={timeCost.months}
        label='Months'
      />
      <TimeCostCard
        cost={timeCost.days}
        label='Days'
      />
      <TimeCostCard
        cost={timeCost.hours}
        label='Hours'
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
  return (
    <div className='flex-1 flex-col gap-8 flex items-center justify-center'>
      <p className='text-lg text-gray-500'>Something went wrong, please try again.</p>
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
  return (
    <div className='text-center text-sm text-neutral-500'>
      <p>Exchange rate</p>
      {productCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${productCurrencyToTWD} ${productCurrency}`}</p>}
      {salaryCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${salaryCurrencyToTWD} ${salaryCurrency}`}</p>}
      {productCurrencyToTWD === salaryCurrencyToTWD && <p>Currency is the same</p>}
    </div>
  );
};

export const ResultStep = ({ result }: { result: ExchangeInfo | null }) => {
  console.log('🚨 - result', result);
  const { getValues, watch, reset } = useFormContext<FormSchema>();
  const { setStep } = useStepContext();

  const amount = watch('amount');
  const currency = watch('currency');

  const converted = amount * exchangeRates[currency];

  const handleTryAgain = useCallback(() => {
    reset();
    setStep(1);
  }, [reset, setStep]);

  if (!result) return <ResultEmpty onClick={handleTryAgain} />;

  return (
    <>
      <div className='text-center space-y-4'>
        <h2 className='text-lg text-pretty font-medium'>This product costs you</h2>
        <TimeCostGrid timeCost={result.timeCost} />
        <CurrencyRate
          productCurrencyToTWD={result.productCurrencyToTWD}
          salaryCurrencyToTWD={result.salaryCurrencyToTWD}
          productCurrency={result.productCurrency}
          salaryCurrency={result.salaryCurrency}
        />
        <p className='text-lg text-pretty font-medium'>
          What else you could buy, if you don't buy this product?
        </p>
      </div>
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
            value='fun'
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
          className='mt-0'>
          <ul className='space-y-3'>
            {alternatives.food.map((product) => (
              <li key={product.label}>
                <h3 className='text-lg font-medium'>{product.label}</h3>
                {product.icon} {(converted / product.unitPrice).toFixed(1)} × {product.label}
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent
          value='fun'
          className='mt-0'>
          <div className='space-y-3'>
            <ul className='space-y-3'>
              {alternatives.fun.map((product) => (
                <li key={product.label}>
                  <h3 className='text-lg font-medium'>{product.label}</h3>
                  {product.icon} {(converted / product.unitPrice).toFixed(1)} × {product.label}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        <TabsContent
          value='travel'
          className='mt-0'>
          <div className='space-y-3'>
            <ul className='space-y-3'>
              {alternatives.travel.map((product) => (
                <li key={product.label}>
                  <h3 className='text-lg font-medium'>{product.label}</h3>
                  {product.icon} {(converted / product.unitPrice).toFixed(1)} × {product.label}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      <div className='flex justify-center gap-4'>
        <Button
          type='button'
          onClick={async () => {
            await navigator.share({
              title: 'I could buy this product with my salary.',
              text: `I could buy ${getValues('productPrice')} ${getValues(
                'productCurrency'
              )} with my salary. Want to know what can you buy with your salary? Check out this extension: https://chromewebstore.google.com/detail/what-can-i-buy/`,
            });
          }}>
          Share this result <ShareIcon className='w-4 h-4' />
        </Button>
        <Button
          type='reset'
          variant='outline'
          onClick={handleTryAgain}>
          Try again <RefreshCwIcon className='w-4 h-4' />
        </Button>
      </div>
    </>
  );
};
