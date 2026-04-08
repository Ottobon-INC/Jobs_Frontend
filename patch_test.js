import axios from 'axios';

async function test() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('http://localhost:8001/auth/login', {
            email: 'saisashank6666@gmail.com',
            password: '12345678'
        });
        
        const token = loginRes.data.access_token;
        console.log("Got token.");
        
        console.log("Patching avatar_url...");
        const patchRes = await axios.patch('http://localhost:8001/users/me', {
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
