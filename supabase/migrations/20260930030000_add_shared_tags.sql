CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0066cc',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name)
);

CREATE TABLE entity_tags (
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('cheque', 'account', 'party', 'business')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tag_id, entity_type, entity_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tags in their businesses" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tags.business_id
      AND businesses.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tags.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage entity tags in their businesses" ON entity_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tags
      JOIN businesses ON businesses.id = tags.business_id
      WHERE tags.id = entity_tags.tag_id
      AND businesses.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM tags
      JOIN businesses ON businesses.id = tags.business_id
      WHERE tags.id = entity_tags.tag_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE INDEX entity_tags_entity_idx ON entity_tags(entity_type, entity_id);