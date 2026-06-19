import os
from supabase import create_client

url = "http://srv1152901.hstgr.cloud:8000/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzI3MTQzNzMsImV4cCI6MjA4ODA3NDM3M30.NFdQ81nDcu4UNsCVdDWIALerkTwyvb_O9pLe6HpAgy4"

supabase = create_client(url, key)

print("Checking jobs_resumes table...")
try:
    res = supabase.table("jobs_resumes").select("*").limit(1).execute()
    print("SUCCESS: jobs_resumes exists!")
    if res.data:
        print("Columns in jobs_resumes:")
        for k in res.data[0].keys():
            print(f"  - {k}")
    else:
        print("jobs_resumes is empty.")
except Exception as e:
    print("ERROR checking jobs_resumes:", str(e))

print("Checking users_jobs table columns...")
try:
    res = supabase.table("users_jobs").select("*").limit(1).execute()
    if res.data:
        print("Columns in users_jobs:")
        for k in res.data[0].keys():
            print(f"  - {k}")
    else:
        print("users_jobs is empty.")
except Exception as e:
    print("ERROR checking users_jobs:", str(e))
