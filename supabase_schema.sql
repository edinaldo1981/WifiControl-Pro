-- Execute este SQL no Editor SQL do seu projeto Supabase

-- 1. Tabela de Clientes
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  full_name text not null,
  nickname text,
  document text, -- CPF/CNPJ
  phone text,
  email text,
  address text,
  credits integer default 0,
  status text default 'online', -- online, offline
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Dispositivos (Radio Base / Roteadores)
create table devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  model text,
  serial_number text,
  mac_address text,
  ip_address text,
  status text default 'online', -- online, offline
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Ordens de Serviço
create table service_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references clients(id) not null,
  type text not null, -- Instalação, Manutenção, etc.
  status text default 'pending', -- pending, completed, cancelled
  technician_name text,
  scheduled_for date,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Transações Financeiras
create table financial_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references clients(id),
  amount decimal(10,2) not null,
  type text not null, -- income, expense
  payment_method text, -- PIX, Credit Card, etc.
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Equipe Técnica
create table team_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Admin que criou
  member_email text not null,
  member_name text not null,
  role text default 'technician', -- admin, technician
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Interessados (Leads)
create table leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  full_name text not null,
  phone text,
  address text,
  plan_interested text,
  status text default 'new', -- new, contacted, converted, lost
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table clients enable row level security;
alter table devices enable row level security;
alter table service_orders enable row level security;
alter table financial_transactions enable row level security;
alter table team_members enable row level security;
alter table leads enable row level security;

-- Políticas de Segurança (Simplificadas: Usuário vê apenas o que ele/seu admin criou)
create policy "Acesso total aos próprios clientes" on clients for all using (auth.uid() = user_id);
create policy "Acesso total aos próprios dispositivos" on devices for all using (auth.uid() = user_id);
create policy "Acesso total às próprias O.S." on service_orders for all using (auth.uid() = user_id);
create policy "Acesso total ao próprio financeiro" on financial_transactions for all using (auth.uid() = user_id);
create policy "Acesso total à própria equipe" on team_members for all using (auth.uid() = user_id);
create policy "Acesso total aos próprios leads" on leads for all using (auth.uid() = user_id);
