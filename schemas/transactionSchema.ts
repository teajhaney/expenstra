import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  account: z.string().min(1, 'Account is required'),
  category: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const expenseTransactionSchema = transactionSchema.refine(
  data => (data.type === 'expense' ? !!data.category : true),
  {
    message: 'Category is required for expenses',
    path: ['category'],
  }
);

export type ExpenseTransactionFormData = z.infer<
  typeof expenseTransactionSchema
>;
