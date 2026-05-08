import asyncio
import os
from supabase import create_client

async def check():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Missing env vars")
        return
    
    supabase = create_client(url, key)
    try:
        res = supabase.table("material_folders").select("*").limit(1).execute()
        print("Table exists")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Load .env if needed
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(check())
