# AuraColor — AI Personal Color Analysis

A React web application that discovers your personal color season using AI photo analysis, an interactive quiz, and a community tips board.

## Team

| Name | Student ID | Email |
|---|---|---|
| Godchagorn K. | — | godchagorn_k@cmu.ac.th |

## Features

| Feature | Description |
|---|---|
| AI Analyzer | Upload a photo — Teachable Machine classifies your color-match quality |
| Color Quiz | 5-question quiz determines your season (Spring / Summer / Autumn / Winter) |
| Community Color Tips | Browse, post, edit, and delete beauty tips by color season (full CRUD via REST API) |

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + Vite |
| State Management | Redux Toolkit |
| Routing | React Router v6 (dynamic route `/tips/:id`) |
| Styling | CSS Modules |
| AI Model | TensorFlow.js + Teachable Machine |
| REST API | MockAPI.io (GET, POST, PUT, DELETE) |
| Deployment | Vercel |

## Getting Started

### 1. Install dependencies

```bash
cd my-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Value |
|---|---|
| `VITE_TM_MODEL_URL` | Teachable Machine model URL *(with trailing slash)* |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |
| `VITE_API_URL` | MockAPI.io base URL e.g. `https://abc123.mockapi.io/api/v1` |

### 3. Set up MockAPI resource

1. Create a free account at [mockapi.io](https://mockapi.io)
2. Create a new project and add a **`tips`** resource
3. Add fields: `title` (String), `season` (String), `body` (String)
4. Copy the base URL (without `/tips`) into `VITE_API_URL`

### 4. Start the dev server

```bash
npm run dev
```

## Project Structure

```
src/
├── features/
│   ├── analysis/        # AI photo analyzer + Redux slice
│   ├── quiz/            # Personal color quiz (5 questions)
│   ├── tips/            # Community Color Tips CRUD (tipsAPI, tipsSlice, pages)
│   └── tryon/           # Color try-on palette
├── pages/               # HomePage, NotFoundPage
├── components/          # Navbar, PhotoUploader, PhotoTips
├── locales/             # en.json
├── app/                 # Redux store, languageSlice
└── hooks/               # useTranslation, useAuraScore
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/analyzer` | AI Color Analyzer |
| `/tryon` | Color Quiz |
| `/tips` | Community Color Tips (list + post form) |
| `/tips/:id` | Tip Detail + Edit / Delete |

## Live URL

*(Add deployed URL here after deploying to Vercel)*
