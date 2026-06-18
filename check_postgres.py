import os
from dotenv import load_dotenv

load_dotenv('d:/Ottobon/jobs_Backend/Jobs_Backend/.env')
db_url = os.getenv('DATABASE_URL')

print("DATABASE_URL:", db_url)

try:
    import psycopg2
    print("psycopg2 is installed")
    
    # Try connecting
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = [row[0] for row in cur.fetchall()]
    print("Connection successful! Tables in database:")
    for table in sorted(tables):
        print(f"- {table}")
    cur.close()
    conn.close()
except ImportError:
    print("psycopg2 is NOT installed")
    try:
        from sqlalchemy import create_engine, text
        print("sqlalchemy is installed")
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [row[0] for row in result]
            print("Connection successful! Tables in database:")
            for table in sorted(tables):
                print(f"- {table}")
    except ImportError:
        print("sqlalchemy is NOT installed")
except Exception as e:
    print(f"Error connecting to Postgres: {e}")
