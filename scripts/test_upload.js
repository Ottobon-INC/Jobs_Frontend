// SECURITY: Keys loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const API_URL = process.env.VITE_API_URL || 'http://localhost:8001';
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_USER_ID = process.env.TEST_USER_ID;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
if (!TEST_EMAIL || !TEST_PASSWORD) throw new Error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in .env');

async function testUpload() {
    try {
        console.log("Logging in via backend...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        const token = loginRes.data.access_token;
        const userId = TEST_USER_ID || loginRes.data.user_id;
        
        console.log("Creating Supabase client with anon key and user JWT...");
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        console.log("Attempting to upload to avatars bucket...");
        const dummyFile = Buffer.from('hello world', 'utf8');
        const fileName = `${userId}/dummy_${Date.now()}.txt`;
        
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, dummyFile, {
                contentType: 'text/plain',
                upsert: true
            });
            
        if (error) {
            console.error("UPLOAD FAILED WITH ERROR:", error);
        } else {
            console.log("UPLOAD SUCCEEDED:", data);
            
            // cleanup
            await supabase.storage.from('avatars').remove([fileName]);
        }
    } catch(e) {
        console.error("Script failed:", e.response?.data || e.message);
    }
}

testUpload();
