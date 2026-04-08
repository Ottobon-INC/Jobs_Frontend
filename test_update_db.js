import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4';

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
