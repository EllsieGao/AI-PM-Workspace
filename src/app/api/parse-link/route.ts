import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 AIPM-LinkParser' },
    })
    const html = await res.text()

    let title = url
    let description = ''

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) title = titleMatch[1].trim()

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
      || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)
    if (descMatch) description = descMatch[1].trim()

    // Try og:title as fallback for title
    if (!titleMatch) {
      const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)
      if (ogTitle) title = ogTitle[1].trim()
    }

    return NextResponse.json({ title, description, url })
  } catch {
    return NextResponse.json({ title: url, description: '', url })
  }
}
