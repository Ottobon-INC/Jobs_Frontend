import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzE0MzczLCJleHAiOjIwODgwNzQzNzN9.Aw2WpTZwJOMdBLOt_UUSgnCYDvP87mmA1Zv-vlr8SoQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function test() {
    const { data } = supabase.storage.from('avatars').getPublicUrl('test.jpg');
    console.log(data);
}

test();
