import sys
import os

# Change current working directory to backend folder so Pydantic finds .env
os.chdir(r"d:\Ottobon\Jobs_backend\Jobs_Backend")

# Add backend to python path to import settings
sys.path.append(r"d:\Ottobon\Jobs_backend\Jobs_Backend")
from app.config import settings

print("Database URL:", settings.database_url)

try:
    from sqlalchemy import create_engine, text
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        print("SUCCESS: Connected to PostgreSQL using SQLAlchemy!")
        # Let's list the tables
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in result.fetchall()]
        print("Tables in public schema:")
        for table in tables:
            print(f"  - {table}")
except Exception as e:
    print("ERROR connecting to PostgreSQL:", str(e))
