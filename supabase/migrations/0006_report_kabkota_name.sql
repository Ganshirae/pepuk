-- 0006: Simpan nama kab/kota (teks) untuk laporan di provinsi yang belum punya data kab/kota di tabel regions.
alter table public.reports add column kabkota_name text check (length(kabkota_name) <= 100);

do $$
declare src text;
begin
  select pg_get_functiondef('public.submit_report(jsonb)'::regprocedure) into src;
  src := replace(src, 'insert into public.reports (public_id, secret_hash, category, fertilizer_id, region_code, kecamatan, desa,',
                      'insert into public.reports (public_id, secret_hash, category, fertilizer_id, region_code, kabkota_name, kecamatan, desa,');
  src := replace(src, $r$p->>'region_code', nullif(trim(p->>'kecamatan'), ''),$r$,
                      $r$p->>'region_code', nullif(trim(left(p->>'kabkota_name', 100)), ''), nullif(trim(p->>'kecamatan'), ''),$r$);
  if position('kabkota_name' in src) = 0 then raise exception 'patch gagal'; end if;
  execute src;
end $$;

create or replace function public.report_view(p_report public.reports)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'public_id', p_report.public_id, 'category', p_report.category, 'fertilizer_id', p_report.fertilizer_id,
    'region_code', p_report.region_code, 'region_name', (select name from public.regions where code = p_report.region_code),
    'kabkota_name', p_report.kabkota_name,
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
revoke execute on function public.report_view(public.reports) from public, anon, authenticated;
