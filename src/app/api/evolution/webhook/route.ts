
// src/app/api/evolution/webhook/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const EVOLUTION_API_WEBHOOK_SECRET = process.env.EVOLUTION_API_WEBHOOK_SECRET;

/**
 * Endpoint de Webhook para a Evolution API.
 * A Evolution API enviará eventos (como novas mensagens) para este endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar a requisição
    if (EVOLUTION_API_WEBHOOK_SECRET) {
      const requestSecret = request.headers.get('X-Evolution-Api-Secret'); // Ou qualquer header que a Evolution API use
      if (requestSecret !== EVOLUTION_API_WEBHOOK_SECRET) {
        console.warn('Webhook da Evolution API: Falha na validação do token secreto.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      // Em ambiente de desenvolvimento, pode ser útil logar um aviso se o secret não estiver configurado.
      // Em produção, a ausência do secret deveria idealmente impedir o webhook de funcionar ou logar um erro crítico.
      console.warn('EVOLUTION_API_WEBHOOK_SECRET não está configurado. Webhook está operando em modo inseguro.');
    }

    const body = await request.json();
    console.log('Webhook da Evolution API Recebido:', JSON.stringify(body, null, 2));

    // TODO:
    // 2. Processar o evento:
    //    - Se for uma nova mensagem (ex: event 'messages.upsert'):
    //      - Extrair detalhes da mensagem (remetente, conteúdo, ID da mensagem do WhatsApp).
    //      - Verificar se já existe um chat para este remetente.
    //      - Se não, criar um novo Chat.
    //      - Adicionar a mensagem ao Chat.
    //      - Notificar a UI sobre a nova mensagem/chat (via WebSockets, Server-Sent Events, ou polling).
    //    - Se for uma atualização de status de conexão da instância (ex: event 'connection.update'):
    //      - Atualizar o status da conexão no sistema.

    // Por enquanto, apenas retornamos 200 OK.
    return NextResponse.json({ message: 'Webhook recebido com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar webhook da Evolution API:', error);
    let errorMessage = 'Erro desconhecido ao processar o webhook.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Falha ao processar webhook', details: errorMessage }, { status: 500 });
  }
}

// A Evolution API pode enviar um GET para verificar se o webhook está ativo.
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook da Evolution API está ativo e pronto para receber POSTs.' }, { status: 200 });
}
