import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

res = supabase.table('saved_jobs').select('*').execute()
print(f"saved_jobs count: {len(res.data)}")
if res.data:
    print(f"First saved job: {res.data[0]}")

res_jobs = supabase.table('jobs_jobs').select('id').limit(1).execute()
if res_jobs.data:
    job_id = res_jobs.data[0]['id']
    print(f"Checking join for job {job_id}")
    res_join = supabase.table('saved_jobs').select('job_id, jobs_jobs(*)').eq('job_id', job_id).execute()
    print(f"Join result: {res_join.data}")
