import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { StepContextProvider } from '@/contexts/step-context';
import { useStepContext } from '@/hooks/useStepContext';

import { ProductStep } from '@/components/product-step';
import { ResultStep } from '@/components/result-step';
import { SalaryStep } from '@/components/salary-step';
import { Form } from '@/components/ui/form';

import { calculateProductTime } from '@/lib/calculator';
import { formSchema, type FormSchema } from '@/lib/schema';
import type { ExchangeInfo } from '@/lib/types';

const HomePageInner = () => {
  const { step, setStep } = useStepContext();
  const [result, setResult] = useState<ExchangeInfo | null>(null);

  const form = useForm<FormSchema>({
    mode: 'onBlur',
    defaultValues: {
      amount: 30000,
      salaryType: 'monthly',
      currency: 'TWD',
      productPrice: 0,
      productCurrency: 'TWD',
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      const rates = await calculateProductTime({
        salary: {
          amount: data.amount,
          type: data.salaryType,
          currency: data.currency,
        },
        product: {
          price: data.productPrice,
          currency: data.productCurrency,
        },
      });
      setResult(rates);
      setStep(3);
    } catch (error) {
      console.error('🚨 - error', error);
      setResult(null);
    }
  };

  useEffect(() => {
    const fetchSalary = async () => {
      const salary = await chrome.storage.sync.get('salary');
      if (salary) {
        form.setValue('amount', salary.salary.amount);
        form.setValue('salaryType', salary.salary.salaryType);
        form.setValue('currency', salary.salary.currency);
      }
    };
    void fetchSalary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form
        className='flex flex-col h-full'
        onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && <SalaryStep />}
        {step === 2 && <ProductStep />}
        {step === 3 && <ResultStep result={result} />}
      </form>
    </Form>
  );
};

export const HomePage = () => {
  return (
    <StepContextProvider>
      <HomePageInner />
    </StepContextProvider>
  );
};
