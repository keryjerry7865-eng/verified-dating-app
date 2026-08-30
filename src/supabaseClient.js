import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidSupabaseUrl = (value) => {
	try {
		const url = new URL(value)
		return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co')
	} catch {
		return false
	}
}

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey
	? 'Supabase configuration is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite.'
	: !isValidSupabaseUrl(supabaseUrl)
		? 'VITE_SUPABASE_URL is invalid. Use your project URL, for example https://your-project-ref.supabase.co.'
		: null

// Keep the module importable so the UI can display a useful configuration error.
export const supabase = createClient(
	supabaseConfigError ? 'https://configuration-error.supabase.co' : supabaseUrl,
	supabaseConfigError ? 'configuration-error-key' : supabaseAnonKey,
)
