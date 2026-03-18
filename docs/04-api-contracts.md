# API Contracts — jobs.ottobon.cloud

## Base URL

- **Production**: `https://jobs.ottobon.cloud`
- **Local Development**: `http://localhost:8000`

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <supabase_access_token>
```

The token is a Supabase JWT containing `user_metadata.role` and `sub` (user UUID).

---

## Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | ✗ | Register via backend Admin API (bypasses Supabase rate limits) |
| Sign-in | Direct Supabase | ✗ | `supabase.auth.signInWithPassword()` — no backend call |

### `POST /auth/signup`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "seeker"  // seeker | provider | admin
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "access_token": "jwt...",
  "refresh_token": "jwt..."
}
```

---

## Users Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/users/me` | ✓ | Any | Get current user profile |
| `POST` | `/users/resume` | ✓ | Seeker | Upload resume (multipart/form-data) |
| `GET` | `/users/me/resume` | ✓ | Seeker | Get resume download URL |

### `POST /users/resume`

**Request:** `multipart/form-data` with field `file` (PDF)

**Response:**
```json
{
  "message": "Resume processed successfully",
  "characters_extracted": 4521
}
```

**Pipeline:** Upload → Store in Supabase Storage → Extract text via PyPDF → Generate embedding → Update user record

---

## Jobs Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/jobs/feed` | ✗ | Any | Paginated job feed |
| `GET` | `/jobs/{id}/details` | ✗ | Any | Full job details (4-Pillar) |
| `POST` | `/jobs` | ✓ | Provider | Create new job posting |
| `GET` | `/jobs/provider` | ✓ | Provider | List provider's own jobs |

### `GET /jobs/feed?skip=0&limit=20`

**Response:** `Array<JobFeedItem>`
```json
[
  {
    "id": "uuid",
    "title": "Senior Consultant",
    "skills_required": ["Python", "SQL", "Tableau"],
    "status": "active",
    "company_name": "Deloitte",
    "external_apply_url": "https://...",
    "created_at": "2026-03-15T10:00:00Z"
  }
]
```

### `GET /jobs/{id}/details`

**Response:** `JobDetail` — includes AI-enriched fields:
```json
{
  "id": "uuid",
  "title": "Senior Consultant",
  "description_raw": "Full job description...",
  "skills_required": ["Python", "SQL"],
  "resume_guide_generated": [
    "Highlight your data analysis experience",
    "Quantify consulting project outcomes",
    "..."
  ],
  "prep_guide_generated": [
    {
      "question": "How would you approach a market sizing problem?",
      "answer_strategy": "Use a top-down approach: start with total market..."
    }
  ],
  "company_name": "Deloitte",
  "external_apply_url": "https://..."
}
```

### `POST /jobs`

**Request:**
```json
{
  "title": "Data Analyst",
  "description_raw": "We are looking for...",
  "skills_required": ["Python", "SQL", "Power BI"]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "message": "Job created. AI enrichment is processing in the background."
}
```

---

## Matching Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/jobs/{id}/match` | ✓ | Seeker | Calculate match score |
| `POST` | `/jobs/{id}/tailor-resume` | ✓ | Seeker | Get tailored resume suggestions |

### `POST /jobs/{id}/match`

**Response:** `MatchResult`
```json
{
  "job_id": "uuid",
  "similarity_score": 0.8234,
  "gap_detected": true,
  "gap_analysis": "Your resume shows strong SQL skills but lacks...",
  "missing_skills": ["Tableau", "Power BI"],
  "learning_recommendations": [
    {
      "skill": "Tableau",
      "title": "Tableau Desktop Specialist",
      "url": "https://coursera.org/...",
      "provider": "Coursera"
    }
  ]
}
```

---

## Chat Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/chat/sessions` | ✓ | Seeker | Create chat session (optional `job_id`) |
| `GET` | `/chat/sessions/{id}` | ✓ | Seeker | Get session info |
| `GET` | `/chat/my-sessions` | ✓ | Seeker | List user's sessions |
| `WS` | `/ws/chat/{session_id}` | Token | Seeker | WebSocket for real-time chat |

### WebSocket Protocol (`/ws/chat/{session_id}`)

**Inbound (Client → Server):**
- Plain text messages (user query)
- `__ping__` — heartbeat keepalive

**Outbound (Server → Client):**
```json
// History replay on connect
{ "type": "history_replay", "messages": [...], "session_status": "active_ai" }

// AI response
{ "type": "ai_reply", "content": "Here's my advice..." }

// Admin intervention
{ "type": "admin_message", "content": "Hi, this is support..." }

// System notification
{ "type": "system_notification", "content": "Session transferred to AI" }
```

- `__pong__` — heartbeat response (plain text)

---

## Admin Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/admin/sessions` | ✓ | Admin | List all active chat sessions |
| `GET` | `/admin/sessions/{id}` | ✓ | Admin | Get session details |
| `POST` | `/admin/sessions/{id}/message` | ✓ | Admin | Send admin message into session |

---

## Ingestion Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/admin/ingest/trigger` | ✓ | Admin | Trigger job scraping (optional `?scraper_name=deloitte`) |

---

## Blog Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/blogs?limit=10` | ✗ | List blog posts |
| `GET` | `/blogs/{slug}` | ✗ | Get blog post by slug |
| `POST` | `/blogs/generate` | ✓ | Generate AI blog post (Admin) |

---

## Analytics Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/analytics/market` | ✓ | Any | Market intelligence data |

**Response:**
```json
{
  "total_jobs": 247,
  "top_skills": [{ "name": "Python", "count": 89 }],
  "salary_trends": [{ "role": "Backend Engineer", "avg_min": 80000, "avg_max": 120000, "count": 15 }],
  "top_companies": [{ "name": "Deloitte", "count": 72 }],
  "work_styles": [{ "name": "Remote", "value": 45 }],
  "experience_levels": [{ "subject": "Senior/Lead", "A": 38, "fullMark": 247 }]
}
```

---

## Mock Interview Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/mock-interviews/start` | ✓ | Seeker | Start a mock interview for a job |
| `POST` | `/mock-interviews/{id}/submit` | ✓ | Seeker | Submit answers |
| `GET` | `/mock-interviews/my` | ✓ | Seeker | List user's mock interviews |
| `GET` | `/mock-interviews/{id}` | ✓ | Seeker | Get interview details + scorecard |
| `POST` | `/mock-interviews/{id}/request-review` | ✓ | Seeker | Request expert review |

---

## Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ✗ | Returns `{ "status": "ok", "service": "jobs.ottobon.cloud" }` |
