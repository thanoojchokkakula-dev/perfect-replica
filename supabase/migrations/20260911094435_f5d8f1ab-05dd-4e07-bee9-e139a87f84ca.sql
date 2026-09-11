CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'Unknown model',
  phone_number TEXT,
  os TEXT NOT NULL DEFAULT 'Android',
  battery INTEGER NOT NULL DEFAULT 100,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices_own" ON public.devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_number TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'incoming',
  body TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_device_idx ON public.messages(device_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_own" ON public.messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_number TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'incoming',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX calls_device_idx ON public.calls(device_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calls TO authenticated;
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calls_own" ON public.calls FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  accuracy_meters INTEGER NOT NULL DEFAULT 10,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX locations_device_idx ON public.locations(device_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_own" ON public.locations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX contacts_device_idx ON public.contacts(device_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_own" ON public.contacts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.seed_device_demo_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  names TEXT[] := ARRAY['Mom','Alex Carter','Sofia Nguyen','Work','Daniel Reed','Priya Sharma','Liam Walsh'];
  numbers TEXT[] := ARRAY['+1 202 555 0132','+1 202 555 0177','+1 202 555 0148','+1 202 555 0109','+1 202 555 0191','+1 202 555 0126','+1 202 555 0165'];
  bodies TEXT[] := ARRAY[
    'Hey, are you on your way?',
    'Don''t forget to pick up the keys.',
    'Call me when you get this please.',
    'Meeting moved to 3pm today.',
    'Happy birthday! Have a great one.',
    'I''ll be home in about 20 minutes.',
    'Can you send me the address again?',
    'Thanks, got it!',
    'Lunch tomorrow?',
    'Photos are uploaded already.'
  ];
  places TEXT[] := ARRAY['Central Park, New York','5th Avenue, New York','Brooklyn Bridge, New York','Times Square, New York','Grand Central Terminal, New York','Chelsea Market, New York'];
  i INTEGER;
  idx INTEGER;
BEGIN
  FOR i IN 1..24 LOOP
    idx := 1 + (i % 7);
    INSERT INTO public.messages (device_id, contact_name, contact_number, direction, body, occurred_at)
    VALUES (
      NEW.id, names[idx], numbers[idx],
      CASE WHEN i % 2 = 0 THEN 'incoming' ELSE 'outgoing' END,
      bodies[1 + (i % 10)],
      now() - (i * interval '47 minutes')
    );
  END LOOP;

  FOR i IN 1..14 LOOP
    idx := 1 + (i % 7);
    INSERT INTO public.calls (device_id, contact_name, contact_number, direction, duration_seconds, occurred_at)
    VALUES (
      NEW.id, names[idx], numbers[idx],
      CASE WHEN i % 3 = 0 THEN 'missed' WHEN i % 2 = 0 THEN 'incoming' ELSE 'outgoing' END,
      CASE WHEN i % 3 = 0 THEN 0 ELSE 45 + (i * 37) % 900 END,
      now() - (i * interval '3 hours')
    );
  END LOOP;

  FOR i IN 1..12 LOOP
    INSERT INTO public.locations (device_id, latitude, longitude, address, accuracy_meters, occurred_at)
    VALUES (
      NEW.id,
      40.7128 + (i * 0.0043),
      -74.0060 + (i * 0.0037),
      places[1 + (i % 6)],
      5 + (i * 3) % 40,
      now() - (i * interval '90 minutes')
    );
  END LOOP;

  FOR i IN 1..7 LOOP
    INSERT INTO public.contacts (device_id, name, phone_number, email)
    VALUES (NEW.id, names[i], numbers[i], lower(replace(names[i], ' ', '.')) || '@example.com');
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_device_created
AFTER INSERT ON public.devices
FOR EACH ROW EXECUTE FUNCTION public.seed_device_demo_data();