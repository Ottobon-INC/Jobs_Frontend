// SECURITY: Credentials loaded from .env — never hardcoded (OWASP A07)
import 'dotenv/config';
import axios from 'axios';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;
const API_URL = process.env.VITE_API_URL || 'http://localhost:8001';

if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in .env');
}

async function test() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        const token = loginRes.data.access_token;
        console.log("Got token.");
        
        console.log("Patching avatar_url...");
        const patchRes = await axios.patch(`${API_URL}/users/me`, {
            avatar_url: 'https://example.com/avatar.jpg'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("Patch response:", patchRes.data);
    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
    }
}

test();
