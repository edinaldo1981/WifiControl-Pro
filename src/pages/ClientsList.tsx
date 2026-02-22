import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, Search, Wifi, WifiOff, MoreHorizontal, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statsData, setStatsData] = useState({
    total: 0,
    online: 0,
    offline: 0
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      // Buscar apenas clientes que possuem dispositivos (provisionados)
      const { data, error } = await supabase
        .from('clients')
        .select('*, devices!inner(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClients(data || []);
      
      const online = data?.filter(c => c.status === 'online').length || 0;
      const offline = data?.filter(c => c.status === 'offline').length || 0;
      
      setStatsData({
        total: data?.length || 0,
        online,
        offline
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const stats = [
    { label: 'Total de clientes', value: statsData.total.toString(), icon: UserCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Online (com créditos)', value: statsData.online.toString(), icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Offline (sem créditos)', value: statsData.offline.toString(), icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
          <UserCircle className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-400 font-medium">Visualize o status de todos os clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
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
              placeholder="Buscar por nome, telefone ou apelido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Todos os Clientes ({filteredClients.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium">
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${client.status === 'online' ? 'bg-emerald-50' : 'bg-red-50'} rounded-2xl flex items-center justify-center`}>
                      {client.status === 'online' ? (
                        <Wifi className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-7 h-7 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{client.full_name}</h3>
                      <p className="text-slate-500 text-sm font-medium">
                        {client.phone} {client.nickname ? `• ${client.nickname}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">🔑</span>
                      </div>
                      <span className="text-xs font-bold">{client.credits || 0} créditos</span>
                    </div>
                    <span className={`px-4 py-1.5 ${client.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'} text-white text-xs font-bold rounded-full shadow-lg`}>
                      {client.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
