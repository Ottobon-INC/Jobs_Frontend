import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzE0MzczLCJleHAiOjIwODgwNzQzNzN9.Aw2WpTZwJOMdBLOt_UUSgnCYDvP87mmA1Zv-vlr8SoQ';

async function testUpload() {
    try {
        const loginRes = await axios.post('http://localhost:8001/auth/login', {
            email: 'saisashank6666@gmail.com',
            password: '12345678'
        });
        
        const token = loginRes.data.access_token;
        const userId = '67dfe625-8cef-45a8-8d99-c84fe1f0378d';
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const dummyFile = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]); 
        const fileName = `${userId}/dummy2_${Date.now()}.png`;
        
        console.log("Uploading without upsert...");
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, dummyFile, {
                contentType: 'image/png',
                upsert: false // <-- THE FIX
            });
            
        if (error) {
            console.error("UPLOAD FAILED WITH ERROR:", error);
        } else {
            console.log("UPLOAD SUCCEEDED:", data);
            await supabase.storage.from('avatars').remove([fileName]);
        }
    } catch(e) {
        console.error("Script failed:", e.response?.data || e.message);
    }
}

testUpload();
