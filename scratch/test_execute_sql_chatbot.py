import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

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
