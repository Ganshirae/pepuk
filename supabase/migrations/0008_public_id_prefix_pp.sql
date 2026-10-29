-- 0008: Ganti awalan ID publik laporan dari 'TT-' menjadi 'PP-' (nama proyek: PEPUK).
-- Catatan: 0002/0003 di repo sudah memakai 'PP-'; migrasi ini untuk database yang sudah terpasang sebelumnya.
do $$
declare src text;
begin
  select pg_get_functiondef('public.submit_report(jsonb)'::regprocedure) into src;
  if position($r$'TT-'$r$ in src) = 0 then return; end if;
  execute replace(src, $r$'TT-'$r$, $r$'PP-'$r$);
end $$;
