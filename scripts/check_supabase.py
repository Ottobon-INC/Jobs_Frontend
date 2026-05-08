import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client

async def check_supabase():
    load_dotenv()
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_KEY")
    print(f"Connecting to: {url}")
    
    supabase = create_client(url, key)
    
    # Check jobs_jobs
    res = supabase.table("jobs_jobs").select("*").execute()
    print(f"Total jobs in jobs_jobs: {len(res.data)}")
    if res.data:
        print("Columns in first job:", res.data[0].keys())
        for job in res.data:
            print(f"Job: {job.get('title')} | Company: {job.get('company_name')} | Link: {job.get('external_apply_url')}")

if __name__ == "__main__":
    asyncio.run(check_supabase())
