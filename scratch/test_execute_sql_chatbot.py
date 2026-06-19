import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

supabase = create_client(url, key)

sql_create = """
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'My Resume',
    resume_data JSONB NOT NULL,
    styling_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
"""

print("Attempting to run CREATE TABLE via execute_sql_chatbot...")
try:
    res = supabase.rpc("execute_sql_chatbot", {"sql": sql_create}).execute()
    print("SUCCESS! Result:", res.data)
except Exception as e:
    print("Failed with 'sql' parameter:", str(e))
    
    try:
        res = supabase.rpc("execute_sql_chatbot", {"query": sql_create}).execute()
        print("SUCCESS! Result:", res.data)
    except Exception as e2:
        print("Failed with 'query' parameter:", str(e2))
