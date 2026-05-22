import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

res = supabase.table('saved_jobs').select('*').execute()
print(f"Total saved jobs in DB: {len(res.data)}")
for row in res.data[:10]:
    print(row)

# Check if any job_id exists in jobs_jobs
if res.data:
    jid = res.data[0]['job_id']
    exists = supabase.table('jobs_jobs').select('id').eq('id', jid).execute()
    print(f"Job {jid} exists in jobs_jobs: {len(exists.data) > 0}")
