# AI-Postmortem (ARIA) - Technical Documentation

## 📋 Overview

**ARIA (Living Postmortem AI)** is an intelligent system that automatically generates comprehensive, blameless postmortems from incident data using AI. It transforms what typically takes 3-5 days of manual work into a 10-second automated process.

### Purpose
- **Automate postmortem creation**: Eliminate manual documentation overhead
- **Ensure consistency**: Follow Google SRE best practices for blameless postmortems
- **Accelerate learning**: Generate actionable insights immediately after incident resolution
- **Reduce friction**: Export-ready documents (PDF, Markdown) for immediate sharing

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────┐
│   User Browser  │
│   (Next.js UI)  │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  ┌─────────────────────────────────┐   │
│  │  Frontend (React Components)     │   │
│  │  - Dashboard (Incident List)     │   │
│  │  - Postmortem Viewer             │   │
│  │  - Export Controls (PDF/MD)      │   │
│  └──────────────┬──────────────────┘   │
│                 │                        │
│  ┌──────────────▼──────────────────┐   │
│  │  API Routes (/api/*)            │   │
│  │  - POST /generate-postmortem    │   │
│  │  - GET  /generate-postmortem    │   │
│  └──────────────┬──────────────────┘   │
│                 │                        │
│  ┌──────────────▼──────────────────┐   │
│  │  Business Logic Layer           │   │
│  │  - AI Generator                 │   │
│  │  - Prompt Builder               │   │
│  │  - Storage Manager              │   │
│  │  - Error Handler                │   │
│  │  - Rate Limiter                 │   │
│  └──────────────┬──────────────────┘   │
│                 │                        │
│  ┌──────────────▼──────────────────┐   │
│  │  Data Layer                     │   │
│  │  - In-Memory Storage (Global)   │   │
│  │  - Mock Incident Data           │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
              │ OpenAI API / Azure OpenAI
              ▼
┌──────────────────────────┐
│   AI Service (External)  │
│   - OpenAI GPT-4o-mini   │
│   - Azure OpenAI         │
└──────────────────────────┘
```

---

## 🔄 Code Execution Flow

### 1. **User Initiates Postmortem Generation**
```
User clicks "Generate Postmortem" → Dashboard (page.tsx)
```

### 2. **API Request**
```
Frontend → POST /api/generate-postmortem
         → Body: { incidentId: "inc-001" }
```

### 3. **API Route Processing** (`app/api/generate-postmortem/route.ts`)
- Validate request (rate limiting, schema validation)
- Find incident from mock data (`MOCK_INCIDENTS`)
- Set end time if not present
- Call AI generator

### 4. **AI Generation** (`lib/ai/generator.ts`)
- Build structured prompt (`buildPostmortemPrompt()`)
- Call OpenAI/Azure OpenAI API
- Parse JSON response
- Transform to `Postmortem` type

### 5. **Prompt Construction** (`lib/ai/prompts.ts`)
- Include incident metadata
- Add Slack conversation logs
- Include error logs and metrics
- Define expected JSON structure

### 6. **Storage** (`lib/storage.ts`)
- Save postmortem to in-memory global storage
- Return postmortem ID

### 7. **Response & Display**
```
API → Frontend → Navigate to /postmortems/{id}
                → Fetch postmortem data
                → Render interactive viewer
```

---

## ✨ Features Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| **Dark Mode UI** | ✅ | Modern slate-themed interface with Tailwind CSS |
| **Real-time AI Generation** | ✅ | GPT-4o-mini powered postmortem creation |
| **Timeline Visualization** | ✅ | Chronological incident events with type indicators |
| **PDF Export** | ✅ | Professional PDF generation with jsPDF |
| **Markdown Export** | ✅ | Developer-friendly markdown format |
| **Copy to Clipboard** | ✅ | Quick copy for sharing |
| **Multiple Incident Scenarios** | ✅ | 5 realistic incidents (DB, Memory, SSL, DDoS, Deployment) |
| **Blameless Format** | ✅ | Follows Google SRE postmortem structure |
| **Error Handling** | ✅ | Comprehensive error messages and logging |
| **Rate Limiting** | ✅ | Configurable API rate limiting |
| **Multi-Provider Support** | ✅ | OpenAI and Azure OpenAI |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.0 | React framework with SSR/API routes |
| **React** | 18.3.0 | UI component library |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Tailwind CSS** | 3.4.3 | Utility-first styling |
| **Framer Motion** | 11.2.0 | Smooth animations |
| **Lucide React** | 0.395.0 | Modern icon library |

### Backend & AI
| Technology | Version | Purpose |
|------------|---------|---------|
| **OpenAI SDK** | 4.57.0 | GPT-4o-mini API integration |
| **jsPDF** | 2.5.1 | PDF generation |
| **react-markdown** | 9.0.1 | Markdown rendering |
| **date-fns** | 3.6.0 | Date/time formatting |

### Infrastructure
- **Hosting**: Vercel (free tier recommended)
- **LLM**: OpenAI GPT-4o-mini or Azure OpenAI
- **Storage**: In-memory (development), extensible to PostgreSQL/Redis

---

## 📊 Data Collection & Processing

### Dummy Data Location
**File**: `lib/data/incidents.ts`

Contains 5 pre-configured incident scenarios:
- `inc-001`: Database connection pool exhaustion
- `inc-002`: Memory leak in checkout service
- `inc-003`: SSL certificate expiration
- `inc-004`: DDoS attack traffic spike
- `inc-005`: Breaking API deployment

### Data Structure

Each incident contains rich mock data:

```typescript
{
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'investigating' | 'resolved'
  startTime: ISO timestamp
  endTime: ISO timestamp (optional)
  affectedServices: string[]
  usersImpacted: number

  // Communication logs
  slackMessages: [
    { timestamp, user, message }
  ]

  // Technical data
  logs: [
    { timestamp, level, message, service, stackTrace }
  ]

  metrics: [
    { timestamp, metric, value, unit }
  ]

  alerts: [
    { timestamp, type, message, user }
  ]
}
```

### Data Processing Pipeline

1. **Input**: User selects incident from dashboard
2. **Retrieval**: System fetches incident data from `MOCK_INCIDENTS` array
3. **Enrichment**: Add end time if missing, calculate duration
4. **Prompt Construction**:
   - Serialize incident data to JSON
   - Embed Slack conversations (with timestamps and users)
   - Include error logs with stack traces
   - Add metric snapshots (showing degradation)
   - Insert alert timeline
5. **AI Processing**: Send structured prompt to GPT-4o-mini
6. **Response Parsing**: Parse JSON response into `Postmortem` type
7. **Storage**: Save to in-memory storage (global variable)
8. **Display**: Render formatted postmortem with interactive UI

---

## 🤖 AI Content Generation

### How AI Generates Postmortems

#### Model Configuration
- **Model**: GPT-4o-mini (fast, cost-effective)
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Response Format**: JSON mode (structured output)

#### Prompt Engineering Strategy

The prompt (`lib/ai/prompts.ts`) uses:
1. **Role Definition**: "You are a Staff SRE writing blameless postmortems"
2. **Context Injection**: Full incident data as JSON
3. **Format Specification**: Exact JSON schema for output
4. **Guidelines**:
   - Blameless approach (focus on systems, not people)
   - Data-driven analysis (use actual timestamps/metrics)
   - Actionable recommendations (specific prevention measures)

#### AI Output Processing

The AI generates:
- **Executive Summary**: 2-3 sentence overview
- **Timeline**: Extracted from Slack messages with event types
- **Root Cause**: Technical analysis with code examples
- **Contributing Factors**: Systemic issues that worsened impact
- **What Went Well/Poorly**: Balanced retrospective
- **Prevention Measures**: Categorized (Monitoring, Testing, Process, Architecture)
- **Action Items**: Prioritized tasks with owners and due dates

---

## 💾 Current Data Flow (Dummy Data)

```
MOCK_INCIDENTS (hardcoded array)
    ↓
User selects incident
    ↓
API fetches from static array
    ↓
AI processes mock Slack logs, metrics, errors
    ↓
Generated postmortem stored in-memory
    ↓
Lost on server restart
```

### Where Dummy Data Exists

| Component | Location | Purpose |
|-----------|----------|---------|
| **Incident Data** | `lib/data/incidents.ts` | 5 pre-written scenarios with detailed timelines |
| **Slack Messages** | Within each incident | Realistic conversation threads |
| **Error Logs** | Within each incident | Stack traces and error messages |
| **Metrics** | Within each incident | Time-series data (CPU, memory, latency) |
| **In-Memory Storage** | `lib/storage.ts` (global variable) | Temporary postmortem storage |

---

## 🚀 Improvement Roadmap: Real Data Integration

### Current Limitations
- ❌ Data lost on restart (in-memory storage)
- ❌ No real incident tracking
- ❌ Manual incident creation
- ❌ No integration with monitoring tools

### Recommended Improvements

### 1. **Persistent Database Layer**

Replace in-memory storage with PostgreSQL:

```typescript
// lib/db/schema.prisma
model Incident {
  id              String   @id @default(uuid())
  title           String
  severity        String
  status          String
  startTime       DateTime
  endTime         DateTime?
  affectedServices String[]
  usersImpacted   Int
  slackChannelId  String
  createdAt       DateTime @default(now())

  postmortem      Postmortem?
  slackMessages   SlackMessage[]
  logs            LogEntry[]
  metrics         MetricSnapshot[]
}

model Postmortem {
  id              String   @id @default(uuid())
  incidentId      String   @unique
  incident        Incident @relation(fields: [incidentId], references: [id])
  content         Json
  generatedAt     DateTime @default(now())
}
```

**Implementation**:
- Use Prisma ORM for type-safe database access
- Migrate `lib/storage.ts` to use database queries
- Add database connection pooling

---

### 2. **Real-Time Slack Integration**

Integrate Slack API to capture live incident conversations:

```typescript
// lib/integrations/slack.ts
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function fetchChannelMessages(channelId: string, since: Date) {
  const result = await slack.conversations.history({
    channel: channelId,
    oldest: since.getTime() / 1000,
  });

  return result.messages.map(msg => ({
    timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
    user: msg.user,
    message: msg.text,
  }));
}
```

**Setup**:
- Create Slack App with `channels:history` scope
- Store bot token in environment variables
- Link incidents to Slack channels on creation
- Fetch messages when generating postmortem

---

### 3. **Monitoring Tool Integration**

Connect to observability platforms for real metrics:

#### Datadog Integration
```typescript
// lib/integrations/datadog.ts
import { client, v1 } from '@datadog/datadog-api-client';

const config = client.createConfiguration();
const metricsApi = new v1.MetricsApi(config);

export async function fetchMetrics(
  metricName: string,
  from: number,
  to: number
) {
  const response = await metricsApi.queryMetrics({
    from,
    to,
    query: `avg:${metricName}{*}`,
  });

  return response.series[0].pointlist.map(([timestamp, value]) => ({
    timestamp: new Date(timestamp).toISOString(),
    metric: metricName,
    value,
  }));
}
```

#### PagerDuty Integration
```typescript
// lib/integrations/pagerduty.ts
import axios from 'axios';

export async function fetchIncidentAlerts(incidentId: string) {
  const response = await axios.get(
    `https://api.pagerduty.com/incidents/${incidentId}/alerts`,
    {
      headers: {
        Authorization: `Token token=${process.env.PAGERDUTY_API_KEY}`,
      },
    }
  );

  return response.data.alerts;
}
```

---

### 4. **Log Aggregation Integration**

Pull real error logs from centralized logging:

#### Splunk/ELK Integration
```typescript
// lib/integrations/logs.ts
import axios from 'axios';

export async function fetchLogs(
  service: string,
  startTime: Date,
  endTime: Date
) {
  // Example for Elasticsearch
  const query = {
    query: {
      bool: {
        filter: [
          { term: { 'service.name': service } },
          { range: { '@timestamp': { gte: startTime, lte: endTime } } },
          { terms: { 'log.level': ['error', 'warning'] } },
        ],
      },
    },
    sort: [{ '@timestamp': 'asc' }],
    size: 100,
  };

  const response = await axios.post(
    `${process.env.ELASTICSEARCH_URL}/_search`,
    query,
    {
      auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASSWORD,
      },
    }
  );

  return response.data.hits.hits.map(hit => ({
    timestamp: hit._source['@timestamp'],
    level: hit._source.log.level,
    message: hit._source.message,
    service: hit._source.service.name,
    stackTrace: hit._source.error?.stack_trace,
  }));
}
```

---

### 5. **Automated Incident Creation**

Trigger incident creation from alerts:

```typescript
// lib/webhooks/pagerduty.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();

  if (payload.event.event_type === 'incident.triggered') {
    const incident = await createIncident({
      title: payload.event.data.title,
      severity: mapSeverity(payload.event.data.urgency),
      status: 'open',
      startTime: payload.event.occurred_at,
      affectedServices: extractServices(payload.event.data.service),
      slackChannel: await createSlackChannel(payload.event.data.id),
    });

    // Start collecting data in background
    startDataCollection(incident.id);
  }

  return NextResponse.json({ received: true });
}
```

---

### 6. **Complete Real Data Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    External Systems                      │
├──────────────┬──────────────┬──────────────┬────────────┤
│  PagerDuty   │    Slack     │   Datadog    │  ELK/Logs  │
│  (Alerts)    │  (Comms)     │  (Metrics)   │  (Errors)  │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────┘
       │              │              │              │
       │ Webhooks     │ API          │ API          │ API
       ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────┐
│              ARIA Application (Next.js)                  │
│  ┌────────────────────────────────────────────────┐     │
│  │         Integration Layer                      │     │
│  │  - Slack Client    - Datadog Client            │     │
│  │  - PagerDuty       - Log Aggregator            │     │
│  └───────────────────┬────────────────────────────┘     │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │         Incident Collection Service            │     │
│  │  - Continuous data polling                     │     │
│  │  - Real-time message capture                   │     │
│  │  - Metric snapshot scheduling                  │     │
│  └───────────────────┬────────────────────────────┘     │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │         PostgreSQL Database                    │     │
│  │  - Incidents table                             │     │
│  │  - Slack messages                              │     │
│  │  - Logs & metrics                              │     │
│  │  - Postmortems                                 │     │
│  └───────────────────┬────────────────────────────┘     │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │         AI Postmortem Generator                │     │
│  │  - Fetch enriched incident data                │     │
│  │  - Generate comprehensive postmortem           │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Environment Variables for Real Data

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aria

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret

# PagerDuty
PAGERDUTY_API_KEY=your-api-key

# Datadog
DATADOG_API_KEY=your-api-key
DATADOG_APP_KEY=your-app-key

# Elasticsearch/ELK
ELASTICSEARCH_URL=https://your-cluster.es.io
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=your-password

# OpenAI
OPENAI_API_KEY=sk-proj-your-key

# Azure OpenAI (alternative)
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
```

---

## 📈 Benefits of Real Data Integration

| Benefit | Impact |
|---------|--------|
| **Accuracy** | Exact timestamps, real error messages, actual metrics |
| **Completeness** | Capture all communications and events automatically |
| **Speed** | No manual data entry required |
| **Persistence** | Data survives restarts, queryable history |
| **Analytics** | Track trends across incidents over time |
| **Automation** | End-to-end flow from alert → postmortem |

---

## 🎯 Summary

ARIA transforms incident postmortems from a 3-5 day manual process into a 10-second automated workflow. Currently using mock data for demonstration, the system is architected to seamlessly integrate with real observability tools (Slack, Datadog, PagerDuty, ELK) and persistent storage (PostgreSQL) for production use.

**Key Takeaway**: The current implementation proves the AI postmortem concept works beautifully. The next step is connecting it to real incident data sources for enterprise deployment.
