-- Create scraping_status table to track scraping operations
create table if not exists public.scraping_status (
  id uuid primary key default uuid_generate_v4(),
  status text not null check (status in ('idle', 'running', 'completed', 'failed')),
  details jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Set up RLS policies
alter table public.scraping_status enable row level security;

-- Create policy to allow admins to read scraping status
create policy "Admins can read scraping status"
  on public.scraping_status
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create policy to allow admins to insert scraping status
create policy "Admins can insert scraping status"
  on public.scraping_status
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create policy to allow admins to update scraping status
create policy "Admins can update scraping status"
  on public.scraping_status
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at timestamp
create trigger set_scraping_status_updated_at
before update on public.scraping_status
for each row
execute function public.handle_updated_at();