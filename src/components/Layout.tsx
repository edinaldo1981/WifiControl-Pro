import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Wifi, 
  Users, 
  UserPlus, 
  ClipboardList, 
  Smartphone, 
  MessageSquare, 
  CircleDollarSign, 
  HardHat,
  Radio,
  UserCircle,
  Bell,
  Search,
  Coins,
  Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export default function Layout({ children, userEmail }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'provisioning', icon: Radio, label: 'Provisionamento', path: '/dashboard/provisioning' },
    { id: 'client-registration', icon: UserPlus, label: 'Cadastro de Clientes', path: '/dashboard/client-registration' },
    { id: 'interested', icon: Users, label: 'Interessados', path: '/dashboard/interested' },
    { id: 'clients', icon: UserCircle, label: 'Clientes', path: '/dashboard/clients' },
    { id: 'service-orders', icon: ClipboardList, label: 'Status da O.S.', path: '/dashboard/service-orders' },
    { id: 'devices', icon: Smartphone, label: 'Dispositivos', path: '/dashboard/devices' },
    { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', path: '/dashboard/whatsapp' },
    { id: 'financial', icon: CircleDollarSign, label: 'Financeiro', path: '/dashboard/financial' },
    { id: 'credits', icon: Coins, label: 'Créditos', path: '/dashboard/credits' },
    { id: 'fidelity', icon: Trophy, label: 'Fidelidade', path: '/dashboard/fidelity' },
    { id: 'team', icon: HardHat, label: 'Equipe Técnica', path: '/dashboard/team' },
    { id: 'settings', icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.label : 'Painel de Controle';
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#1e1b4b] flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Wifi className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight leading-none">WIFIControl</h1>
            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Pro</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-white/10 text-white border-l-4 border-primary' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Sistema Online</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <div className="h-10 w-[1px] bg-slate-200 mx-2" />

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Admin</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Administrador</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20">
                  <UserCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </div>
  );
}
