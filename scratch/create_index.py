import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

sql_index = "CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);"

try:
    res = supabase.rpc("execute_sql_chatbot", {"sql": sql_index}).execute()
    print("SUCCESS! Index created:", res.data)
except Exception as e:
    print("ERROR creating index:", str(e))
