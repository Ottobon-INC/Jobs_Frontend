import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

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
