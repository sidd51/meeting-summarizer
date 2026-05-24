# MeetScribe AI

An AI-powered meeting summarization tool that converts audio recordings into structured summaries, action items, and decisions — instantly.

Live: https://meetscribe-ai-ten.vercel.app

---

## What it does

Upload any meeting recording and MeetScribe AI will:

- Transcribe the audio using **Whisper Large v3** (via Groq)
- Generate a structured summary using **Llama 3.1** (via Groq)
- Extract action items, decisions, key topics, and meeting sentiment
- Store results so you can search and revisit past meetings
- Let you download a full meeting report as a `.txt` file

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Dropzone
- Lucide React

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- Multer (audio file handling)
- Groq SDK (Whisper v3 + Llama 3.1-8b-instant)
- dotenv, cors, nodemon

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas (free tier)

---

## Project Structure

```
meeting-summarizer/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadZone.jsx     # Drag & drop with 3 UI states
│   │   │   ├── SummaryCard.jsx    # AI analysis display
│   │   │   ├── MeetingCard.jsx    # History list item
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx     # Home — file upload + progress
│   │   │   ├── ResultsPage.jsx    # AI output after processing
│   │   │   ├── HistoryPage.jsx    # All past meetings + search
│   │   │   └── MeetingDetailPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # All axios calls in one place
│   │   └── App.jsx
│   └── .env
│
└── server/                        # Express backend
    ├── config/
    │   └── groqClient.js          # Groq SDK instance
    ├── controllers/
    │   └── meetingController.js   # Request/response logic
    ├── middleware/
    │   └── upload.js              # Multer config + file validation
    ├── models/
    │   └── Meeting.js             # Mongoose schema
    ├── routes/
    │   └── meetingRoutes.js       # API route definitions
    ├── services/
    │   └── meetingService.js      # Whisper + Llama 3 pipeline
    ├── uploads/                   # Temporary audio storage
    └── index.js                   # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/meetscribe-ai.git
cd meetscribe-ai
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
```

Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`. Verify at `http://localhost:5000/health`.

### 3. Set up the frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

App runs on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/meetings/upload` | Upload and process audio file |
| `GET` | `/api/meetings` | Get all completed meetings |
| `GET` | `/api/meetings/:id` | Get one meeting by ID |

### Upload request

```
POST /api/meetings/upload
Content-Type: multipart/form-data

Fields:
  audio  (File)    — required, max 25MB, audio formats only
  title  (String)  — optional
```

### Upload response

```json
{
  "message": "Meeting processed successfully",
  "meeting": {
    "_id": "64abc...",
    "title": "Q3 Sprint Planning",
    "transcript": "Alright everyone, let's get started...",
    "analysis": {
      "summary": "The team aligned on Q3 release scope and assigned QA ownership.",
      "actionItems": ["Ravi to update test plan by Friday"],
      "decisions": ["Release pushed to August 15th"],
      "sentiment": "positive",
      "keyTopics": ["release planning", "QA", "deadlines"],
      "duration": "approximately 25 minutes"
    },
    "status": "completed",
    "fileSize": "3.12 MB",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## AI Pipeline

```
Audio file (mp3/wav/webm)
        ↓
  Groq Whisper Large v3
        ↓
  Raw transcript text
        ↓
  Groq Llama 3.1-8b-instant
  (structured prompt → JSON)
        ↓
  { summary, actionItems, decisions,
    sentiment, keyTopics, duration }
        ↓
  Saved to MongoDB Atlas
```

**Why Groq?** Groq's free tier includes both Whisper and Llama 3.1 with fast LPU-based inference — no credit card required. Ideal for a production-grade prototype.

**Reliable JSON extraction** — LLMs occasionally wrap responses in natural language even when instructed not to. A regex fallback parser extracts the JSON object regardless:

```js
try {
  return JSON.parse(raw)
} catch (e) {
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) return JSON.parse(match[0])
  throw new Error('Could not parse AI response')
}
```

---

## Deployment

### Backend → Render

1. Push `server/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node index.js`
5. Add environment variables: `PORT`, `MONGO_URI`, `GROQ_API_KEY`

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

> **Note:** Render's free tier spins down after inactivity. The first request after idle may take ~30 seconds to wake up — expected behaviour for a portfolio project.

---

## Supported Audio Formats

| Format | Extension |
|--------|-----------|
| MP3 | `.mp3` |
| WAV | `.wav` |
| WebM | `.webm` |
| MPEG-4 Audio | `.m4a` |
| OGG | `.ogg` |

Maximum file size: **25MB** (Groq API limit)

---

## Environment Variables

### Server

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key from console.groq.com |

### Client

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL |

---

## Future Improvements

- JWT authentication — scope meetings per user
- Job queue (BullMQ) — async processing so HTTP requests don't hang
- S3/R2 storage — replace ephemeral local uploads folder
- Streaming responses — show transcript as it's generated
- Speaker diarization — identify who said what
- Export to PDF/Notion/Slack

---

## License

MIT
