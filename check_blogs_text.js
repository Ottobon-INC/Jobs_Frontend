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
    const { data, error } = await supabase.from('jobs_blogs').select('*').limit(2);
    if (error) {
        console.error(error);
    } else {
        data.forEach((post, i) => {
            console.log(`--- POST ${i+1} ---`);
            console.log("title:", post.title);
            console.log("summary:", post.summary);
            console.log("description:", post.description);
            console.log("content:", post.content);
        });
    }
}
check();
