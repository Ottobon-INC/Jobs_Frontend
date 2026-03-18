# Frontend Architecture — jobs.ottobon.cloud

## Directory Structure

```
src/
├── api/                    # API layer (10 modules)
│   ├── client.js           # Axios instance + Supabase client
│   ├── authApi.js          # Sign up / sign in / sign out
│   ├── jobsApi.js          # CRUD for job postings
│   ├── matchingApi.js      # Resume-to-job matching
│   ├── chatApi.js          # Chat session management
│   ├── adminApi.js         # Admin control tower
│   ├── analyticsApi.js     # Market intelligence
│   ├── blogApi.js          # Blog posts
│   ├── mockInterviewApi.js # Mock interview lifecycle
│   └── usersApi.js         # Profile + resume upload
│
├── components/             # Reusable UI components
│   ├── Layout/
│   │   └── AppShell.jsx    # Main layout (sidebar + navbar + content)
│   ├── ProtectedRoute.jsx  # Role-based route guard
│   ├── landing/            # Landing page sections (9 components)
│   ├── seeker/             # Seeker-specific components
│   └── ui/                 # Design system primitives (8 components)
│       └── Loader.jsx      # Full-screen loading state
│
├── context/
│   └── AuthContext.jsx     # Global auth state (session, user, role)
│
├── hooks/
│   ├── useAuth.js          # Convenience hook for AuthContext
│   ├── useBlogPosts.js     # Blog data fetching hook
│   └── useWebSocket.js     # Chat WebSocket management
│
├── pages/                  # Route-level page components
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── seeker/
│   │   ├── JobFeedPage.jsx     # Job listing feed
│   │   ├── JobDetailPage.jsx   # 4-Pillar job details
│   │   ├── MatchPage.jsx       # Match results
│   │   ├── ProfilePage.jsx     # Resume + profile management
│   │   └── CoursesPage.jsx     # Learning recommendations
│   ├── provider/
│   │   ├── CreateJobPage.jsx   # Job creation form
│   │   ├── MyListingsPage.jsx  # Provider's job list
│   │   └── MarketPage.jsx      # Market intelligence dashboard
│   ├── admin/
│   │   ├── ControlTowerPage.jsx # Chat session monitoring
│   │   ├── IngestionPage.jsx    # Scraper management
│   │   └── HelpDeskPage.jsx     # Support tools
│   ├── chat/
│   │   └── ChatPage.jsx        # AI career coach
│   ├── public/
│   │   ├── LandingPage.jsx     # Marketing landing page
│   │   ├── BlogLandingPage.jsx # Blog listing
│   │   └── BlogPostPage.jsx   # Individual blog post
│   └── NotFoundPage.jsx       # 404 page
│
├── utils/
│   ├── constants.js        # API URLs, Supabase keys, roles enum
│   └── cn.js               # Tailwind class merge utility
│
├── App.jsx                 # Root router (lazy-loaded routes)
├── main.jsx                # React DOM entry point
├── App.css                 # Global styles
└── index.css               # Tailwind base + design tokens
```

## Routing Architecture

| Path | Component | Auth | Role | Description |
|------|-----------|------|------|-------------|
| `/` | `LandingPage` | ✗ | — | Marketing landing page (standalone) |
| `/login` | `LoginPage` | ✗ | — | Sign in form |
| `/register` | `RegisterPage` | ✗ | — | Sign up form |
| `/jobs` | `JobFeedPage` | ✗ | — | Public job feed |
| `/jobs/:id` | `JobDetailPage` | ✗ | — | Job details (4 Pillars) |
| `/jobs/:id/match` | `MatchPage` | ✓ | Seeker | Match results |
| `/profile` | `ProfilePage` | ✓ | Seeker | Resume & profile |
| `/courses` | `CoursesPage` | ✓ | Seeker | Learning recs |
| `/chat` | `ChatPage` | ✓ | Seeker | AI career coach |
| `/blogs` | `BlogLandingPage` | ✗ | — | Blog listing |
| `/blogs/:slug` | `BlogPostPage` | ✗ | — | Blog post |
| `/market-intelligence` | `MarketPage` | ✓ | Any | Analytics dashboard |
| `/provider/create` | `CreateJobPage` | ✓ | Provider | Create job |
| `/provider/listings` | `MyListingsPage` | ✓ | Provider | Manage listings |
| `/admin/tower` | `ControlTowerPage` | ✓ | Admin | Session monitoring |
| `/admin/ingest` | `IngestionPage` | ✓ | Admin | Scraper management |
| `/admin/helpdesk` | `HelpDeskPage` | ✓ | Admin | Support tools |

## State Management

### AuthContext (Global)
```
session     → Supabase session object (JWT tokens)
user        → Supabase user object (id, email, metadata)
role        → "seeker" | "provider" | "admin" (fetched from backend)
loading     → boolean (true during initial auth check)
isAuthenticated → derived from !!session?.user
```

**Performance:** Context value is `useMemo`-ized — only re-renders consumers when actual values change.

### WebSocket State (Chat-scoped)
```
messages       → Array of {role, content, timestamp}
isConnected    → WebSocket connection status
isTyping       → true while waiting for AI reply
sessionStatus  → "active_ai" | "closed"
```

**Reconnection:** Exponential backoff (1s, 2s, 4s, 8s) with max 3 retries.

## API Client Architecture

```
Supabase Client (Auth)
  └── Used directly for sign in/out, session management
  └── Auth tokens cached in memory (not re-fetched per request)

Axios Instance (Backend API)
  └── baseURL: VITE_API_URL
  └── 30s timeout
  └── Request interceptor: auto-attach cached Bearer token
  └── Response interceptor: auto-retry 503s (3x with linear backoff)
```

## Key Design Patterns

1. **Lazy Loading**: All page components use `React.lazy()` + `Suspense` for code splitting
2. **Protected Routes**: `ProtectedRoute` component checks `isAuthenticated` and `allowedRoles`
3. **Optimistic Updates**: Chat messages appear instantly before AI responds
4. **Token Caching**: Auth tokens cached in-memory and synced via `onAuthStateChange`
5. **Role Fallback**: If backend profile fetch fails, role falls back to `user_metadata.role`
