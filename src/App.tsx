import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Provisioning from './pages/Provisioning';
import ClientRegistration from './pages/ClientRegistration';
import Interested from './pages/Interested';
import ClientsList from './pages/ClientsList';
import ServiceOrders from './pages/ServiceOrders';
import Devices from './pages/Devices';
import WhatsApp from './pages/WhatsApp';
import Financial from './pages/Financial';
import Credits from './pages/Credits';
import Fidelity from './pages/Fidelity';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            session ? (
              <Layout userEmail={session.user.email}>
                <Routes>
                  <Route index element={<Dashboard session={session} />} />
                  <Route path="provisioning" element={<Provisioning />} />
                  <Route path="client-registration" element={<ClientRegistration />} />
                  <Route path="interested" element={<Interested />} />
                  <Route path="clients" element={<ClientsList />} />
                  <Route path="service-orders" element={<ServiceOrders />} />
                  <Route path="devices" element={<Devices />} />
                  <Route path="whatsapp" element={<WhatsApp />} />
                  <Route path="financial" element={<Financial />} />
                  <Route path="credits" element={<Credits />} />
                  <Route path="fidelity" element={<Fidelity />} />
                  <Route path="team" element={<Team />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
