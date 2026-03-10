import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error(
        'Supabase の環境変数が設定されていません。.env.local を確認してください。'
      )
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// 各ページから直接 getSupabase() を呼ぶ代わりに、
// 既存コードとの互換性のため supabase をエクスポート
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return (getSupabase() as any)[prop]
  },
})
