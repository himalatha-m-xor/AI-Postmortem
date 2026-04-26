# ✅ Slack Integration - Setup Complete!

The code is ready! Now follow these steps to test it:

---

## 📝 **Step 4: Update .env.local**

Make sure your `.env.local` has these values:

```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-YOUR-ACTUAL-TOKEN-HERE
SLACK_INCIDENT_CHANNEL_ID=C-YOUR-CHANNEL-ID-HERE
ENABLE_SLACK=true
```

**Replace with your actual values!**

---

## 🧪 **Step 5: Test in Slack Channel**

Go to your Slack #incidents channel and post these messages (copy-paste one by one):

```
🚨 Payment API latency spiking - investigating now
```

```
Seeing database connection pool exhausted errors
```

```
Checking recent deployments... payment-service v2.3.1 deployed 30 mins ago
```

```
Found the issue - connection leak in error handling code
```

```
Deploying hotfix now...
```

```
Hotfix deployed, connection pool stabilizing
```

```
✅ All systems operational - incident resolved
```

---

## 🚀 **Step 6: Restart the Dev Server**

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## ✅ **Step 7: Test the Integration**

### **7.1: Test Slack Connection**

Open browser and go to:
```
http://localhost:3000/api/slack/test-connection
```

You should see:
```json
{
  "success": true,
  "message": "Slack connection successful!"
}
```

If you see an error, check your SLACK_BOT_TOKEN is correct!

### **7.2: Fetch Incident from Slack**

1. Go to: http://localhost:3000
2. Click the **"Fetch from Slack"** button (top right)
3. Wait a few seconds...
4. You should see a popup: ✅ "Fetched incident from Slack: Payment API latency spiking..."
5. The incident should appear in your incident list!

### **7.3: Generate Postmortem from Real Slack Data**

1. Find the incident you just fetched
2. Click **"🚀 Close Incident & Generate Postmortem"**
3. AI will analyze your REAL Slack messages!
4. View the postmortem - it will include actual conversation!

---

## 🎉 **Success Checklist**

- [ ] `.env.local` updated with Slack tokens
- [ ] Test messages posted in Slack channel
- [ ] Dev server restarted
- [ ] `/api/slack/test-connection` shows success
- [ ] "Fetch from Slack" button works
- [ ] Incident appears in dashboard
- [ ] Postmortem generated from real Slack data

---

## 🐛 **Troubleshooting**

### **Error: "Slack is not configured"**
- Check SLACK_BOT_TOKEN is set in `.env.local`
- Check ENABLE_SLACK=true
- Restart dev server

### **Error: "missing_scope"**
- Go back to Slack App settings
- Add missing scopes (channels:history, channels:read, users:read)
- Reinstall app to workspace

### **Error: "channel_not_found"**
- Check SLACK_INCIDENT_CHANNEL_ID is correct
- Make sure bot is invited to the channel
- Type `/invite @ARIA Postmortem Bot` in the channel

### **Error: "No messages found"**
- Post some test messages in the channel
- Make sure messages are recent (within 24 hours)
- Try clicking "Fetch from Slack" again

---

## 📋 **What's Next?**

Once Slack integration is working:

1. **Add more incidents** - Test with different scenarios
2. **GitHub integration** - Add deployment context (optional)
3. **Deploy to Vercel** - Make it accessible online
4. **Share with team** - Get feedback!

---

**Need help? Tell me which step isn't working!** 🚀
