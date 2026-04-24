# 🏗️ ARIA Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ARIA DEMO SYSTEM                      │
└─────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Next.js    │────────▶│   OpenAI    │
│  (Client)   │         │   Server     │         │     API     │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │                        │                         │
      ▼                        ▼                         ▼
  Dashboard              Mock Data                AI Generation
  Postmortem            (JSON files)              (GPT-4o-mini)
   Viewer
```

---

## 🔄 Request Flow

### When User Clicks "Generate Postmortem":

```
1. USER ACTION
   └─▶ Click "Close Incident & Generate Postmortem"

2. FRONTEND (app/page.tsx)
   └─▶ Send POST request to /api/generate-postmortem
       Body: { incidentId: "inc-001" }

3. API ROUTE (app/api/generate-postmortem/route.ts)
   └─▶ Find incident in mock data
   └─▶ Call AI generator

4. AI GENERATOR (lib/ai/generator.ts)
   └─▶ Build prompt with incident data
   └─▶ Send to OpenAI API
   └─▶ Wait for response (~10-15 seconds)

5. OPENAI API
   └─▶ Process incident data
   └─▶ Generate structured postmortem JSON
   └─▶ Return to server

6. API ROUTE
   └─▶ Store postmortem in memory
   └─▶ Return postmortem ID to frontend

7. FRONTEND
   └─▶ Redirect to /postmortems/[id]

8. POSTMORTEM VIEWER (app/postmortems/[id]/page.tsx)
   └─▶ Fetch postmortem data
   └─▶ Display beautiful report
```

---

## 📁 File Structure Explained

### **Frontend Pages**
```
app/
├── page.tsx                    → Dashboard (incident list)
├── postmortems/[id]/page.tsx  → Postmortem viewer
└── layout.tsx                 → Root layout (nav, theme)
```

### **API Routes**
```
app/api/
└── generate-postmortem/
    └── route.ts               → POST: Generate postmortem
                                  GET: Fetch postmortem by ID
```

### **AI Logic**
```
lib/ai/
├── openai.ts                  → OpenAI client configuration
├── prompts.ts                 → Prompt engineering templates
└── generator.ts               → Main generation logic
```

### **Mock Data**
```
lib/data/
└── incidents.ts               → 2 realistic incident scenarios
                                  - Database outage
                                  - API performance issue
```

### **Type Definitions**
```
types/
├── incident.ts                → Incident, LogEntry, SlackMessage, etc.
└── postmortem.ts             → Postmortem, TimelineEvent, ActionItem, etc.
```

---

## 🎨 Component Architecture

### Dashboard Page
```
Dashboard
├── Header
│   └── ARIA Logo + Status
├── Stats Cards
│   ├── Active Incidents
│   ├── Avg MTTR
│   └── Generated This Week
├── Open Incidents Section
│   └── IncidentCard (for each incident)
│       ├── Severity badge
│       ├── Title & description
│       ├── Metadata (users, duration)
│       └── "Generate Postmortem" button
└── Recent Postmortems Section
```

### Postmortem Viewer
```
PostmortemViewer
├── Header
│   ├── Back button
│   └── Export buttons (PDF, Markdown)
├── Hero Section
│   ├── Severity indicator
│   ├── Title
│   └── Metadata (duration, impact)
├── Executive Summary
├── Timeline
│   └── TimelineEvent (for each event)
│       ├── Timestamp
│       ├── Type indicator dot
│       └── Description
├── Root Cause
│   ├── Summary
│   ├── Technical details
│   └── Code example (if available)
├── Contributing Factors
├── What Went Well / Poorly
├── Prevention Measures
│   └── Measure cards with priority badges
└── Action Items
    └── Checkboxes with details
```

---

## 🔌 Data Flow

### Incident Data Structure
```typescript
{
  id: "inc-001",
  title: "Database Connection Pool Exhausted",
  severity: "critical",
  status: "open",
  startTime: "2024-04-22T14:23:00Z",
  affectedServices: ["Payment API", "User Dashboard"],
  usersImpacted: 2500,
  
  slackMessages: [
    { timestamp, user, message },
    ...
  ],
  
  logs: [
    { timestamp, level, message, service, stackTrace },
    ...
  ],
  
  metrics: [
    { timestamp, metric, value, unit },
    ...
  ],
  
  alerts: [
    { timestamp, type, message, user },
    ...
  ]
}
```

### AI Prompt Structure
```
1. System Message
   └─▶ "You are a Staff SRE writing blameless postmortems"

2. User Message (Prompt)
   ├─▶ Incident data (JSON)
   ├─▶ Task description
   ├─▶ Output format (JSON schema)
   ├─▶ Tone & style guidelines
   └─▶ Examples (optional)

3. AI Response
   └─▶ Structured JSON postmortem
```

### Postmortem Output Structure
```typescript
{
  id: "pm-1713801234567",
  incidentId: "inc-001",
  executiveSummary: "...",
  timeline: [...],
  rootCause: {
    summary: "...",
    technicalDetails: "...",
    codeExample: "..."
  },
  contributingFactors: [...],
  whatWentWell: [...],
  whatWentPoorly: [...],
  preventionMeasures: [...],
  actionItems: [...]
}
```

---

## 🎯 Key Technologies

### **Frontend**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations (optional)
- **Lucide React** - Icon library

### **Backend**
- **Next.js API Routes** - Serverless functions
- **OpenAI SDK** - AI integration

### **AI**
- **Model:** GPT-4o-mini (fast, cheap, good quality)
- **Temperature:** 0.7 (balanced creativity)
- **Format:** JSON mode (structured output)

### **Export**
- **jsPDF** - PDF generation
- **Markdown** - Text export

---

## 🔐 Environment Variables

```bash
OPENAI_API_KEY=sk-proj-...    # Required for AI generation
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────┐
│   Vercel    │  ← Free hosting
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OpenAI API │  ← Pay per use
└─────────────┘

# For Production (Future):
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│ PostgreSQL  │────▶│   OpenAI    │
│  (App)      │     │ (Database)  │     │    API      │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Real Integrations (Phase 2)    │
│  - Slack API                    │
│  - Datadog API                  │
│  - PagerDuty API                │
│  - Jira API                     │
└─────────────────────────────────┘
```

---

## 💡 Design Decisions

### Why Next.js?
- Server-side rendering for fast initial load
- API routes built-in (no separate backend)
- Easy deployment to Vercel
- Great developer experience

### Why OpenAI GPT-4o-mini?
- Cheap ($0.50-1 per postmortem)
- Fast (10-15 second generation)
- Good quality for structured tasks
- JSON mode ensures consistent output

### Why Mock Data?
- No complex integrations needed for demo
- Faster to build
- Easier to demo (predictable)
- Shows the value without the complexity

### Why In-Memory Storage?
- Simple for demo
- No database setup needed
- Fast
- Easy to reset between demos

---

## 🔄 Future Enhancements (Phase 2)

### Real Integrations
```
lib/integrations/
├── slack.ts         → Fetch Slack messages
├── datadog.ts       → Fetch logs & metrics
├── pagerduty.ts     → Fetch alerts
├── jira.ts          → Create tickets
└── github.ts        → Fetch recent commits
```

### Database
```
prisma/
├── schema.prisma    → Database schema
└── migrations/      → Version control for schema
```

### Authentication
```
lib/auth/
├── nextauth.ts      → User authentication
└── middleware.ts    → Route protection
```

---

This architecture is designed to:
✅ Be simple to understand
✅ Easy to demo
✅ Scalable to production
✅ Minimal dependencies
✅ Fast to build

**Current focus:** Prove the AI quality and value proposition
**Next phase:** Add real integrations
