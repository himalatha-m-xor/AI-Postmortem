# PostgreSQL Database Setup Guide

## ✅ What's Configured

- ✅ Direct PostgreSQL connection using `pg` library (no Prisma)
- ✅ Connection pool configured in `lib/db/pool.ts`
- ✅ Database schema defined in `lib/db/schema.sql`
- ✅ Database operations using raw SQL queries
- ✅ Environment variables configured
- ✅ Migration script ready

## 🔧 Environment Variables

Already configured in `.env.local`:

```bash
POSTGRES_DB=aria_postmortem
POSTGRES_USER=postgres
POSTGRES_PASSWORD=R@vi9347
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## 🚀 Setup Commands

Run these commands in your WSL terminal:

### Step 1: Create the Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Inside psql, run:
CREATE DATABASE aria_postmortem;

# Grant permissions (if needed)
ALTER USER postgres WITH PASSWORD 'R@vi9347';

# Exit
\q
```

### Step 2: Install Dependencies

```bash
cd ~/AI-Postmortem
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- `@types/pg` - TypeScript types
- `tsx` - TypeScript executor

### Step 3: Run Database Migration

```bash
npm run db:migrate
```

This will:
- Create all tables (incidents, postmortems, slack_messages, logs, metrics, alerts, etc.)
- Create indexes for performance
- Set up foreign keys

### Step 4: Verify Database Setup

```bash
# Check tables were created
sudo -u postgres psql -d aria_postmortem -c "\dt"
```

You should see:
```
                    List of relations
 Schema |         Name          | Type  |  Owner   
--------+-----------------------+-------+----------
 public | action_items          | table | postgres
 public | alerts                | table | postgres
 public | incidents             | table | postgres
 public | logs                  | table | postgres
 public | metrics               | table | postgres
 public | postmortems           | table | postgres
 public | prevention_measures   | table | postgres
 public | slack_messages        | table | postgres
 public | timeline_events       | table | postgres
```

### Step 5: Start the Application

```bash
npm run dev
```

## 🧪 Test the Integration

### 1. Fetch Incident from Slack

- Open your app at http://localhost:3000
- Click "Fetch from Slack" (if Slack integration is configured)
- The incident will be saved to PostgreSQL

### 2. Verify Data in Database

```bash
# View all incidents
sudo -u postgres psql -d aria_postmortem -c "SELECT id, title, severity, status FROM incidents;"

# View incident details
sudo -u postgres psql -d aria_postmortem -c "SELECT * FROM slack_messages LIMIT 5;"
```

### 3. Generate Postmortem

- Click "Generate Postmortem" for an incident
- The postmortem will be saved to the database

### 4. Check Postmortems

```bash
sudo -u postgres psql -d aria_postmortem -c "SELECT id, incident_title, severity FROM postmortems;"
```

## 📊 Database Tables (Simplified)

| Table | Description | Storage Type |
|-------|-------------|--------------|
| `incidents` | Main incident records from Slack | Relational |
| `slack_messages` | Slack conversation history (for AI processing) | Relational |
| `postmortems` | AI-generated postmortem reports | Relational + JSONB |

**JSONB Fields in Postmortems:**
- `timeline` - Event timeline
- `prevention_measures` - Prevention actions
- `action_items` - Follow-up tasks
- `contributing_factors` - Analysis factors
- `what_went_well` / `what_went_poorly` - Retrospective
- `remediation_steps` - Fix steps taken

## 🔍 Useful PostgreSQL Commands

```bash
# Connect to database
sudo -u postgres psql -d aria_postmortem

# Inside psql:
\dt                          # List all tables
\d incidents                 # Describe incidents table
SELECT COUNT(*) FROM incidents;  # Count incidents
SELECT * FROM incidents LIMIT 5; # View first 5 incidents

# Exit
\q
```

## 🔄 Data Flow

```
Slack API → Fetch Incident → Transform Data → saveIncidentToDB()
                                                     ↓
                                          INSERT INTO incidents
                                          INSERT INTO slack_messages
                                          INSERT INTO logs, metrics, alerts
                                                     ↓
                                              PostgreSQL Database
```

## 🛠️ Troubleshooting

### Error: "database does not exist"
```bash
sudo -u postgres psql -c "CREATE DATABASE aria_postmortem;"
```

### Error: "password authentication failed"
```bash
# Update PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'R@vi9347';"
```

### Error: "connection refused"
```bash
# Start PostgreSQL
sudo service postgresql start

# Check status
sudo service postgresql status
```

### Error: "permission denied for database"
```bash
sudo -u postgres psql -d aria_postmortem -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
```

## ✨ Features

### What Works Now

✅ **Direct PostgreSQL Connection** - No ORM overhead
✅ **Raw SQL Queries** - Full control over database operations
✅ **Connection Pooling** - Efficient connection management
✅ **Automatic Migrations** - Run `npm run db:migrate`
✅ **Slack → Database** - Incidents saved automatically
✅ **AI → Database** - Postmortems persisted
✅ **Dashboard Stats** - Real data from PostgreSQL

### Advantages Over Prisma

- ✅ No schema validation errors
- ✅ Direct SQL control
- ✅ Simpler configuration
- ✅ No Prisma version conflicts
- ✅ Better performance for complex queries

## 📝 Next Steps

1. ✅ Run the setup commands above
2. ✅ Test by fetching an incident from Slack
3. ✅ Verify data in PostgreSQL
4. ✅ Generate a postmortem and check it's saved

Your PostgreSQL integration is complete! 🎉
