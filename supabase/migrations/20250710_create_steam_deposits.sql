-- Create steam_deposits table for tracking user skin deposits
create table if not exists public.steam_deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  steam_item_id text not null,
  market_hash_name text not null,
  market_price numeric(10,2) not null,
  deposit_value numeric(10,2) not null,
  quantity integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  notes text
);

-- Add indexes for better performance
create index if not exists idx_steam_deposits_user_id on public.steam_deposits(user_id);
create index if not exists idx_steam_deposits_status on public.steam_deposits(status);
create index if not exists idx_steam_deposits_created_at on public.steam_deposits(created_at);

-- Add RLS policies
alter table public.steam_deposits enable row level security;

-- Users can view their own deposits
create policy "Users can view own deposits" on public.steam_deposits
  for select using (auth.uid() = user_id);

-- Users can insert their own deposits
create policy "Users can insert own deposits" on public.steam_deposits
  for insert with check (auth.uid() = user_id);

-- Admins can view all deposits
create policy "Admins can view all deposits" on public.steam_deposits
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and nickname = 'admin'
    )
  );

-- Admins can update all deposits
create policy "Admins can update all deposits" on public.steam_deposits
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and nickname = 'admin'
    )
  );

-- Add status and deposit_value columns to steam_bot_inventory if they don't exist
alter table public.steam_bot_inventory 
add column if not exists status text default 'available' check (status in ('available', 'deposited', 'sold', 'reserved')),
add column if not exists deposited_at timestamp with time zone,
add column if not exists deposit_value numeric(10,2);

-- Update the fetchSteamInventory function to only show available items
create or replace function public.fetch_steam_inventory_for_user(p_user_id uuid)
returns table (
  id uuid,
  steam_item_id text,
  market_hash_name text,
  icon_url text,
  tradable boolean,
  marketable boolean,
  exterior text,
  rarity_color text,
  bot_id uuid,
  last_synced timestamp with time zone,
  status text,
  deposit_value numeric(10,2)
) as $$
begin
  return query
  select 
    sbi.id,
    sbi.steam_item_id,
    sbi.market_hash_name,
    sbi.icon_url,
    sbi.tradable,
    sbi.marketable,
    sbi.exterior,
    sbi.rarity_color,
    sbi.bot_id,
    sbi.last_synced,
    sbi.status,
    sbi.deposit_value
  from public.steam_bot_inventory sbi
  where sbi.tradable = true 
    and sbi.status = 'available'
  order by sbi.last_synced desc;
end;
$$ language plpgsql security definer; 