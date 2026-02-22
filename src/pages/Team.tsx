import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HardHat, Plus, UserCircle, Trash2, ShieldCheck, Wrench, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'technician' });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('team_members')
        .insert([{
          user_id: user.id,
          member_name: newMember.name,
          member_email: newMember.email,
          role: newMember.role
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewMember({ name: '', email: '', role: 'technician' });
      fetchMembers();
    } catch (error: any) {
      alert('Erro ao adicionar membro: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      fetchMembers();
    } catch (error: any) {
      alert('Erro ao remover membro: ' + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm">
            <HardHat className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Equipe Técnica</h1>
            <p className="text-slate-400 font-medium">Gerencie os logins e acessos da sua equipe</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" /> Novo Técnico
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <UserCircle className="w-6 h-6 text-indigo-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Membros da Equipe</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{members.length} usuário(s) cadastrado(s)</p>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Nenhum membro cadastrado na equipe.
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                    {member.member_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-0.5">{member.member_name}</h3>
                    <p className="text-slate-400 text-sm font-medium">{member.member_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    member.role === 'admin' 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' : 'Técnico'}
                  </span>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Modal para Novo Técnico */}
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
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Novo Membro</h2>
            
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
                <input 
                  type="email" 
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Cargo</label>
                <select 
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-slate-700"
                >
                  <option value="technician">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4">
                Cadastrar Membro
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">👑 Administrador</h2>
          </div>
          <ul className="space-y-4">
            {[
              'Acesso total ao sistema',
              'Gerenciar equipe técnica',
              'Configurações e financeiro',
              'Relatórios e dashboard completo'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">🔧 Técnico</h2>
          </div>
          <ul className="space-y-4">
            {[
              'Dashboard operacional',
              'Provisionamento e equipamentos',
              'Clientes e ordens de serviço',
              'WhatsApp e dispositivos'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
