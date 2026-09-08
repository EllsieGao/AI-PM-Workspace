import { NextResponse } from 'next/server'

// Vercel cron 每 3 天自动访问一次，保持 Supabase 活跃
export async function GET() {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/conversations?select=id&limit=1`,
    { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` } }
  )
  return NextResponse.json({ ok: resp.ok, status: resp.status })
}
