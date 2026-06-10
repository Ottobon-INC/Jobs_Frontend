import os
from dotenv import load_dotenv
from supabase import create_client

def test_execute_sql():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    sql = "ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;"
    
    # Let's try different parameter names for execute_sql
    params_to_try = [
        {"sql": sql},
        {"sql_query": sql},
        {"statement": sql},
        {"query_string": sql},
        {"query": sql},
    ]
    
    for params in params_to_try:
        try:
            print(f"Trying execute_sql with parameters: {params}")
            res = supabase.rpc("execute_sql", params).execute()
            print(f"SUCCESS with {list(params.keys())[0]}!")
            print(res.data)
            return
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    test_execute_sql()
