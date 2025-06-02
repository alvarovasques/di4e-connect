
'use server';

/**
 * @fileOverview Provides relevant knowledge base article suggestions to agents based on the current chat content.
 *
 * - suggestKnowledgeBaseArticles - A function that suggests relevant knowledge base articles.
 * - SuggestKnowledgeBaseArticlesInput - The input type for the suggestKnowledgeBaseArticles function.
 * - SuggestKnowledgeBaseArticlesOutput - The return type for the suggestKnowledgeBaseArticles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKnowledgeBaseArticlesInputSchema = z.object({
  chatContent: z
    .string()
    .describe('The content of the current chat, including customer messages.'),
  knowledgeBaseArticles: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
    })
  ).describe('A list of knowledge base articles to compare against the chat content.'),
});
export type SuggestKnowledgeBaseArticlesInput = z.infer<
  typeof SuggestKnowledgeBaseArticlesInputSchema
>;

const SuggestKnowledgeBaseArticlesOutputSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    relevanceScore: z.number().describe('A score indicating the relevance of the article to the chat content.'),
  })
).describe('A list of knowledge base articles, sorted by relevance to the chat content.');
export type SuggestKnowledgeBaseArticlesOutput = z.infer<
  typeof SuggestKnowledgeBaseArticlesOutputSchema
>;

export async function suggestKnowledgeBaseArticles(
  input: SuggestKnowledgeBaseArticlesInput
): Promise<SuggestKnowledgeBaseArticlesOutput> {
  return suggestKnowledgeBaseArticlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKnowledgeBaseArticlesPrompt',
  input: {schema: SuggestKnowledgeBaseArticlesInputSchema},
  output: {schema: SuggestKnowledgeBaseArticlesOutputSchema},
  prompt: `You are an AI assistant helping agents find relevant knowledge base articles to assist customers.

  Given the current chat content and a list of knowledge base articles, determine the relevance of each article to the chat content.
  Return a list of articles sorted by relevance score in descending order.

  Chat Content:
  {{chatContent}}

  Knowledge Base Articles:
  {{#each knowledgeBaseArticles}}
  ---
  ID: {{this.id}}
  Title: {{this.title}}
  Content: {{this.content}}
  {{/each}}
  ---
  Output the articles and their relevance score.  The relevance score must be between 0 and 1.
  `,
});

const suggestKnowledgeBaseArticlesFlow = ai.defineFlow(
  {
    name: 'suggestKnowledgeBaseArticlesFlow',
    inputSchema: SuggestKnowledgeBaseArticlesInputSchema,
    outputSchema: SuggestKnowledgeBaseArticlesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output || []; // Retorna lista vazia se output for null/undefined
    } catch (error) {
      console.error('Error in suggestKnowledgeBaseArticlesFlow:', error);
      // Em caso de erro (ex: 503 da API), retorna uma lista vazia para não quebrar a UI.
      return []; 
    }
  }
);

