import { z } from 'zod';

export const formSchema = z.object({
  amount: z.number().min(1, { message: 'Amount must be greater than 0' }),
  salaryType: z.enum(['hourly', 'monthly', 'yearly']),
  currency: z.enum(['TWD', 'USD', 'JPY']),
  productPrice: z.number().min(1, { message: 'Product price must be greater than 0' }),
  productCurrency: z.enum(['TWD', 'USD', 'JPY']),
});

export type FormSchema = z.infer<typeof formSchema>;
