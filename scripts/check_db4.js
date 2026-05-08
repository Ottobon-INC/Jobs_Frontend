// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Checking DB for Sai Sashank in full_name...");
    const { data, error } = await supabase.from('users_jobs').select('*').ilike('full_name', '%Sai Sashank%');
    console.log("Output:", data, "Error:", error);
}

check();
