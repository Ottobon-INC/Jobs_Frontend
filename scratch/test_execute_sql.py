import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

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
