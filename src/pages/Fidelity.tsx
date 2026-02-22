import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  Timer,
  Crown,
  Medal,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const REWARDS = [
  { id: 1, title: '10 Créditos Grátis', points: 500, icon: Gift, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, title: 'Desconto de 20% na Próxima Recarga', points: 1000, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 3, title: 'Upgrade de Velocidade (7 dias)', points: 2500, icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, title: 'Isenção de Taxa de Suporte', points: 5000, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

// Mock for ShieldCheck since it wasn't in the import list but I used it in the reward
import { ShieldCheck } from 'lucide-react';

export default function Fidelity() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(1250); // Mock for current user

  useEffect(() => {
    fetchRanking();
  }, []);

  async function fetchRanking() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, fidelity_points')
        .order('fidelity_points', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedRanking = data?.map((item, i) => ({
        id: item.id,
        name: item.full_name,
        points: item.fidelity_points || 0,
        level: getLevelName(item.fidelity_points || 0),
        avatar: item.full_name.charAt(0)
      })) || [];

      setRanking(formattedRanking);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  function getLevelName(points: number) {
    if (points >= 10000) return 'Diamante';
    if (points >= 5000) return 'Platina';
    if (points >= 2500) return 'Ouro';
    if (points >= 1000) return 'Prata';
    return 'Bronze';
  }

  const levels = [
    { name: 'Bronze', min: 0, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Prata', min: 1000, color: 'text-slate-400', bg: 'bg-slate-50' },
    { name: 'Ouro', min: 2500, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Platina', min: 5000, color: 'text-indigo-400', bg: 'bg-indigo-50' },
    { name: 'Diamante', min: 10000, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const currentLevel = levels.reverse().find(l => userPoints >= l.min) || levels[levels.length - 1];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header & User Status */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Trophy className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Programa de Fidelidade</h1>
              <p className="text-slate-400 font-medium">Ganhe pontos a cada recarga e troque por prêmios</p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-8 min-w-[450px]"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-100 flex items-center justify-center">
              <Crown className="w-10 h-10 text-purple-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Seu Status Atual</p>
            <h3 className="text-2xl font-black text-slate-800 mb-1">Nível {currentLevel.name}</h3>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-lg font-bold text-purple-600">{userPoints} Pontos</span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2">
              Resgatar Prêmios
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rewards Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Prêmios Disponíveis</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Troque seus pontos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REWARDS.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${reward.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <reward.icon className={`w-6 h-6 ${reward.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo</p>
                    <p className="text-lg font-black text-slate-800">{reward.points} pts</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{reward.title}</h3>
                <div className="w-full bg-slate-50 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (userPoints / reward.points) * 100)}%` }} 
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2">
                  {userPoints >= reward.points ? 'Disponível para resgate!' : `${reward.points - userPoints} pontos restantes`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ranking Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Medal className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">Ranking de Fidelidade</h2>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Clientes do Mês</p>
            </div>
            <div className="p-6 space-y-6">
              {ranking.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100">
                        {item.avatar}
                      </div>
                      {i < 3 && (
                        <div className="absolute -top-2 -right-2">
                          <Award className={`w-5 h-5 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : 'text-orange-400'}`} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{item.points}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pontos</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-indigo-600 text-white text-center cursor-pointer hover:bg-indigo-700 transition-colors">
              <p className="text-xs font-bold uppercase tracking-widest">Ver Ranking Completo</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Timer className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Missões Diárias</h3>
          </div>
          <div className="space-y-4">
            {[
              { task: 'Fazer login hoje', points: 50, done: true },
              { task: 'Indicar um amigo', points: 200, done: false },
              { task: 'Avaliar o suporte', points: 100, done: false },
            ].map((mission, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  {mission.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-200 rounded-full" />
                  )}
                  <span className={`text-sm font-medium ${mission.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {mission.task}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600">+{mission.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-center">
          <h3 className="text-2xl font-black mb-4">Indique e Ganhe!</h3>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
            Compartilhe seu link de indicação e ganhe 500 pontos quando seu amigo fizer a primeira recarga. 
            Seu amigo também ganha 5 créditos de bônus!
          </p>
          <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all">
            Copiar Link de Indicação
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 p-10 rounded-[40px] border border-indigo-100 flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shrink-0">
          <TrendingUp className="w-10 h-10 text-indigo-500" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-black text-indigo-900 mb-2">Como ganhar mais pontos?</h3>
          <p className="text-indigo-700/70 font-medium leading-relaxed">
            Cada R$ 1,00 em recargas equivale a 10 pontos de fidelidade. 
            Clientes que mantêm recargas consecutivas ganham bônus multiplicadores! 
            Interaja com nosso suporte e avalie nossos serviços para ganhar pontos extras.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-indigo-100 text-center">
            <p className="text-2xl font-black text-indigo-600">10x</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multiplicador</p>
          </div>
          <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-indigo-100 text-center">
            <p className="text-2xl font-black text-indigo-600">+50</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bônus Login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
