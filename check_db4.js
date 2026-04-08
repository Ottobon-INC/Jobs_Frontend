import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Checking DB for Sai Sashank in full_name...");
    const { data, error } = await supabase.from('users_jobs').select('*').ilike('full_name', '%Sai Sashank%');
    console.log("Output:", data, "Error:", error);
}

check();
