# User Flows — jobs.ottobon.cloud

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant SB as Supabase

    Note over U,SB: Registration
    U->>FE: Fill email, password, role
    FE->>BE: POST /auth/signup
    BE->>SB: admin.createUser() (auto-confirm)
    SB-->>BE: user + tokens
    BE->>SB: Insert into users_jobs table
    BE-->>FE: access_token + refresh_token
    FE->>SB: setSession(tokens)
    FE->>FE: AuthContext picks up session

    Note over U,SB: Login
    U->>FE: Enter email, password
    FE->>SB: signInWithPassword() (direct)
    SB-->>FE: session + tokens
    FE->>BE: GET /users/me (with token)
    BE-->>FE: user profile + role
    FE->>FE: setRole(), render role-specific UI
```

## 2. Job Seeker — Full Journey

```mermaid
sequenceDiagram
    participant S as Seeker
    participant FE as Frontend
    participant BE as Backend
    participant AI as OpenAI

    Note over S,AI: 1. Resume Upload
    S->>FE: Upload PDF resume
    FE->>BE: POST /users/resume (multipart)
    BE->>BE: Extract text via PyPDF
    BE->>AI: Generate embedding
    BE->>BE: Store text + embedding + file
    BE-->>FE: "Resume processed (4521 chars)"

    Note over S,AI: 2. Browse Jobs
    S->>FE: Open /jobs page
    FE->>BE: GET /jobs/feed?skip=0&limit=20
    BE-->>FE: Job feed items
    FE->>FE: Render job cards

    Note over S,AI: 3. View Job Details
    S->>FE: Click a job card
    FE->>BE: GET /jobs/{id}/details
    BE-->>FE: Full details + resume guide + prep questions
    FE->>FE: Render 4-Pillar job page

    Note over S,AI: 4. Match Against Job
    S->>FE: Click "Match" button
    FE->>BE: POST /jobs/{id}/match
    BE->>BE: Cosine similarity (resume↔job embeddings)
    alt Score ≥ 0.7
        BE-->>FE: Good match, no gaps
    else Score < 0.7
        BE->>AI: Analyze gap + extract missing skills
        BE->>BE: Fetch learning resources for gaps
        BE-->>FE: Gap analysis + missing skills + courses
    end

    Note over S,AI: 5. AI Career Coach
    S->>FE: Open /chat
    FE->>BE: POST /chat/sessions {job_id: optional}
    BE-->>FE: session_id
    FE->>BE: WS /ws/chat/{session_id}
    BE-->>FE: history_replay + ai_greeting
    S->>FE: Type message
    FE->>BE: WS send(text)
    BE->>AI: Chat completion (with user context)
    BE-->>FE: ai_reply
```

## 3. Job Provider — Posting Flow

```mermaid
sequenceDiagram
    participant P as Provider
    participant FE as Frontend
    participant BE as Backend
    participant AI as OpenAI

    P->>FE: Fill job form (title, description, skills)
    FE->>BE: POST /jobs
    BE->>BE: Insert job (status: "processing")
    BE-->>FE: "Job created. AI enrichment processing..."
    
    Note over BE,AI: Background Task
    BE->>AI: GPT-4o structured output (Instructor)
    AI-->>BE: resume_guide + prep_questions + extracted_skills + salary_range
    BE->>AI: Generate embedding
    AI-->>BE: vector[]
    BE->>BE: Update job (status: "active")

    P->>FE: View /provider/listings
    FE->>BE: GET /jobs/provider
    BE-->>FE: Provider's job listings
```

## 4. Job Ingestion Pipeline (Automated)

```mermaid
sequenceDiagram
    participant CRON as APScheduler (10PM IST)
    participant LOCK as cron_locks Table
    participant SVC as IngestionService
    participant SCRAPER as Big 4 Scrapers
    participant DB as Supabase
    participant AI as OpenAI

    CRON->>LOCK: acquire_cron_lock("daily_ingestion")
    alt Lock acquired
        LOCK-->>CRON: true
        
        loop For each scraper (Deloitte, PwC, KPMG, EY)
            CRON->>SVC: ingest_jobs(scraper)
            SVC->>DB: Insert scraping_log (status: running)
            SVC->>SCRAPER: fetch_jobs()
            SCRAPER-->>SVC: raw job listings
            
            loop For each job
                SVC->>DB: find_job_by_external_id(company, ext_id)
                alt Job exists
                    SVC->>SVC: Skip (dedup)
                else New job
                    SVC->>DB: create_job(status: processing)
                    SVC->>DB: find_job_by_description_hash(sha256)
                    alt Hash match found
                        SVC->>DB: Copy enrichment from donor job
                        Note right of SVC: Saves AI costs!
                    else No hash match
                        SVC->>AI: Full enrichment pipeline
                        SVC->>DB: Update job (status: active)
                    end
                end
            end
            
            SVC->>DB: Update scraping_log (status: success/partial/failed)
        end
        
        CRON->>LOCK: release_cron_lock()
    else Lock held by another worker
        LOCK-->>CRON: false
        Note right of CRON: Skip this run
    end
```

## 5. Mock Interview Flow

```mermaid
sequenceDiagram
    participant S as Seeker
    participant FE as Frontend
    participant BE as Backend
    participant AI as OpenAI

    S->>FE: Click "Start Mock Interview" on job page
    FE->>BE: POST /mock-interviews/start {job_id}
    BE->>AI: Generate 5 interview questions for this role
    BE->>BE: Create interview record (status: in_progress)
    BE-->>FE: Interview ID + questions

    S->>FE: Answer all questions
    FE->>BE: POST /mock-interviews/{id}/submit {answers}
    BE->>AI: Evaluate answers → MockScorecard
    AI-->>BE: technical_accuracy, clarity, confidence, summary
    BE->>BE: Update (status: completed)
    BE-->>FE: Scorecard results

    opt Request Expert Review
        S->>FE: Click "Request Expert Review"
        FE->>BE: POST /mock-interviews/{id}/request-review
        BE->>BE: Update (status: pending_review)
    end
```

## 6. Blog Generation Flow

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant BE as Backend
    participant News as Google News RSS
    participant AI as OpenAI
    participant DB as Supabase

    Admin->>BE: POST /blogs/generate
    BE->>News: Fetch Big 4 career news (RSS)
    News-->>BE: 5 latest articles
    BE->>AI: Generate career strategy blog post
    AI-->>BE: {title, slug, summary, content (markdown)}
    BE->>DB: Insert blog_posts row
    DB-->>BE: Created post
    BE-->>Admin: Blog post published
```

## 7. Admin Control Tower

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend
    participant BE as Backend

    A->>FE: Open /admin/tower
    FE->>BE: GET /admin/sessions
    BE-->>FE: All active chat sessions

    A->>FE: Click a session
    FE->>BE: GET /admin/sessions/{id}
    BE-->>FE: Full session details + conversation log

    opt Send Admin Message
        A->>FE: Type message in admin panel
        FE->>BE: POST /admin/sessions/{id}/message {content}
        BE->>BE: Append to conversation_log (role: admin)
        BE-->>FE: Message sent
        Note right of BE: Seeker sees admin_message via WebSocket
    end
```
