# AgileBoard - A Premium Two-Agent Built Kanban Board

AgileBoard is a collaborative, Trello-style Kanban board application. It features a modern dark-mode glassmorphic user interface built with React (Vite) and is backed by a robust REST API built with Laravel (PHP 8.3 & SQLite).

This project was built entirely by orchestrating a team of two AI agents (Hermes & OpenClaw) wired through Slack.

---

## Core Features

-   **Multi-Board Workspace**: Create, switch, and delete boards.
-   **Structured Columns (Swimlanes)**: Boards start with `To Do`, `In Progress`, and `Done` lists. Add new columns dynamically.
-   **Interactive Cards**: Create, edit, and delete cards within lists.
-   **Interactive Drag-and-Drop**: Drag cards between lists using HTML5 drag-and-drop actions.
-   **Task Assignment**: Add board members and assign cards.
-   **Categorization Tags**: Create colored tags and toggle them on cards.
-   **Due Date Tracking**: Select a due date/time. Overdue tasks are dynamically highlighted with a crimson boundary glow.
-   **Pre-seeded Workspace**: Run a single click demo seed to populate boards, lists, cards, tags, and members.

---

## Tech Stack

-   **Backend**: Laravel (PHP 8.3), SQLite Database, Eloquent ORM.
-   **Frontend**: React 19 (Vite), Vanilla CSS (Custom Glassmorphism, Google Fonts).
-   **Orchestration**: Hermes Agent (NousResearch), OpenClaw Gateway.
-   **Comms Link**: Slack Workspace (Connections/Socket mode).

---

## Free Models & Routing Rationale

All models used in this build are 100% free:

1.  **Hermes (Brain / Planning)**: Guided by **Google Gemini 2.5 Flash** & **Groq gpt-oss-120b**.
    *   *Why*: Gemini and Groq's high-tier models have outstanding logic structure and zero-shot reasoning. This is crucial for Hermes to break down abstract user goals into task files.
2.  **OpenClaw (Hands / Execution)**: Guided by **Ollama qwen2.5-coder** (local) & **Groq llama-3.3-70b-versatile**.
    *   *Why*: Local Ollama execution offers unlimited token throughput, bypassing API rate limit thresholds, while Groq provides extremely fast compilation and syntax validation checks.

---

## Local Run Instructions

### Prerequisites
Make sure you have installed:
- PHP 8.2+
- Composer
- Node.js (v24 LTS recommended)
- NPM

---

### 1. Launch the Backend API

1. Navigate to the `/backend` directory:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Generate the application key:
   ```bash
   php artisan key:generate
   ```
4. Run the database migrations (creates the SQLite database and tables):
   ```bash
   php artisan migrate
   ```
5. Start the local development server:
   ```bash
   php artisan serve
   ```
   The API will now be running at `http://127.0.0.1:8000`.

---

### 2. Launch the Frontend UI

1. Navigate to the `/frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the local address in your browser: `http://localhost:5173`.
5. Click **"🚀 Seed Demo Board"** to initialize data.

---

## Live Deployments

-   **Frontend (Vercel/Netlify)**: [Live Board URL](https://forge2-qualifier-swastik.vercel.app)
-   **Backend API (Render/Railway)**: [Live Laravel API](https://forge2-qualifier-swastik.render.com/api)
