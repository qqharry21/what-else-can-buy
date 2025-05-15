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
import { useTranslation } from 'react-i18next';

export const ProductStep = () => {
  const { t } = useTranslation();
  const { setStep } = useStepContext();
  const { formState, control } = useFormContext<FormSchema>();

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle className='text-lg'>{t('productStep.title')}</CardTitle>
        <CardDescription>{t('productStep.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='productPrice'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('productStep.price.label')}</FormLabel>
              <FormControl>
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('productStep.price.placeholder')}
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
              <FormLabel>{t('productStep.currency.label')}</FormLabel>
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
        <p className='text-xs text-gray-500'>* {t('productStep.note')}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          type='button'
          variant='outline'
          disabled={formState.isSubmitting}
          onClick={() => setStep(1)}>
          {t('back')}
        </Button>
        <Button
          type='submit'
          disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2Icon className='h-4 w-4 animate-spin text-neutral-950' />
              <span>{t('calculating')}</span>
            </>
          ) : (
            t('calculate')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
