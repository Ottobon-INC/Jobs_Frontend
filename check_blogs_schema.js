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
    console.log("Fetching jobs_blogs schema...");
    const { data, error } = await supabase.from('jobs_blogs').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        console.log("Keys:", Object.keys(data[0]));
        console.log("Post 1 keys and titles:", data.map(d => ({id: d.id, title: d.title, hasContent: !!d.content})));
    }
}
check();
