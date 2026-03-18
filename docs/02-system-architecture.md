# System Architecture — jobs.ottobon.cloud

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        UI[React SPA]
        Auth[AuthContext / Supabase Auth]
        WS[WebSocket Client]
        API_Client[Axios API Client]
    end

    subgraph "Backend (FastAPI)"
        GW[API Gateway / Routers]
        SVC[Service Layer]
        PORTS[Port Interfaces]
    end

    subgraph "Adapters"
        SB_Adapter[Supabase Adapter]
        OAI_Adapter[OpenAI Adapter]
        OAI_Embed[OpenAI Embedding Adapter]
        PDF_Adapter[PyPDF Adapter]
        Doc_Adapter[Document Adapter]
        Storage_Adapter[Supabase Storage Adapter]
    end

    subgraph "External Services"
        Supabase[(Supabase - PostgreSQL + Auth + Storage)]
        OpenAI[OpenAI API - GPT-4o + Embeddings]
        Big4[Big 4 Career Sites]
        News[Google News RSS]
    end

    subgraph "Background Jobs"
        Scheduler[APScheduler]
        Scrapers[Job Scrapers]
    end

    UI --> API_Client --> GW
    UI --> WS --> GW
    Auth --> Supabase
    GW --> SVC --> PORTS
    PORTS --> SB_Adapter --> Supabase
    PORTS --> OAI_Adapter --> OpenAI
    PORTS --> OAI_Embed --> OpenAI
    PORTS --> PDF_Adapter
    PORTS --> Doc_Adapter
    PORTS --> Storage_Adapter --> Supabase
    Scheduler --> Scrapers --> Big4
    Scheduler --> SVC
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 7 | SPA with code-splitting, lazy-loaded routes |
| **Styling** | TailwindCSS 4, Framer Motion | Responsive design + animations |
| **Charts** | Recharts | Market analytics visualizations |
| **3D** | Spline / Three.js | Landing page visual effects |
| **State** | React Context (AuthContext) | Global auth state, role-based routing |
| **HTTP Client** | Axios | API calls with retry, auth interceptor |
| **Realtime** | Native WebSocket | Chat with ping/pong heartbeat, auto-reconnect |
| **Backend** | FastAPI (Python) | Async REST API + WebSocket endpoints |
| **Architecture** | Hexagonal (Ports & Adapters) | Clean separation of concerns |
| **Database** | Supabase (PostgreSQL) | Tables with RLS, pgvector for embeddings |
| **Auth** | Supabase Auth | JWT-based, role in user_metadata |
| **Storage** | Supabase Storage | Resume file uploads |
| **AI** | OpenAI GPT-4o + text-embedding-3-small | Enrichment, matching, chat, interviews |
| **Scheduling** | APScheduler (AsyncIO) | Daily 10 PM IST job ingestion cron |
| **Deployment** | Docker + Nginx | Containerized with reverse proxy |

## Hexagonal Architecture (Backend)

```mermaid
graph LR
    subgraph "Driving Side (Inbound)"
        R1[Auth Router]
        R2[Jobs Router]
        R3[Matching Router]
        R4[Chat Router + WS]
        R5[Admin Router]
        R6[Ingestion Router]
        R7[Users Router]
        R8[Blog Router]
        R9[Analytics Router]
        R10[Mock Interviews Router]
    end

    subgraph "Application Core"
        S1[AuthService]
        S2[JobService]
        S3[MatchingService]
        S4[ChatService]
        S5[IngestionService]
        S6[EnrichmentService]
        S7[UserService]
        S8[AnalyticsService]
        S9[MockInterviewService]
        S10[MarketNewsService]
        S11[ResumeTailor]
        AG[BlogAgent]
    end

    subgraph "Port Interfaces"
        P1[DatabasePort]
        P2[AIPort]
        P3[EmbeddingPort]
        P4[StoragePort]
        P5[DocumentPort]
        P6[PDFPort]
        P7[ChatPort]
        P8[UserPort]
        P9[JobPort]
        P10[MockInterviewPort]
        P11[BlogPort]
        P12[ScraperPort]
    end

    subgraph "Driven Side (Outbound)"
        A1[SupabaseAdapter]
        A2[OpenAIAdapter]
        A3[OpenAIEmbeddingAdapter]
        A4[SupabaseStorageAdapter]
        A5[DocumentAdapter]
        A6[PyPDFAdapter]
        SC1[DeloitteAdapter]
        SC2[PwCAdapter]
        SC3[KPMGAdapter]
        SC4[EYAdapter]
    end

    R1 --> S1
    R2 --> S2
    R3 --> S3
    R4 --> S4
    R5 --> S4
    R6 --> S5
    R7 --> S7
    R8 --> AG
    R9 --> S8

    S1 --> P1 & P2
    S2 --> P1
    S3 --> P1 & P2
    S4 --> P1 & P2
    S5 --> P1 & P2 & P3
    S6 --> P1 & P2 & P3
    S7 --> P1 & P4 & P6
    S8 --> P1

    P1 --> A1
    P2 --> A2
    P3 --> A3
    P4 --> A4
    P5 --> A5
    P6 --> A6
    P12 --> SC1 & SC2 & SC3 & SC4
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        FE[Frontend Container<br/>Nginx + React Build]
        BE[Backend Container<br/>Uvicorn + FastAPI]
    end

    DNS[jobs.ottobon.cloud] --> FE
    FE -->|/api/*| BE
    BE --> SB[(Supabase Cloud)]
    BE --> OAI[OpenAI API]
```

- **Frontend**: Built with Vite, served via Nginx reverse proxy
- **Backend**: Uvicorn ASGI server running FastAPI
- **Both**: Docker Compose orchestration with `.env` configuration
