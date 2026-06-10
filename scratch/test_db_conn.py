import socket
import os
from dotenv import load_dotenv

def test_conn():
    load_dotenv(r'd:\Ottobon\Jobs_backend\Jobs_Backend\.env')
    url = os.environ.get("SUPABASE_URL", "http://srv1152901.hstgr.cloud:8000/")
    
    # Extract host
    host = url.replace("https://", "").replace("http://", "").split(":")[0]
    print(f"Testing host: {host}")
    
    for port in [5432, 6543, 8000, 8001]:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3.0)
        try:
            s.connect((host, port))
            print(f"Port {port} is OPEN!")
        except Exception as e:
            print(f"Port {port} is CLOSED ({e})")
        finally:
            s.close()

if __name__ == "__main__":
    test_conn()
