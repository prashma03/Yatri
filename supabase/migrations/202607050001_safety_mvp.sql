-- Yatri safety MVP schema. Apply with: supabase db push
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'traveler' check (role in ('traveler', 'moderator', 'admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('taxi_overcharge', 'fake_permit', 'gem_scam', 'aggressive_seller', 'other')),
  description text not null check (char_length(description) between 10 and 1000),
  latitude double precision not null check (latitude between 26 and 31),
  longitude double precision not null check (longitude between 80 and 89),
  district text,
  photo_path text,
  verification_status text not null default 'community' check (verification_status in ('community', 'verified', 'rejected')),
  moderation_note text,
  vote_count integer not null default 0 check (vote_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scam_reports_nearby_idx on public.scam_reports (created_at desc, category);
create index if not exists scam_reports_coordinates_idx on public.scam_reports (latitude, longitude);

create table if not exists public.report_votes (
  report_id uuid not null references public.scam_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table if not exists public.saved_districts (
  user_id uuid not null references auth.users(id) on delete cascade,
  district text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, district)
);

create table if not exists public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('trusted', 'embassy')),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_key text unique not null,
  category text not null check (category in ('price', 'emergency', 'permit', 'phrase', 'district', 'safety')),
  district text,
  title text not null,
  body jsonb not null,
  source_name text not null,
  source_url text not null,
  reviewed_at timestamptz not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin')); $$;

create or replace function public.sync_report_vote_count()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.scam_reports set vote_count = (select count(*) from public.report_votes where report_id = coalesce(new.report_id, old.report_id)), updated_at = now()
  where id = coalesce(new.report_id, old.report_id);
  return coalesce(new, old);
end; $$;

drop trigger if exists report_vote_count on public.report_votes;
create trigger report_vote_count after insert or delete on public.report_votes for each row execute function public.sync_report_vote_count();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name') on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.scam_reports enable row level security;
alter table public.report_votes enable row level security;
alter table public.saved_districts enable row level security;
alter table public.trusted_contacts enable row level security;
alter table public.content_items enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_moderator());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "reports public safety read" on public.scam_reports for select using (verification_status <> 'rejected');
create policy "reports authenticated insert" on public.scam_reports for insert to authenticated with check (reporter_id = auth.uid() and verification_status = 'community');
create policy "reports owner update pending" on public.scam_reports for update to authenticated using (reporter_id = auth.uid() and verification_status = 'community') with check (reporter_id = auth.uid() and verification_status = 'community');
create policy "reports moderator update" on public.scam_reports for update to authenticated using (public.is_moderator()) with check (public.is_moderator());
create policy "votes public read" on public.report_votes for select using (true);
create policy "votes own insert" on public.report_votes for insert to authenticated with check (user_id = auth.uid());
create policy "votes own delete" on public.report_votes for delete to authenticated using (user_id = auth.uid());
create policy "saved districts own all" on public.saved_districts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contacts own all" on public.trusted_contacts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "published content read" on public.content_items for select using (published or public.is_moderator());
create policy "content moderator write" on public.content_items for all to authenticated using (public.is_moderator()) with check (public.is_moderator());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "report photos authenticated upload" on storage.objects for insert to authenticated with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "report photos owner read" on storage.objects for select to authenticated using (bucket_id = 'report-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderator()));

alter publication supabase_realtime add table public.scam_reports;
