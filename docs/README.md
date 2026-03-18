# 📚 Documentation — jobs.ottobon.cloud

> **Outcome-Driven Recruitment Ecosystem** — connecting providers directly with seekers via AI-powered matching, preparation, and mentorship.

## Table of Contents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Business Overview](./01-business-overview.md) | Vision, problem statement, user roles, revenue model, and key differentiators |
| 02 | [System Architecture](./02-system-architecture.md) | High-level architecture, tech stack, hexagonal architecture, and deployment topology |
| 03 | [Data Model](./03-data-model.md) | ER diagram, table schemas, embedding strategy, and key design decisions |
| 04 | [API Contracts](./04-api-contracts.md) | Complete REST API reference with request/response schemas and WebSocket protocol |
| 05 | [User Flows](./05-user-flows.md) | Sequence diagrams for auth, seeker journey, provider posting, ingestion, mock interviews, blog, and admin |
| 06 | [AI Pipeline](./06-ai-pipeline.md) | AI architecture: enrichment, matching, chat, mock interviews, blog agent, and cost analysis |
| 07 | [Frontend Architecture](./07-frontend-architecture.md) | React app structure, routing, state management, API client, and design patterns |
| 08 | [Scraper & Ingestion](./08-scraper-ingestion.md) | Big 4 job scrapers, ingestion pipeline, scheduling, and distributed locking |

## Quick Start

```bash
# Frontend
cd jobs.frontend
npm install
npm run dev          # → http://localhost:5173

# Backend
cd Jobs-backend/backend
pip install -r requirements.txt
uvicorn main:app --reload  # → http://localhost:8000
```

## Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=eyJ...
```

### Backend (`.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...              # anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # service role key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
```
