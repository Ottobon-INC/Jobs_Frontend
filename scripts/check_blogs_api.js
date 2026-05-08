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
    console.log("Fetching list...");
    const { data, error } = await supabase
        .from('jobs_blogs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) {
        console.error("List error:", error);
    } else {
        console.log("List success count:", data.length);
        if (data.length > 0) {
            const slug = data[0].slug;
            console.log("Fetching by slug:", slug);
            const res = await supabase
                .from('jobs_blogs')
                .select('*')
                .or(`slug.eq.${slug},id.eq.${slug}`)
                .single();
            console.log("Fetch single result:", res.error ? res.error : "Success");
        }
    }
}
check();
