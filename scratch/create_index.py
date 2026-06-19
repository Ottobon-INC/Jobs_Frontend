import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

supabase = create_client(url, key)

sql_index = "CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);"

try:
    res = supabase.rpc("execute_sql_chatbot", {"sql": sql_index}).execute()
    print("SUCCESS! Index created:", res.data)
except Exception as e:
    print("ERROR creating index:", str(e))
