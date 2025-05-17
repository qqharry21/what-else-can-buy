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
import { useTranslation } from 'react-i18next';

export const SalaryStep = () => {
  const { t } = useTranslation();
  const { setStep } = useStepContext();
  const { control, getValues } = useFormContext<FormSchema>();
  const { validateStep } = useStepValidation(['amount', 'salaryType', 'currency']);

  const handleNext = async () => {
    if (validateStep()) {
      const [amount, salaryType, currency] = getValues(['amount', 'salaryType', 'currency']);
      await chrome.storage.sync.set({
        salary: {
          amount,
          salaryType,
          currency,
        },
      });
      setStep(2);
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle className='text-lg'>{t('salaryStep.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('salaryStep.amount.label')}</FormLabel>
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
              <FormLabel>{t('salaryStep.salaryType.label')}</FormLabel>

              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    avoidCollisions={false}
                    position='popper'>
                    <SelectItem value='hourly'>{t('salaryType.hourly')}</SelectItem>
                    <SelectItem value='monthly'>{t('salaryType.monthly')}</SelectItem>
                    <SelectItem value='yearly'>{t('salaryType.yearly')}</SelectItem>
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
              <FormLabel>{t('salaryStep.currency.label')}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    avoidCollisions={false}
                    position='popper'>
                    <SelectItem value='TWD'>🇹🇼 {t('currency.TWD')}</SelectItem>
                    <SelectItem value='USD'>🇺🇸 {t('currency.USD')}</SelectItem>
                    <SelectItem value='JPY'>🇯🇵 {t('currency.JPY')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className='text-xs text-left text-gray-500'>* {t('salaryStep.note')}</p>
      </CardContent>
      <CardFooter className='justify-end'>
        <Button
          type='button'
          onClick={handleNext}>
          {t('next')}
        </Button>
      </CardFooter>
    </Card>
  );
};
