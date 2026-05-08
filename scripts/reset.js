// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function reset() {
    const userId = '67dfe625-8cef-45a8-8d99-c84fe1f0378d'; // Sai Sashank
    await supabase.from('users_jobs').update({ avatar_url: null }).eq('id', userId);
    console.log("Reset user avatar.");
    
    // Also, apply the storage policies CORRECTLY via API so the user doesn't have to fiddle with SQL!
    // Wait, pg_policies can't be created from REST API, but maybe we can just make sure the bucket allows uploads via an RPC if we create one? No, we don't have python to run migrate!
    // BUT what if the user manually pasted the SQL and got it wrong?
}

reset();
