import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wmdfrrwcvshozhlqnojr.supabase.co'
const supabaseAnonKey = 'sb_publishable_zrmIhg_SkxPwpOzwQe0kpw_igdpRqq5'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const loginAliases = {
  admin: 'admin@mmarcoseguridad.local',
  tecnico: 'tecnico@mmarcoseguridad.local',
  cliente: 'cliente@mmarcoseguridad.local',
  total: 'total@mmarcoseguridad.local'
}
