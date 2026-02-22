import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Wifi, Mail, Lock, Loader2, UserPlus, LogIn } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });
        if (error) throw error;
        setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar (se habilitado no Supabase) ou tente fazer login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px]"
      >
        <div className="bg-white rounded-[24px] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Wifi className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">WIFIControl Pro</h1>
            <p className="text-slate-500 font-medium mt-1">
              {isLogin ? 'Painel de Controle WiFi' : 'Criar Conta de Administrador'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-600"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-lg">
                {success}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 bg-[#6366f1] text-white rounded-xl font-bold hover:bg-[#4f46e5] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Entrar' : 'Cadastrar Administrador'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-[#6366f1] text-sm font-bold hover:underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>

          <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            Acesso restrito a administradores e equipe técnica
          </p>
        </div>
      </motion.div>
    </div>
  );
}
