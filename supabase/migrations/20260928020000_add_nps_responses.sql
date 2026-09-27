-- Net Promoter Score responses collected after cheque creation
CREATE TABLE nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  cheque_id UUID REFERENCES cheques(id) ON DELETE SET NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment TEXT CHECK (comment IS NULL OR char_length(comment) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX nps_responses_user_created_idx
  ON nps_responses (user_id, created_at DESC);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own NPS responses" ON nps_responses
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Responses are immutable: insert-only, and only against the user's own business/cheque.
CREATE POLICY "Users can submit their own NPS responses" ON nps_responses
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND (
      business_id IS NULL
      OR EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
    )
    AND (
      cheque_id IS NULL
      OR EXISTS (
        SELECT 1 FROM cheques c
        JOIN businesses b ON b.id = c.business_id
        WHERE c.id = cheque_id AND b.user_id = auth.uid()
      )
    )
  );
