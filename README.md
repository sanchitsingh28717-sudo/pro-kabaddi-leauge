# KabaddiIQ

KabaddiIQ is an elite Kabaddi analytics workspace and dashboard designed to forecast match outcomes using AI time-series models, manage role-based authentication setups, and power interactive dashboards for coaches, analysts, and front-office personnel.

This repository is split into two primary segments: a robust **Python/FastAPI** backend powering a PyTorch LSTM model, and a comprehensive **React/Vite** frontend customized with TailwindCSS logic.

## Project Structure

```
.
├── backend                 # FastAPI Server & AI Architecture
│   ├── main.py             # Server endpoints & PyTorch LSTM definition
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Template for backend server variables
│   └── seed_data.py        # Supabase seed population routines
└── frontend                # Modern UI built with React & Vite
    ├── src/                # Front-end source logic
    ├── package.json        # Node dependencies & frontend scripts
    ├── tailwind.config.js  # Styling configuration
    └── .env.example        # Template for frontend environment variables
```

---

## Prerequisites

Before setting up KabaddiIQ, ensure your local environment has the following strictly installed:
- **Python 3.9+**
- **Node.js 18+**
- **Supabase Account** (For managed cloud database / PostgREST)

---

## 1. Backend Setup

The backend houses a Deep Learning PyTorch LSTM model to process sequence parameters and calculate win probabilities dynamically. It relies on Twilio for SMS recovery, Resend for email actions, and Supabase for cloud architecture.

### Initialization
Navigate to the backend directory and set up a Python virtual environment to keep global dependencies clean:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies (utilizes a CPU wheel for PyTorch to enhance setup stability)
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Environment Variables
Copy `.env.example` into a new file named `.env` in the `backend/` directory:
```bash
cp .env.example .env
```
Fill out `.env` with your Supabase, Twilio, and Resend credentials. The backend will selectively fail specific endpoint paths if certain keys are missing, but core API generation will survive.

### Run the Server
While inside the active virtual environment:
```bash
uvicorn main:app --reload
```
The server will now be listening locally at HTTP `http://127.0.0.1:8000`.

---

## 2. Frontend Setup

The frontend operates as a state-of-the-art Single Page Application managed via Vite.

### Initialization 
Navigate into the frontend logic shell and build your node module dependencies:
```bash
cd frontend
npm install
```

### Environment Variables
Duplicate `.env.example` into `.env` natively inside `frontend/`:
```bash
cp .env.example .env
```
Provide the anon Supabase key mapped to your project so the browser client logic can successfully communicate directly securely.

### Run the App
Launch the fast-reload development server:
```bash
npm run dev
```
Navigate to your local port broadcast. Enjoy your Kabaddi Intelligence System.
