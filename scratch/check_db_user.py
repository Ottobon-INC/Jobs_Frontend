import os
from dotenv import load_dotenv
from supabase import create_client

def test_db_user():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    queries = [
        "SELECT json_build_object('current_user', current_user, 'session_user', session_user, 'role', current_setting('role', true));",
        "SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) FROM (SELECT tablename, schemaname, tableowner FROM pg_tables WHERE tablename = 'playbooks') t;",
    ]
    
    for q in queries:
        try:
            print(f"Running: {q}")
            res = supabase.rpc("execute_sql", {"sql": q}).execute()
            print("Result:", res.data)
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    test_db_user()
