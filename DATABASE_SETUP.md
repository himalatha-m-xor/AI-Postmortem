# 🗄️ PostgreSQL Database Setup

This guide will help you set up PostgreSQL to store real incident and postmortem data.

---

## 📋 **Prerequisites**

You need a PostgreSQL database. Choose ONE option:

### **Option A: Local PostgreSQL (Recommended for Development)**
### **Option B: Free Cloud Database (Railway/Neon/Supabase)**

---

## 🚀 **Option A: Local PostgreSQL Setup**

### **1. Install PostgreSQL**

**On Ubuntu/WSL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**On Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
Download from https://www.postgresql.org/download/windows/

### **2. Create Database**

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE aria_db;

# Create user
CREATE USER aria_user WITH PASSWORD 'your_password_here';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE aria_db TO aria_user;

# Exit
\q
```

### **3. Get Connection String**

```
postgresql://aria_user:your_password_here@localhost:5432/aria_db
```

---

## ☁️ **Option B: Free Cloud Database (Recommended for Production)**

### **Railway.app (Free $5 credit)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on PostgreSQL → "Connect" → Copy "Postgres Connection URL"

### **Neon.tech (Free tier)**

1. Go to https://neon.tech
2. Sign up
3. Create new project
4. Copy connection string

### **Supabase (Free tier)**

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Copy connection string

---

## ⚙️ **Setup Steps**

### **1. Install Dependencies**

```bash
cd ~/Postmortem
npm install @prisma/client
npm install -D prisma
```

### **2. Add Database URL to .env.local**

```bash
# Add this line to your .env.local file
DATABASE_URL="postgresql://aria_user:your_password@localhost:5432/aria_db"
```

Replace with your actual connection string!

### **3. Generate Prisma Client**

```bash
npx prisma generate
```

### **4. Run Database Migration**

```bash
npx prisma db push
```

You should see:
```
✔ Your database is now in sync with your Prisma schema.
```

### **5. (Optional) Open Prisma Studio**

View your database in a nice UI:

```bash
npx prisma studio
```

Opens at http://localhost:5555

---

## ✅ **Test It Works**

### **1. Restart your app**

```bash
npm run dev
```

### **2. Fetch an incident from Slack**

- Click "Fetch from Slack"
- Incident will be saved to database!

### **3. Check the database**

```bash
npx prisma studio
```

You should see your incident in the `Incident` table!

### **4. Generate a postmortem**

- Click "Close Incident & Generate Postmortem"
- Postmortem will be saved to database!

### **5. Check dashboard stats**

- Refresh the page
- Stats should now show REAL data:
  - Active Incidents: actual count from DB
  - Avg MTTR: calculated from resolved incidents
  - Generated This Week: actual postmortem count

---

## 🎉 **What Changed**

### **Before (In-Memory Only):**
- ❌ Data lost on server restart
- ❌ Dummy stats (always "5 incidents", "45m MTTR", "12 postmortems")
- ❌ No persistence

### **After (PostgreSQL):**
- ✅ Data persists forever
- ✅ Real stats calculated from actual data
- ✅ Can query historical incidents
- ✅ Production-ready

---

## 📊 **Database Schema**

Your database now has these tables:

- **Incident** - Stores all incidents from Slack
- **Postmortem** - Stores generated postmortems
- **SlackMessage** - Slack conversation history
- **TimelineEvent** - Timeline from postmortems
- **ActionItem** - Action items from postmortems
- **PreventionMeasure** - Prevention measures
- **Log** - Error logs
- **Metric** - Metrics data
- **Alert** - Alert history

---

## 🔧 **Troubleshooting**

### **Error: "Can't reach database server"**
- Check DATABASE_URL is correct
- Check PostgreSQL is running: `sudo service postgresql status`
- Try: `sudo service postgresql restart`

### **Error: "Schema out of sync"**
```bash
npx prisma db push --force-reset
```

### **Want to reset database?**
```bash
npx prisma migrate reset
```

---

## 🚀 **You're Done!**

Your ARIA now has:
- ✅ PostgreSQL database
- ✅ Real-time stats
- ✅ Persistent storage
- ✅ Production-ready data layer

**Next:** Deploy to production with your database!
