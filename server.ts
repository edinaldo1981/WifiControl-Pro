import express from 'express';
console.log('SERVER STARTING...');
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const WHATSAPP_INTERPRETER_PROMPT = `
Você é o cérebro do sistema WIFIControl Pro. Sua função é interpretar mensagens de clientes enviadas via WhatsApp e transformá-las em comandos técnicos para roteadores MikroTik.

REGRAS DE INTERPRETAÇÃO:
1. Identifique se o usuário quer trocar a SENHA do WiFi ou o NOME da rede (SSID).
2. Extraia o novo valor desejado.
3. Se a intenção não for clara, retorne a ação "UNKNOWN".
4. Retorne SEMPRE um JSON válido.

AÇÕES POSSÍVEIS:
- CHANGE_PASSWORD: Quando o usuário quer mudar a senha. Parâmetro: "new_password".
- CHANGE_SSID: Quando o usuário quer mudar o nome da rede. Parâmetro: "new_ssid".
- UNKNOWN: Quando a mensagem não é um comando reconhecido.

EXEMPLOS:
Mensagem: "Quero mudar minha senha para 12345678"
Retorno: { "action": "CHANGE_PASSWORD", "params": { "new_password": "12345678" } }

Mensagem: "Muda o nome do meu wifi para Casa do Joao"
Retorno: { "action": "CHANGE_SSID", "params": { "new_ssid": "Casa do Joao" } }

Mensagem: "Oi, tudo bem?"
Retorno: { "action": "UNKNOWN", "params": {} }
`;

dotenv.config();

// Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
  });

  // --- Credits & Billing ---
  app.post('/api/credits/recharge', async (req, res) => {
    const { planId, clientId, clientName } = req.body;
    console.log(`[BILLING] Recharge requested for Plan: ${planId}, Client: ${clientId} (${clientName})`);
    
    const plans: any = {
      'basic': { price: 20, credits: 20 },
      'standard': { price: 30, credits: 35 },
      'premium': { price: 40, credits: 50 }
    };

    const plan = plans[planId] || plans['basic'];
    const pointsEarned = plan.price * 10; // 10 points per Real

    try {
      // 1. Record Financial Transaction
      const { error: transError } = await supabase
        .from('financial_transactions')
        .insert([{
          amount: plan.price,
          type: 'income',
          description: `Recarga de Créditos - ${plan.name || planId}`,
          payment_method: 'Stripe (Simulado)',
          client_name: clientName,
          client_id: clientId
        }]);

      if (transError) console.error('Error recording transaction:', transError);

      // 2. Update Client Credits and Fidelity Points
      // Note: This assumes columns 'credits' and 'fidelity_points' exist
      const { error: clientError } = await supabase.rpc('increment_client_stats', {
        p_client_id: clientId,
        p_credits: plan.credits,
        p_points: pointsEarned
      });

      // Fallback if RPC doesn't exist (common in early dev)
      if (clientError) {
        console.warn('RPC increment_client_stats failed, attempting manual update');
        const { data: clientData } = await supabase.from('clients').select('credits, fidelity_points').eq('id', clientId).single();
        if (clientData) {
          await supabase.from('clients').update({
            credits: (clientData.credits || 0) + plan.credits,
            fidelity_points: (clientData.fidelity_points || 0) + pointsEarned
          }).eq('id', clientId);
        }
      }

      res.json({ 
        success: true, 
        message: `Recarga de R$ ${plan.price.toFixed(2)} processada com sucesso para ${clientName}!`,
        transactionId: `txn_${Date.now()}`,
        pointsEarned
      });
    } catch (error) {
      console.error('Recharge error:', error);
      res.status(500).json({ success: false, message: 'Erro interno ao processar recarga' });
    }
  });

  // Função para verificar créditos e notificar (Simulação)
  async function checkCreditsAndNotify(clientId: string, currentCredits: number) {
    if (currentCredits <= 5) {
      console.log(`[NOTIFY] Client ${clientId} has low credits (${currentCredits}). Sending WhatsApp reminder...`);
      // Aqui chamaria a API do WhatsApp para enviar o lembrete
    }
  }

  // Gemini Setup
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will not work.');
  }
  const genAI = new GoogleGenAI({ apiKey: geminiKey || 'dummy-key' });

  // --- WhatsApp Webhook ---
  
  // Verification (for Meta/Facebook)
  app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  });

  // Receiving messages
  app.post('/api/whatsapp/webhook', async (req, res) => {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Customer phone number
        const text = message.text.body;

        console.log(`Message from ${from}: ${text}`);

        try {
          // 1. Interpret with Gemini
          const interpretation = await interpretMessage(text);
          console.log('Interpretation:', interpretation);

          if (interpretation.action === 'CHANGE_PASSWORD') {
            // 2. Execute on MikroTik
            await executeMikrotikCommand(interpretation.params);
            // 3. Reply via WhatsApp (Simulated for now)
            console.log(`Replying to ${from}: Senha alterada com sucesso!`);
          } else if (interpretation.action === 'CHANGE_SSID') {
            await executeMikrotikCommand(interpretation.params);
            console.log(`Replying to ${from}: Nome da rede alterado com sucesso!`);
          } else {
            console.log(`Replying to ${from}: Desculpe, não entendi seu pedido.`);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

  async function interpretMessage(text: string) {
    const model = 'gemini-3-flash-preview';
    const prompt = `${WHATSAPP_INTERPRETER_PROMPT}\n\nMensagem do Cliente: "${text}"`;

    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  }

  async function executeMikrotikCommand(params: any) {
    const host = process.env.MIKROTIK_HOST;
    const user = process.env.MIKROTIK_USER;
    const password = process.env.MIKROTIK_PASSWORD;

    if (!host || !user || !password) {
      console.warn('MikroTik credentials not configured.');
      return;
    }

    const { Router } = await import('mikrotik-node');
    const device = new Router({
      host,
      user,
      password,
      port: 8728
    });

    try {
      await device.connect();
      if (params.new_password) {
        // Example command to change wireless password
        // This depends on the specific MikroTik setup (security profiles)
        await device.write('/interface/wireless/security-profiles/set', [
          '=.id=default',
          `=wpa2-pre-shared-key=${params.new_password}`
        ]);
      }
      if (params.new_ssid) {
        await device.write('/interface/wireless/set', [
          '=.id=wlan1',
          `=ssid=${params.new_ssid}`
        ]);
      }
    } catch (err) {
      console.error('MikroTik Error:', err);
    } finally {
      device.close();
    }
  }

  // --- Vite Middleware ---
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware loaded');
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
