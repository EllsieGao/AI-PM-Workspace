-- RLS policies for research_notes table
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own research_notes"
  ON research_notes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own research_notes"
  ON research_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own research_notes"
  ON research_notes FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own research_notes"
  ON research_notes FOR DELETE
  USING (true);

-- RLS policies for competitors table
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitors"
  ON competitors FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own competitors"
  ON competitors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own competitors"
  ON competitors FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own competitors"
  ON competitors FOR DELETE
  USING (true);
