import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, Send, UserCircle, ChevronRight, Loader2, MoreVertical, Phone, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WhatsApp() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients for WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedClient) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    // Simular processamento pelo servidor (Webhook + AI + MikroTik)
    setTimeout(async () => {
      try {
        // Simulando o que o servidor faria ao receber o webhook
        const response = await fetch('/api/whatsapp/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            object: 'whatsapp_business_account',
            entry: [{
              changes: [{
                value: {
                  messages: [{
                    from: selectedClient.phone,
                    text: { body: message }
                  }]
                }
              }]
            }]
          })
        });

        // No mundo real, o servidor enviaria uma mensagem de volta via API do WhatsApp.
        // Aqui, vamos apenas simular a resposta visual no chat.
        const feedback = {
          id: Date.now() + 1,
          text: `[SISTEMA] Comando processado. Verifique os logs do servidor para detalhes da execução no MikroTik.`,
          sender: 'client',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, feedback]);
      } catch (error) {
        console.error('Erro na simulação:', error);
      }
    }, 1000);
  };

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
          <MessageSquare className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">WhatsApp</h1>
          <p className="text-slate-400 font-medium">Selecione um cliente cadastrado para simular comandos</p>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Client List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/3 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-800">Clientes</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium">
                Nenhum cliente encontrado.
              </div>
            ) : (
              filteredClients.map((client) => (
                <div 
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setChatHistory([]);
                  }}
                  className={`p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all ${
                    selectedClient?.id === client.id 
                      ? 'bg-emerald-50 border border-emerald-100' 
                      : 'bg-white border border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                      <UserCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{client.full_name}</p>
                      <p className="text-slate-500 text-[11px] font-medium">{client.phone || '(00) 00000-0000'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedClient?.id === client.id ? 'text-emerald-500' : 'text-slate-300'}`} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden"
        >
          {selectedClient ? (
            <>
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedClient.full_name}</h2>
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                    <MessageSquare className="w-12 h-12 opacity-10" />
                    <p className="font-medium">Inicie uma conversa com {selectedClient.full_name}</p>
                  </div>
                ) : (
                  chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'me' 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        <p className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${msg.sender === 'me' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <input 
                    type="text" 
                    placeholder="Digite sua mensagem ou comando..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button 
                    type="submit"
                    className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 opacity-20" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum cliente selecionado</h2>
              <p className="font-medium max-w-xs mx-auto">Selecione um cliente na lista ao lado para iniciar o atendimento via WhatsApp</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
