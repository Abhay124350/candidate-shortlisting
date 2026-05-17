# Candidate Profile Shortlisting System

A full-stack MERN application for shortlisting candidates using skill matching and OpenRouter AI.

## Project Structure

```
candidate-shortlisting/
├── backend/          # Express + MongoDB API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/         # React app
    └── src/
        ├── components/
        └── api/
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your MONGO_URI and OPENROUTER_API_KEY
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The React app proxies `/api` requests to `http://localhost:5000`.

## API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | /api/candidates             | Add a candidate                    |
| GET    | /api/candidates             | Get all candidates (search/filter) |
| GET    | /api/candidates/:id         | Get single candidate               |
| DELETE | /api/candidates/:id         | Delete a candidate                 |
| POST   | /api/match                  | Basic skill-based shortlisting     |
| POST   | /api/ai/shortlist           | AI-powered shortlisting            |
| POST   | /api/ai/interview-questions | Generate interview questions       |

## Getting an OpenRouter API Key

1. Sign up at https://openrouter.ai
2. Go to Keys → Create Key
3. Add it to `backend/.env` as `OPENROUTER_API_KEY`

## Features

- Add/delete candidates with skills, experience, and bio
- Search and filter candidates
- Basic shortlisting with skill overlap scoring and tier ranking
- AI-powered shortlisting with explanations, strengths, and gaps
- Match score bar chart visualization
- AI-generated interview questions per candidate
- Save/star shortlisted candidates
