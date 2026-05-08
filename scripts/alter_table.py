import os
import asyncio
from dotenv import load_dotenv
import asyncpg

async def main():
    load_dotenv(r'c:\jobs_backend\jobs.backend\.env')
    url = os.environ.get("SUPABASE_URL")
    pwd = os.environ.get("SUPABASE_DB_PASSWORD")
    
    # Construct postgres connection string
    # e.g. https://xxx.supabase.co -> postgres://postgres.xxx:pwd@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
    # Easier way: if SUPABASE_URL is available, usually the host is the same but with db. prefix
    host = url.replace("https://", "").split(".")[0] + ".supabase.co"
    host = host.replace("supabase.co", "supabase.co")  # Usually db.id.supabase.co
    # Wait, the best way to get the conn string without guessing is using the supabase library if possible.
    # Actually, we can just use the standard REST API with supabase-py? No, REST API can't do DDL (ALTER TABLE).
    
    # Let me just try to use REST API to insert a row with exam_date to see if PostgREST auto-creates? No it doesn't.
    print(f"URL: {url}")
