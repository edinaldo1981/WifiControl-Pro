import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ClientRegistration() {
  const [loading, setLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    plan_interested: ''
  });

  useEffect(() => {
    fetchTotalLeads();
  }, []);

  async function fetchTotalLeads() {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    setTotalLeads(count || 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('leads')
        .insert([
          { 
            ...formData,
            user_id: user.id,
            status: 'new'
          }
        ]);

      if (error) throw error;

      alert('Interessado cadastrado com sucesso!');
      setFormData({
        full_name: '',
        phone: '',
        address: '',
        plan_interested: ''
      });
      fetchTotalLeads();
    } catch (error: any) {
      alert('Erro ao cadastrar interessado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
          <UserPlus className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Cadastro de Interessados</h1>
          <p className="text-slate-400 font-medium">Registre novos leads no sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-10">Novo Interessado</h2>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo *</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nome do interessado"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Telefone *</label>
                <input 
                  type="text" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Endereço</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Plano de Interesse</label>
              <input 
                type="text" 
                name="plan_interested"
                value={formData.plan_interested}
                onChange={handleChange}
                placeholder="Ex: 500 Mega"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Salvar Interessado'}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm h-fit"
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800">Resumo</h2>
          </div>
          
          <div className="text-center py-10">
            <p className="text-6xl font-black text-indigo-600 mb-2 tracking-tighter">{totalLeads}</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Interessados cadastrados</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
