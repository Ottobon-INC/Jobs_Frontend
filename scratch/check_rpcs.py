import requests
import json

url = "http://srv1152901.hstgr.cloud:8000/rest/v1/"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        schema = response.json()
        print("Schema successfully fetched!")
        
        # List tables
        definitions = schema.get("definitions", {})
        print("\nTables:")
        for table in sorted(definitions.keys()):
            print(f"  - {table}")
            
        # List RPCs (paths starting with /rpc/)
        paths = schema.get("paths", {})
        print("\nRPC Functions:")
        for path in sorted(paths.keys()):
            if path.startswith("/rpc/"):
                print(f"  - {path}")
    else:
        print("Failed to fetch schema. Status code:", response.status_code)
except Exception as e:
    print("Error:", str(e))
