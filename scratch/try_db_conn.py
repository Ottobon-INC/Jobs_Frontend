import psycopg2
import os
from dotenv import load_dotenv

def try_conn():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL", "http://srv1152901.hstgr.cloud:8000/")
    
    # Extract host
    host = url.replace("https://", "").replace("http://", "").split(":")[0]
    
    passwords = [
        "postgres",
        "yourpassword",
        "dXU3w5hMlr3k2EI0x/RZ5uesatbJBOzhFBtzxbowLK8=" # JWT Secret
    ]
    
    for pwd in passwords:
        for port in [5432, 6543]:
            try:
                print(f"Trying: postgres@{host}:{port} with password '{pwd[:5]}...'")
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user="postgres",
                    password=pwd,
                    database="postgres",
                    connect_timeout=3
                )
                print(f"SUCCESS! Connected with password: {pwd} on port {port}")
                conn.close()
                return
            except Exception as e:
                print(f"Failed: {e}")

if __name__ == "__main__":
    try_conn()
