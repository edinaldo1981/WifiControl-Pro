import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Radio, Wifi, WifiOff, Search, MoreHorizontal, Edit2, Trash2, Play, Users, ClipboardList, Plus, Loader2, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Provisioning() {
  const [loading, setLoading] = useState(true);
  const [pendingOS, setPendingOS] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    model: '',
    serial_number: '',
    mac_address: '',
    ip_address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Buscar O.S. pendentes com dados do cliente
      const { data: osData } = await supabase
        .from('service_orders')
        .select('*, clients(*)')
        .eq('status', 'pending')
        .eq('type', 'Instalação');

      // Buscar todos os dispositivos
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*, clients(*)');

      setPendingOS(osData || []);
      setDevices(devicesData || []);
    } catch (error) {
      console.error('Error fetching provisioning data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Criar o dispositivo
      const { error: deviceError } = await supabase
        .from('devices')
        .insert([{
          user_id: user.id,
          client_id: selectedOS.client_id,
          name: newDevice.name,
          model: newDevice.model,
          serial_number: newDevice.serial_number,
          mac_address: newDevice.mac_address,
          ip_address: newDevice.ip_address,
          status: 'online'
        }]);

      if (deviceError) throw deviceError;

      // 2. Atualizar status da O.S. para 'completed'
      const { error: osError } = await supabase
        .from('service_orders')
        .update({ status: 'completed' })
        .eq('id', selectedOS.id);

      if (osError) throw osError;

      // 3. Atualizar status do cliente para 'online'
      const { error: clientError } = await supabase
        .from('clients')
        .update({ status: 'online' })
        .eq('id', selectedOS.client_id);

      if (clientError) throw clientError;

      alert('Equipamento provisionado com sucesso!');
      setIsModalOpen(false);
      setSelectedOS(null);
      setNewDevice({ name: '', model: '', serial_number: '', mac_address: '', ip_address: '' });
      fetchData();
    } catch (error: any) {
      alert('Erro ao provisionar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openProvisionModal = (os: any) => {
    setSelectedOS(os);
    setNewDevice({
      name: `ONU - ${os.clients?.full_name}`,
      model: 'HG6143D',
      serial_number: '',
      mac_address: '',
      ip_address: '192.168.1.100'
    });
    setIsModalOpen(true);
  };

  const stats = [
    { label: 'Total Equipamentos', value: devices.length.toString(), icon: Radio, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Online', value: devices.filter(d => d.status === 'online').length.toString(), icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Offline', value: devices.filter(d => d.status === 'offline').length.toString(), icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
            <p className="text-slate-500 font-semibold text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending OS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Clientes com O.S. pendente</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium ml-11">
            {pendingOS.length} cliente(s) com ordem de serviço aguardando provisionamento
          </p>
        </div>
        
        <div className="p-8">
          {loading && !isModalOpen ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : pendingOS.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhuma ordem de serviço pendente para provisionamento.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOS.map((os) => (
                <div key={os.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{os.clients?.full_name}</p>
                      <p className="text-slate-500 text-sm font-medium">{os.clients?.phone} • {os.clients?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> Gerar Script
                    </button>
                    <button 
                      onClick={() => openProvisionModal(os)}
                      className="px-6 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Provisionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Equipment List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, serial, MAC, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none">
            <option>Todos</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
        </div>

        <div className="p-8">
          {loading && !isModalOpen ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhum equipamento encontrado.
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
                      <p className="text-slate-400 text-xs font-medium mt-0.5">Cliente: {device.clients?.full_name || 'Não atribuído'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{device.ip_address}</p>
                      <p className="text-xs font-medium text-slate-400">{device.mac_address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                        <Play className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de Provisionamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-2xl p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Provisionar Equipamento</h2>
            <p className="text-slate-500 font-medium mb-8">Cliente: {selectedOS?.clients?.full_name}</p>
            
            <form onSubmit={handleProvision} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nome do Dispositivo</label>
                  <input 
                    type="text" 
                    required
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Modelo</label>
                  <input 
                    type="text" 
                    required
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Número de Série</label>
                  <input 
                    type="text" 
                    required
                    value={newDevice.serial_number}
                    onChange={(e) => setNewDevice({ ...newDevice, serial_number: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Endereço MAC</label>
                  <input 
                    type="text" 
                    required
                    value={newDevice.mac_address}
                    onChange={(e) => setNewDevice({ ...newDevice, mac_address: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Endereço IP</label>
                <input 
                  type="text" 
                  required
                  value={newDevice.ip_address}
                  onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Finalizar Provisionamento
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
