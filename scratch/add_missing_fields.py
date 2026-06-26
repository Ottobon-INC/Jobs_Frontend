import re

missing_companies = ['OpenAI', 'Sarvam AI', 'Razorpay', 'PhonePe', 'Krutrim AI', 'Zepto', 'Skyroot Aerospace', 'EPAM Systems']

with open('src/data/newGradData.js', 'r', encoding='utf-8') as f:
    content = f.read()

default_fields = """        testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
"""

for c in missing_companies:
    pattern = rf"(name:\s*'{c}'.*?process:\s*\[.*?\],\s*)(compensation:\s*\{{)"
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = content[:match.start(2)] + default_fields + content[match.start(2):]
    else:
        print(f"Could not match for {c}")

with open('src/data/newGradData.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
