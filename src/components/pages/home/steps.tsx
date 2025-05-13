import { Loader2Icon, RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { NumberInput } from '@/components/ui/number-input';
import { useStepValidation } from '@/hooks/useStepValidation';
import { alternatives, exchangeRates } from '@/lib/data';
import { type FormSchema } from '@/lib/schema';

export const SalaryStep = () => {
  const { setStep } = useStepContext();
  const { control } = useFormContext<FormSchema>();
  const { validateStep } = useStepValidation(['amount', 'salaryType', 'currency']);

  const handleNext = () => {
    if (validateStep()) {
      setStep(2);
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle>Your Salary</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='e.g. 100'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='salaryType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Type</FormLabel>

              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a salary type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='hourly'>Hourly</SelectItem>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='yearly'>Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='currency'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a currency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TWD'>TWD</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='JPY'>JPY</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className='text-xs text-left text-gray-500'>
          * 計算方式是以每天 8 小時工時，每月 20 天工作日為基準。
        </p>
      </CardContent>
      <CardFooter className='justify-end'>
        <Button
          type='button'
          onClick={handleNext}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ProductStep = () => {
  const { setStep } = useStepContext();
  const { formState, control } = useFormContext<FormSchema>();

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle>Product Price</CardTitle>
        <CardDescription>Fill in the price of the product you want to buy.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='productPrice'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='e.g. 100'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='productCurrency'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a currency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TWD'>TWD</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='JPY'>JPY</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className='text-xs text-gray-500'>
          * 計算結果僅供參考，實際金額可能會因為匯率波動而有所不同。
        </p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          type='button'
          variant='outline'
          disabled={formState.isSubmitting}
          onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          type='submit'
          disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2Icon className='h-4 w-4 animate-spin text-neutral-950' />
              <span>Calculating</span>
            </>
          ) : (
            'Calculate'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ResultStep = () => {
  const { getValues, watch, reset } = useFormContext<FormSchema>();
  const { setStep } = useStepContext();

  const amount = watch('amount');
  const currency = watch('currency');

  const converted = amount * exchangeRates[currency];

  return (
    <>
      <h2 className='text-lg mb-4 text-pretty font-medium'>Here is the results</h2>

      <>
        <p className='text-sm mb-4 text-gray-500'>
          This product costs you{' '}
          <span className='font-medium'>
            {getValues('productPrice')} {getValues('productCurrency')}
          </span>
        </p>
        <p className='text-sm mb-4 text-gray-500'>
          What else you could buy, if you don't buy this product?
        </p>
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
            onClick={() => {
              reset();
              setStep(1);
            }}>
            Try again <RefreshCwIcon className='w-4 h-4' />
          </Button>
        </div>
      </>
    </>
  );
};
