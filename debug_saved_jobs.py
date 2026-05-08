import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

res = supabase.table('saved_jobs').select('*').limit(5).execute()
print(f"saved_jobs data: {res.data}")

# Check if there are any jobs in jobs_jobs
res_jobs = supabase.table('jobs_jobs').select('id').limit(5).execute()
print(f"jobs_jobs IDs: {[j['id'] for j in res_jobs.data]}")
