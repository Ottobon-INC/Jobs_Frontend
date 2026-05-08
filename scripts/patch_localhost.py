import os

files_to_patch = [
    'src/utils/constants.js',
    'src/api/mockInterviewApi.js',
    'src/pages/seeker/MockInterviewPage.jsx'
]

replacements = [
    ("|| 'http://localhost:8000'", "|| ''"),
    ("|| 'http://localhost:8001/mock'", "|| ''"),
    ("|| 'ws://localhost:8001/mock/ws'", "|| ''")
]

base_path = 'c:/jobs_frontend/jobs.frontend'

for rel_path in files_to_patch:
    full_path = os.path.join(base_path, rel_path)
    if not os.path.exists(full_path):
        print(f"Skipping {rel_path}: Not found")
        continue
        
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {rel_path}")
    else:
        print(f"No changes needed for {rel_path}")
