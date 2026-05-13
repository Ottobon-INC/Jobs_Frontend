
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/jobs_backend/jobs.backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogs() {
    console.log("Checking jobs_blogs table...");
    const { data, error } = await supabase
        .from('jobs_blogs')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error fetching blogs:", error);
        return;
    }

    console.log(`Found ${data.length} blogs.`);
    if (data.length > 0) {
        data.forEach((blog, i) => {
            console.log(`\nBlog ${i+1}:`);
            console.log(`Title: ${blog.title}`);
            console.log(`Slug: ${blog.slug}`);
            console.log(`Published At: ${blog.published_at}`);
            console.log(`Created At: ${blog.created_at}`);
        });
    } else {
        console.log("Table is empty.");
    }
}

checkBlogs();
