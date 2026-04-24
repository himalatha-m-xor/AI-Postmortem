# 🚀 ARIA Setup Guide (Step-by-Step)

Follow these exact steps to get ARIA running on your Windows computer.

---

## ✅ Step 1: Get Your OpenAI API Key (5 minutes)

1. Open browser and go to: **https://platform.openai.com/signup**
2. Click "Sign up" (or use Google/Microsoft sign-in)
3. Complete the signup
4. Once logged in, go to: **https://platform.openai.com/api-keys**
5. Click **"Create new secret key"**
6. Name it: `ARIA-Demo`
7. Click **"Create secret key"**
8. **IMPORTANT:** Copy the key (starts with `sk-proj-...`) and save it in Notepad
9. You won't be able to see it again!

**Note:** They'll ask for a credit card but give you $5 free credit (enough for 100+ demos).

---

## ✅ Step 2: Open Terminal (1 minute)

### Option A: Using VS Code Terminal (Recommended)
1. Open VS Code
2. Click **Terminal** → **New Terminal** (or press `` Ctrl+` ``)
3. You should see a terminal at the bottom

### Option B: Using PowerShell
1. Press **Windows key**
2. Type `PowerShell`
3. Press **Enter**

---

## ✅ Step 3: Navigate to Project (1 minute)

In the terminal, type:
```bash
cd ~
```

Press **Enter**

You should already be in the project folder (`/home/himah`)

---

## ✅ Step 4: Install Dependencies (2-3 minutes)

Copy and paste this command:
```bash
npm install
```

Press **Enter**

**What you'll see:**
- Lots of text scrolling
- "added 500+ packages" message
- Takes 1-3 minutes depending on internet speed

**Wait until you see your prompt again (no more scrolling text)**

---

## ✅ Step 5: Create Environment File (2 minutes)

Type this command:
```bash
copy .env.local.example .env.local
```

Press **Enter**

Now open the `.env.local` file in VS Code:
1. In VS Code, look at the left sidebar (file explorer)
2. Find `.env.local` file
3. Click it to open
4. Replace `sk-proj-your-key-here` with YOUR actual OpenAI API key (from Step 1)
5. Save the file (**Ctrl+S**)

**It should look like:**
```
OPENAI_API_KEY=sk-proj-abc123yourrealkeyhere
```

---

## ✅ Step 6: Start the App (1 minute)

In the terminal, type:
```bash
npm run dev
```

Press **Enter**

**What you'll see:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

**✅ SUCCESS! The app is running!**

---

## ✅ Step 7: Open in Browser (30 seconds)

1. Open your web browser (Chrome, Edge, Firefox)
2. Go to: **http://localhost:3000**
3. You should see the ARIA dashboard!

---

## ✅ Step 8: Test It Works (1 minute)

1. You should see the dashboard with 2 open incidents
2. Click the big purple button: **"Close Incident & Generate Postmortem"**
3. Wait 10-20 seconds
4. You should see a beautiful postmortem appear!

**✅ If you see the postmortem, EVERYTHING WORKS!**

---

## 🎉 You're Done!

The app is ready to demo to your client!

---

## 📝 Quick Reference

### To Start the App:
```bash
npm run dev
```
Then open: **http://localhost:3000**

### To Stop the App:
Press **Ctrl+C** in the terminal

### To Restart the App:
1. Stop it (Ctrl+C)
2. Start it again (`npm run dev`)

---

## ⚠️ Troubleshooting

### Error: "OPENAI_API_KEY is missing"
- You forgot to create `.env.local` file OR
- You didn't paste your API key correctly
- **Fix:** Double-check Step 5

### Error: "Port 3000 is already in use"
- Another app is using port 3000
- **Fix:** Use a different port:
```bash
npm run dev -- -p 3001
```
Then open: **http://localhost:3001**

### Error: "Failed to generate postmortem"
- Check your internet connection
- Make sure your OpenAI API key is valid
- Check if you have API credits remaining at https://platform.openai.com/usage

### Browser shows "This site can't be reached"
- Make sure the app is running (`npm run dev`)
- Check the terminal for errors
- Try refreshing the browser

### npm install fails
- Make sure you have Node.js installed
- Try running as administrator
- Delete `node_modules` folder and try again

---

## 📞 Need Help?

If you get stuck:
1. Read the error message carefully
2. Check this troubleshooting section
3. Try stopping and restarting the app
4. Copy the exact error message and ask for help

---

## 🎯 Next Steps

Once everything works:
1. Practice the demo 3-5 times
2. Read the `DEMO_SCRIPT.md` file
3. Test generating postmortems for different incidents
4. Try exporting to PDF

---

**You've got this! 🚀**
