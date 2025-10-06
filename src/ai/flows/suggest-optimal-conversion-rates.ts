'use server';

/**
 * @fileOverview Suggests optimal coin conversion rates using generative AI based on current market trends and historical data.
 *
 * - suggestOptimalConversionRates - A function that suggests optimal conversion rates.
 * - SuggestOptimalConversionRatesInput - The input type for the suggestOptimalConversionRates function.
 * - SuggestOptimalConversionRatesOutput - The return type for the suggestOptimalConversionRates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalConversionRatesInputSchema = z.object({
  coinType: z.string().describe('The type of coin to convert.'),
  targetCurrency: z.string().describe('The target currency for conversion (e.g., USD, EUR, INR).'),
  historicalData: z.string().describe('Historical conversion data for the coin.'),
  marketTrends: z.string().describe('Current market trends affecting the coin and target currency.'),
});
export type SuggestOptimalConversionRatesInput = z.infer<typeof SuggestOptimalConversionRatesInputSchema>;

const SuggestOptimalConversionRatesOutputSchema = z.object({
  suggestedRate: z.number().describe('The suggested optimal conversion rate.'),
  reasoning: z.string().describe('The reasoning behind the suggested rate, based on market trends and historical data.'),
  disclaimer: z.string().optional().describe('Any disclaimer or caveat associated with the suggested rate.'),
});
export type SuggestOptimalConversionRatesOutput = z.infer<typeof SuggestOptimalConversionRatesOutputSchema>;

export async function suggestOptimalConversionRates(input: SuggestOptimalConversionRatesInput): Promise<SuggestOptimalConversionRatesOutput> {
  return suggestOptimalConversionRatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalConversionRatesPrompt',
  input: {schema: SuggestOptimalConversionRatesInputSchema},
  output: {schema: SuggestOptimalConversionRatesOutputSchema},
  prompt: `You are an expert in cryptocurrency and digital currency conversion rates.

  Based on the provided historical data and current market trends, suggest an optimal conversion rate for the given coin type to the target currency.
  Explain your reasoning, and include any relevant disclaimers.

  Coin Type: {{{coinType}}}
  Target Currency: {{{targetCurrency}}}
  Historical Data: {{{historicalData}}}
  Market Trends: {{{marketTrends}}}

  Here's how the output should be formatted. Adhere to the schema descriptions, and ensure the suggestedRate is a number.
  {
    "suggestedRate": <number>,
    "reasoning": <string>,
    "disclaimer": <string, optional>
  }`,
});

const suggestOptimalConversionRatesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalConversionRatesFlow',
    inputSchema: SuggestOptimalConversionRatesInputSchema,
    outputSchema: SuggestOptimalConversionRatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
