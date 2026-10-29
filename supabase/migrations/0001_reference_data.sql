-- 0001: Data referensi publik (wilayah, jenis pupuk, sumber data, statistik penyaluran, HET).
-- Semua tabel di sini hanya-baca untuk publik; penulisan dilakukan lewat seed / role postgres.

create table public.regions (
  code        text primary key,              -- kode Kemendagri: '52' (provinsi), '5201' (kab/kota)
  name        text not null,
  level       text not null check (level in ('provinsi', 'kabkota')),
  parent_code text references public.regions (code),
  check ((level = 'provinsi') = (parent_code is null))
);

create table public.fertilizer_types (
  id         text primary key,               -- 'urea', 'npk', 'npk_fk', 'za', 'sp36', 'organik', ...
  name       text not null,
  sort_order int  not null default 0
);

create table public.data_sources (
  id          text primary key,
  publisher   text not null,
  title       text not null,
  url         text not null,
  source_type text not null check (source_type in ('dataset_resmi', 'regulasi', 'berita')),
  released_on date,
  data_until  text,                          -- mis. 'Oktober 2025' bila data tahun berjalan belum penuh
  accessed_on date not null,
  license     text,
  notes       text
);

create table public.distribution_stats (
  id              bigint generated always as identity primary key,
  region_code     text not null references public.regions (code),
  fertilizer_id   text not null references public.fertilizer_types (id),
  year            int  not null check (year between 2000 and 2100),
  allocation_ton  numeric check (allocation_ton >= 0),
  realization_ton numeric check (realization_ton >= 0),
  realization_pct numeric generated always as
    (case when allocation_ton > 0 then round(realization_ton / allocation_ton * 100, 2) end) stored,
  source_id       text not null references public.data_sources (id),
  unique (region_code, fertilizer_id, year, source_id)
);
create index on public.distribution_stats (year, fertilizer_id);

create table public.het_rates (
  fertilizer_id  text not null references public.fertilizer_types (id),
  price_per_kg   int  not null check (price_per_kg > 0),
  pack_kg        int  check (pack_kg > 0),
  regulation     text not null,
  effective_from date not null,
  source_id      text not null references public.data_sources (id),
  primary key (fertilizer_id, effective_from)
);

-- RLS: publik boleh membaca, tidak ada yang boleh menulis lewat API.
do $$
declare t text;
begin
  foreach t in array array['regions', 'fertilizer_types', 'data_sources', 'distribution_stats', 'het_rates'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- HET yang berlaku pada tanggal tertentu (dipakai kalkulator & snapshot laporan).
create function public.het_on(p_fertilizer_id text, p_date date default current_date)
returns int language sql stable set search_path = '' as $$
  select h.price_per_kg from public.het_rates h
  where h.fertilizer_id = p_fertilizer_id and h.effective_from <= p_date
  order by h.effective_from desc limit 1
$$;
