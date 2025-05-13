import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, RefreshCwIcon, ShareIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StepContextProvider } from '@/contexts/step-context';
import { useStepContext } from '@/hooks/useStepContext';

import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const HomePage = () => {
  return (
    <StepContextProvider>
      <HomePageInner />
    </StepContextProvider>
  );
};

const formSchema = z.object({
  amount: z.number().min(0, { message: 'Amount must be greater than 0' }),
  salaryType: z.enum(['hourly', 'monthly', 'yearly']),
  currency: z.enum(['TWD', 'USD', 'JPY']),
  productPrice: z.number().min(0, { message: 'Product price must be greater than 0' }),
  productCurrency: z.enum(['TWD', 'USD', 'JPY']),
});

const HomePageInner = () => {
  const { step, setStep } = useStepContext();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onBlur',
    defaultValues: {
      amount: 0,
      salaryType: 'monthly',
      currency: 'TWD',
      productPrice: 0,
      productCurrency: 'TWD',
    },
    resolver: zodResolver(formSchema),
  });
  console.log('loading', form.formState.isSubmitting);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setStep(3);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card className='mb-4'>
              <CardHeader>
                <CardTitle>Your Salary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='e.g. 100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  onClick={() => setStep(2)}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          )}
          {step === 2 && (
            <Card className='mb-4'>
              <CardHeader>
                <CardTitle>Product Price</CardTitle>
                <CardDescription>Fill in the price of the product you want to buy.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='productPrice'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='e.g. 100'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type='submit'>Calculate</Button>
              </CardFooter>
            </Card>
          )}
          {step === 3 && (
            <div>
              <h2 className='text-lg mb-4 text-pretty font-medium'>
                What else you could buy, if you don't buy this product?
              </h2>

              {form.formState.isSubmitting ? (
                <div className='flex items-center justify-center'>
                  <Loader2Icon className='h-4 w-4 animate-spin text-neutral-950' />
                </div>
              ) : (
                <div className='space-y-4'>
                  <Tabs
                    defaultValue='all'
                    className='w-full'>
                    <TabsList className='grid w-full grid-cols-4 mb-2'>
                      <TabsTrigger value='all'>All</TabsTrigger>
                      <TabsTrigger value='food'>🍔 Food</TabsTrigger>
                      <TabsTrigger value='fun'>😎 Cool stuff</TabsTrigger>
                      <TabsTrigger value='travel'>✈️ Travel</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value='all'
                      className='mt-0'>
                      <div className='space-y-3'>
                        {/* {alternativeProducts.map((product, index) => (
                  <AlternativeProductCard
                    key={index}
                    product={product}
                  />
                ))} */}
                      </div>
                    </TabsContent>
                    <TabsContent
                      value='tech'
                      className='mt-0'>
                      <div className='space-y-3'>
                        {/* {alternativeProducts
                  .filter((p) => p.category === 'tech')
                  .map((product, index) => (
                    <AlternativeProductCard
                      key={index}
                      product={product}
                    />
                  ))} */}
                      </div>
                    </TabsContent>
                    <TabsContent
                      value='home'
                      className='mt-0'>
                      <div className='space-y-3'>
                        {/* {alternativeProducts
                  .filter((p) => p.category === 'home')
                  .map((product, index) => (
                    <AlternativeProductCard
                      key={index}
                      product={product}
                    />
                  ))} */}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className='flex justify-center gap-4'>
                    <Button
                      type='button'
                      onClick={async () => {
                        await navigator.share({
                          title: 'I could buy this product with my salary.',
                          text: `I could buy ${form.getValues('productPrice')} ${form.getValues(
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
                        form.reset();
                        setStep(1);
                      }}>
                      Try again <RefreshCwIcon className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
