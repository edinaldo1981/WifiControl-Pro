import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Wifi, Shield, Bell, Database, Save, Globe, Lock, Loader2 } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('wifi');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Configurações salvas com sucesso!');
    }, 1000);
  };

  const tabs = [
    { id: 'wifi', label: 'Wi-Fi & Rede', icon: Wifi },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'system', label: 'Sistema', icon: Database },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
            <SettingsIcon className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
            <p className="text-slate-400 font-medium">Gerencie as preferências do seu sistema WIFIControl Pro</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Alterações
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10"
          >
            {activeTab === 'wifi' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Wifi className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Configurações de Wi-Fi</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nome da Rede (SSID)</label>
                    <input 
                      type="text" 
                      defaultValue="WIFIControl_Pro_Network"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Frequência</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-slate-700">
                      <option>Dual Band (2.4GHz / 5GHz)</option>
                      <option>2.4GHz Only</option>
                      <option>5GHz Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Canal</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-slate-700">
                      <option>Automático (Recomendado)</option>
                      <option>Canal 1</option>
                      <option>Canal 6</option>
                      <option>Canal 11</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Potência de Transmissão</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-slate-700">
                      <option>Máxima (100%)</option>
                      <option>Média (50%)</option>
                      <option>Baixa (25%)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-4">
                      <Globe className="w-6 h-6 text-indigo-500" />
                      <div>
                        <p className="font-bold text-slate-800">Rede de Visitantes</p>
                        <p className="text-xs text-slate-500 font-medium">Crie uma rede separada para seus convidados</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Segurança do Sistema</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Autenticação em Duas Etapas (2FA)</p>
                      <p className="text-sm text-slate-500 font-medium">Adicione uma camada extra de segurança à sua conta</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                      Configurar
                    </button>
                  </div>

                  <div className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Firewall Avançado</p>
                      <p className="text-sm text-slate-500 font-medium">Proteção contra ataques externos e monitoramento de tráfego</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Notificações</h2>
                </div>

                <div className="space-y-4">
                  {['Alertas de Dispositivo Offline', 'Novas Ordens de Serviço', 'Transações Financeiras', 'Atualizações do Sistema'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all">
                      <span className="font-bold text-slate-700">{item}</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Informações do Sistema</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Versão do Software</p>
                    <p className="text-lg font-black text-slate-800">v2.4.0-stable</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Último Backup</p>
                    <p className="text-lg font-black text-slate-800">Hoje, às 04:12</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Uso de Armazenamento</p>
                    <p className="text-lg font-black text-slate-800">1.2 GB / 10 GB</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status do Banco</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-lg font-black text-slate-800">Conectado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
