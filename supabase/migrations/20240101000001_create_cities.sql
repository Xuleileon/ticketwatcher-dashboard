-- Create cities table
create table cities (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    code varchar not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create unique index on city name and code
create unique index cities_name_idx on cities(name);
create unique index cities_code_idx on cities(code);

-- Create RLS policies
alter table cities enable row level security;

-- Cities are readable by all authenticated users
create policy "Cities are viewable by all users"
    on cities for select
    to authenticated
    using (true);

-- Create trigger for auto-updating updated_at
create trigger update_cities_updated_at
    before update on cities
    for each row
    execute function update_updated_at_column(); 