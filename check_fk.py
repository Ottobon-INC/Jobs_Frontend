import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('d:/Ottobon\jobs_Backend\Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

# Query the information_schema to see foreign keys for saved_jobs
query = """
SELECT
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='saved_jobs';
"""

# Since we can't run raw SQL via the client easily without a RPC, 
# we'll try to guess by looking at the error message again if we can.
# Alternatively, we can try to insert a fake UUID and see the error.

try:
    res = supabase.table('saved_jobs').insert({"user_id": "00000000-0000-0000-0000-000000000000", "job_id": "00000000-0000-0000-0000-000000000000"}).execute()
except Exception as e:
    print(f"Schema check error: {e}")
