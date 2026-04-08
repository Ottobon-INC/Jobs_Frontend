import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4';

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
