-- RLS policies for requirements table
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON requirements FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON requirements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON requirements FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON requirements FOR DELETE
  USING (true);

-- RLS policies for dev_tasks table (if not already set)
ALTER TABLE dev_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON dev_tasks FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON dev_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON dev_tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON dev_tasks FOR DELETE
  USING (true);
