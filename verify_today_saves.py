import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime, timezone

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

# Get current date in ISO format
today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

res = supabase.table('saved_jobs').select('*').gte('created_at', today).execute()
print(f"Saved jobs today: {len(res.data)}")
for row in res.data:
    print(row)
    jid = row['job_id']
    exists = supabase.table('jobs_jobs').select('id').eq('id', jid).execute()
    print(f"  Job {jid} exists in jobs_jobs: {len(exists.data) > 0}")
