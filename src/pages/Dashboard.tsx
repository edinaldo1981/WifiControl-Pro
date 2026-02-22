import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Smartphone, 
  ShieldAlert, 
  Wifi,
  ChevronRight,
  AlertTriangle,
  Plus,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [statsData, setStatsData] = useState({
    commands: 0,
    devices: 0,
    blocked: 0,
    wifiStatus: 'Online'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: devicesCount } = await supabase
          .from('devices')
          .select('*', { count: 'exact', head: true });

        // Contar clientes bloqueados (offline) que possuem dispositivos
        const { count: blockedCount } = await supabase
          .from('clients')
          .select('*, devices!inner(*)', { count: 'exact', head: true })
          .eq('status', 'offline');

        setStatsData({
          commands: 0,
          devices: devicesCount || 0,
          blocked: blockedCount || 0,
          wifiStatus: 'Online'
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    { label: 'Comandos Totais', value: statsData.commands.toString(), icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Dispositivos', value: statsData.devices.toString(), icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Bloqueados', value: statsData.blocked.toString(), icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Status WiFi', value: statsData.wifiStatus, icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-10 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">Bem-vindo ao WIFIControl Pro!</h1>
          <p className="text-indigo-50 text-lg opacity-90">Controle sua rede WiFi de forma simples e rápida através do WhatsApp.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
            <p className="text-slate-500 font-semibold text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.label === 'Status WiFi' ? 'text-emerald-500' : 'text-slate-800'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Status do WiFi</h2>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Wifi className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="font-bold text-slate-700">Rede Principal</span>
              </div>
              <span className="font-bold text-slate-800">MinhaRede</span>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm opacity-50">
                  <Wifi className="w-5 h-5 text-slate-400" />
                </div>
                <span className="font-bold text-slate-400">Rede Visitante</span>
              </div>
              <span className="font-bold text-slate-400">Inativa</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-8">Ações Rápidas</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-5 bg-red-50 border border-red-100 rounded-2xl group hover:bg-red-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-bold text-red-600">Ativar Modo Pânico</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-2xl group hover:bg-indigo-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="font-bold text-indigo-600">Criar WiFi Visitante</span>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
