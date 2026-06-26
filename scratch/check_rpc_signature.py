import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

sql_query = """
SELECT proname, prorettype::regtype::text, proargnames 
FROM pg_proc 
WHERE proname LIKE 'execute_sql%';
"""
try:
    res = supabase.rpc("execute_sql", {"sql": sql_query}).execute()
    print("Function signature:")
    # We might get the invalid input syntax for json if we return rows.
    # So let's wrap it in json_agg or similar if it fails, but let's see.
    print(res.data)
except Exception as e:
    print("Error:", str(e))
