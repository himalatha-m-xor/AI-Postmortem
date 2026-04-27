# ARIA - Complete Code Explanation

> **Purpose**: Detailed explanation of every code file, their purpose, and main functions

---

## 📁 Project Structure Overview

```
AI-Postmortem/
├── app/                    # Next.js App Router (UI & API routes)
├── components/             # Reusable React components
├── lib/                    # Business logic & utilities
└── types/                  # TypeScript type definitions
```

---

## 📦 Types Folder (`/types`)

### 1. `types/incident.ts`
**Purpose**: Defines TypeScript types for incident data structures

**Main Types**:

```typescript
// Type Definitions
SeverityLevel: 'critical' | 'high' | 'medium' | 'low'
IncidentStatus: 'open' | 'investigating' | 'resolved'

// Data Structures
SlackMessage: { timestamp, user, message, thread? }
LogEntry: { timestamp, level, message, service, stackTrace? }
MetricSnapshot: { timestamp, metric, value, unit? }
Alert: { timestamp, type, message, user? }

// Main Incident Type
Incident: {
  id, title, description, severity, status,
  startTime, endTime?, affectedServices[], usersImpacted,
  slackChannel, slackMessages[], logs[], metrics[], alerts[]
}
```

**Usage**: Import in any file that handles incident data
**Why Important**: Ensures type safety across the entire application

---

### 2. `types/postmortem.ts`
**Purpose**: Defines TypeScript types for AI-generated postmortem reports

**Main Types**:

```typescript
TimelineEvent: { timestamp, event, type, user? }
ActionItem: { task, priority, owner, dueDate }
PreventionMeasure: { category, action, priority, owner }

Postmortem: {
  id, incidentId, incidentTitle, generatedAt,
  severity, startTime, endTime, durationMinutes,
  executiveSummary, usersImpacted, servicesAffected[],
  timeline[], rootCause{}, contributingFactors[],
  whatWentWell[], whatWentPoorly[], remediationSteps[],
  recentCodeChanges[], preventionMeasures[], actionItems[]
}
```

**Usage**: Used by AI generator and postmortem display components
**Why Important**: Defines the structured output from GPT-4o-mini

---

## 🎨 App Folder (`/app`) - Next.js 14 App Router

### 3. `app/layout.tsx`
**Purpose**: Root layout component that wraps all pages

**Key Features**:
```typescript
export default function RootLayout({ children })
```
- Sets up HTML structure
- Applies global CSS (`globals.css`)
- Configures font (Inter)
- Provides dark theme styling
- Wraps all pages with consistent layout

**Why Important**: Defines the base structure for the entire app

---

### 4. `app/globals.css`
**Purpose**: Global CSS styles using Tailwind CSS

**Key Styles**:
- Dark theme variables (slate colors)
- Tailwind base, components, utilities
- Custom scrollbar styling
- Dark background (#0f172a)

**Why Important**: Provides consistent dark-mode UI theme

---

### 5. `app/page.tsx`
**Purpose**: Main dashboard page (homepage at `/`)

**Main Functions**:

```typescript
export default function DashboardPage()
```

**What it does**:
1. `fetchIncidents()` - Loads incidents from API
2. `fetchStats()` - Loads dashboard statistics
3. `handleFetchFromSlack()` - Triggers Slack integration
4. `handleGeneratePostmortem(incidentId)` - Starts AI generation

**UI Components**:
- Dashboard header with stats cards
- Incident list with severity badges
- Slack fetch button
- Loading states and error handling

**API Calls**:
- `GET /api/incidents` - Fetch all incidents
- `GET /api/dashboard/stats` - Get statistics
- `POST /api/slack/fetch-incident` - Fetch from Slack
- `POST /api/generate-postmortem` - Generate postmortem

**Why Important**: Main user interface for the entire application

---

### 6. `app/postmortems/[id]/page.tsx`
**Purpose**: Displays individual postmortem report (dynamic route)

**Main Functions**:

```typescript
export default function PostmortemPage({ params })
```

**What it does**:
1. Extracts postmortem ID from URL params
2. Fetches postmortem data from API
3. Renders formatted postmortem report
4. Provides export options (PDF, Markdown, Copy)

**Key Features**:
- Timeline visualization
- Root cause analysis display
- Action items table
- Prevention measures list
- Export functionality

**API Calls**:
- `GET /api/generate-postmortem?id={id}` - Fetch postmortem

**Why Important**: Displays the final AI-generated postmortem

---

## 🔌 API Routes (`/app/api`)

### 7. `app/api/generate-postmortem/route.ts`
**Purpose**: API endpoint for generating and retrieving postmortems

**Main Functions**:

```typescript
export async function POST(request)
```
**What it does**:
1. Validates request (rate limiting)
2. Extracts `incidentId` from request body
3. Loads incident from database or mock data
4. Calls `generatePostmortem(incident)` - AI generation
5. Saves postmortem to database
6. Returns generated postmortem

**Input**: `{ incidentId: "inc-001" }`
**Output**: `{ id: "pm-xxx", incidentTitle: "...", ... }`

```typescript
export async function GET(request)
```
**What it does**:
1. Extracts postmortem `id` from query params
2. Fetches from in-memory storage
3. Returns postmortem data

**Input**: `?id=pm-xxx`
**Output**: Full postmortem object

**Error Handling**:
- Rate limit exceeded (429)
- Incident not found (404)
- AI generation failed (500)

**Why Important**: Core API that triggers AI postmortem generation

---

### 8. `app/api/incidents/route.ts`
**Purpose**: API endpoint to fetch all incidents

**Main Function**:

```typescript
export async function GET()
```

**What it does**:
1. Checks if database feature is enabled
2. If enabled: Calls `getAllIncidentsFromDB()`
3. If disabled: Returns `MOCK_INCIDENTS`
4. Returns array of incidents

**Output**: `{ incidents: [...], source: "database" | "mock" }`

**Database Query** (if enabled):
- Joins `incidents` with `slack_messages`
- Returns incidents with full conversation history

**Why Important**: Provides incident data to the dashboard

---

### 9. `app/api/dashboard/stats/route.ts`
**Purpose**: API endpoint for dashboard statistics

**Main Function**:

```typescript
export async function GET()
```

**What it does**:
1. Checks database feature flag
2. If enabled: Calls `getDashboardStats()` from database
3. If disabled: Calculates stats from mock data

**Statistics Calculated**:
- `activeIncidents` - Count of open/investigating incidents
- `avgMTTR` - Average Mean Time To Resolution (minutes)
- `postmortemsThisWeek` - Postmortems generated this week
- `totalIncidents` - Total incident count

**Output**: 
```json
{
  "activeIncidents": 2,
  "avgMTTR": 45,
  "postmortemsThisWeek": 3,
  "totalIncidents": 5,
  "source": "database"
}
```

**Why Important**: Powers the dashboard metrics cards

---

### 10. `app/api/slack/fetch-incident/route.ts`
**Purpose**: Fetches incident data from Slack channel

**Main Function**:

```typescript
export async function POST(request)
```

**What it does**:
1. Extracts `channelId` and `hours` from request
2. Calls `slackClient.fetchChannelMessages()`
3. Transforms Slack messages to Incident format
4. Saves to database using `saveIncidentToDB()`
5. Returns incident data

**Input**: `{ channelId: "C0AV1T615KM", hours: 24 }`

**Slack API Calls**:
- `conversations.history` - Fetch messages
- `users.info` - Resolve user IDs to names
- `conversations.info` - Get channel metadata

**Output**:
```json
{
  "success": true,
  "incident": { /* full incident object */ },
  "messagesCount": 18,
  "savedToDatabase": true
}
```

**Why Important**: Bridge between Slack and ARIA database

---

### 11. `app/api/github/test-connection/route.ts`
**Purpose**: Tests GitHub API connectivity

**Main Function**:

```typescript
export async function GET()
```

**What it does**:
1. Calls `githubClient.testConnection()`
2. Verifies API token and repository access
3. Returns connection status

**Output**:
```json
{
  "success": true,
  "organization": "himalatha-m-xor",
  "repository": "AI-Postmortem",
  "hasAccess": true
}
```

**Why Important**: Validates GitHub integration setup

---

## 🧰 Lib Folder (`/lib`) - Business Logic

### 12. `lib/config.ts`
**Purpose**: Central configuration file for the entire application

**Main Export**:

```typescript
export const config = {
  app: { name, url, debug },
  openai: { apiKey, model, maxTokens, temperature },
  postgres: { database, user, password, host, port },
  session: { secret, maxAge },
  slack: { botToken, channelId },
  github: { token, org, repo },
  features: { authentication, database, rateLimiting, slack, github }
}
```

**What it does**:
- Loads environment variables
- Provides typed configuration object
- Feature flags for enabling/disabling integrations

**Key Features**:
- `features.database` - Enable/disable PostgreSQL
- `features.slack` - Enable/disable Slack integration
- `features.github` - Enable/disable GitHub integration

**Why Important**: Single source of truth for app configuration

---

### 13. `lib/logger.ts`
**Purpose**: Centralized logging system

**Main Functions**:

```typescript
logger.info(message, metadata?)
logger.error(message, error, metadata?)
logger.warn(message, metadata?)
logger.debug(message, metadata?)
```

**What it does**:
- Structured JSON logging
- Different log levels (info, error, warn, debug)
- Timestamps on all logs
- Metadata support for context

**Example**:
```typescript
logger.info('Fetching Slack messages', { channelId: 'C123' });
logger.error('AI generation failed', error, { incidentId: 'inc-001' });
```

**Why Important**: Debugging and monitoring in production

---

### 14. `lib/errors.ts`
**Purpose**: Custom error classes and error handling utilities

**Main Classes**:

```typescript
class NotFoundError extends Error
class ValidationError extends Error
class AIGenerationError extends Error
class RateLimitError extends Error
```

**Main Function**:

```typescript
formatErrorResponse(error, statusCode?)
```

**What it does**:
- Creates standardized error responses
- Maps error types to HTTP status codes
- Logs errors automatically

**Output**:
```json
{
  "error": "Incident not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

**Why Important**: Consistent error handling across APIs

---

### 15. `lib/rate-limit.ts`
**Purpose**: API rate limiting to prevent abuse

**Main Functions**:

```typescript
rateLimiter.check(clientId)
rateLimiter.reset(clientId)
```

**What it does**:
- Tracks API requests per client (by IP)
- Limits to 10 requests per minute
- Throws `RateLimitError` if exceeded
- Auto-cleanup of expired entries

**Configuration**:
- Max requests: 10
- Window: 60 seconds
- Storage: In-memory (per client)

**Why Important**: Prevents API abuse and controls costs

---

### 16. `lib/storage.ts`
**Purpose**: In-memory storage for postmortems (fallback)

**Main Functions**:

```typescript
savePostmortem(postmortem)
getPostmortem(id)
getAllPostmortems()
```

**What it does**:
- Stores postmortems in global variable
- Provides CRUD operations
- Used when database is disabled

**Limitation**: Data lost on server restart

**Why Important**: Allows app to work without database

---

### 17. `lib/utils.ts`
**Purpose**: Utility functions (Tailwind CSS merging)

**Main Function**:

```typescript
cn(...inputs)
```

**What it does**:
- Merges Tailwind CSS classes
- Resolves conflicts (e.g., `px-2 px-4` → `px-4`)
- Uses `clsx` + `tailwind-merge`

**Example**:
```typescript
cn('px-2 py-1', 'px-4') // → 'py-1 px-4'
```

**Why Important**: Clean className management in React

---

## 🤖 AI Folder (`/lib/ai`)

### 18. `lib/ai/openai.ts`
**Purpose**: OpenAI/Azure OpenAI client initialization

**Main Export**:

```typescript
export const openai
```

**What it does**:
- Detects provider (OpenAI vs Azure OpenAI)
- Initializes correct client
- Configures API keys and endpoints

**Supports**:
- OpenAI: `OPENAI_API_KEY`
- Azure OpenAI: `AZURE_OPENAI_API_KEY` + endpoint

**Why Important**: Abstraction layer for AI provider

---

### 19. `lib/ai/prompts.ts`
**Purpose**: Builds structured prompts for GPT-4o-mini

**Main Functions**:

```typescript
buildPostmortemPrompt(incident, githubContext?)
```

**What it does**:
1. Creates system prompt (role definition)
2. Serializes incident data to JSON
3. Adds Slack conversation (chronological)
4. Includes GitHub commits (if available)
5. Defines expected JSON output structure
6. Adds blameless postmortem guidelines

**Prompt Structure**:
```
SYSTEM: You are a Staff SRE writing blameless postmortems...

INCIDENT DATA:
- Title, severity, duration, impact
- Slack conversation (18 messages)
- GitHub commits (23 commits)

OUTPUT FORMAT:
{
  "executiveSummary": "...",
  "timeline": [...],
  "rootCause": {...},
  ...
}

GUIDELINES:
- Focus on systems, not people
- Be data-driven
- Provide actionable recommendations
```

**Why Important**: Quality of prompt = Quality of AI output

---

### 20. `lib/ai/generator.ts`
**Purpose**: Core AI postmortem generation logic

**Main Function**:

```typescript
async function generatePostmortem(incident)
```

**What it does**:
1. Validates incident has end time
2. Fetches GitHub context (commits, PRs, deployments)
3. Builds comprehensive prompt
4. Calls Azure OpenAI API (gpt-4o-mini)
5. Parses JSON response
6. Transforms to Postmortem type
7. Adds metadata (ID, generated timestamp)
8. Returns structured postmortem

**Configuration**:
- Model: gpt-4o-mini
- Temperature: 0.7
- Max tokens: 4000
- Response format: JSON

**Error Handling**:
- Invalid JSON from AI
- Missing required fields
- API failures

**Why Important**: Main AI generation engine

---

## 💾 Database Folder (`/lib/db`)

### 21. `lib/db/pool.ts`
**Purpose**: PostgreSQL connection pool manager

**Main Functions**:

```typescript
getPool() // Returns singleton pool
query(sql, params?) // Execute SQL queries
closePool() // Graceful shutdown
```

**What it does**:
- Creates PostgreSQL connection pool
- Singleton pattern (one pool per app)
- Max 20 connections
- Auto-reconnect on errors
- Query logging in debug mode

**Configuration**:
```typescript
{
  database: 'aria_postmortem',
  user: 'postgres',
  password: 'Ravi9347',
  host: 'localhost',
  port: 5432,
  max: 20
}
```

**Why Important**: Efficient database connection management

---

### 22. `lib/db/schema.sql`
**Purpose**: PostgreSQL database schema definition

**What it defines**:

```sql
-- 3 Main Tables:
CREATE TABLE incidents (...)
CREATE TABLE slack_messages (...)
CREATE TABLE postmortems (...)

-- Indexes for performance:
CREATE INDEX idx_incidents_status
CREATE INDEX idx_postmortems_incident
...
```

**Key Features**:
- Foreign key relationships
- JSONB columns for flexible data
- Indexes on frequently queried fields
- Cascade deletes

**Why Important**: Database structure definition

---

### 23. `lib/db/migrate.ts`
**Purpose**: Database migration script

**Main Function**:

```typescript
async function runMigrations()
```

**What it does**:
1. Loads environment variables (.env.local)
2. Reads schema.sql file
3. Executes SQL to create tables
4. Logs success/failure

**Usage**: `npm run db:migrate`

**Why Important**: Sets up database tables

---

### 24. `lib/db/incidents.ts`
**Purpose**: Database operations for incidents

**Main Functions**:

```typescript
async function saveIncidentToDB(incident)
```
- INSERT INTO incidents
- INSERT INTO slack_messages (batch)
- Returns saved incident

```typescript
async function getAllIncidentsFromDB()
```
- SELECT with JOIN on slack_messages
- Returns array of incidents with messages

```typescript
async function getIncidentFromDB(id)
```
- SELECT single incident by ID
- Includes all related slack_messages
- Returns incident or null

```typescript
async function getDashboardStats()
```
- Counts active incidents
- Calculates average MTTR
- Counts recent postmortems
- Returns statistics object

**SQL Queries**: Raw SQL with parameterized queries (SQL injection safe)

**Why Important**: All incident database operations

---

### 25. `lib/db/postmortems.ts`
**Purpose**: Database operations for postmortems

**Main Functions**:

```typescript
async function savePostmortemToDB(postmortem)
```
- INSERT INTO postmortems
- Stores timeline/action_items as JSONB
- Returns saved postmortem

```typescript
async function getPostmortemFromDB(id)
```
- SELECT postmortem by ID
- Parses JSONB fields
- Returns full postmortem object

```typescript
async function getAllPostmortemsFromDB()
```
- SELECT all postmortems
- Returns list with basic info

**JSONB Handling**:
- `JSON.stringify()` before INSERT
- `JSON.parse()` after SELECT

**Why Important**: All postmortem database operations

---

## 💬 Slack Integration (`/lib/integrations/slack`)

### 26. `lib/integrations/slack/client.ts`
**Purpose**: Slack API client wrapper

**Main Class**:

```typescript
class SlackClient
```

**Main Methods**:

```typescript
async fetchChannelMessages(channelId, hours)
```
- Calls `conversations.history` API
- Fetches messages from last N hours
- Limits to 100 messages
- Returns array of raw Slack messages

```typescript
async getUserInfo(userId)
```
- Calls `users.info` API
- Returns user display name
- Caches results to avoid duplicate calls

```typescript
async getChannelInfo(channelId)
```
- Calls `conversations.info` API
- Returns channel name and metadata

**Error Handling**:
- Invalid token → throws error
- Channel not found → throws error
- API rate limits → retries with backoff

**Why Important**: Direct communication with Slack API

---

### 27. `lib/integrations/slack/transformer.ts`
**Purpose**: Transforms Slack data to Incident format

**Main Function**:

```typescript
async function transformSlackToIncident(messages, channelInfo, slackClient)
```

**What it does**:
1. Extracts incident title (first message or channel name)
2. Determines severity from keywords (critical, high, medium)
3. Sets status based on conversation (open/resolved)
4. Extracts affected services from messages
5. Estimates users impacted from conversation
6. Resolves all user IDs to names
7. Sorts messages chronologically
8. Creates Incident object

**Keyword Detection**:
- "critical", "p0", "down" → severity: critical
- "high", "p1", "degraded" → severity: high
- Default → severity: medium

**Output**: Complete `Incident` object ready for database

**Why Important**: Bridges Slack data format to our data model

---

### 28. `lib/integrations/slack/index.ts`
**Purpose**: Main export file for Slack integration

**Exports**:
```typescript
export { slackClient }
export { transformSlackToIncident }
```

**Why Important**: Clean public API for Slack features

---

## 🐙 GitHub Integration (`/lib/integrations/github`)

### 29. `lib/integrations/github/client.ts`
**Purpose**: GitHub API client wrapper

**Main Class**:

```typescript
class GitHubClient
```

**Main Methods**:

```typescript
async fetchCommits(since, until)
```
- Calls `/repos/{owner}/{repo}/commits` API
- Fetches commits within date range
- Returns last 30 commits
- Includes commit SHA, message, author, date

```typescript
async fetchPullRequests()
```
- Calls `/repos/{owner}/{repo}/pulls` API
- Gets recently closed PRs
- Returns last 10 PRs

```typescript
async fetchDeployments()
```
- Calls `/repos/{owner}/{repo}/deployments` API
- Gets recent production deployments
- Returns deployment history

```typescript
async testConnection()
```
- Verifies GitHub token works
- Checks repository access
- Returns connection status

**Authentication**: Uses Personal Access Token (PAT)

**Why Important**: Fetches code context for incidents

---

### 30. `lib/integrations/github/transformer.ts`
**Purpose**: Formats GitHub data for AI prompt

**Main Function**:

```typescript
function formatGitHubContext(commits, prs, deployments)
```

**What it does**:
1. Formats commits with SHA + message + author
2. Formats PRs with title + number + merge time
3. Formats deployments with environment + timestamp
4. Creates markdown-formatted text
5. Limits to prevent prompt overflow

**Output Example**:
```markdown
## Recent GitHub Activity:

### Recent Commits (last 24h):
- 1244318 - fix(auth): Add proper error handling (himalatha-m-xor)
- f8a30db - hotfix(auth): Fix token expiration bug (himalatha-m-xor)

### Recent Pull Requests:
- #42: Fix authentication timeout (merged 2h ago)

### Recent Deployments:
- production @ 2026-04-26 03:15 UTC
```

**Why Important**: Provides code context to AI for root cause analysis

---

### 31. `lib/integrations/github/index.ts`
**Purpose**: Main export file for GitHub integration

**Exports**:
```typescript
export { githubClient }
export { formatGitHubContext }
```

**Why Important**: Clean public API for GitHub features

---

## 📊 Data Folder (`/lib/data`)

### 32. `lib/data/incidents.ts`
**Purpose**: Mock incident data for demos

**Main Export**:

```typescript
export const MOCK_INCIDENTS: Incident[]
```

**Contains**:
- 5 realistic incident scenarios
- Complete Slack conversations (10-20 messages each)
- Severity levels, affected services
- Timestamps spanning realistic incident durations

**Incidents**:
1. `inc-001`: Database connection pool exhaustion (Critical)
2. `inc-002`: Memory leak in checkout service (High)
3. `inc-003`: SSL certificate expiration (High)
4. `inc-004`: DDoS attack traffic spike (Critical)
5. `inc-005`: Breaking API deployment (Medium)

**Why Important**: Allows demos without real Slack data

---

## 🎨 Components Folder (`/components`)

### 33. `components/ui/button.tsx`
**Purpose**: Reusable button component

**Props**:
```typescript
variant?: 'default' | 'destructive' | 'outline' | 'ghost'
size?: 'default' | 'sm' | 'lg' | 'icon'
className?: string
```

**Features**:
- Multiple visual variants
- Different sizes
- Tailwind CSS styling
- Accessible (keyboard navigation)

**Usage**:
```tsx
<Button variant="default" size="lg" onClick={handleClick}>
  Generate Postmortem
</Button>
```

**Why Important**: Consistent button styling across app

---

### 34. `components/ui/card.tsx`
**Purpose**: Card container components

**Exports**:

```typescript
<Card>         // Main container
<CardHeader>   // Top section
<CardTitle>    // Title text
<CardContent>  // Main content
```

**Features**:
- Dark theme styling
- Consistent spacing
- Rounded corners, borders
- Composable structure

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Incident Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Incident details...</p>
  </CardContent>
</Card>
```

**Why Important**: Consistent card layouts throughout app

---

### 35. `components/ui/badge.tsx`
**Purpose**: Badge/tag component for labels

**Props**:
```typescript
variant?: 'default' | 'secondary' | 'destructive' | 'outline'
```

**Features**:
- Color-coded variants
- Small, compact design
- Used for severity levels, status

**Usage**:
```tsx
<Badge variant="destructive">Critical</Badge>
<Badge variant="default">Medium</Badge>
```

**Why Important**: Visual severity indicators

---

### 36. `components/GeneratingModal.tsx`
**Purpose**: Modal dialog showing AI generation progress

**Main Component**:

```typescript
export function GeneratingModal()
```

**What it does**:
1. Displays full-screen modal overlay
2. Shows 5 generation stages:
   - Analyzing Slack conversations
   - Processing error logs
   - Correlating metrics and alerts
   - Identifying root cause
   - Generating recommendations
3. Animates progress through stages
4. Shows checkmarks as each stage completes
5. Progress bar at bottom

**Features**:
- Animated spinner
- Stage-by-stage completion
- Progress percentage
- Dark theme styling
- Auto-advances through stages (simulated)

**Usage**:
```tsx
{isGenerating && <GeneratingModal />}
```

**Why Important**: Provides visual feedback during AI generation (10 seconds)

---

### 37. `components/Toast.tsx`
**Purpose**: Toast notification component for user feedback

**Props**:

```typescript
{
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number  // Default: 5000ms
  onClose: () => void
}
```

**What it does**:
1. Shows notification in bottom-right corner
2. Auto-dismisses after duration
3. Color-coded by type (green/red/orange/blue)
4. Fade in/out animation
5. Manual close button

**Features**:
- Icon per type (✓ ✗ ⚠ ℹ)
- Customizable duration
- Smooth animations
- Fixed positioning

**Usage**:
```tsx
<Toast
  message="Postmortem generated successfully!"
  type="success"
  onClose={() => setToast(null)}
/>
```

**Why Important**: User feedback for actions (success/error notifications)

---



## 📝 Summary Table

| File | Purpose | Key Function |
|------|---------|-------------|
| `types/incident.ts` | Type definitions for incidents | Defines Incident, SlackMessage, etc. |
| `types/postmortem.ts` | Type definitions for postmortems | Defines Postmortem, Timeline, ActionItem |
| `app/page.tsx` | Main dashboard UI | Lists incidents, triggers generation |
| `app/postmortems/[id]/page.tsx` | Postmortem viewer | Displays formatted report |
| `app/api/generate-postmortem/route.ts` | Generate API | POST: Creates postmortem via AI |
| `app/api/incidents/route.ts` | Incidents API | GET: Returns all incidents |
| `app/api/dashboard/stats/route.ts` | Stats API | GET: Returns dashboard metrics |
| `app/api/slack/fetch-incident/route.ts` | Slack API | POST: Fetches from Slack channel |
| `lib/config.ts` | Configuration | Centralized config object |
| `lib/logger.ts` | Logging | Structured logging functions |
| `lib/errors.ts` | Error handling | Custom error classes |
| `lib/rate-limit.ts` | Rate limiting | API request throttling |
| `lib/ai/generator.ts` | AI generation | `generatePostmortem()` main function |
| `lib/ai/prompts.ts` | Prompt builder | Constructs AI prompts |
| `lib/ai/openai.ts` | OpenAI client | Azure OpenAI initialization |
| `lib/db/pool.ts` | DB connection | PostgreSQL connection pool |
| `lib/db/incidents.ts` | Incident DB ops | CRUD for incidents table |
| `lib/db/postmortems.ts` | Postmortem DB ops | CRUD for postmortems table |
| `lib/db/migrate.ts` | Migrations | Creates database tables |
| `lib/integrations/slack/client.ts` | Slack API client | Fetches Slack messages |
| `lib/integrations/slack/transformer.ts` | Slack transformer | Converts to Incident type |
| `lib/integrations/github/client.ts` | GitHub API client | Fetches commits, PRs |
| `lib/integrations/github/transformer.ts` | GitHub formatter | Formats for AI prompt |
| `lib/data/incidents.ts` | Mock data | 5 demo incidents |
| `components/ui/button.tsx` | Button component | Reusable buttons |
| `components/ui/card.tsx` | Card component | Container layouts |
| `components/ui/badge.tsx` | Badge component | Status/severity labels |
| `components/GeneratingModal.tsx` | Loading modal | Shows AI generation progress |
| `components/Toast.tsx` | Notification | Success/error messages |

---

## 🔄 Data Flow Through Code

### Slack → Database → AI → Postmortem Flow

```
1. User clicks "Fetch from Slack"
   ↓
2. app/page.tsx → handleFetchFromSlack()
   ↓
3. POST /api/slack/fetch-incident
   ↓
4. lib/integrations/slack/client.ts → fetchChannelMessages()
   ↓
5. lib/integrations/slack/transformer.ts → transformSlackToIncident()
   ↓
6. lib/db/incidents.ts → saveIncidentToDB()
   ↓
7. PostgreSQL database (incidents + slack_messages tables)
   ↓
8. User clicks "Generate Postmortem"
   ↓
9. app/page.tsx → handleGeneratePostmortem()
   ↓
10. POST /api/generate-postmortem
    ↓
11. lib/db/incidents.ts → getIncidentFromDB()
    ↓
12. lib/integrations/github/client.ts → fetchCommits()
    ↓
13. lib/ai/prompts.ts → buildPostmortemPrompt()
    ↓
14. lib/ai/generator.ts → generatePostmortem()
    ↓
15. Azure OpenAI API (GPT-4o-mini)
    ↓
16. lib/db/postmortems.ts → savePostmortemToDB()
    ↓
17. PostgreSQL database (postmortems table)
    ↓
18. Navigate to /postmortems/{id}
    ↓
19. app/postmortems/[id]/page.tsx → Display report
```

---

## 🎯 Key Architectural Patterns

### 1. **Separation of Concerns**
- **Types** (`/types`): Data structures
- **UI** (`/app`, `/components`): User interface
- **Business Logic** (`/lib`): Core functionality
- **Data Access** (`/lib/db`): Database operations
- **Integrations** (`/lib/integrations`): External APIs

### 2. **API Route Pattern**
- Each API route is a separate file
- Uses Next.js 14 App Router
- Exports `GET`, `POST` functions
- Consistent error handling

### 3. **Database Abstraction**
- Connection pool in `lib/db/pool.ts`
- Operations in separate files (`incidents.ts`, `postmortems.ts`)
- Raw SQL queries (no ORM)
- JSONB for flexible data

### 4. **Integration Pattern**
- Client class (API calls)
- Transformer (format conversion)
- Index file (public exports)
- Clean separation of concerns

### 5. **Type Safety**
- TypeScript throughout
- Strict type definitions in `/types`
- IDE autocomplete support
- Compile-time error detection

---

**Total Files Explained**: 37 files
**Total Lines of Code**: ~4,200 lines
**Languages**: TypeScript (95%), SQL (3%), CSS (2%)

**File Breakdown**:
- Types: 2 files
- App (Pages): 3 files
- API Routes: 5 files
- Business Logic (lib): 12 files
- Database (lib/db): 5 files
- Integrations: 6 files
- Components: 5 files
- Data: 1 file

---

---

## 🔍 Quick Reference Guide

### Need to add a new API route?
1. Create file in `app/api/{route-name}/route.ts`
2. Export `GET` or `POST` async function
3. Use `NextRequest` and `NextResponse`
4. Add error handling with `formatErrorResponse()`

### Need to add a new database table?
1. Add SQL to `lib/db/schema.sql`
2. Run `npm run db:migrate`
3. Create operations file in `lib/db/{table}.ts`
4. Add CRUD functions using `query()` from `lib/db/pool.ts`

### Need to add a new integration?
1. Create folder in `lib/integrations/{service}`
2. Add `client.ts` (API calls)
3. Add `transformer.ts` (data conversion)
4. Add `index.ts` (exports)
5. Add config to `lib/config.ts`

### Need to modify AI prompt?
- Edit `lib/ai/prompts.ts`
- Function: `buildPostmortemPrompt()`
- Test with different incidents
- Check JSON output structure

### Need to add a UI component?
1. Create in `components/{ComponentName}.tsx`
2. Use TypeScript for props
3. Apply Tailwind CSS classes
4. Use existing UI components from `components/ui/`

---

## 📖 Common Development Tasks

### Task 1: Add a new incident source
**Files to modify**:
- `lib/integrations/{source}/client.ts` - API calls
- `lib/integrations/{source}/transformer.ts` - Transform to Incident
- `app/api/{source}/fetch-incident/route.ts` - API endpoint
- `lib/config.ts` - Add configuration

### Task 2: Change AI model
**Files to modify**:
- `lib/config.ts` - Update `openai.model`
- `lib/ai/generator.ts` - Update model call
- `.env.local` - Update API keys if needed

### Task 3: Add database column
**Files to modify**:
- `lib/db/schema.sql` - ALTER TABLE or new CREATE
- `lib/db/{table}.ts` - Update INSERT/SELECT queries
- `types/{type}.ts` - Add to TypeScript type
- Run: `npm run db:migrate`

### Task 4: Add export format
**Files to modify**:
- `app/postmortems/[id]/page.tsx` - Add export button
- Create `lib/export/{format}.ts` - Export logic
- Add format type to `types/postmortem.ts`

---

## 🐛 Debugging Tips

### Backend Issues
- Check logs: Console output from `npm run dev`
- Enable debug: Set `DEBUG_MODE=true` in `.env.local`
- Database: Check PostgreSQL logs with `sudo -u postgres psql`

### API Issues
- Use browser DevTools Network tab
- Check API response in console
- Verify environment variables loaded
- Test with `curl` commands

### AI Issues
- Check prompt in `lib/ai/prompts.ts`
- Verify OpenAI API key is valid
- Check rate limits (Azure OpenAI dashboard)
- Test response JSON parsing

### Database Issues
- Check connection: `sudo service postgresql status`
- Verify credentials in `.env.local`
- Run migrations: `npm run db:migrate`
- Check tables: `sudo -u postgres psql -d aria_postmortem -c "\dt"`

---

## 📚 Code Conventions

### Naming Conventions
- **Files**: kebab-case (`fetch-incident.ts`)
- **Components**: PascalCase (`GeneratingModal.tsx`)
- **Functions**: camelCase (`fetchIncidents()`)
- **Types**: PascalCase (`Incident`, `Postmortem`)
- **Constants**: UPPER_SNAKE_CASE (`MOCK_INCIDENTS`)

### Code Organization
- **1 feature = 1 file** (separation of concerns)
- **Types first** (import types before implementation)
- **Error handling** (always use try/catch in async functions)
- **Logging** (use `logger.*` instead of `console.*`)

### TypeScript Best Practices
- Always define interfaces for props
- Use `async/await` instead of `.then()`
- Avoid `any` type (use `unknown` if needed)
- Export types alongside implementations

---

**Last Updated**: 2026-04-26
**Version**: 2.0
**Status**: Production-Ready ✅

