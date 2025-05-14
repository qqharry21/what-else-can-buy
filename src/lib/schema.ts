import { z } from '@/lib/zod';

export const formSchema = z.object({
  amount: z.number().min(1),
  salaryType: z.enum(['hourly', 'monthly', 'yearly']),
  currency: z.enum(['TWD', 'USD', 'JPY']),
  productPrice: z.number().min(1),
  productCurrency: z.enum(['TWD', 'USD', 'JPY']),
});

export type FormSchema = z.infer<typeof formSchema>;
