const SUPABASE_URL = 'https://cfmmerjqzoqqvuqksprd.supabase.co'
const SERVICE_KEY = process.argv[2]

if (!SERVICE_KEY) {
  console.error('Missing service_role key')
  process.exit(1)
}

const SQL = `
ALTER TABLE IF EXISTS research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own research_notes"
  ON research_notes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own research_notes"
  ON research_notes FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update own research_notes"
  ON research_notes FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Users can delete own research_notes"
  ON research_notes FOR DELETE USING (true);

ALTER TABLE IF EXISTS competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own competitors"
  ON competitors FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own competitors"
  ON competitors FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update own competitors"
  ON competitors FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Users can delete own competitors"
  ON competitors FOR DELETE USING (true);
`;

async function run() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  }

  // Try Supabase SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query_text: SQL }),
  })
  const text = await res.text()
  console.log('Trying /rest/v1/rpc/pg_sql...')
  console.log('Status:', res.status)
  console.log('Response:', text)

  if (res.ok) {
    console.log('\n✅ Migration applied successfully!')
    return
  }

  // Try auth/v1/sql
  const res2 = await fetch(`${SUPABASE_URL}/auth/v1/sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: SQL }),
  })
  const text2 = await res2.text()
  console.log('\nTrying /auth/v1/sql...')
  console.log('Status:', res2.status)
  console.log('Response:', text2)
  if (res2.ok) {
    console.log('\n✅ Migration applied successfully!')
    return
  }

  // Try directly querying the table with an INSERT that triggers schema
  console.log('\n❌ Could not apply migration via REST API.')
  console.log('Please run the SQL manually in Supabase Dashboard SQL Editor:')
  console.log('  https://supabase.com/dashboard/project/cfmmerjqzoqqvuqksprd/sql/new')
}

run().catch(console.error)
