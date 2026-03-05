create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  is_booked boolean default false,
  created_at timestamptz default now(),
  unique(date, time)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references slots(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  snap text not null,
  email text not null,
  service text not null check (service in ('coupe', 'coupe_barbe')),
  created_at timestamptz default now()
);

alter table slots enable row level security;
create policy "Slots lisibles par tous" on slots for select using (true);
create policy "Slots modifiables par admin" on slots for all using (auth.role() = 'authenticated');

alter table bookings enable row level security;
create policy "Reservation publique" on bookings for insert with check (true);
create policy "Bookings lisibles par admin" on bookings for select using (auth.role() = 'authenticated');
