# 🔥 ARIA - Living Postmortem AI

Automatically generate blameless postmortems from incident data using AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
# Copy the example file
copy .env.local.example .env.local

# Edit .env.local and add your OpenAI API key
# OPENAI_API_KEY=sk-proj-your-key-here
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

## 🎯 Demo Instructions

### For Client Demo:

1. **Start the app** - `npm run dev`
2. **Open** `http://localhost:3000` in browser
3. **Show the dashboard** - Explain you have active incidents
4. **Click "Close Incident & Generate Postmortem"** on the first incident
5. **Wait 10-20 seconds** - AI is analyzing data
6. **Show the generated postmortem** - Walk through all sections
7. **Export to PDF or Markdown** - Show it's production-ready

### What to Say:

> "This is ARIA - it automatically writes postmortems the moment an incident closes.
> 
> Normally this takes 3-5 days and most teams skip it. ARIA does it in 10 seconds.
> 
> Watch what happens when I close this database incident..."
> 
> [Click button, wait for generation]
> 
> "And there it is - complete timeline from Slack, root cause analysis, and 
> specific prevention measures. All automatically generated from real incident data."

## 📁 Project Structure

```
aria-postmortem/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Dashboard (main page)
│   ├── postmortems/[id]/        # Postmortem viewer
│   └── api/generate-postmortem/ # AI generation API
├── lib/
│   ├── ai/                      # OpenAI integration
│   │   ├── openai.ts           # OpenAI client
│   │   ├── prompts.ts          # Prompt engineering
│   │   └── generator.ts        # Postmortem generation
│   ├── data/                   # Mock incident data
│   └── utils.ts                # Utility functions
└── types/                      # TypeScript types
```

## 🎨 Features

- ✅ Beautiful dark-mode UI
- ✅ Real-time AI postmortem generation
- ✅ Timeline visualization
- ✅ Export to PDF
- ✅ Export to Markdown
- ✅ Copy to clipboard
- ✅ 3 realistic incident scenarios
- ✅ Blameless postmortem format

## 🔧 Troubleshooting

### "Failed to generate postmortem"
- Check that your OpenAI API key is set in `.env.local`
- Verify you have internet connection
- Check that you have API credits remaining

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

## 📊 Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **AI:** OpenAI GPT-4o-mini
- **Language:** TypeScript
- **Icons:** Lucide React
- **PDF Export:** jsPDF

## 💰 Cost

- Development: **FREE**
- OpenAI API: **~$0.50-1 per postmortem** ($5 free credit = 100 demos)
- Hosting: **FREE** (Vercel)

## 🚢 Deployment

Deploy to Vercel (free):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add your OpenAI API key in Vercel dashboard:
# Settings → Environment Variables → Add OPENAI_API_KEY
```

## 📝 License

MIT

## 🤝 Support

For questions or issues, contact your development team.
