// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');

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
