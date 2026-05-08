import os
import psycopg2
from dotenv import load_dotenv

def main():
    # Load backend env
    load_dotenv(r'c:\jobs_backend\jobs.backend\.env')
    url = os.environ.get("SUPABASE_URL")
    pwd = os.environ.get("SUPABASE_DB_PASSWORD")
    
    # Supabase URL format: https://xyz.supabase.co
    if not url or not pwd:
        print("Missing SUPABASE_URL or SUPABASE_DB_PASSWORD")
        return
        
    project_id = url.replace("https://", "").split(".")[0]
    
    # Supabase direct connection string format:
    # postgresql://postgres.[project_id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    # Actually, a simpler way is using the supabase python client to call a stored procedure if one exists, 
    # but we don't have one for arbitrary SQL.
    # What if SUPABASE_URL is all we have? Is there a DATABASE_URL?
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env, trying to construct it...")
        # A common default for Supabase Postgres is:
        host = f"db.{project_id}.supabase.co"
        db_url = f"postgresql://postgres:{pwd}@{host}:5432/postgres"

    print(f"Connecting to: {db_url.replace(pwd, '***')}")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Add column
        cur.execute("ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS exam_date TEXT;")
        print("Successfully added exam_date to playbooks table!")
        
        # Test it
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='playbooks' AND column_name='exam_date';")
        print(f"Verify column: {cur.fetchall()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
