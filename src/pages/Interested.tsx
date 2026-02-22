import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Phone, MapPin, Calendar, MoreHorizontal, Loader2, Plus, X, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Interested() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', address: '', plan: '' });

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateOS = async (lead: any) => {
    try {
      setActionLoading(lead.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Criar o cliente na tabela 'clients'
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([{
          user_id: user.id,
          full_name: lead.full_name,
          phone: lead.phone,
          address: lead.address,
          status: 'offline' // Inicialmente offline até instalar
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Criar a Ordem de Serviço
      const { error: osError } = await supabase
        .from('service_orders')
        .insert([{
          user_id: user.id,
          client_id: client.id,
          type: 'Instalação',
          status: 'pending',
          description: `Instalação para novo cliente vindo de interessados. Plano: ${lead.plan_interested || 'Não definido'}`
        }]);

      if (osError) throw osError;

      // 3. Atualizar status do lead
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', lead.id);

      if (leadError) throw leadError;

      alert('O.S. Gerada com sucesso! Redirecionando para Provisionamento...');
      navigate('/dashboard/provisioning');
    } catch (error: any) {
      alert('Erro ao gerar O.S.: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('leads')
        .insert([{
          user_id: user.id,
          full_name: newLead.name,
          phone: newLead.phone,
          address: newLead.address,
          plan_interested: newLead.plan
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewLead({ name: '', phone: '', address: '', plan: '' });
      fetchLeads();
    } catch (error: any) {
      alert('Erro ao adicionar interessado: ' + error.message);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
            <Users className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Interessados</h1>
            <p className="text-slate-400 font-medium">Gerencie potenciais clientes e leads</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" /> Novo Interessado
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhum interessado encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                      {lead.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-800">{lead.full_name}</h3>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.status === 'new' ? 'Novo' : lead.status === 'converted' ? 'Convertido' : lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {lead.phone || 'Sem telefone'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lead.address || 'Sem endereço'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{lead.plan_interested || 'Interesse não definido'}</p>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lead.status !== 'converted' && (
                        <button 
                          onClick={() => handleGenerateOS(lead)}
                          disabled={actionLoading === lead.id}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-100"
                        >
                          {actionLoading === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                          Gerar O.S.
                        </button>
                      )}
                      <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal para Novo Interessado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Novo Interessado</h2>
            
            <form onSubmit={handleAddLead} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Telefone</label>
                <input 
                  type="text" 
                  required
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Endereço</label>
                <input 
                  type="text" 
                  value={newLead.address}
                  onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Plano de Interesse</label>
                <input 
                  type="text" 
                  value={newLead.plan}
                  onChange={(e) => setNewLead({ ...newLead, plan: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4">
                Cadastrar Lead
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
