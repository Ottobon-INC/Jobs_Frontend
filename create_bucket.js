const axios = require('axios');

const SUPABASE_URL = 'http://srv1152901.hstgr.cloud:8000';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4';

async function createBucket() {
  try {
    const response = await axios.post(`${SUPABASE_URL}/storage/v1/bucket`, {
      id: 'public',
      name: 'public',
      public: true,
      file_size_limit: 3145728, // 3MB
      allowed_mime_types: [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Bucket created successfully:', response.data);
  } catch (error) {
    console.error('Error creating bucket:', error.response ? error.response.data : error.message);
  }
}

createBucket();
