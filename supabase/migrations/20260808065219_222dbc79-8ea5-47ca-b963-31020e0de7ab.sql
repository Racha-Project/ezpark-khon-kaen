
REVOKE ALL ON FUNCTION public.sync_zone_counters() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_in(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_out() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_out() TO authenticated;
