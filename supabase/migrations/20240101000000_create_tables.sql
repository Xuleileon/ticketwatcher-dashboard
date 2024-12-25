-- Create tickets table
create table tickets (
    id uuid default uuid_generate_v4() primary key,
    train_no varchar not null,
    from_station varchar not null,
    to_station varchar not null,
    departure_time timestamp with time zone not null,
    arrival_time timestamp with time zone not null,
    seat_type varchar not null,
    price decimal(10,2) not null,
    remaining_tickets integer not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create watch_tasks table
create table watch_tasks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    from_station varchar not null,
    to_station varchar not null,
    travel_date date not null,
    preferred_trains text[], -- 优先车次
    seat_types text[], -- 座位类型优先级
    passenger_ids text[], -- 乘客证件号
    status varchar not null default 'active',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create order_records table
create table order_records (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    watch_task_id uuid references watch_tasks not null,
    train_no varchar not null,
    order_no varchar,
    status varchar not null default 'pending',
    passenger_info jsonb not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create RLS policies
alter table tickets enable row level security;
alter table watch_tasks enable row level security;
alter table order_records enable row level security;

-- Tickets are readable by all authenticated users
create policy "Tickets are viewable by all users"
    on tickets for select
    to authenticated
    using (true);

-- Watch tasks are only viewable and manageable by their owners
create policy "Users can manage their own watch tasks"
    on watch_tasks for all
    to authenticated
    using (auth.uid() = user_id);

-- Order records are only viewable and manageable by their owners
create policy "Users can manage their own orders"
    on order_records for all
    to authenticated
    using (auth.uid() = user_id);

-- Create functions for auto-updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for auto-updating updated_at
create trigger update_tickets_updated_at
    before update on tickets
    for each row
    execute function update_updated_at_column();

create trigger update_watch_tasks_updated_at
    before update on watch_tasks
    for each row
    execute function update_updated_at_column();

create trigger update_order_records_updated_at
    before update on order_records
    for each row
    execute function update_updated_at_column(); 