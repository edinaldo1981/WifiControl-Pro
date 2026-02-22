import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  History, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  Coins,
  ArrowRight,
  Search,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const PLANS = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 20,
    credits: 20,
    description: 'Ideal para uso moderado e navegação simples.',
    features: ['Acesso 24h', 'Suporte Básico', 'Válido por 30 dias']
  },
  {
    id: 'standard',
    name: 'Plano Standard',
    price: 30,
    credits: 35,
    description: 'O melhor custo-benefício para sua casa.',
    features: ['Acesso 24h', 'Suporte Prioritário', 'Bônus de 5 créditos', 'Válido por 30 dias'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 40,
    credits: 50,
    description: 'Máxima performance e bônus exclusivos.',
    features: ['Acesso 24h', 'Suporte VIP', 'Bônus de 10 créditos', 'Válido por 30 dias']
  }
];

export default function Credits() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [balance, setBalance] = useState(15);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').limit(10);
    setClients(data || []);
  }

  const handleRecharge = async (planId: string) => {
    if (!selectedClient) {
      alert('Por favor, selecione um cliente primeiro.');
      return;
    }

    setSelectedPlan(planId);
    try {
      const response = await fetch('/api/credits/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          clientId: selectedClient.id,
          clientName: selectedClient.full_name 
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Sucesso: ${data.message}\nCliente: ${selectedClient.full_name}\nPontos Ganhos: ${data.pointsEarned} pts\nID da Transação: ${data.transactionId}`);
        setBalance(prev => prev + PLANS.find(p => p.id === planId)!.price);
      }
    } catch (error) {
      console.error('Erro ao processar recarga:', error);
      alert('Erro ao processar recarga. Tente novamente.');
    }
  };

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header & Balance Card */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm">
            <Wallet className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sistema de Créditos</h1>
            <p className="text-slate-400 font-medium">Gerencie seu saldo e recargas pré-pagas</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-600 p-6 rounded-[28px] text-white shadow-xl shadow-indigo-200 flex items-center gap-8 min-w-[300px]"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Total Recebido</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">R$ {balance.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Client Selector */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">1. Selecione o Cliente</h2>
        </div>

        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar cliente por nome..."
                value={searchTerm}
                onFocus={() => setShowClientList(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {selectedClient && (
              <div className="flex items-center gap-3 px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {selectedClient.full_name.charAt(0)}
                </div>
                <span className="text-sm font-bold text-indigo-700">{selectedClient.full_name}</span>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="text-indigo-300 hover:text-indigo-500 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {showClientList && searchTerm && !selectedClient && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientList(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold">
                    {client.full_name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{client.full_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">Escolha seu Plano de Recarga</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[32px] border-2 transition-all p-8 flex flex-col ${
                plan.popular 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-100 scale-105 z-10' 
                  : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-800">R$ {plan.price.toFixed(2)}</span>
                </div>
                <p className="text-indigo-500 text-sm font-bold mt-1">Ganha {plan.credits} créditos</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleRecharge(plan.id)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Recarregar Agora
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Pagamento Seguro</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Utilizamos tecnologia de ponta para garantir que suas transações sejam 100% seguras. 
            Em breve, integração completa com **Stripe** para pagamentos via Cartão de Crédito, Pix e Boleto.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Aviso de Saldo Baixo</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            O sistema enviará automaticamente uma mensagem via WhatsApp quando seus créditos estiverem acabando, 
            garantindo que você nunca fique sem acesso às ferramentas.
          </p>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Histórico de Recargas</h3>
          </div>
          <button className="text-indigo-500 text-sm font-bold hover:underline">Ver tudo</button>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[
              { id: 1, date: '20/02/2026', amount: 30, status: 'Concluído', plan: 'Plano Standard' },
              { id: 2, date: '15/01/2026', amount: 20, status: 'Concluído', plan: 'Plano Básico' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.plan}</p>
                    <p className="text-slate-400 text-[11px] font-medium">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">R$ {item.amount.toFixed(2)}</p>
                  <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
