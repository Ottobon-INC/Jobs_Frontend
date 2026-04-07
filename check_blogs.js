import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    if (line.includes('=')) {
        const [key, val] = line.split('=');
        env[key.trim()] = val.trim();
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking jobs_blogs...");
    const res1 = await supabase.from('jobs_blogs').select('*').limit(1);
    console.log("jobs_blogs:", res1.error || "Success: " + res1.data.length);

    console.log("Checking Jobs_blogs...");
    const res2 = await supabase.from('Jobs_blogs').select('*').limit(1);
    console.log("Jobs_blogs:", res2.error || "Success: " + res2.data.length);
}
check();
