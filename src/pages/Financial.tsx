import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CircleDollarSign, TrendingUp, Users, Zap, PieChart, Calendar, Loader2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '../lib/supabase';

export default function Financial() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    monthlyRevenue: 0,
    totalRevenue: 0,
    activeClients: 0,
    systemCredits: 66
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  async function fetchFinancialData() {
    try {
      setLoading(true);
      
      // Buscar transações
      const { data: transData } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: true });

      // Buscar total de clientes ativos
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'online');

      setTransactions(transData || []);

      const total = transData?.reduce((acc, curr) => 
        curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0) || 0;
      
      // Calcular receita do mês atual
      const now = new Date();
      const monthly = transData?.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'income';
      }).reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setStatsData(prev => ({
        ...prev,
        monthlyRevenue: monthly,
        totalRevenue: total,
        activeClients: clientsCount || 0
      }));

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Preparar dados para o gráfico de área (últimos 6 meses)
  const chartData = [
    { name: 'set', value: 0 },
    { name: 'out', value: 0 },
    { name: 'nov', value: 0 },
    { name: 'dez', value: 0 },
    { name: 'jan', value: 0 },
    { name: 'fev', value: statsData.monthlyRevenue },
  ];

  // Preparar dados para o gráfico de pizza (por método de pagamento)
  const paymentMethods = transactions.reduce((acc: any, curr) => {
    if (curr.type === 'income') {
      acc[curr.payment_method] = (acc[curr.payment_method] || 0) + Number(curr.amount);
    }
    return acc;
  }, {});

  const pieData = Object.keys(paymentMethods).map((key, i) => ({
    name: key,
    value: paymentMethods[key],
    color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4]
  }));

  if (pieData.length === 0) {
    pieData.push({ name: 'Sem dados', value: 1, color: '#f1f5f9' });
  }

  const stats = [
    { label: 'Receita do Mês', value: `R$ ${statsData.monthlyRevenue.toFixed(2)}`, trend: 'Receita atual', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', trendColor: 'text-emerald-600' },
    { label: 'Receita Total', value: `R$ ${statsData.totalRevenue.toFixed(2)}`, trend: `${transactions.length} transações`, icon: CircleDollarSign, color: 'text-blue-500', bg: 'bg-blue-50', trendColor: 'text-slate-400' },
    { label: 'Clientes Ativos', value: statsData.activeClients.toString(), trend: 'Status online', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', trendColor: 'text-slate-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
            <CircleDollarSign className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
            <p className="text-slate-400 font-medium">Controle completo de receitas, despesas e créditos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-800 mb-2">{stat.value}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${stat.trendColor}`}>{stat.trend}</span>
                </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Créditos do Sistema</p>
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <p className="text-3xl font-black text-slate-800">{statsData.systemCredits}</p>
                <p className="text-slate-400 text-sm font-bold mb-1">/ 100</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${statsData.systemCredits}%` }} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-2">{statsData.systemCredits}% disponível</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-10">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-slate-800">Receita nos Últimos 6 Meses</h2>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 700, color: '#6366f1' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-10">
                <PieChart className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-slate-800">Por Forma de Pagamento</h2>
              </div>

              <div className="h-[240px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">
                      {item.name === 'Sem dados' ? '-' : `R$ ${item.value.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Transações Recentes</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    transactions.slice().reverse().map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                          {new Date(t.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-sm font-bold text-slate-800">{t.description || 'Recarga de Créditos'}</p>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {t.client_name || 'Sistema de Crédito'}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm text-slate-500 font-medium capitalize">
                          {t.payment_method}
                        </td>
                        <td className={`px-8 py-4 text-sm font-black text-right ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
