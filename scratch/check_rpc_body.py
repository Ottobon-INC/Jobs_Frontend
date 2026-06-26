import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

sql_query = "SELECT prosrc FROM pg_proc WHERE proname = 'execute_sql';"
try:
    res = supabase.rpc("execute_sql", {"sql": sql_query}).execute()
    print("Function Body:")
    print(res.data)
except Exception as e:
    print("Error:", str(e))
