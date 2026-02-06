# TigerTrust AI Scoring System - Integration Guide

## Overview

This guide explains how the AI Scoring System integrates with the rest of the TigerTrust platform to provide dynamic, intelligent credit scoring.

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        TigerTrust Platform                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Frontend   │◄────►│  RSE Server  │◄────►│   Helius     │ │
│  │  (Next.js)   │      │  (Node.js)   │      │     API      │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                                │
│         │                      ▼                                │
│         │              ┌──────────────┐                        │
│         │              │   On-Chain   │                        │
│         │              │     Data     │                        │
│         │              └──────────────┘                        │
│         │                      │                                │
│         └──────────────────────┼────────────────────┐          │
│                                ▼                     ▼          │
│                        ┌─────────────────────────────────┐     │
│                        │   AI Scoring Service (Python)   │     │
│                        ├─────────────────────────────────┤     │
│                        │   • Gemini AI Engine            │     │
│                        │   • Score Calculation           │     │
│                        │   • Anomaly Detection           │     │
│                        │   • REST API                    │     │
│                        │   • Event Scheduler             │     │
│                        └─────────────────────────────────┘     │
│                                        │                        │
│                                        ▼                        │
│                        ┌─────────────────────────────────┐     │
│                        │   Solana Blockchain (Anchor)    │     │
│                        ├─────────────────────────────────┤     │
│                        │   • User Profile PDA            │     │
│                        │   • TigerScore Storage          │     │
│                        │   • Tier Information            │     │
│                        │   • Repayment History           │     │
│                        └─────────────────────────────────┘     │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Score Calculation

When a new user joins:

```
User → Frontend → Human Verification → Backend
                     ↓
              Verify with Face++
                     ↓
         ┌───────────┴───────────┐
         ▼                       ▼
   Create Anchor          Trigger AI
   User Profile PDA       Score Calculation
         │                       │
         │    ┌──────────────────┘
         ▼    ▼
   Store Initial Score (300)
   Update with AI Score
```

**Implementation:**

```typescript
// Frontend: After human verification
const response = await fetch('http://localhost:5001/api/score/calculate-and-update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wallet_address: userWallet,
    human_verified: true,
    wallet_age_days: 0,
    tx_count: 0,
    // ... other initial data
  })
});
```

### 2. Periodic Updates

The scheduler runs every 24 hours (configurable):

```
Scheduler → Fetch All Monitored Wallets
    ↓
For Each Wallet:
    ├─→ Fetch On-Chain Data (RSE Server)
    ├─→ Fetch User Profile PDA
    ├─→ Calculate New Score (Gemini AI)
    ├─→ Update On-Chain PDA
    └─→ Log Results
```

**To monitor a wallet:**

```bash
# Add to .env
MONITORED_WALLETS=wallet1,wallet2,wallet3

# Start scheduler
python scheduler.py
```

### 3. Event-Driven Updates

Significant events trigger immediate recalculation:

```
Event Occurs → Backend Webhook → AI Scoring API
    ↓
Trigger Recalculation
    ↓
Update Score On-Chain
```

**Events that trigger updates:**
- Loan taken
- Successful repayment
- Default
- VC issued
- Human verification status changed

**Implementation:**

```typescript
// Backend: After loan disbursement
import { TigerTrustIntegration } from './ai_scoring/integration';

const integration = new TigerTrustIntegration();

await integration.handle_loan_event(
  borrowerWallet,
  loanAmount,
  { loan_id, duration, interest_rate }
);
```

## Components

### 1. Gemini Scorer (`gemini_scorer.py`)

**Purpose:** Core AI engine that analyzes user data and calculates TigerScore

**Key Features:**
- Uses Google Gemini AI for intelligent analysis
- Dynamic factor weighting
- Anomaly detection
- Fallback to rule-based scoring

**Usage:**
```python
from gemini_scorer import TigerScoreAI

scorer = TigerScoreAI()
result = scorer.calculate_score(user_data)
```

### 2. Score Updater (`score_updater.py`)

**Purpose:** Updates TigerScore in on-chain User Profile PDAs

**Key Features:**
- Derives PDA addresses
- Builds and sends transactions
- Confirms on-chain updates
- Handles transaction errors

**Usage:**
```python
from score_updater import TigerScoreUpdater

updater = TigerScoreUpdater()
result = await updater.update_tiger_score(wallet, score, tier)
```

### 3. REST API (`api.py`)

**Purpose:** HTTP interface for score calculations and updates

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/score/calculate` | POST | Calculate score (off-chain) |
| `/api/score/calculate-and-update` | POST | Calculate and update on-chain |
| `/api/score/update` | POST | Update existing score |
| `/api/profile/{wallet}` | GET | Get user profile |
| `/api/batch/calculate` | POST | Batch scoring |
| `/api/trigger/recalculate` | POST | Trigger event-based update |
| `/api/test/gemini` | GET | Test Gemini connection |

### 4. Scheduler (`scheduler.py`)

**Purpose:** Automated periodic updates and event handling

**Features:**
- Configurable update intervals
- Wallet monitoring
- Event queue processing
- Error recovery

**Usage:**
```bash
python scheduler.py
```

### 5. Integration Layer (`integration.py`)

**Purpose:** Connects RSE server, AI scoring, and blockchain

**Key Methods:**
```python
# Full wallet analysis
result = integration.full_wallet_analysis(wallet_address)

# Event handlers
integration.handle_loan_event(wallet, amount)
integration.handle_repayment_event(wallet, amount, is_default)
integration.handle_vc_issued_event(wallet, vc_type)
```

## Anchor Program Updates

### User Profile PDA Structure

```rust
pub struct UserProfile {
    pub wallet: Pubkey,              // Owner wallet
    pub tiger_score: u16,            // Score (0-1000)
    pub tier: Tier,                  // Risk tier
    pub human_verified: bool,        // Verification status
    pub total_loans: u32,            // Loan count
    pub successful_repayments: u32,  // Successful repayments
    pub defaults: u32,               // Defaults
    pub total_borrowed: u64,         // Total borrowed (lamports)
    pub total_repaid: u64,           // Total repaid (lamports)
    pub outstanding_debt: u64,       // Current debt (lamports)
    pub created_at: i64,            // Creation timestamp
    pub last_score_update: i64,     // Last update timestamp
    pub bump: u8,                    // PDA bump seed
}
```

### Instructions

```rust
// Initialize user profile
initialize_user_profile(human_verified: bool)

// Update score (backend only)
update_tiger_score(new_score: u16, new_tier: Tier)

// Record loan
record_loan(amount: u64)

// Record repayment
record_repayment(amount: u64, is_default: bool)

// Update verification
update_human_verification(verified: bool)
```

## Setup Instructions

### Step 1: Install Anchor Program

```bash
cd anchor
anchor build
anchor deploy
```

Copy the program ID and update `.env`:
```
TIGERTRUST_PROGRAM_ID=<your_program_id>
```

### Step 2: Setup AI Scoring Service

```bash
cd ai_scoring

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add:
# - GEMINI_API_KEY
# - SOLANA_RPC_URL
# - TIGERTRUST_PROGRAM_ID
# - AUTHORITY_PRIVATE_KEY
```

### Step 3: Start Services

```bash
# Terminal 1: Start RSE Server
cd rse-server
npm run dev

# Terminal 2: Start AI Scoring API
cd ai_scoring
python api.py

# Terminal 3: Start Scheduler (optional)
cd ai_scoring
python scheduler.py

# Terminal 4: Start Frontend
npm run dev
```

## Integration Points

### Frontend → AI Scoring

```typescript
// Calculate score for display
async function calculateScore(walletAddress: string) {
  const response = await fetch('http://localhost:5001/api/score/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet_address: walletAddress,
      // ... user data
    })
  });
  
  const result = await response.json();
  return result.tiger_score;
}
```

### RSE Server → AI Scoring

```typescript
import axios from 'axios';

// After calculating on-chain features
const rseData = await buildFeatures(wallet);

// Send to AI for enhanced scoring
const aiResponse = await axios.post(
  'http://localhost:5001/api/score/calculate',
  {
    wallet_address: wallet,
    ...rseData
  }
);

return aiResponse.data;
```

### Backend Events → AI Scoring

```typescript
// After loan approval
await axios.post('http://localhost:5001/api/trigger/recalculate', {
  wallet_address: borrower,
  event_type: 'loan_taken'
});

// After repayment
await axios.post('http://localhost:5001/api/trigger/recalculate', {
  wallet_address: borrower,
  event_type: 'repayment'
});
```

## Monitoring & Debugging

### Check Service Health

```bash
# AI Scoring API
curl http://localhost:5001/health

# Test Gemini connection
curl http://localhost:5001/api/test/gemini

# Get user profile
curl http://localhost:5001/api/profile/{wallet_address}
```

### View Logs

```bash
# API logs
tail -f ai_scoring/logs/api.log

# Scheduler logs
tail -f ai_scoring/logs/scheduler.log
```

### Common Issues

**Gemini API Errors:**
- Check API key is valid
- Verify quota remaining
- Try fallback model: `gemini-1.5-flash`

**Solana Transaction Errors:**
- Ensure authority has SOL for fees
- Verify program ID is correct
- Check User Profile PDA exists

**Integration Errors:**
- Confirm all services are running
- Check network connectivity
- Verify environment variables

## Security Considerations

1. **Authority Key:** Store securely, never commit to git
2. **API Authentication:** Implement in production
3. **Rate Limiting:** Add to prevent abuse
4. **Input Validation:** All endpoints validate inputs
5. **CORS:** Configure for production domains

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Historical score tracking
- [ ] Score explanation API
- [ ] Multi-model ensemble (Gemini + others)
- [ ] Advanced ML models
- [ ] Predictive default risk
- [ ] Automated VC verification
- [ ] Integration with more data providers

## Support

For questions or issues:
- Check logs for error details
- Review this integration guide
- Test individual components
- Contact TigerTrust team

---

**Last Updated:** February 2026
