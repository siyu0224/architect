-- Projects (portfolio items)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  location text,
  image text not null,
  slug text not null unique,
  description text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- RLS: allow public read on projects only
alter table public.projects enable row level security;
alter table public.contact_submissions enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Contact submissions are insertable by everyone"
  on public.contact_submissions for insert
  with check (true);

-- Only authenticated users (or service role) can read contact submissions.
-- For now we allow no public select; use Supabase dashboard or service role to view.
create policy "Contact submissions are not publicly readable"
  on public.contact_submissions for select
  using (false);

-- Optional: seed placeholder projects (run once; you can delete after adding real data)
insert into public.projects (title, category, location, image, slug, sort_order)
values
  ('Residence One', 'Residential', 'California', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'residence-one', 1),
  ('Hill House', 'Residential', 'Pacific Northwest', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'hill-house', 2),
  ('Urban Pavilion', 'Commercial', 'San Francisco', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'urban-pavilion', 3),
  ('Coastal Retreat', 'Residential', 'Oregon Coast', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', 'coastal-retreat', 4),
  ('Garden Studio', 'Studio', 'Bay Area', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', 'garden-studio', 5),
  ('Canyon View', 'Residential', 'Arizona', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'canyon-view', 6)
on conflict (slug) do nothing;
