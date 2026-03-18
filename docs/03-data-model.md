# Data Model — jobs.ottobon.cloud

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ JOBS : "provider_id (creates)"
    USERS ||--o{ CHAT_SESSIONS : "user_id"
    USERS ||--o{ MOCK_INTERVIEWS : "user_id"
    JOBS ||--o{ CHAT_SESSIONS : "job_id (optional context)"
    JOBS ||--o{ MOCK_INTERVIEWS : "job_id"
    SCRAPING_LOGS ||--|| JOBS : "source tracking"

    USERS {
        uuid id PK
        string email
        enum role "seeker | provider | admin"
        string full_name
        text resume_text "Extracted from uploaded PDF"
        vector resume_embedding "OpenAI text-embedding-3-small"
        string resume_file_url "Supabase Storage URL"
        string resume_file_name
        timestamp created_at
    }

    JOBS {
        uuid id PK
        uuid provider_id FK "References USERS"
        string title
        text description_raw
        string[] skills_required "Extracted or manual"
        string[] resume_guide_generated "5 AI bullet points"
        jsonb[] prep_guide_generated "5 interview Q&A pairs"
        vector embedding "Job description embedding"
        string status "processing | active"
        string company_name
        string external_id "For scraped jobs"
        string external_apply_url
        string description_hash "SHA-256 for dedup"
        string salary_range "AI-estimated"
        string location
        timestamp created_at
    }

    CHAT_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK "Optional job context"
        enum status "active_ai | closed"
        jsonb conversation_log "Array of message objects"
        timestamp created_at
    }

    MOCK_INTERVIEWS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        jsonb[] transcript "Q&A pairs"
        jsonb ai_scorecard "technical_accuracy, clarity, confidence, summary"
        text expert_feedback
        enum status "in_progress | completed | pending_review | reviewed"
        timestamp created_at
    }

    BLOG_POSTS {
        uuid id PK
        string title
        string slug UK
        text summary
        text content "Markdown format"
        string image_url
        timestamp created_at
    }

    SCRAPING_LOGS {
        uuid id PK
        string source_name "deloitte | pwc | kpmg | ey"
        enum status "running | success | partial | failed"
        int jobs_found
        int jobs_new
        int jobs_skipped
        int error_count
        text error_message
        text traceback
        timestamp started_at
        timestamp finished_at
    }

    CRON_LOCKS {
        string lock_name PK
        timestamp locked_until "TTL-based distributed lock"
    }

    LEARNING_RESOURCES {
        uuid id PK
        string skill "Skill name"
        string title "Course/resource title"
        string url
        string provider "Coursera, Udemy, etc."
    }
```

## Key Design Decisions

### 1. Embeddings as First-Class Columns
- Both `users.resume_embedding` and `jobs.embedding` store pgvector embeddings
- Enables cosine similarity matching at the database level
- Generated via OpenAI `text-embedding-3-small`

### 2. SHA-256 Description Hashing
- `jobs.description_hash` prevents duplicate AI enrichment
- When a scraped job has the same description as an existing one, enrichment data is copied instead of re-generated (saves ~50% on OpenAI costs)

### 3. Conversation Log as JSONB
- Chat history stored as a JSONB array in `chat_sessions.conversation_log`
- Each entry: `{ role: "user"|"assistant"|"admin", content: string, timestamp: ISO8601 }`
- Hidden system context entries (e.g., job context) marked with `hidden: true`

### 4. System Provider for Scraped Jobs
- All scraped jobs assigned to `provider_id = "00000000-0000-4000-a000-000000000001"`
- This is a system user created by migration to satisfy FK constraints

### 5. Distributed Locking
- `cron_locks` table with TTL-based locking via PostgreSQL RPC
- Prevents duplicate cron runs across multiple Uvicorn workers
