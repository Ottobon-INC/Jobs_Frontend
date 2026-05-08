import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

res = supabase.table('saved_jobs').select('*').limit(1).execute()
if res.data:
    print(f"saved_jobs columns: {res.data[0].keys()}")
else:
    print("saved_jobs is empty")

# Check 'jobs' table (legacy?)
try:
    res_legacy = supabase.table('jobs').select('*').limit(1).execute()
    print(f"jobs table columns: {res_legacy.data[0].keys() if res_legacy.data else 'Empty'}")
except Exception as e:
    print(f"jobs table check failed: {e}")
