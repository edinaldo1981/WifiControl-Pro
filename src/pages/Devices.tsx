import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Radio, Wifi, WifiOff, Search, MoreHorizontal, UserCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Devices() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*, clients(*)');

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total RBs', value: devices.length.toString(), icon: Radio, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Online', value: devices.filter(d => d.status === 'online').length.toString(), icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Offline', value: devices.filter(d => d.status === 'offline').length.toString(), icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
          <Smartphone className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Estações Radio Base</h1>
          <p className="text-slate-400 font-medium">Monitore suas RBs e acesse o histórico de atendimento dos clientes</p>
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
        <div className="p-8 border-b border-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, cliente, IP ou MAC..."
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
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhum dispositivo encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <div key={device.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${device.status === 'online' ? 'bg-emerald-50' : 'bg-red-50'} rounded-2xl flex items-center justify-center`}>
                      <Wifi className={`w-7 h-7 ${device.status === 'online' ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-800">{device.name}</h3>
                        <span className={`px-3 py-1 ${device.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} text-[10px] font-bold uppercase tracking-wider rounded-full`}>
                          {device.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">{device.model} • {device.serial_number}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-400 text-xs font-medium">{device.clients?.full_name || 'Sem cliente'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{device.ip_address}</p>
                      <p className="text-xs font-medium text-slate-400">{device.mac_address}</p>
                    </div>
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
