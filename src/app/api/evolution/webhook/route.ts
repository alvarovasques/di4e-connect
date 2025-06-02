
// src/app/api/evolution/webhook/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { processIncomingWebhookMessageServerAction } from '@/app/actions/chatActions'; // Importar Server Action

const EVOLUTION_API_WEBHOOK_SECRET = process.env.EVOLUTION_API_WEBHOOK_SECRET;

/**
 * Endpoint de Webhook para a Evolution API.
 * A Evolution API enviará eventos (como novas mensagens) para este endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    if (EVOLUTION_API_WEBHOOK_SECRET) {
      const requestSecret = request.headers.get('X-Evolution-Api-Secret'); 
      if (requestSecret !== EVOLUTION_API_WEBHOOK_SECRET) {
        console.warn('Webhook da Evolution API: Falha na validação do token secreto.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('EVOLUTION_API_WEBHOOK_SECRET não está configurado. Webhook está operando em modo inseguro.');
    }

    const body = await request.json();
    console.log('Webhook da Evolution API Recebido:', JSON.stringify(body, null, 2));

    // Exemplo de como extrair dados e chamar a Server Action
    // Adapte isso à estrutura real do payload da Evolution API
    if (body.event === 'messages.upsert' && body.data && body.data.message) {
      const messageData = body.data.message;
      const customerContact = body.data.key?.remoteJid?.split('@')[0]; // Ex: 5511999998888
      const customerName = body.data.pushName || `Cliente ${customerContact}`; // Nome do contato ou fallback

      if (messageData.message?.conversation || messageData.message?.extendedTextMessage?.text) {
        const messageContent = messageData.message.conversation || messageData.message.extendedTextMessage.text;
        
        // Chamar a Server Action para processar a mensagem
        const processedChat = await processIncomingWebhookMessageServerAction({
          customerName: customerName,
          customerPhone: customerContact || 'unknown_phone', // Garantir que tem um valor
          messageContent: messageContent,
          whatsappMessageId: messageData.key?.id,
          // queueId: 'queue_pre_atendimento', // Pode ser definido por regras de roteamento ou padrão
          // chatId: se a evolution api puder enviar o ID do chat no seu sistema
        });

        if (processedChat) {
          console.log(`[Webhook] Mensagem processada para o chat ID: ${processedChat.id}`);
          // TODO: Notificar a UI sobre a nova mensagem/chat (via WebSockets, Server-Sent Events, ou polling).
        } else {
          console.error('[Webhook] Falha ao processar a mensagem via Server Action.');
        }
      }
    } else if (body.event === 'connection.update') {
      console.log('[Webhook] Atualização de status de conexão da instância:', body.data);
      // TODO: Atualizar o status da conexão no sistema.
    }

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

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook da Evolution API está ativo e pronto para receber POSTs.' }, { status: 200 });
}
