import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log("Updating avatars bucket limit to 2MB...");
    const { error: updateErr } = await supabase.storage.updateBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });
    if (updateErr) {
        console.log("Error updating bucket:", updateErr);
    } else {
        console.log("Successfully updated bucket size limit to 2MB.");
    }
}

fix();
