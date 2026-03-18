# 💰 AI Expense Tracker

A full-stack expense tracking app that uses AI to parse natural language input and automatically categorize expenses.

Built by:Rajeev Ranjan Kumar
GitHub: rajkumu12
Time to build: ~50 to 70 minutes with ai assitance 

## 🎥 Demo

mobile app: https://drive.google.com/file/d/18JPEd4m3x6V1nzNVtd6BDJdbLArstuKh/view?usp=drivesdk


## 🛠️ Tech Stack

- **Mobile:** React Native, Expo SDK 54, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (better-sqlite3)
- **AI:** Groq API (llama-3.3-70b-versatile)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Expo Go app on your phone (v54)
- Groq API key (free at console.groq.com)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Groq API key to .env
npm run dev
```

### Mobile
```bash
cd mobile
npm install
# Update API_URL in src/services/api.ts with your machine's local IP
npx expo start
# Scan QR code with Expo Go
```

## 📁 Project Structure
```
ai-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── routes/
│   │   │   └── expenses.ts   # REST API endpoints
│   │   ├── services/
│   │   │   └── aiService.ts  # Groq AI integration
│   │   └── database/
│   │       └── db.ts         # SQLite setup & queries
│   └── .env.example
└── mobile/
    ├── App.tsx               # Main screen
    └── src/
        ├── services/
        │   └── api.ts        # Backend API calls
        └── types/
            └── index.ts      # TypeScript interfaces
```

## 🤖 AI Prompt Design

I used this system prompt for expense parsing with Groq:
```
You are an expense parser. Extract expense information from 
natural language input and return ONLY valid JSON with:
amount, currency, category, description, merchant
```

**Why this approach:**
Keeping the prompt focused and asking for JSON-only output
ensures consistent, parseable responses without any extra 
formatting or explanation from the model.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/expenses | Add expense via natural language |
| GET | /api/expenses | Get all expenses |
| DELETE | /api/expenses/:id | Delete an expense |

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Project Setup | 10 min |
| Database Setup | 10 min |
| AI Integration | 20 min |
| Backend API | 15 min |
| React Native App | 30 min |
| Debugging & Polish | 35 min |
| **Total** | **~2 hours** |

## 🔮 What I'd Add With More Time

- [ ] Expense analytics dashboard with charts
- [ ] Monthly spending summaries
- [ ] Edit expense functionality
- [ ] Push notifications for spending limits
- [ ] Export expenses to CSV
- [ ] Multi-currency support

## 🤖 AI Tools Used

- **Claude (claude.ai):** Step-by-step guidance, debugging,
  code generation for all components
  
Most helpful prompt: *"Create Express.js routes in TypeScript 
for an expense tracker API with proper error handling and 
consistent response format"*

## 📜 License

MIT - Feel free to use this for your own projects!
