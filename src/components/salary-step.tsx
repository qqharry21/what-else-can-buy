import { useFormContext } from 'react-hook-form';

import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { NumberInput } from '@/components/ui/number-input';
import { useStepValidation } from '@/hooks/useStepValidation';
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
