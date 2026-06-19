import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

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
