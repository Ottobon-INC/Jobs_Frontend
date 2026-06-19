import sys
import os

# Change current working directory to backend folder so Pydantic finds .env
os.chdir(r"d:\Ottobon\Jobs_backend\Jobs_Backend")

# Add backend to python path
sys.path.append(r"d:\Ottobon\Jobs_backend\Jobs_Backend")

try:
    from main import app
    print("SUCCESS: FastAPI application loaded successfully!")
    
    # List routes to verify our new ones are present
    print("\nRegistered Routes matching '/resume-builder':")
    for route in app.routes:
        if hasattr(route, "path") and "/resume-builder" in route.path:
            methods = getattr(route, "methods", set())
            print(f"  {list(methods)} {route.path}")
            
except Exception as e:
    import traceback
    print("ERROR loading FastAPI application:")
    print(traceback.format_exc())
