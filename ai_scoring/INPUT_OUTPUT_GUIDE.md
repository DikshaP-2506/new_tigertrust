# TigerTrust AI Scoring - Input/Output Guide

## 📥 What Goes IN (Required Inputs)

### 1. User Data for Score Calculation

When calling the AI scoring API, you need to provide:

```json
{
  // REQUIRED
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  
  // ON-CHAIN DATA (from Helius/RSE Server)
  "wallet_age_days": 365,           // How old is the wallet?
  "tx_count": 250,                  // Number of transactions
  "total_volume": 150.5,            // Total SOL transacted
  "nft_count": 5,                   // Number of NFTs owned
  "token_count": 12,                // Number of different tokens
  "defi_protocols": ["Raydium", "Jupiter"],  // DeFi usage
  
  // VERIFICATION STATUS
  "human_verified": true,           // Passed face verification?
  "identity_level": "KYC Level 2",  // Identity verification level
  
  // VERIFIABLE CREDENTIALS (VCs from User Profile)
  "education_vcs": ["University Degree VC"],
  "employment_vcs": ["Tech Company Employee"],
  "financial_vcs": [],
  
  // REPAYMENT HISTORY (from Anchor Program)
  "total_loans": 3,                 // Number of loans taken
  "successful_repayments": 3,       // Successful repayments
  "defaults": 0,                    // Number of defaults
  "avg_repayment_days": 28,         // Average days to repay
  "total_borrowed": 50.0,           // Total SOL borrowed
  "total_repaid": 52.5,             // Total SOL repaid (with interest)
  "outstanding_debt": 0,            // Current debt
  "on_time_rate": 100,              // % of on-time payments
  
  // BEHAVIORAL DATA
  "recent_activity_score": 85,      // Recent wallet activity (0-100)
  "network_score": 70,              // Quality of wallet connections
  "smart_contract_count": 45,       // Smart contract interactions
  "anomaly_flags": []               // Any detected anomalies
}
```

### 2. Minimal Required Input

At minimum, you need:

```json
{
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "human_verified": false,
  "wallet_age_days": 0,
  "tx_count": 0,
  "total_loans": 0,
  "successful_repayments": 0,
  "defaults": 0
}
```

All other fields will default to reasonable values.

### 3. Environment Variables (Configuration)

In your `.env` file:

```bash
# REQUIRED
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SOLANA_RPC_URL=https://api.devnet.solana.com
TIGERTRUST_PROGRAM_ID=Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe

# OPTIONAL
AUTHORITY_PRIVATE_KEY=base58_encoded_private_key
AI_SCORING_PORT=5001
SCORE_UPDATE_INTERVAL_HOURS=24
```

---

## 📤 What Comes OUT (Outputs)

### 1. AI Score Calculation Response

```json
{
  "success": true,
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  
  // PRIMARY RESULTS
  "tiger_score": 750,               // Score (0-1000)
  "tier": "Platinum",               // Bronze/Silver/Gold/Platinum/Diamond
  
  // CONFIDENCE & RISK
  "confidence_level": 0.87,         // How confident is the AI (0-1)
  "risk_category": "Low",           // Very Low/Low/Medium/Medium-High/High
  
  // DETAILED BREAKDOWN
  "key_factors": {
    "repayment_contribution": 180,   // Points from repayments (40% weight)
    "vc_contribution": 110,          // Points from VCs (25% weight)
    "onchain_contribution": 100,     // Points from on-chain (20% weight)
    "behavioral_contribution": 60    // Points from behavior (15% weight)
  },
  
  // ANALYSIS
  "strengths": [
    "Perfect repayment history with 100% on-time rate",
    "Human verified with strong identity credentials",
    "Active wallet with diverse DeFi participation",
    "No suspicious or anomalous behavior detected"
  ],
  
  "weaknesses": [
    "Limited credit history with only 3 loans",
    "Could improve by adding employment credentials"
  ],
  
  "red_flags": [],  // Empty means no serious concerns
  
  "recommendations": [
    "Continue maintaining perfect repayment record",
    "Consider obtaining employment verification",
    "Increase DeFi participation for better score"
  ],
  
  "anomalies_detected": [],
  
  "reasoning": "Strong borrower profile with perfect repayment history and human verification. Wallet shows consistent, legitimate activity across multiple DeFi protocols. Score reflects low risk due to proven reliability.",
  
  // METADATA
  "calculated_at": "2026-02-07T10:30:45.123Z",
  "model_used": "gemini-2.0-flash-exp"
}
```

### 2. On-Chain Update Response

If you use `/api/score/calculate-and-update`:

```json
{
  "success": true,
  "tiger_score": 750,
  "tier": "Platinum",
  // ... all fields from above ...
  
  // PLUS on-chain update info:
  "on_chain_update": {
    "success": true,
    "signature": "5J7Xa...signature...",  // Solana transaction signature
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "score": 750,
    "tier": "Platinum",
    "timestamp": "2026-02-07T10:30:46.456Z"
  }
}
```

### 3. User Profile from Blockchain

When fetching from on-chain PDA:

```json
{
  "success": true,
  "profile": {
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "tiger_score": 750,
    "tier": 3,  // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum, 4=Diamond
    "human_verified": true,
    "total_loans": 3,
    "successful_repayments": 3,
    "defaults": 0,
    "total_borrowed": 50000000000,  // In lamports (50 SOL)
    "total_repaid": 52500000000,    // In lamports (52.5 SOL)
    "outstanding_debt": 0,
    "created_at": 1738886400,       // Unix timestamp
    "last_score_update": 1738972800,
    "bump": 255
  }
}
```

---

## 🔒 What's HIDDEN (Internal Processing)

These things happen behind the scenes - you don't need to know about them, but they're happening:

### 1. Gemini AI Processing

**You send:** User data JSON

**Hidden magic:**
```
1. System builds a comprehensive prompt (400+ lines)
2. Prompt includes:
   - Detailed scoring guidelines
   - Factor weights (40%, 25%, 20%, 15%)
   - Risk categories and definitions
   - Anomaly detection rules
   - Output format requirements
3. Sends to Gemini API with temperature=0.2 (consistent)
4. Gemini analyzes all factors using AI reasoning
5. Gemini returns structured JSON analysis
6. System validates and parses response
7. If Gemini fails, falls back to rule-based scoring
```

**You receive:** TigerScore + detailed analysis

### 2. Blockchain Transaction Building

**You call:** `/api/score/calculate-and-update`

**Hidden magic:**
```
1. Derives User Profile PDA address:
   seeds = ["user_profile", wallet_pubkey]
   
2. Builds Solana instruction:
   - Instruction discriminator (8 bytes)
   - Score data (u16, 2 bytes)
   - Tier data (u8, 1 byte)
   
3. Creates transaction with accounts:
   - User Profile PDA (writable)
   - Wallet address (read-only)
   - Authority (signer)
   
4. Gets recent blockhash from RPC

5. Signs transaction with authority key

6. Sends to Solana network

7. Waits for confirmation

8. Verifies transaction succeeded
```

**You receive:** Transaction signature

### 3. Score Calculation Algorithm

**You provide:** Raw data points

**Hidden algorithm:**
```python
# Start with base score
score = 300

# Repayment impact (40% weight - most important)
score += successful_repayments * 60
score -= defaults * 120
if on_time_rate > 95:
    score += 50  # Bonus for excellent payment record

# VC impact (25% weight)
if human_verified:
    score += 100
score += len(education_vcs) * 30
score += len(employment_vcs) * 30
score += len(financial_vcs) * 40

# On-chain impact (20% weight)
if wallet_age_days > 180:
    score += 40
if tx_count > 100:
    score += 40
if nft_count > 0:
    score += 20
score += len(defi_protocols) * 10

# Behavioral impact (15% weight)
score += recent_activity_score * 0.5
score += network_score * 0.3
if smart_contract_count > 50:
    score += 30

# Anomaly penalties
for anomaly in anomaly_flags:
    score -= 50  # Penalize for each red flag

# Clamp to valid range
score = max(0, min(1000, score))
```

**You receive:** Final score 0-1000

### 4. Periodic Scheduler

**Runs automatically every 24 hours:**

```
Hidden process:
├─ Load monitored wallets from config
├─ For each wallet:
│  ├─ Fetch current User Profile PDA
│  ├─ Fetch latest on-chain data from Helius
│  ├─ Aggregate all user information
│  ├─ Calculate new AI score
│  ├─ Compare with old score
│  ├─ If changed significantly, update on-chain
│  └─ Wait 2 seconds (rate limiting)
├─ Log results
└─ Sleep for 24 hours
```

**You do:** Nothing! It runs automatically

### 5. Data Aggregation

**You call:** Integration endpoint

**Hidden aggregation:**
```
1. Fetch from RSE Server:
   - Wallet age, TX count, NFTs, tokens
   
2. Fetch from Blockchain:
   - User Profile PDA (score, loans, repayments)
   
3. Fetch from Human Verification:
   - Verification status, confidence level
   
4. Combine all sources into single data object

5. Send to AI scorer

6. Return comprehensive result
```

**You receive:** Complete analysis

### 6. Error Handling & Fallbacks

**Hidden safety mechanisms:**

```
If Gemini API fails:
  ├─ Retry with exponential backoff
  ├─ If still fails, use fallback rule-based scoring
  └─ Log error but continue service

If Solana transaction fails:
  ├─ Check if PDA exists
  ├─ Retry transaction
  ├─ If still fails, queue for later
  └─ Return partial result

If RPC is slow:
  ├─ Use cached data if available
  ├─ Switch to backup RPC endpoint
  └─ Continue with degraded service
```

### 7. Security Measures

**Hidden security:**

```
- API keys never exposed in responses
- Authority private key encrypted at rest
- Input validation on all endpoints
- Rate limiting (100 req/min per IP)
- SQL injection prevention
- XSS protection
- CORS configured for specific origins
- Transaction signing isolated
```

---

## 🔄 Complete Flow Example

### User Repays Loan

**1. INPUT (Frontend/Backend):**
```javascript
// User completes repayment in smart contract
await lendingProgram.repayLoan(loanId, amount);

// Backend triggers score update
await fetch('http://localhost:5001/api/trigger/recalculate', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: userWallet,
    event_type: 'repayment'
  })
});
```

**2. HIDDEN PROCESSING:**
```
Step 1: API receives trigger
Step 2: Fetches latest User Profile PDA
Step 3: Sees successful_repayments: 3 → 4
Step 4: Fetches all other data
Step 5: Sends to Gemini AI:
  "User now has 4 successful repayments, 0 defaults,
   100% on-time rate. Previous score was 720. What's new score?"
Step 6: Gemini analyzes and returns: 755
Step 7: Builds transaction to update PDA
Step 8: Signs with authority key
Step 9: Sends to Solana
Step 10: Waits for confirmation
```

**3. OUTPUT (Response):**
```json
{
  "success": true,
  "tiger_score": 755,
  "tier": "Platinum",
  "previous_score": 720,
  "score_change": +35,
  "reasoning": "Upgraded due to additional successful repayment",
  "on_chain_update": {
    "success": true,
    "signature": "5J7Xa..."
  }
}
```

**4. USER SEES:**
```
🎉 Score updated: 720 → 755
   You earned +35 points for on-time repayment!
```

---

## 📊 Summary Table

| What You Provide | What Happens (Hidden) | What You Get |
|-----------------|----------------------|--------------|
| Wallet address + data | Gemini AI analysis | TigerScore (0-1000) |
| API call | PDA derivation + transaction | Blockchain signature |
| Event trigger | Data aggregation | Complete analysis |
| Nothing (scheduler) | Every 24h auto-update | Updated scores |
| Configuration (.env) | Security + validation | Protected service |

---

## 💡 Key Takeaways

**INPUTS you need:**
- Wallet address (required)
- On-chain data (from RSE/Helius)
- Repayment history (from smart contract)
- VCs and verification (from your systems)
- Gemini API key (in .env)

**HIDDEN processing:**
- AI analysis with Gemini
- Complex scoring algorithms
- Blockchain transactions
- PDA management
- Error handling
- Security measures
- Automatic scheduling

**OUTPUTS you get:**
- TigerScore (0-1000)
- Tier (Bronze → Diamond)
- Detailed analysis
- Recommendations
- Transaction confirmations
- Updated on-chain data

You just provide the data and call the API - everything else is handled automatically! 🚀
