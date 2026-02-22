import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ServiceOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_orders')
        .select('*, clients(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching service orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      fetchOrders();
    } catch (error: any) {
      alert('Erro ao concluir O.S.: ' + error.message);
    }
  };

  const stats = [
    { label: 'Pendentes', value: orders.filter(o => o.status === 'pending').length.toString(), icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Concluídas', value: orders.filter(o => o.status === 'completed').length.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total', value: orders.length.toString(), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
          <ClipboardList className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Status da O.S.</h1>
          <p className="text-slate-400 font-medium">Acompanhe as ordens de serviço</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-800">Pendentes</h2>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhuma ordem de serviço pendente.
            </div>
          ) : (
            <div className="space-y-6">
              {pendingOrders.map((os) => (
                <div key={os.id} className="p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-800">{os.clients?.full_name}</h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Pendente</span>
                      </div>
                      <p className="text-slate-500 font-bold">{os.type}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
                      <p className="text-slate-400 font-medium">Técnico: <span className="text-slate-700 font-bold">{os.technician_name || 'Não atribuído'}</span></p>
                      <p className="text-slate-400 font-medium">Agendado: <span className="text-slate-700 font-bold">{os.scheduled_for ? new Date(os.scheduled_for).toLocaleDateString('pt-BR') : 'Sem data'}</span></p>
                      <p className="text-slate-400 font-medium">Criado: <span className="text-slate-700 font-bold">{new Date(os.created_at).toLocaleString('pt-BR')}</span></p>
                    </div>
                    
                    <p className="text-slate-500 text-sm font-medium">{os.clients?.address}</p>
                  </div>

                  <button 
                    onClick={() => handleComplete(os.id)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Concluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
