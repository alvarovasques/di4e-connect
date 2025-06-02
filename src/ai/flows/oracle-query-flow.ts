
'use server';
/**
 * @fileOverview Um fluxo Genkit para o Oráculo IA, que responde a perguntas com base na Base de Conhecimento.
 *
 * - queryOracle - Função que interage com o Oráculo.
 * - OracleQueryInput - Tipo de entrada para queryOracle.
 * - OracleQueryOutput - Tipo de saída para queryOracle.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MOCK_KB_ITEMS } from '@/lib/mock-data'; // Acessa a base de conhecimento mockada
import type { KBItem } from '@/types';

const OracleQueryInputSchema = z.object({
  userInput: z.string().describe('A pergunta ou comando do usuário para o Oráculo.'),
  // Futuramente: selectedKbIds: z.array(z.string()).optional().describe('IDs de itens da KB selecionados pelo usuário para focar a resposta.'),
});
export type OracleQueryInput = z.infer<typeof OracleQueryInputSchema>;

const OracleQueryOutputSchema = z.object({
  oracleResponse: z.string().describe('A resposta do Oráculo baseada na Base de Conhecimento.'),
  // Futuramente: suggestedPrompts: z.array(z.string()).optional().describe('Sugestões de prompts geradas pelo Oráculo.'),
});
export type OracleQueryOutput = z.infer<typeof OracleQueryOutputSchema>;

export async function queryOracle(input: OracleQueryInput): Promise<OracleQueryOutput> {
  return oracleQueryFlow(input);
}

// Função auxiliar para preparar o contexto da Base de Conhecimento
const getKnowledgeBaseContext = (): string => {
  const textBasedItems = MOCK_KB_ITEMS.filter(
    (item: KBItem) =>
      item.type === 'file' &&
      (item.mimeType === 'text/markdown' || item.mimeType === 'text/plain' || (item.content && item.content.trim() !== ''))
  );

  if (textBasedItems.length === 0) {
    return 'A Base de Conhecimento está vazia ou não contém documentos textuais relevantes.';
  }

  return textBasedItems
    .map((item: KBItem) => `Título do Documento: ${item.name}\nConteúdo:\n${item.content || item.summary}\n---\n`)
    .join('\n\n');
};

const prompt = ai.definePrompt({
  name: 'oracleQueryPrompt',
  input: {schema: OracleQueryInputSchema},
  output: {schema: OracleQueryOutputSchema},
  prompt: `Você é o Oráculo IA, um assistente especializado em fornecer informações precisas e úteis baseadas na Base de Conhecimento da empresa.
Seu objetivo é ajudar os usuários a entenderem melhor os processos, políticas e informações contidas nos documentos.

Base de Conhecimento Disponível:
{{{knowledgeBaseContext}}}

Pergunta do Usuário:
"{{{userInput}}}"

Responda à pergunta do usuário utilizando exclusivamente as informações da Base de Conhecimento fornecida acima.
Se a resposta não estiver na Base de Conhecimento, informe que a informação não foi encontrada nos documentos disponíveis.
Seja claro, conciso e direto ao ponto.
Se a pergunta for vaga, tente interpretá-la no contexto da Base de Conhecimento.
Você também pode sugerir como o usuário pode formular melhor suas perguntas ou quais tópicos da base de conhecimento podem ser relevantes.
`,
});

const oracleQueryFlow = ai.defineFlow(
  {
    name: 'oracleQueryFlow',
    inputSchema: OracleQueryInputSchema,
    outputSchema: OracleQueryOutputSchema,
  },
  async (input: OracleQueryInput) => {
    const knowledgeBaseContext = getKnowledgeBaseContext();
    
    // Adicionando o contexto da KB ao input do prompt dinamicamente
    const {output} = await prompt({
      userInput: input.userInput,
      knowledgeBaseContext, // Passando o contexto para o template do prompt
    });

    if (!output) {
        return { oracleResponse: "Desculpe, não consegui processar sua solicitação no momento." };
    }
    return output;
  }
);
