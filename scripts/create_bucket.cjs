const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

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
