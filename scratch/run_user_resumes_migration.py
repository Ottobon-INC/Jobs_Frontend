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

CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
"""

print("Running DDL to create user_resumes...")
try:
    res = supabase.rpc("execute_sql", {"sql": sql_create}).execute()
    print("SUCCESS! user_resumes table created or updated.")
except Exception as e:
    print("ERROR running migration:", str(e))
