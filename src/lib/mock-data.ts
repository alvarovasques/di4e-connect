
// src/lib/mock-data.ts
// Este arquivo agora re-exporta do server-memory-store para o lado do cliente
// e as definições de mock para inicialização do store.

// Exportar MOCK_CURRENT_USER e setSimulatedUserType da lógica de simulação de usuário
export { MOCK_CURRENT_USER, setSimulatedUserType } from '@/lib/mock-data-definitions';

// Exportar as definições originais dos mocks para que o server-memory-store possa usá-las para inicialização.
// Estes não devem ser importados diretamente por componentes de frontend para dados dinâmicos.
export { 
  MOCK_USERS,
  MOCK_CHATS,
  MOCK_QUEUES,
  MOCK_KB_ITEMS,
  MOCK_ROLES,
  MOCK_AI_MODELS,
  MOCK_WHISPER_NOTES,
  MOCK_METRICS,
  MOCK_PERFORMANCE_DATA,
  MOCK_AI_INSIGHTS
} from '@/lib/mock-data-definitions';

// NOTA: Componentes do frontend não devem mais importar MOCK_CHATS, MOCK_USERS etc. diretamente deste arquivo
// para operações de leitura/escrita de dados dinâmicos. Eles devem usar Server Actions
// que, por sua vez, interagem com o server-memory-store.ts.
// Este arquivo (mock-data.ts) pode ainda ser usado por componentes que precisam de uma lista estática
// (ex: para popular um seletor com todos os MOCK_USERS disponíveis, embora isso também possa vir de uma Server Action).
