import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client as Client_Supa
from dotenv import load_dotenv
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from typing import List, Optional
import numpy as np
import random
from twilio.rest import Client
import resend

load_dotenv()

app = FastAPI(title="PKL AI Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY", "")

# Initialize Supabase client if URL and KEY are provided
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client_Supa = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    twilio_client = None

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# ---- MODELS ----
class ResetPasswordRequest(BaseModel):
    method: str
    contact: str

class VerifyOTPRequest(BaseModel):
    contact: str
    otp: str

class MatchState(BaseModel):
    score_diff: int
    minutes_remaining: int
    raid_success_rate: float

class WinProbRequest(BaseModel):
    score_diff: Optional[int] = None
    minutes_remaining: Optional[int] = None
    raid_success_rate: Optional[float] = None
    sequence: Optional[List[MatchState]] = None

class TimeoutRequest(BaseModel):
    score_diff: int
    minutes_remaining: int
    raid_success_rate: float

class MatchOutcomeRequest(BaseModel):
    home_team_id: str
    away_team_id: str

class PlayerCreate(BaseModel):
    name: str
    position: str
    team_id: str = None
    height: float = 0.0
    nationality: str = ""
    weight: float = 0.0
    matches_played: int = 0
    points: int = 0
    career_best_points: int = 0
    not_out_pct: float = 0.0
    raids: int = 0
    successful_raids: int = 0
    unsuccessful_raids: int = 0
    empty_raids: int = 0
    successful_raid_pct: float = 0.0
    raid_touch_points: int = 0
    raid_bonus_points: int = 0
    total_raid_points: int = 0
    super_raids: int = 0
    super_10s: int = 0
    tackles: int = 0
    successful_tackles: int = 0
    unsuccessful_tackles: int = 0
    tackles_per_match: float = 0.0
    tackle_bonus_points: int = 0
    tackle_success_rate: float = 0.0
    super_tackles: int = 0
    high_5s: int = 0

# ---- ML MOCK LOGIC INITIALIZATION ----
# In a real scenario, we'd train this on historical play-by-play sequence data.
class KabaddiLSTM(nn.Module):
    def __init__(self, input_size=3, hidden_size=32, num_layers=2):
        super(KabaddiLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        # Take the output from the last time step
        out = self.fc(out[:, -1, :])
        return self.sigmoid(out)

lstm_model = KabaddiLSTM()

def train_mock_lstm():
    # Generating a short synthetic sequence data (batch=32, seq_len=10, features=3)
    SEQ_LEN = 10
    NUM_FEATURES = 3
    BATCH_SIZE = 32
    X_train = torch.randn(BATCH_SIZE, SEQ_LEN, NUM_FEATURES) * 10
    y_train = torch.randint(0, 2, (BATCH_SIZE, 1)).float()
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(lstm_model.parameters(), lr=0.001)
    
    # Run a few mock epochs
    for epoch in range(20):
        optimizer.zero_grad()
        outputs = lstm_model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

# Initialize the mock training
train_mock_lstm()
lstm_model.eval()  # Set to evaluation mode

# ---- ENDPOINTS ----
PENDING_OTPS = {}

@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest):
    otp = str(random.randint(100000, 999999))
    if req.method == "phone":
        if req.contact != "+918353945200" and req.contact.replace(" ", "") != "+918353945200":
            raise HTTPException(status_code=403, detail="Not an authorized test phone number.")
        if not twilio_client:
            raise HTTPException(status_code=500, detail="Twilio is not configured on the server.")
        
        message_body = f"[KabaddiIQ] Your System Override OTP is {otp}. Do not share this key."
        
        try:
            message = twilio_client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to=req.contact
            )
            PENDING_OTPS[req.contact] = otp
            return {"status": "success", "message": "OTP sent.", "sid": message.sid}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    elif req.method == "email":
        if not RESEND_API_KEY:
             raise HTTPException(status_code=500, detail="Resend is not configured on the server.")
             
        html_content = f"""
        <div style="font-family: monospace; background: #0e0e0e; color: #ffffff; padding: 40px; text-align: center; border: 1px solid #333;">
            <h2 style="color: #6366f1; letter-spacing: 2px;">KABADDI IQ - SYSTEM OVERRIDE</h2>
            <p>An emergency access recovery protocol was initiated.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">YOUR DECRYPTION KEY IS:</p>
            <h1 style="font-size: 48px; letter-spacing: 10px; margin: 10px 0; color: #ffffff;">{otp}</h1>
            <p style="color: #ef4444; font-size: 10px; margin-top: 40px;">IF YOU DID NOT INITIATE THIS, SECURE YOUR ACCOUNT IMMEDIATELY.</p>
        </div>
        """
        
        try:
            r = resend.Emails.send({
                "from": "KabaddiIQ Override <onboarding@resend.dev>",
                "to": [req.contact],
                "subject": "System Override Decryption Key",
                "html": html_content
            })
            PENDING_OTPS[req.contact] = otp
            return {"status": "success", "message": f"Recovery email dispatched to {req.contact}."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Invalid method.")

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    expected_otp = PENDING_OTPS.get(req.contact)
    if not expected_otp:
        raise HTTPException(status_code=400, detail="No pending OTP for this contact.")
    
    if req.otp != expected_otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
        
    # Clear the OTP once used
    del PENDING_OTPS[req.contact]
    
    return {"status": "success", "message": "OTP verified successfully"}

@app.get("/api/teams")
def get_teams():
    if not supabase: return []
    res = supabase.table("teams").select("*").execute()
    return res.data

@app.get("/api/teams/{team_id}/players")
def get_team_players(team_id: str):
    if not supabase: return []
    res = supabase.table("players").select("*").eq("team_id", team_id).execute()
    return res.data

@app.get("/api/players")
def get_players(position: str = None, team: str = None):
    if not supabase: return []
    query = supabase.table("players").select("*, team:teams(*)")
    if position:
        query = query.eq("position", position)
    if team:
        # User passed a team name or ID? Let's assume ID since frontend will likely use ID.
        query = query.eq("team_id", team)
    res = query.execute()
    return res.data

@app.post("/api/players")
def create_player(player: PlayerCreate):
    if not supabase: return {"error": "Supabase not configured"}
    
    # Try looking up team_id if a name was passed
    team_id = player.team_id
    if team_id:
        try:
            team_res = supabase.table("teams").select("id").ilike("name", f"%{team_id}%").limit(1).execute()
            if team_res.data:
                team_id = team_res.data[0]["id"]
            else:
                team_id = None # prevent UUID crash if team not found
        except Exception:
            team_id = None
            
    payload = player.model_dump()
    payload["team_id"] = team_id
    
    try:
        res = supabase.table("players").insert(payload).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/players/{id}")
def get_player(id: str):
    if not supabase: return {}
    res = supabase.table("players").select("*").eq("id", id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Player not found")
    return res.data[0]

@app.get("/api/fixtures/results")
def get_fixture_results(team: str = None):
    if not supabase: return []
    # If team given, we'd need to filter by home_team_id OR away_team_id. Range queries in Supabase client might be tricky.
    query = supabase.table("fixtures").select("*, home:teams!home_team_id(*), away:teams!away_team_id(*)").eq("is_completed", True)
    res = query.execute()
    data = res.data
    if team:
        data = [d for d in data if d["home_team_id"] == team or d["away_team_id"] == team]
    return data

@app.get("/api/fixtures/upcoming")
def get_fixture_upcoming():
    if not supabase: return []
    res = supabase.table("fixtures").select("*, home:teams!home_team_id(*), away:teams!away_team_id(*)").eq("is_completed", False).execute()
    return res.data

@app.get("/api/league-table")
def get_league_table():
    if not supabase: return []
    res = supabase.table("league_table").select("*, teams(*)").order("rank").execute()
    return res.data

@app.post("/api/predict/win-probability")
def predict_win_probability(req: WinProbRequest):
    # Determine the input sequence
    if req.sequence is not None and len(req.sequence) > 0:
        # Use provided sequence
        input_data = []
        for state in req.sequence:
            input_data.append([state.score_diff, state.minutes_remaining, state.raid_success_rate])
    else:
        # Backward compatibility: synthesize a sequence from the static values
        base_state = [
            req.score_diff if req.score_diff is not None else 0,
            req.minutes_remaining if req.minutes_remaining is not None else 40,
            req.raid_success_rate if req.raid_success_rate is not None else 50.0
        ]
        # Duplicate to create a sequence of SEQ_LEN (10)
        input_data = [base_state for _ in range(10)]
        
    # Convert to PyTorch tensor: shape (batch_size=1, seq_len, num_features)
    input_tensor = torch.tensor([input_data], dtype=torch.float32)
    
    with torch.no_grad():
        home_win_prob = lstm_model(input_tensor).item()
        
    return {"home_win_prob": round(float(home_win_prob), 2)}

@app.post("/api/predict/timeout")
def predict_timeout(req: TimeoutRequest):
    take_timeout = "Continue Play"
    reason = "Current momentum is acceptable"

    if req.minutes_remaining < 5 and req.score_diff < -3:
        take_timeout = "Take Timeout Now"
        reason = "You are trailing with little time left"
    elif req.raid_success_rate < 35:
        take_timeout = "Take Timeout Now"
        reason = "Raid success rate is critically low"

    return {
        "advice": take_timeout,
        "reason": reason
    }

@app.post("/api/predict/match-outcome")
def predict_match_outcome(req: MatchOutcomeRequest):
    if not supabase: return {"predicted_winner": "Unknown", "confidence": 0.5}
    
    # fetch team A
    team_a_res = supabase.table("teams").select("*").eq("id", req.home_team_id).limit(1).execute()
    # fetch team B
    team_b_res = supabase.table("teams").select("*").eq("id", req.away_team_id).limit(1).execute()
    
    if not team_a_res.data or not team_b_res.data:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_a = team_a_res.data[0]
    team_b = team_b_res.data[0]

    def calc_score(team):
        avg_pts = float(team.get("avg_points_scored", 0))
        games = float(team.get("games", 1))
        games = games if games > 0 else 1
        raids = float(team.get("successful_raids", 0))
        tackles = float(team.get("successful_tackles", 0))
        all_outs = float(team.get("all_outs_inflicted", 0))
        
        return (avg_pts * 0.4) + ((raids / games) * 0.3) + ((tackles / games) * 0.2) + ((all_outs / games) * 0.1)

    score_a = calc_score(team_a)
    score_b = calc_score(team_b)
    
    if score_a > score_b:
        winner = team_a["name"]
    else:
        winner = team_b["name"]
        
    confidence = abs(score_a - score_b) / max(score_a, score_b) if max(score_a, score_b) > 0 else 0
    # clamp 0.5 - 0.95
    confidence = max(0.5, min(0.95, confidence))
    
    return {
        "predicted_winner": winner,
        "confidence": round(confidence, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
