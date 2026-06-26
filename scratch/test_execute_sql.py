import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

print("Attempting to run SELECT 1 via execute_sql RPC...")
try:
    # Try different param names if 'sql' fails
    # Let's try 'sql_query' first, or 'sql'
    res = supabase.rpc("execute_sql", {"sql": "SELECT 1 as val;"}).execute()
    print("SUCCESS with 'sql' parameter! Result:", res.data)
except Exception as e:
    print("Failed with 'sql' parameter:", str(e))
    
    try:
        res = supabase.rpc("execute_sql", {"query": "SELECT 1 as val;"}).execute()
        print("SUCCESS with 'query' parameter! Result:", res.data)
    except Exception as e2:
        print("Failed with 'query' parameter:", str(e2))
