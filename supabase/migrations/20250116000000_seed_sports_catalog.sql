-- Seed the sports catalog with all water sports
-- This ensures all sports exist in the database for the UI

INSERT INTO public.sports (name) VALUES 
  ('Surfing'),
  ('Scuba Diving'),
  ('Kitesurfing'),
  ('Kayaking'),
  ('Paddleboarding'),
  ('Windsurfing')
ON CONFLICT (name) DO NOTHING;

-- Add any additional sports that might be needed
INSERT INTO public.sports (name) VALUES 
  ('Jet Ski'),
  ('Sailing'),
  ('Canoeing'),
  ('Swimming'),
  ('Snorkeling'),
  ('Wakeboarding')
ON CONFLICT (name) DO NOTHING;
