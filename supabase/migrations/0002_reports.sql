-- 0002: Pelaporan tanpa akun/NIK, pelacakan berbasis kode rahasia, panel petugas.
-- Prinsip: publik TIDAK punya akses tabel langsung. Semua lewat fungsi security definer yang tervalidasi.
-- Tenggat mengacu PermenPANRB 62/2018: verifikasi <=3 hari kerja, tindak lanjut <=14 hari kerja
-- (<=60 bila perlu pemeriksaan lapangan), konfirmasi pelapor 10 hari.

create table public.officers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name    text not null,
  agency  text not null,                      -- mis. 'Dinas Pertanian Kab. Lombok Tengah'
  role    text not null default 'verifikator' check (role in ('verifikator', 'admin'))
);

create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  public_id         text not null unique,
  secret_hash       text not null,
  category          text not null check (category in (
                      'harga_di_atas_het', 'stok_kosong', 'tidak_terdaftar',
                      'paket_paksa', 'penebusan_diwakilkan', 'pupuk_palsu', 'lainnya')),
  fertilizer_id     text references public.fertilizer_types (id),
  region_code       text not null references public.regions (code),
  kecamatan         text,
  desa              text,
  kiosk_name        text,
  incident_date     date not null check (incident_date <= current_date),
  quantity_kg       numeric check (quantity_kg > 0),
  price_paid_per_kg numeric check (price_paid_per_kg > 0),
  het_per_kg        int,                       -- snapshot HET saat kejadian
  description       text not null check (length(description) between 20 and 2000),
  contact           text check (length(contact) <= 100),  -- opsional, hanya terlihat petugas
  photo_paths       text[] not null default '{}' check (cardinality(photo_paths) <= 3),
  needs_field_check boolean not null default false,
  status            text not null default 'diterima' check (status in (
                      'diterima', 'diverifikasi', 'diteruskan', 'ditindaklanjuti',
                      'selesai_instansi', 'selesai', 'dibuka_kembali', 'ditolak')),
  assigned_agency   text,
  due_at            timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.reports (status);
create index on public.reports (region_code);

create table public.report_events (
  id         bigint generated always as identity primary key,
  report_id  uuid not null references public.reports (id) on delete cascade,
  status     text not null,
  actor      text not null check (actor in ('pelapor', 'petugas', 'sistem')),
  officer_id uuid references public.officers (user_id),
  agency     text,
  note       text,                             -- catatan publik (tampil di timeline)
  due_at     timestamptz,
  created_at timestamptz not null default now()
);
create index on public.report_events (report_id, created_at);

create table public.track_attempts (
  public_id    text not null,
  attempted_at timestamptz not null default now()
);
create index on public.track_attempts (public_id, attempted_at);

-- ---------- RLS ----------
alter table public.officers       enable row level security;
alter table public.reports        enable row level security;
alter table public.report_events  enable row level security;
alter table public.track_attempts enable row level security;
revoke all on public.officers, public.reports, public.report_events, public.track_attempts from anon, authenticated;

create function public.is_officer() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.officers where user_id = auth.uid())
$$;

grant select on public.reports, public.report_events to authenticated;
grant select on public.officers to authenticated;
create policy "officer read reports" on public.reports       for select to authenticated using (public.is_officer());
create policy "officer read events"  on public.report_events for select to authenticated using (public.is_officer());
create policy "officer read self"    on public.officers      for select to authenticated using (user_id = auth.uid());

-- ---------- Helper ----------
-- Tambah N hari kerja (Senin–Jumat). Libur nasional belum diperhitungkan.
create function public.add_working_days(p_from timestamptz, p_days int)
returns timestamptz language plpgsql immutable set search_path = '' as $$
declare d timestamptz := p_from; n int := 0;
begin
  while n < p_days loop
    d := d + interval '1 day';
    if extract(isodow from d at time zone 'Asia/Makassar') < 6 then n := n + 1; end if;
  end loop;
  return d;
end $$;

-- Alfabet tanpa karakter mirip (0/O, 1/I/L) agar mudah dibaca & diketik petani.
create function public.random_code(p_len int)
returns text language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (get_byte(b, i) % 31) + 1, 1), '')
  from (select extensions.gen_random_bytes(p_len) b) x, generate_series(0, p_len - 1) i
$$;

-- Bentuk data laporan untuk pelapor (tanpa kontak & tanpa hash).
create function public.report_view(p_report public.reports)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'public_id', p_report.public_id, 'category', p_report.category, 'fertilizer_id', p_report.fertilizer_id,
    'region_code', p_report.region_code, 'region_name', (select name from public.regions where code = p_report.region_code),
    'kecamatan', p_report.kecamatan, 'desa', p_report.desa, 'kiosk_name', p_report.kiosk_name,
    'incident_date', p_report.incident_date, 'quantity_kg', p_report.quantity_kg,
    'price_paid_per_kg', p_report.price_paid_per_kg, 'het_per_kg', p_report.het_per_kg,
    'description', p_report.description, 'status', p_report.status, 'assigned_agency', p_report.assigned_agency,
    'due_at', p_report.due_at,
    'overdue', p_report.due_at is not null and now() > p_report.due_at
               and p_report.status not in ('selesai', 'ditolak'),
    'created_at', p_report.created_at,
    'events', (select coalesce(jsonb_agg(jsonb_build_object(
                 'status', e.status, 'actor', e.actor, 'agency', e.agency, 'note', e.note,
                 'due_at', e.due_at, 'created_at', e.created_at) order by e.created_at), '[]')
               from public.report_events e where e.report_id = p_report.id))
$$;

-- ---------- RPC publik ----------
-- Kirim laporan. Kode rahasia dibuat server & dikembalikan SEKALI; yang disimpan hanya hash bcrypt.
create function public.submit_report(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_secret text := public.random_code(4) || '-' || public.random_code(4);
  v_public text;
  v_id     uuid;
  v_fert   text := nullif(p->>'fertilizer_id', '');
  v_date   date := (p->>'incident_date')::date;
  v_due    timestamptz := public.add_working_days(now(), 3);
begin
  if p->>'category' = 'harga_di_atas_het' and (v_fert is null or (p->>'price_paid_per_kg') is null) then
    raise exception 'Laporan harga wajib menyertakan jenis pupuk dan harga per kg yang dibayar';
  end if;

  loop
    v_public := 'PP-' || to_char(now(), 'YYYY') || '-' || public.random_code(6);
    exit when not exists (select 1 from public.reports where public_id = v_public);
  end loop;

  insert into public.reports (public_id, secret_hash, category, fertilizer_id, region_code, kecamatan, desa,
    kiosk_name, incident_date, quantity_kg, price_paid_per_kg, het_per_kg, description, contact, photo_paths, due_at)
  values (v_public, extensions.crypt(v_secret, extensions.gen_salt('bf')), p->>'category', v_fert,
    p->>'region_code', nullif(trim(p->>'kecamatan'), ''), nullif(trim(p->>'desa'), ''),
    nullif(trim(p->>'kiosk_name'), ''), v_date, (p->>'quantity_kg')::numeric, (p->>'price_paid_per_kg')::numeric,
    case when v_fert is not null then public.het_on(v_fert, v_date) end,
    trim(p->>'description'), nullif(trim(p->>'contact'), ''),
    coalesce(array(select jsonb_array_elements_text(p->'photo_paths')), '{}'), v_due)
  returning id into v_id;

  insert into public.report_events (report_id, status, actor, note, due_at)
  values (v_id, 'diterima', 'sistem', 'Laporan diterima dan menunggu verifikasi petugas.', v_due);

  return jsonb_build_object('public_id', v_public, 'secret_code', v_secret, 'due_at', v_due);
end $$;

-- Lacak laporan. Maks 5 percobaan/menit per ID. Mengembalikan error sebagai JSON (bukan raise)
-- supaya catatan percobaan tidak ikut di-rollback.
create function public.track_report(p_public_id text, p_secret text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r public.reports; v_id text := upper(trim(p_public_id));
begin
  if (select count(*) from public.track_attempts
      where public_id = v_id and attempted_at > now() - interval '1 minute') >= 5 then
    return jsonb_build_object('error', 'rate_limited');
  end if;
  insert into public.track_attempts (public_id) values (v_id);
  delete from public.track_attempts where attempted_at < now() - interval '1 day';

  select * into r from public.reports where public_id = v_id;
  if not found or r.secret_hash <> extensions.crypt(upper(trim(p_secret)), r.secret_hash) then
    return jsonb_build_object('error', 'not_found');
  end if;
  return public.report_view(r);
end $$;

-- Konfirmasi pelapor setelah instansi menyatakan selesai: diterima -> 'selesai', ditolak -> 'dibuka_kembali'.
create function public.confirm_resolution(p_public_id text, p_secret text, p_resolved boolean, p_note text default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r public.reports; v_status text := case when p_resolved then 'selesai' else 'dibuka_kembali' end;
        v_due timestamptz := case when p_resolved then null else public.add_working_days(now(), 14) end;
begin
  select * into r from public.reports where public_id = upper(trim(p_public_id)) for update;
  if not found or r.secret_hash <> extensions.crypt(upper(trim(p_secret)), r.secret_hash) then
    return jsonb_build_object('error', 'not_found');
  end if;
  if r.status <> 'selesai_instansi' then
    return jsonb_build_object('error', 'invalid_state');
  end if;
  update public.reports set status = v_status, due_at = v_due, updated_at = now() where id = r.id returning * into r;
  insert into public.report_events (report_id, status, actor, note, due_at)
  values (r.id, v_status, 'pelapor', left(p_note, 500), v_due);
  return public.report_view(r);
end $$;

-- Timeline publik: hanya laporan terverifikasi; tanpa kontak, deskripsi, maupun foto.
create function public.public_reports(p_region_code text default null, p_limit int default 50)
returns table (public_id text, category text, fertilizer_id text, region_code text, region_name text,
               kiosk_name text, status text, assigned_agency text, overdue boolean,
               created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.public_id, r.category, r.fertilizer_id, r.region_code, g.name, r.kiosk_name, r.status,
         r.assigned_agency, (r.due_at is not null and now() > r.due_at and r.status not in ('selesai', 'ditolak')),
         r.created_at, r.updated_at
  from public.reports r join public.regions g on g.code = r.region_code
  where r.status not in ('diterima', 'ditolak')
    and (p_region_code is null or r.region_code = p_region_code or g.parent_code = p_region_code)
  order by r.updated_at desc
  limit least(p_limit, 200)
$$;

-- Statistik agregat (dua indikator selesai). Mencakup semua laporan, tanpa detail apa pun.
create function public.report_stats(p_region_code text default null)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'total', count(*),
    'menunggu_verifikasi', count(*) filter (where r.status = 'diterima'),
    'dalam_proses', count(*) filter (where r.status in ('diverifikasi', 'diteruskan', 'ditindaklanjuti', 'dibuka_kembali')),
    'selesai_menurut_instansi', count(*) filter (where r.status in ('selesai_instansi', 'selesai')),
    'selesai_menurut_pelapor', count(*) filter (where r.status = 'selesai'),
    'terlambat', count(*) filter (where r.due_at < now() and r.status not in ('selesai', 'ditolak')))
  from public.reports r join public.regions g on g.code = r.region_code
  where p_region_code is null or r.region_code = p_region_code or g.parent_code = p_region_code
$$;

-- ---------- RPC petugas ----------
create function public.officer_update_status(p_report_id uuid, p_status text, p_note text,
                                             p_agency text default null, p_needs_field_check boolean default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r public.reports; o public.officers; v_due timestamptz;
begin
  select * into o from public.officers where user_id = auth.uid();
  if not found then raise exception 'Hanya petugas terdaftar'; end if;
  if p_status not in ('diverifikasi', 'diteruskan', 'ditindaklanjuti', 'selesai_instansi', 'ditolak') then
    raise exception 'Status tidak valid untuk petugas: %', p_status;
  end if;
  if coalesce(trim(p_note), '') = '' then raise exception 'Catatan tindak lanjut wajib diisi'; end if;

  select * into r from public.reports where id = p_report_id for update;
  if not found then raise exception 'Laporan tidak ditemukan'; end if;
  if r.status in ('selesai', 'ditolak') then raise exception 'Laporan sudah ditutup'; end if;

  v_due := case p_status
    when 'selesai_instansi' then now() + interval '10 days'
    when 'ditolak' then null
    else public.add_working_days(now(),
           case when coalesce(p_needs_field_check, r.needs_field_check) then 60 else 14 end)
  end;

  update public.reports set status = p_status, due_at = v_due, updated_at = now(),
         assigned_agency = coalesce(p_agency, assigned_agency),
         needs_field_check = coalesce(p_needs_field_check, needs_field_check)
  where id = r.id;
  insert into public.report_events (report_id, status, actor, officer_id, agency, note, due_at)
  values (r.id, p_status, 'petugas', o.user_id, coalesce(p_agency, o.agency), p_note, v_due);
  return jsonb_build_object('ok', true, 'status', p_status, 'due_at', v_due);
end $$;

-- ---------- Hak eksekusi ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.het_on(text, date)                         to anon, authenticated;
grant execute on function public.submit_report(jsonb)                       to anon, authenticated;
grant execute on function public.track_report(text, text)                   to anon, authenticated;
grant execute on function public.confirm_resolution(text, text, boolean, text) to anon, authenticated;
grant execute on function public.public_reports(text, int)                  to anon, authenticated;
grant execute on function public.report_stats(text)                         to anon, authenticated;
grant execute on function public.is_officer()                               to authenticated;
grant execute on function public.officer_update_status(uuid, text, text, text, boolean) to authenticated;

-- ---------- Storage: foto bukti (private) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-evidence', 'report-evidence', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "anon upload evidence" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'report-evidence');
create policy "officer read evidence" on storage.objects for select to authenticated
  using (bucket_id = 'report-evidence' and public.is_officer());
