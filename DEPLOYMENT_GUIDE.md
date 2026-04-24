# 🚀 ARIA Deployment Guide

Deploy ARIA to the internet for free using Vercel!

---

## 🤔 Why Deploy?

**Benefits:**
- ✅ Live URL to share with client
- ✅ No need to run locally during demo
- ✅ More professional
- ✅ Can demo from anywhere
- ✅ Client can test it themselves

**When to deploy:**
- If you want a live demo URL
- If presenting remotely and want backup
- If client wants to try it themselves

**When NOT to deploy (yet):**
- If demo is tomorrow and you haven't tested locally yet
- If you're not comfortable with deployment

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free signup)
- [ ] OpenAI API key
- [ ] App working locally

---

## 🎯 Deployment Steps (15 minutes)

### Step 1: Push to GitHub (5 minutes)

**If you haven't initialized git yet:**

```bash
# Initialize git repo
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - ARIA postmortem AI"

# Create repo on GitHub
# Go to github.com → New Repository
# Name it: aria-postmortem
# Don't initialize with README (we already have files)

# Add GitHub as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/aria-postmortem.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Expected result:**
- ✅ Your code is on GitHub
- ✅ You can see it at github.com/YOUR-USERNAME/aria-postmortem

---

### Step 2: Sign Up for Vercel (2 minutes)

1. Go to: **https://vercel.com/signup**
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Complete signup

**Expected result:**
- ✅ Vercel account created
- ✅ Connected to GitHub

---

### Step 3: Deploy to Vercel (5 minutes)

1. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `aria-postmortem` repository
   - Click "Import"

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `next build` (leave default)
   - Output Directory: `.next` (leave default)

3. **Add Environment Variable**
   - Click "Environment Variables"
   - Add variable:
     - Name: `OPENAI_API_KEY`
     - Value: `sk-proj-your-actual-key-here`
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes while it builds

**Expected result:**
- ✅ Build completes successfully
- ✅ You get a live URL like: `aria-postmortem.vercel.app`

---

### Step 4: Test Deployed App (3 minutes)

1. Click on the deployment URL
2. Wait for page to load
3. Try generating a postmortem
4. Verify it works

**Expected:**
- ✅ Dashboard loads
- ✅ Can generate postmortem
- ✅ All features work
- ✅ No errors

---

## 🌐 Your Live URLs

After deployment, you'll have:

**Production URL:**
```
https://aria-postmortem.vercel.app
(or custom domain if you set one up)
```

**Preview URLs:**
- Every git push creates a new preview URL
- Perfect for testing changes before going live

---

## 🔄 Updating Your Deployed App

**To make changes:**

```bash
# Make your changes locally
# Test them: npm run dev

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push

# Vercel auto-deploys! (takes ~1 minute)
```

**That's it!** Vercel automatically rebuilds and deploys when you push to GitHub.

---

## 🎨 Custom Domain (Optional)

**If you want a custom domain:**

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. Go to Vercel → Your Project → Settings → Domains
3. Add your domain
4. Follow DNS setup instructions
5. Wait for DNS to propagate (~30 min to 24 hours)

**Example:**
- Instead of: `aria-postmortem.vercel.app`
- You get: `aria.yourdomain.com`

---

## 📊 Monitoring Your Deployment

**Vercel Dashboard shows:**
- Deployment status
- Build logs (for debugging)
- Analytics (how many visitors)
- Error logs

**Access at:** https://vercel.com/dashboard

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to GitHub
- ✅ Add secrets only in Vercel dashboard
- ✅ Use different API keys for dev vs production (optional)

### API Key Protection
- ✅ API routes run server-side (key is safe)
- ✅ Never expose API key in frontend code
- ✅ Set usage limits on OpenAI dashboard

---

## 💰 Costs

**Vercel Free Tier includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Custom domains
- Automatic HTTPS
- Preview URLs

**Limitations:**
- 1 team member (fine for solo projects)
- 100 GB bandwidth (plenty for a demo)

**OpenAI Costs:**
- ~$0.50-1.00 per postmortem generated
- $5 free credit = 100+ demos
- Can set spending limits

**Total monthly cost for demo: $0-5**

---

## 🚨 Troubleshooting Deployment

### Build Fails

**Error: "Module not found"**
```bash
# Make sure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable missing"**
- Go to Vercel dashboard → Settings → Environment Variables
- Add OPENAI_API_KEY
- Redeploy: Deployments → Click "..." → Redeploy

### Deployment Success but App Doesn't Work

**Check Vercel logs:**
1. Go to Vercel dashboard
2. Click on failed deployment
3. Click "View Function Logs"
4. Look for error messages

**Common issues:**
- API key not set correctly
- Missing environment variables
- Syntax error in code

### Slow Performance

**Vercel free tier is fast enough for demos.**

If it's slow:
- Check OpenAI API response time (usually the bottleneck)
- Check your internet connection
- Try different browser

---

## 🎯 Demo with Deployed Version

**Benefits:**
- No local setup needed during demo
- Works from any device
- Can share link with client
- More professional

**Demo flow:**
1. Share URL with client before call
2. Open URL during demo
3. Show live demo
4. Client can try it themselves after

**Talking point:**
> "This is already deployed and live. You can try it yourself at this URL..."

---

## 📱 Sharing with Client

**Send them:**
1. **Live URL:** `https://your-app.vercel.app`
2. **Demo video:** (if you recorded one)
3. **Sample PDF:** Export a postmortem and attach

**Email template:**
```
Hi [Client Name],

Following up on our demo, here's the live ARIA application:

🔗 Live Demo: https://aria-postmortem.vercel.app

Feel free to test it yourself:
1. Click "Close Incident & Generate Postmortem"
2. Wait ~15 seconds
3. See the AI-generated report

I've also attached a sample postmortem PDF.

Let me know if you have any questions!

Best,
[Your Name]
```

---

## 🔄 Rolling Back Deployment

**If something breaks:**

1. Go to Vercel dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

**Your app is back to working state!**

---

## 📈 Next Steps After Deployment

### For Demo:
- [ ] Test deployed app thoroughly
- [ ] Share URL with team/client
- [ ] Set up custom domain (optional)

### For Production:
- [ ] Add user authentication
- [ ] Connect real data sources
- [ ] Set up database
- [ ] Add monitoring/alerts
- [ ] Implement rate limiting

---

## ✅ Deployment Checklist

**Before deploying:**
- [ ] App works perfectly locally
- [ ] All tests pass (see TESTING_GUIDE.md)
- [ ] Code committed to GitHub
- [ ] .env.local NOT committed (in .gitignore)

**During deployment:**
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added
- [ ] Deployment successful

**After deployment:**
- [ ] Live URL works
- [ ] Can generate postmortem
- [ ] No console errors
- [ ] Shared URL with relevant people

---

## 🎉 You're Live!

Your app is now on the internet! 🌐

**Show it off:**
- Demo to client from live URL
- Add to your portfolio
- Share with friends/colleagues

---

**Questions about deployment? Check Vercel docs: https://vercel.com/docs**
