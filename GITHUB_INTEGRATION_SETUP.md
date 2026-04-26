# 🐙 GitHub Integration Setup

## ✅ Integration Built!

The GitHub integration is now ready. Follow these steps to enable it:

---

## 🔑 **Step 1: Get GitHub Personal Access Token**

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `ARIA Postmortem Integration`
4. Set expiration: **90 days** (or longer)
5. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
6. Click **"Generate token"**
7. **Copy the token** (starts with `ghp_`)
   - ⚠️ Save it now! You won't see it again!

---

## ⚙️ **Step 2: Add to .env.local**

Add these lines to your `.env.local` file:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_YOUR_ACTUAL_TOKEN_HERE
GITHUB_ORG=your-github-username-or-org
GITHUB_REPO=your-repository-name
ENABLE_GITHUB=true
```

**Example:**
```bash
GITHUB_TOKEN=ghp_abc123def456...
GITHUB_ORG=himalatha-m-xor
GITHUB_REPO=AI-Postmortem
ENABLE_GITHUB=true
```

---

## 🧪 **Step 3: Test Connection**

```bash
# Restart server
npm run dev
```

Then test in browser:
```
http://localhost:3000/api/github/test-connection
```

**You should see:**
```json
{
  "success": true,
  "message": "GitHub connection successful!",
  "org": "your-org",
  "repo": "your-repo",
  "recentCommits": 3
}
```

---

## 🎯 **What It Does**

When you generate a postmortem, ARIA will now automatically:

### **1. Fetch Recent Commits**
```
Recent Commits (last 24h):
- abc123f - Fix payment retry logic (Sarah Chen)
- def456g - Update database timeout (Mike Rodriguez)
- ghi789h - Refactor error handling (Emily Watson)
```

### **2. Find Deployments**
```
Recent Deployments:
- 14:00 - Deployed abc123f to production by GitHub Actions
- 12:30 - Deployed xyz789a to production by Sarah Chen
```

### **3. Identify Suspicious Deployment**
```
⚠️ Suspicious Deployment (within 2h of incident):
- 14:00 - Deployed abc123f by GitHub Actions
```

### **4. Show Recent PRs**
```
Recently Merged Pull Requests:
- PR #234: Refactor payment error handling by sarah
- PR #235: Add connection pool monitoring by mike
```

### **5. Correlate with Incident**
The AI will:
- Compare deployment time with incident start
- Identify which commit likely caused the issue
- Include deployment context in root cause analysis
- Show code changes in the timeline

---

## 📊 **Example Postmortem With GitHub**

```markdown
## Timeline of Events

13:50 - PR #234 merged: "Refactor payment error handling"
        by Sarah Chen

14:00 - 🚀 Deployment to production
        Commit: abc123f
        Deployed by: GitHub Actions

14:23 - 🚨 Alert: Payment API latency > 5s
        (23 minutes after deployment!)

14:25 - Team investigating recent deployment
        
14:30 - Root cause identified in commit abc123f
        
14:45 - Hotfix deployed (reverted abc123f)
        
16:47 - ✅ Incident resolved

## Root Cause

Deployment at 14:00 (commit abc123f) introduced a connection 
leak in the error handler. This was identified by correlating 
the incident start time with recent GitHub deployments.

Related PR: #234 "Refactor payment error handling"
```

---

## 🔧 **Troubleshooting**

### **Error: "GitHub is not configured"**
- Check `GITHUB_TOKEN` is set in `.env.local`
- Check `GITHUB_ORG` and `GITHUB_REPO` are correct
- Set `ENABLE_GITHUB=true`
- Restart server

### **Error: "GitHub connection failed"**
- Check token is valid (not expired)
- Check you have access to the repository
- Check org/repo names are correct (case-sensitive!)

### **Error: "404 Not Found"**
- Repository name might be wrong
- You might not have access to the repo
- Try: `GITHUB_ORG=your-username` (not organization name)

### **No commits showing?**
- Make sure there are commits in last 24 hours
- Try pushing a test commit
- Check repository has commits

---

## 🎉 **You're Done!**

Now when you:
1. Fetch incident from Slack
2. Click "Generate Postmortem"

The postmortem will include:
- ✅ Recent commits
- ✅ Deployments timeline
- ✅ Suspicious deployment detection
- ✅ Code change correlation
- ✅ PR information

**Much more context = Better postmortems!** 🚀
