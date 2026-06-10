import os
from dotenv import load_dotenv
from supabase import create_client

def test_alter_owner():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    # Try to change the owner of the playbooks table
    try:
        q = "ALTER TABLE playbooks OWNER TO postgres;"
        print(f"Running: {q}")
        res = supabase.rpc("execute_sql", {"sql": q}).execute()
        print("Success!", res.data)
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_alter_owner()
