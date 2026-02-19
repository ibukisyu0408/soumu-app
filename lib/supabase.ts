import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url === 'your-supabase-url-here') {
      throw new Error(
        'Supabase の環境変数が設定されていません。.env.local を確認してください。'
      )
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = typeof window !== 'undefined'
  ? new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        return (getSupabase() as any)[prop]
      },
    })
  : (null as unknown as SupabaseClient)
