// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testStoragePolicies() {
    console.log("Checking storage policies...");
    
    // We can query pg_policies using the service key
    const { data, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'objects');
    if (error) {
        console.error("Error fetching policies:", error);
    } else {
        console.log("Policies on storage.objects:");
        console.log(data);
    }
}

testStoragePolicies();
