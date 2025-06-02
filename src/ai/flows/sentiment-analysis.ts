// src/ai/flows/sentiment-analysis.ts
'use server';
/**
 * @fileOverview A sentiment analysis AI agent.
 *
 * - analyzeSentiment - A function that handles the sentiment analysis process.
 * - SentimentAnalysisInput - The input type for the analyzeSentiment function.
 * - SentimentAnalysisOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentAnalysisInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});
export type SentimentAnalysisInput = z.infer<typeof SentimentAnalysisInputSchema>;

const SentimentAnalysisOutputSchema = z.object({
  sentimentScore: z
    .number()
    .describe(
      'A number between -1 and 1 indicating the sentiment of the text. -1 is very negative, 0 is neutral, and 1 is very positive.'
    ),
  confidenceIndex: z
    .number()
    .describe('A number between 0 and 1 indicating the confidence in the sentiment analysis.'),
});
export type SentimentAnalysisOutput = z.infer<typeof SentimentAnalysisOutputSchema>;

export async function analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: SentimentAnalysisInputSchema},
  output: {schema: SentimentAnalysisOutputSchema},
  prompt: `Analyze the sentiment of the following text. Return a sentiment score between -1 and 1, and a confidence index between 0 and 1.\n\nText: {{{text}}}`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: SentimentAnalysisInputSchema,
    outputSchema: SentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
