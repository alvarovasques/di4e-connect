
import { config } from 'dotenv';
config();

import '@/ai/flows/sentiment-analysis.ts';
import '@/ai/flows/knowledge-base-suggestions.ts';
import '@/ai/flows/oracle-query-flow.ts'; // Adicionado novo fluxo
