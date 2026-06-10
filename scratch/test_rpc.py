import os
from dotenv import load_dotenv
from supabase import create_client

def test_rpc():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    # Try calling a common RPC for SQL execution
    try:
        res = supabase.rpc("exec_sql", {"sql": "ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;"}).execute()
        print("Success using exec_sql RPC!")
        print(res.data)
        return
    except Exception as e:
        print(f"exec_sql RPC failed: {e}")
        
    try:
        res = supabase.rpc("execute_sql", {"query": "ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;"}).execute()
        print("Success using execute_sql RPC!")
        print(res.data)
        return
    except Exception as e:
        print(f"execute_sql RPC failed: {e}")

if __name__ == "__main__":
    test_rpc()
