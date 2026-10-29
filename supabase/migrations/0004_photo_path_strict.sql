-- 0004: Path foto di submit_report wajib berformat reports/<uuid>.<jpg|jpeg|png|webp> (cegah path traversal).
do $$
declare src text;
begin
  select pg_get_functiondef('public.submit_report(jsonb)'::regprocedure) into src;
  src := replace(src, $r$x !~ '^[A-Za-z0-9/_.-]{1,200}$'$r$, $r$x !~ '^reports/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'$r$);
  execute src;
end $$;
