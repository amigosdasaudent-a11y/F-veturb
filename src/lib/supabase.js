import { createClient } from '@supabase/supabase-js'

const env = import.meta.env || {}
export const supabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY)
export const supabase = supabaseConfigured
  ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

let cloudEnabled = false
let saveTimer
export const setCloudReady = value => { cloudEnabled = value }

export async function getCloudSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCloudState() {
  if (!supabase) return null
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return null
  const { data, error } = await supabase.from('veturb_state').select('payload').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return data?.payload || null
}

export async function syncCloudState(state) {
  if (!supabase || !state?.session?.id) return
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return
  const { session, ...payload } = state
  const { error } = await supabase.from('veturb_state').upsert({
    user_id: user.id,
    payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) console.error('Falha ao salvar no Supabase:', error.message)
}

export function scheduleCloudSync(state) {
  if (!cloudEnabled || !state?.session?.id) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => syncCloudState(state), 500)
}
