
'use server';
/**
 * @fileOverview Um fluxo Genkit para o Oráculo IA, que responde a perguntas com base na Base de Conhecimento e sugere prompts.
 *
 * - queryOracle - Função que interage com o Oráculo.
 * - OracleQueryInput - Tipo de entrada para queryOracle.
 * - OracleQueryOutput - Tipo de saída para queryOracle.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MOCK_KB_ITEMS, MOCK_CURRENT_USER, MOCK_ROLES } from '@/lib/mock-data'; // Acessa a base de conhecimento mockada
import type { KBItem, PermissionId } from '@/types';

const OracleQueryInputSchema = z.object({
  userInput: z.string().describe('A pergunta ou comando do usuário para o Oráculo.'),
  selectedKbIds: z.array(z.string()).optional().describe('IDs de itens da KB selecionados pelo usuário para focar a resposta.'),
});
export type OracleQueryInput = z.infer<typeof OracleQueryInputSchema>;

const OracleQueryOutputSchema = z.object({
  oracleResponse: z.string().describe('A resposta do Oráculo baseada na Base de Conhecimento.'),
  suggestedPrompts: z.array(z.string()).optional().describe('Sugestões de prompts de acompanhamento geradas pelo Oráculo.'),
});
export type OracleQueryOutput = z.infer<typeof OracleQueryOutputSchema>;

export async function queryOracle(input: OracleQueryInput): Promise<OracleQueryOutput> {
  return oracleQueryFlow(input);
}

// Função auxiliar para preparar o contexto da Base de Conhecimento
const getKnowledgeBaseContext = (selectedKbIds?: string[]): string => {
  let itemsToProcess = MOCK_KB_ITEMS;

  if (selectedKbIds && selectedKbIds.length > 0) {
    itemsToProcess = MOCK_KB_ITEMS.filter(item => selectedKbIds.includes(item.id));
  }

  const textBasedItems = itemsToProcess.filter(
    (item: KBItem) =>
      item.type === 'file' &&
      (item.mimeType === 'text/markdown' || item.mimeType === 'text/plain' || (item.content && item.content.trim() !== ''))
  );

  if (textBasedItems.length === 0) {
    if (selectedKbIds && selectedKbIds.length > 0) {
      return 'Nenhum dos itens da Base de Conhecimento selecionados contém conteúdo textual pesquisável.';
    }
    return 'A Base de Conhecimento está vazia ou não contém documentos textuais relevantes.';
  }

  return textBasedItems
    .map((item: KBItem) => `Título do Documento: ${item.name}\nConteúdo:\n${item.content || item.summary}\n---\n`)
    .join('\n\n');
};

const prompt = ai.definePrompt({
  name: 'oracleQueryPrompt',
  input: { schema: z.object({userInput: z.string(), knowledgeBaseContext: z.string()}) }, // Ajustado para receber o contexto
  output: {schema: OracleQueryOutputSchema},
  prompt: `Você é o Oráculo IA, um assistente especializado em fornecer informações precisas e úteis baseadas na Base de Conhecimento da empresa.
Seu objetivo é ajudar os usuários a entenderem melhor os processos, políticas e informações contidas nos documentos.

Base de Conhecimento Disponível (use APENAS esta informação para responder):
{{{knowledgeBaseContext}}}

Pergunta do Usuário:
"{{{userInput}}}"

1. Responda à pergunta do usuário utilizando exclusivamente as informações da Base de Conhecimento fornecida acima.
   Se a resposta não estiver na Base de Conhecimento, informe que a informação não foi encontrada nos documentos disponíveis ou nos documentos selecionados.
   Seja claro, conciso e direto ao ponto. Se a pergunta for vaga, tente interpretá-la no contexto da Base de Conhecimento.

2. Após responder, gere de 2 a 3 sugestões de prompts de acompanhamento que o usuário poderia fazer, relacionados à pergunta original ou a tópicos adjacentes na Base de Conhecimento.
   Formate essas sugestões como uma lista no campo 'suggestedPrompts'. Se não conseguir pensar em boas sugestões, deixe o campo 'suggestedPrompts' vazio.
`,
});

const oracleQueryFlow = ai.defineFlow(
  {
    name: 'oracleQueryFlow',
    inputSchema: OracleQueryInputSchema,
    outputSchema: OracleQueryOutputSchema,
  },
  async (input: OracleQueryInput) => {
    const knowledgeBaseContext = getKnowledgeBaseContext(input.selectedKbIds);
    
    const {output} = await prompt({
      userInput: input.userInput,
      knowledgeBaseContext, 
    });

    if (!output) {
        return { oracleResponse: "Desculpe, não consegui processar sua solicitação no momento.", suggestedPrompts: [] };
    }
    return output;
  }
);
