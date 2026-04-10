// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function test() {
    const { data } = supabase.storage.from('avatars').getPublicUrl('test.jpg');
    console.log(data);
}

test();
