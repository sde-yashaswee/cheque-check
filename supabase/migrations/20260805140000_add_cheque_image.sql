-- Add image_url to cheques
ALTER TABLE cheques ADD COLUMN image_url TEXT;

-- Create storage bucket for cheque images
INSERT INTO storage.buckets (id, name, public) VALUES ('cheque-images', 'cheque-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'cheque-images');
CREATE POLICY "Authenticated users can upload cheque images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cheque-images' AND auth.role() = 'authenticated');
