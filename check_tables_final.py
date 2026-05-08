import os
from dotenv import load_dotenv
from supabase import create_client

# Use absolute path to backend .env
load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    # Fallback to frontend .env if needed
    load_dotenv('d:/Ottobon/jobs_Frontend/Jobs_Frontend/.env')
    url = os.getenv('VITE_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

def check_tables():
    # Try to fetch some rows from common table names to see which ones exist
    tables = [
        "saved_jobs", 
        "users_jobs", 
        "jobs_jobs", 
        "user_saved_jobs", 
        "saved_jobs_jobs"
    ]
    
    for t in tables:
        try:
            res = supabase.table(t).select("*").limit(1).execute()
            print(f"Table '{t}' exists. Sample data: {res.data}")
        except Exception as e:
            print(f"Table '{t}' check failed: {e}")

if __name__ == "__main__":
    check_tables()
