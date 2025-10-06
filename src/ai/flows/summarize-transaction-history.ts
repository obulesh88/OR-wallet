'use server';

/**
 * @fileOverview Summarizes a user's transaction history to provide insights into spending and earning patterns.
 *
 * - summarizeTransactionHistory - A function that takes a user's transaction history and returns a summarized overview.
 * - SummarizeTransactionHistoryInput - The input type for the summarizeTransactionHistory function.
 * - SummarizeTransactionHistoryOutput - The return type for the summarizeTransactionHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTransactionHistoryInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe("A detailed record of the user's transaction history, including earnings, withdrawals, and conversions."),
});
export type SummarizeTransactionHistoryInput = z.infer<typeof SummarizeTransactionHistoryInputSchema>;

const SummarizeTransactionHistoryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summarized overview of the transaction history, highlighting key spending and earning patterns.'),
});
export type SummarizeTransactionHistoryOutput = z.infer<typeof SummarizeTransactionHistoryOutputSchema>;

export async function summarizeTransactionHistory(
  input: SummarizeTransactionHistoryInput
): Promise<SummarizeTransactionHistoryOutput> {
  return summarizeTransactionHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTransactionHistoryPrompt',
  input: {schema: SummarizeTransactionHistoryInputSchema},
  output: {schema: SummarizeTransactionHistoryOutputSchema},
  prompt: `You are an expert financial advisor. Please summarize the following transaction history, highlighting key spending and earning patterns, so the user can quickly understand their coin usage and make better financial decisions within the app.\n\nTransaction History: {{{transactionHistory}}}`,
});

const summarizeTransactionHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeTransactionHistoryFlow',
    inputSchema: SummarizeTransactionHistoryInputSchema,
    outputSchema: SummarizeTransactionHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
