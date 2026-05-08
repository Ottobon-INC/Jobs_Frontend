const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    const { data, error } = await supabase.from('interview_materials').select('*');
    if (data) {
        for (let row of data) {
            if (row.file_url.startsWith('/storage')) {
                const newUrl = `${SUPABASE_URL}${row.file_url}`;
                await supabase.from('interview_materials').update({ file_url: newUrl }).eq('id', row.id);
                console.log(`Updated ${row.id} to ${newUrl}`);
            }
        }
    } else if (error) {
        console.error('Error fetching data:', error);
    }
}

fix();
