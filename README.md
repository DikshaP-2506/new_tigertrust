# TigerTrust - Decentralized Lending Platform on Solana

TigerTrust is a decentralized lending platform built on Solana that uses AI-powered credit scoring, human verification, and on-chain data analysis to provide fair and transparent lending services.

## 🎯 Key Features

- **AI-Powered Credit Scoring**: Uses Google Gemini AI to analyze comprehensive user data
- **TigerScore (0-1000)**: Dynamic credit score with 5-tier system (Bronze → Diamond)
- **Human Verification**: Face++ integration for liveness detection
- **On-Chain User Profiles**: Solana PDAs store scores, tiers, and repayment history
- **Event-Driven Updates**: Automatic score recalculation on significant events
- **Periodic Updates**: Scheduled score refreshes every 24 hours
- **Comprehensive Risk Analysis**: On-chain activity + VCs + repayment history

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TigerTrust Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Next.js)                                          │
│       ↓                                                       │
│  RSE Server (Node.js) ← Helius API (On-chain Data)          │
│       ↓                                                       │
│  AI Scoring Service (Python + Gemini)                        │
│       ↓                                                       │
│  Solana Blockchain (Anchor Program)                          │
│       ↓                                                       │
│  User Profile PDAs (Scores, Tiers, History)                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
new_tigertrust/
├── ai_scoring/              # AI Scoring Service (Python)
│   ├── gemini_scorer.py     # Gemini AI scoring engine
│   ├── score_updater.py     # On-chain PDA updater
│   ├── api.py               # REST API service
│   ├── scheduler.py         # Periodic update scheduler
│   ├── integration.py       # Integration layer
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # AI service documentation
│
├── anchor/                  # Solana Programs (Rust)
│   └── programs/counter/
│       └── src/lib.rs       # User Profile PDA & instructions
│
├── rse-server/              # Risk Scoring Engine (Node.js)
│   └── src/
│       ├── scoring.ts       # Traditional scoring logic
│       ├── features.ts      # Feature extraction
│       └── routes.ts        # API routes
│
├── human_verification/      # Human Verification Service (Python)
│   └── app.py               # Face++ verification API
│
├── src/                     # Next.js Frontend
│   ├── app/                 # App router pages
│   └── components/          # React components
│
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Rust & Solana CLI
- Google Gemini API key
- Solana RPC access

### 1. Clone Repository

```bash
git clone https://github.com/DikshaP-2506/new_tigertrust.git
cd new_tigertrust
```

### 2. Setup Anchor Program

```bash
cd anchor
anchor build
anchor deploy
# Copy program ID to .env files
```

### 3. Setup AI Scoring Service

```bash
cd ai_scoring
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys
```

### 4. Setup RSE Server

```bash
cd rse-server
npm install
cp .env.example .env
# Edit .env
```

### 5. Setup Human Verification

```bash
cd human_verification
pip install -r requirements.txt
cp .env.example .env
# Add Face++ API credentials
```

### 6. Setup Frontend

```bash
npm install
cp .env.example .env.local
# Edit .env.local
```

### 7. Start All Services

```bash
# Terminal 1: AI Scoring API
cd ai_scoring && python api.py

# Terminal 2: AI Scheduler (optional)
cd ai_scoring && python scheduler.py

# Terminal 3: RSE Server
cd rse-server && npm run dev

# Terminal 4: Human Verification
cd human_verification && python app.py

# Terminal 5: Frontend
npm run dev
```

## 🎯 TigerScore System

### Score Range & Tiers

| Score | Tier | Risk Level | Description |
|-------|------|------------|-------------|
| 851-1000 | 💎 Diamond | Very Low | Excellent history, multiple VCs, perfect repayments |
| 701-850 | 🏆 Platinum | Low | Good history, verified identity, consistent activity |
| 501-700 | 🥇 Gold | Medium | Decent history, some verification |
| 301-500 | 🥈 Silver | Medium-High | Limited history, basic verification |
| 0-300 | 🥉 Bronze | High | New user or significant risk factors |

### Scoring Factors

1. **Repayment History (40%)**
   - Successful repayments: +60 points each
   - Defaults: -120 points each
   - On-time payment rate

2. **Verifiable Credentials (25%)**
   - Human verification: +80-120 points
   - Education VCs: +20-50 points
   - Employment VCs: +20-50 points

3. **On-Chain Activity (20%)**
   - Wallet age
   - Transaction volume
   - NFT & token holdings
   - DeFi participation

4. **Behavioral Patterns (15%)**
   - Recent activity
   - Network connections
   - Anomaly detection

## 🔄 Score Update Flow

### Initial Score
```
User Signup → Human Verification → Create Profile PDA → Calculate Initial Score (300) → AI Enhancement → Update On-Chain
```

### Event-Driven Updates
```
Event (Loan/Repayment/VC) → Trigger API → Recalculate Score → Update PDA → Notify User
```

### Periodic Updates
```
Scheduler (Every 24h) → Fetch All Monitored Wallets → Recalculate Each → Batch Update → Log Results
```

## 🔌 API Endpoints

### AI Scoring Service (Port 5001)

- `POST /api/score/calculate` - Calculate score (off-chain)
- `POST /api/score/calculate-and-update` - Calculate and update on-chain
- `POST /api/score/update` - Update existing score
- `GET /api/profile/{wallet}` - Get user profile
- `POST /api/batch/calculate` - Batch scoring
- `POST /api/trigger/recalculate` - Trigger event-based update
- `GET /health` - Health check
- `GET /api/test/gemini` - Test Gemini connection

### RSE Server (Port 4000)

- `POST /api/risk/recalculate` - Calculate risk features

### Human Verification (Port 5000)

- `POST /api/verify/human` - Verify human liveness

## 🔐 Environment Variables

See individual `.env.example` files in each service directory:

- `ai_scoring/.env.example` - AI scoring configuration
- `rse-server/.env.example` - RSE server configuration
- `human_verification/.env.example` - Face++ credentials
- `.env.example` - Frontend configuration

## 📚 Documentation

- [AI Scoring System](./ai_scoring/README.md)
- [Integration Guide](./ai_scoring/INTEGRATION.md)
- [Anchor Program Documentation](./anchor/README.md)

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **AI/ML**: Python, Google Gemini AI
- **Blockchain**: Solana, Anchor Framework, Rust
- **APIs**: Helius, Face++
- **Infrastructure**: Flask, asyncio, solana-py

## 🧪 Testing

```bash
# Test AI scorer
cd ai_scoring && python gemini_scorer.py

# Test score updater
cd ai_scoring && python score_updater.py

# Test integration
cd ai_scoring && python integration.py
```

## 🔒 Security

- Authority keypairs stored securely
- API authentication implemented
- Input validation on all endpoints
- CORS configured for production
- Rate limiting enabled
- Gemini API keys never committed

## 🚧 TODO

- [ ] WebSocket support for real-time updates
- [ ] Historical score tracking UI
- [ ] Score explanation API
- [ ] Multi-model ensemble scoring
- [ ] Advanced ML models
- [ ] Predictive default risk analytics
- [ ] Automated VC verification
- [ ] Integration with more data providers

## 📄 License

Copyright © 2026 TigerTrust. All rights reserved.

## 👥 Team

TigerTrust Development Team

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📞 Support

For questions or issues, please open a GitHub issue or contact the team.

---

**Built with ❤️ on Solana**
