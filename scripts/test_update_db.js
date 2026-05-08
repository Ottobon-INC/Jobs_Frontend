// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const userId = '4f35cbd3-8182-4fe3-9f08-8b6c07ab5007'; // from previous script
    const testUrl = 'https://example.com/avatar.jpg';
    
    // Test update
    console.log("Updating avatar...");
    const { data: updateData, error: updateErr } = await supabase
        .from('users_jobs')
        .update({ avatar_url: testUrl })
        .eq('id', userId)
        .select();
        
    console.log("Update output:", updateData, "Error:", updateErr);
}

check();
