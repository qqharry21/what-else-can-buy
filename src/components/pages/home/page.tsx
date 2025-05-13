import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { StepContextProvider } from '@/contexts/step-context';
import { useStepContext } from '@/hooks/useStepContext';

import { calculateProductTime } from '@/lib/calculator';
import { formSchema, type FormSchema } from '@/lib/schema';
import { Form } from '../../ui/form';
import { ProductStep, ResultStep, SalaryStep } from './steps';

const HomePageInner = () => {
  const { step, setStep } = useStepContext();

  const form = useForm<FormSchema>({
    mode: 'onBlur',
    defaultValues: {
      amount: 60000,
      salaryType: 'monthly',
      currency: 'TWD',
      productPrice: 10000,
      productCurrency: 'TWD',
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormSchema) => {
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
    console.log('🚨 - rates', rates);
    console.log(data);
    setStep(3);
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col h-full'
        onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && <SalaryStep />}
        {step === 2 && <ProductStep />}
        {step === 3 && <ResultStep />}
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
