import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

supabase = create_client(url, key)

print("Checking user_resumes table...")
try:
    # Let's insert a dummy row or select columns
    # We can select table description or try to query the columns using pg_attribute
    sql_cols = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_resumes';
    """
    res = supabase.rpc("execute_sql_chatbot", {"sql": sql_cols}).execute()
    print("SUCCESS! Columns in user_resumes:")
    # Wait, execute_sql_chatbot returns a dict or status, but does it return results?
    # Let's see if we can select from user_resumes using Supabase client
    res2 = supabase.table("user_resumes").select("*").limit(1).execute()
    print("Supabase client select success! Data:", res2.data)
except Exception as e:
    print("ERROR:", str(e))
