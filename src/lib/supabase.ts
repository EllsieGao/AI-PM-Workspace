import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('【AIPM】Supabase 环境变量未加载，请检查 Vercel 环境变量配置！')
  }

  return createSupabaseClient(supabaseUrl || '', supabaseAnonKey || '')
}
