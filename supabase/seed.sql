-- Reference data is repeated here so db reset remains deterministic without editing history.
INSERT INTO public.banks (name)
VALUES
  ('State Bank of India'),
  ('HDFC Bank'),
  ('ICICI Bank'),
  ('Axis Bank'),
  ('Punjab National Bank'),
  ('Bank of Baroda'),
  ('Canara Bank'),
  ('Union Bank of India'),
  ('IDBI Bank'),
  ('Kotak Mahindra Bank'),
  ('IndusInd Bank'),
  ('Yes Bank'),
  ('Federal Bank')
ON CONFLICT (name) DO NOTHING;