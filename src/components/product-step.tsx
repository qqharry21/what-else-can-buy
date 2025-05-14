import { Loader2Icon } from 'lucide-react';
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

import { NumberInput } from '@/components/ui/number-input';
import { type FormSchema } from '@/lib/schema';

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
