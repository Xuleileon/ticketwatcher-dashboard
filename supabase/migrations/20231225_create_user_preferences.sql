-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  from_station text not null,
  to_station text not null,
  morning_train text not null,
  evening_train text not null,
  seat_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_preferences enable row level security;

-- Create policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can delete their own preferences"
  on public.user_preferences for delete
  using (auth.uid() = user_id);

-- Create indexes
create index user_preferences_user_id_idx on public.user_preferences(user_id);

-- Set up realtime
alter publication supabase_realtime add table public.user_preferences; 