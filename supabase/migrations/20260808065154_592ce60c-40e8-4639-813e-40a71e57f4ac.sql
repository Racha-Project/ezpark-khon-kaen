
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  vehicle_type text NOT NULL DEFAULT 'motorcycle',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ZONES
CREATE TABLE public.parking_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL UNIQUE,
  total_slots int NOT NULL DEFAULT 0,
  available_slots int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parking_zones TO authenticated, anon;
GRANT ALL ON public.parking_zones TO service_role;
ALTER TABLE public.parking_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zones readable" ON public.parking_zones FOR SELECT TO authenticated, anon USING (true);

-- SLOTS
CREATE TABLE public.parking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.parking_zones(id) ON DELETE CASCADE,
  slot_number text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  UNIQUE (zone_id, slot_number)
);
GRANT SELECT ON public.parking_slots TO authenticated, anon;
GRANT ALL ON public.parking_slots TO service_role;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots readable" ON public.parking_slots FOR SELECT TO authenticated, anon USING (true);

-- SESSIONS
CREATE TABLE public.parking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '',
  zone_id uuid NOT NULL REFERENCES public.parking_zones(id),
  slot_id uuid NOT NULL REFERENCES public.parking_slots(id),
  vehicle_type text NOT NULL DEFAULT 'motorcycle',
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'PARKED'
);
GRANT SELECT ON public.parking_sessions TO authenticated;
GRANT ALL ON public.parking_sessions TO service_role;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.parking_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- keep zone counters in sync
CREATE OR REPLACE FUNCTION public.sync_zone_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE zid uuid;
BEGIN
  zid := COALESCE(NEW.zone_id, OLD.zone_id);
  UPDATE public.parking_zones z
  SET total_slots = s.total,
      available_slots = s.avail,
      status = CASE WHEN s.avail = 0 THEN 'full' WHEN s.avail <= GREATEST(1, s.total / 5) THEN 'almost_full' ELSE 'available' END
  FROM (
    SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'available')::int AS avail
    FROM public.parking_slots WHERE zone_id = zid
  ) s
  WHERE z.id = zid;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_sync_zone_counters
AFTER INSERT OR UPDATE OR DELETE ON public.parking_slots
FOR EACH ROW EXECUTE FUNCTION public.sync_zone_counters();

-- CHECK IN
CREATE OR REPLACE FUNCTION public.check_in(p_zone_id uuid, p_vehicle_type text, p_username text)
RETURNS public.parking_sessions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slot public.parking_slots; v_session public.parking_sessions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.parking_sessions WHERE user_id = auth.uid() AND status = 'PARKED') THEN
    RAISE EXCEPTION 'ALREADY_PARKED';
  END IF;
  SELECT * INTO v_slot FROM public.parking_slots
   WHERE zone_id = p_zone_id AND status = 'available'
   ORDER BY slot_number FOR UPDATE SKIP LOCKED LIMIT 1;
  IF v_slot.id IS NULL THEN RAISE EXCEPTION 'ZONE_FULL'; END IF;
  UPDATE public.parking_slots SET status = 'occupied' WHERE id = v_slot.id;
  INSERT INTO public.parking_sessions (user_id, username, zone_id, slot_id, vehicle_type)
  VALUES (auth.uid(), COALESCE(p_username, ''), p_zone_id, v_slot.id, COALESCE(p_vehicle_type, 'motorcycle'))
  RETURNING * INTO v_session;
  RETURN v_session;
END; $$;
GRANT EXECUTE ON FUNCTION public.check_in(uuid, text, text) TO authenticated;

-- CHECK OUT
CREATE OR REPLACE FUNCTION public.check_out()
RETURNS public.parking_sessions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session public.parking_sessions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.parking_sessions
     SET check_out_time = now(), status = 'COMPLETED'
   WHERE user_id = auth.uid() AND status = 'PARKED'
  RETURNING * INTO v_session;
  IF v_session.id IS NULL THEN RAISE EXCEPTION 'NO_ACTIVE_SESSION'; END IF;
  UPDATE public.parking_slots SET status = 'available' WHERE id = v_session.slot_id;
  RETURN v_session;
END; $$;
GRANT EXECUTE ON FUNCTION public.check_out() TO authenticated;

-- DEMO DATA
INSERT INTO public.parking_zones (zone_name, total_slots, available_slots) VALUES
  ('Zone A', 20, 12), ('Zone B', 15, 3), ('Zone C', 15, 0), ('Zone D', 10, 5);

INSERT INTO public.parking_slots (zone_id, slot_number, status)
SELECT z.id,
       upper(right(z.zone_name,1)) || lpad(g::text, 2, '0'),
       CASE WHEN g <= occ THEN 'occupied' ELSE 'available' END
FROM (VALUES ('Zone A',20,8), ('Zone B',15,12), ('Zone C',15,15), ('Zone D',10,5)) AS d(name, total, occ)
JOIN public.parking_zones z ON z.zone_name = d.name
CROSS JOIN LATERAL generate_series(1, d.total) AS g;

ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_sessions;
