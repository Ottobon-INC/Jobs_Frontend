import os
import sys
from dotenv import load_dotenv

# Load backend .env file
load_dotenv(r"d:\Ottobon\Jobs_backend\Jobs_Backend\.env")

# Add backend directory to path
sys.path.insert(0, r"d:\Ottobon\Jobs_backend\Jobs_Backend")

import pytest
sys.exit(pytest.main(["-v", r"d:\Ottobon\Jobs_backend\Jobs_Backend\tests\test_playbook_views_router.py"]))
