# 🧪 ARIA Testing Guide

## ✅ Pre-Demo Testing Checklist

Test everything before showing to the client!

---

## 🚀 Basic Functionality Tests

### Test 1: App Starts Successfully
```bash
npm run dev
```

**Expected:**
- ✅ No errors in terminal
- ✅ Shows "Ready in X seconds"
- ✅ URL: http://localhost:3000

**If it fails:**
- Check Node.js is installed: `node --version`
- Delete node_modules: `rm -rf node_modules && npm install`
- Check for port conflicts: Try `npm run dev -- -p 3001`

---

### Test 2: Dashboard Loads
**Steps:**
1. Open http://localhost:3000 in browser
2. Wait for page to load

**Expected:**
- ✅ Beautiful dark dashboard appears
- ✅ 3 stat cards showing (Active Incidents, Avg MTTR, Generated This Week)
- ✅ 2 open incidents visible
- ✅ "Recent Postmortems" section at bottom
- ✅ No console errors (F12 → Console tab)

**If it fails:**
- Check browser console for errors
- Hard refresh: Ctrl+Shift+R
- Clear browser cache

---

### Test 3: Generate Postmortem (MOST IMPORTANT!)
**Steps:**
1. Click "🚀 Close Incident & Generate Postmortem" on first incident
2. Wait for modal to appear
3. Watch progress stages complete
4. Wait for redirect (~15 seconds total)

**Expected:**
- ✅ Loading modal appears immediately
- ✅ Progress bar animates from 0% to 100%
- ✅ Stages check off one by one:
  - Analyzing Slack conversations ✅
  - Processing error logs ✅
  - Correlating metrics and alerts ✅
  - Identifying root cause ✅
  - Generating recommendations ✅
- ✅ Redirects to postmortem viewer page
- ✅ Beautiful postmortem report appears

**If it fails:**
- **Error: "OPENAI_API_KEY is missing"**
  → Check `.env.local` file exists and has your key
  
- **Error: "Failed to generate postmortem"**
  → Check internet connection
  → Verify API key is correct
  → Check OpenAI API status: https://status.openai.com
  
- **Timeout or hangs:**
  → Wait up to 30 seconds
  → Check OpenAI usage limits
  → Try refreshing and generating again

---

### Test 4: Postmortem Content Quality
**Steps:**
1. After postmortem generates, scroll through entire page
2. Read each section

**Expected:**
- ✅ **Executive Summary:** 2-3 sentences, makes sense
- ✅ **Timeline:** Multiple events with timestamps from Slack
- ✅ **Root Cause:** Clear explanation mentioning code/database
- ✅ **Contributing Factors:** 3+ specific factors
- ✅ **What Went Well:** 2-3 positive items
- ✅ **What Went Poorly:** 2-3 improvement areas
- ✅ **Prevention Measures:** Multiple items with P0/P1/P2 priorities
- ✅ **Action Items:** Specific tasks with owners and dates

**Quality Checks:**
- [ ] Reads like a human wrote it (not robotic)
- [ ] Uses specific data from the incident (timestamps, names, metrics)
- [ ] No hallucinated information (only uses provided data)
- [ ] Professional tone, blameless language
- [ ] No obvious typos or grammar errors

**If quality is poor:**
- Regenerate and try again (AI has some randomness)
- Check that mock data in `lib/data/incidents.ts` is detailed enough
- Quality should be consistently good with GPT-4

---

### Test 5: Export to PDF
**Steps:**
1. On postmortem page, click "Export PDF" button
2. Check Downloads folder

**Expected:**
- ✅ PDF file downloads immediately
- ✅ Filename: `postmortem-pm-[timestamp].pdf`
- ✅ PDF opens and shows postmortem content
- ✅ Text is readable

**Note:** PDF export is basic. Main demo is the web view.

---

### Test 6: Copy to Markdown
**Steps:**
1. On postmortem page, click "Copy Markdown" button
2. Open Notepad and paste (Ctrl+V)

**Expected:**
- ✅ Button text changes to "Copied!" briefly
- ✅ Markdown text pastes into Notepad
- ✅ Contains headers, bullets, formatting
- ✅ Readable format

---

### Test 7: Navigation
**Steps:**
1. From postmortem page, click "← Back to Dashboard"
2. Should return to main page

**Expected:**
- ✅ Returns to dashboard
- ✅ Incidents still visible
- ✅ Can generate another postmortem

---

### Test 8: Generate Second Postmortem
**Steps:**
1. From dashboard, generate postmortem for second incident
2. Verify it's different from first one

**Expected:**
- ✅ Different incident title
- ✅ Different timeline events
- ✅ Different root cause
- ✅ Different recommendations
- ✅ Proves it's not hardcoded!

---

## 🎨 Visual/UI Tests

### Responsive Design
**Test on different screen sizes:**
- [ ] Full screen desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet view (resize browser to ~800px wide)
- [ ] Mobile view (resize to ~400px wide)

**Expected:**
- ✅ Layout adapts smoothly
- ✅ Text remains readable
- ✅ Buttons don't overlap
- ✅ No horizontal scrolling

---

### Dark Mode
**Steps:**
1. Inspect page for dark theme consistency

**Expected:**
- ✅ Background is dark (slate-950)
- ✅ Text is light colored
- ✅ Good contrast (readable)
- ✅ Looks professional, not harsh on eyes

---

### Animations
**Watch for smooth transitions:**
- [ ] Modal fade in/out
- [ ] Progress bar animation
- [ ] Stage checkmarks appearing
- [ ] Page transitions

**Expected:**
- ✅ Smooth, not janky
- ✅ No flashing or glitches

---

## ⚡ Performance Tests

### Load Time
**Steps:**
1. Hard refresh page (Ctrl+Shift+R)
2. Note how long until fully loaded

**Expected:**
- ✅ Dashboard loads in < 2 seconds
- ✅ Postmortem generation completes in 10-20 seconds

---

### Browser Compatibility
**Test in multiple browsers:**
- [ ] Chrome/Edge (recommended for demo)
- [ ] Firefox
- [ ] Safari (if on Mac)

**Expected:**
- ✅ Works in all modern browsers
- ✅ No layout issues

---

## 🎯 Demo-Specific Tests

### Test 9: Full Demo Run-Through
**Practice the complete demo flow:**

1. ✅ Start at dashboard
2. ✅ Show stats and incidents
3. ✅ Click generate button
4. ✅ Let modal play through completely
5. ✅ Land on postmortem page
6. ✅ Scroll through all sections slowly
7. ✅ Click export PDF
8. ✅ Click copy markdown
9. ✅ Go back to dashboard
10. ✅ Show second incident

**Time yourself:** Should take 4-5 minutes

---

### Test 10: Multiple Generations
**Steps:**
1. Generate postmortem for incident 1
2. Go back
3. Generate postmortem for incident 2
4. Repeat 2-3 times

**Expected:**
- ✅ Each generation works
- ✅ No slowdown
- ✅ No errors
- ✅ Consistent quality

---

## 🚨 Error Scenarios to Test

### Test 11: Internet Disconnection
**Steps:**
1. Disconnect internet/WiFi
2. Try to generate postmortem

**Expected:**
- ✅ Shows error message
- ✅ Doesn't crash app
- ✅ Can retry after reconnecting

**Preparation:**
- Have backup video ready for this scenario

---

### Test 12: Invalid API Key
**Steps:**
1. Temporarily change API key in `.env.local` to invalid value
2. Restart app
3. Try to generate

**Expected:**
- ✅ Shows clear error message about API key
- ✅ Doesn't expose key in error

**Remember:** Change back to correct key after test!

---

## 📊 Quality Assurance Checklist

Before demo day, verify:

### Content Quality
- [ ] Timeline events are chronological
- [ ] Timestamps make sense
- [ ] Names from Slack appear in timeline
- [ ] Root cause is specific and technical
- [ ] Prevention measures are actionable
- [ ] No placeholder text like "TODO" or "Lorem ipsum"

### Professional Appearance
- [ ] No spelling errors visible
- [ ] Consistent font sizes
- [ ] Colors are professional
- [ ] Icons render correctly
- [ ] No broken images

### Functionality
- [ ] All buttons work
- [ ] No console errors
- [ ] Smooth animations
- [ ] Fast load times

---

## 🎬 Final Pre-Demo Test (Do This 1 Hour Before)

**Complete checklist:**
1. [ ] Restart computer (fresh start)
2. [ ] Start app: `npm run dev`
3. [ ] Open http://localhost:3000
4. [ ] Generate postmortem for incident 1
5. [ ] Verify it looks perfect
6. [ ] Export PDF - verify download works
7. [ ] Copy Markdown - verify clipboard works
8. [ ] Go back to dashboard
9. [ ] Close all other tabs
10. [ ] Turn off notifications
11. [ ] App ready for demo! ✅

---

## 🔧 Troubleshooting Common Issues

### Issue: "npm: command not found"
**Fix:**
```bash
# Install Node.js from: https://nodejs.org
# Restart terminal
node --version  # Should show v18 or higher
```

### Issue: Port 3000 already in use
**Fix:**
```bash
# Use different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### Issue: Changes not showing
**Fix:**
```bash
# Hard refresh browser
Ctrl + Shift + R

# Or clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: API key not working
**Fix:**
1. Verify key in `.env.local` starts with `sk-proj-`
2. No spaces or quotes around the key
3. File is named exactly `.env.local` (not `.env.local.txt`)
4. Restart app after changing env file

### Issue: Slow generation (>30 seconds)
**Fix:**
- Check internet speed
- OpenAI may be slow (their side)
- Try again
- Have backup video ready

---

## ✅ Test Results Log

**Use this to track your tests:**

| Test | Status | Notes |
|------|--------|-------|
| App starts | ⬜ Pass / ⬜ Fail | |
| Dashboard loads | ⬜ Pass / ⬜ Fail | |
| Generate postmortem | ⬜ Pass / ⬜ Fail | |
| Content quality | ⬜ Pass / ⬜ Fail | |
| Export PDF | ⬜ Pass / ⬜ Fail | |
| Copy Markdown | ⬜ Pass / ⬜ Fail | |
| Navigation | ⬜ Pass / ⬜ Fail | |
| Second generation | ⬜ Pass / ⬜ Fail | |
| Full demo run | ⬜ Pass / ⬜ Fail | Time: _____ |

---

**All tests passing? You're ready to demo! 🚀**
