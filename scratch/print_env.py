import os
print("DATABASE_URL:", os.environ.get("DATABASE_URL"))
print("All keys:")
for k in sorted(os.environ.keys()):
    if "key" in k.lower() or "secret" in k.lower() or "pass" in k.lower():
        print(f"  {k}: [REDACTED]")
    else:
        print(f"  {k}: {os.environ[k]}")
