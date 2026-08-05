-- Add phone and voice call toggle to profiles
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN voice_call_enabled BOOLEAN DEFAULT TRUE;
