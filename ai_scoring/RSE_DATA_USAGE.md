# Using Your Existing RSE Data with AI Scoring

## Your Current RSE Data Structure ✅

```json
{
  "wallet": "4Du8GKHMaSevJqH5V7kvKy6J5GVbgC8cSuJnXBRqh2Ya",
  "score": 300,
  "tier": "Bronze",
  "features_used": {
    "txCount": 1,
    "walletAgeDays": 0,
    "nftCount": 0,
    "successfulRepayments": 0,
    "defaults": 0,
    "humanVerified": false,
    "tokenCount": 0,
    "hasVC": false
  }
}
```

## 3 Ways to Use This Data

### Option 1: Direct RSE Endpoint (Easiest) ⭐

Send your existing RSE response directly:

```javascript
// Frontend or Backend
const rseData = await fetch('http://localhost:4000/api/risk/recalculate', {
  method: 'POST',
  body: JSON.stringify({ wallet: userWallet })
}).then(r => r.json());

// Send directly to AI scoring
const aiScore = await fetch('http://localhost:5001/api/score/from-rse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(rseData)  // Send as-is!
}).then(r => r.json());

console.log(`RSE Score: ${rseData.score}`);
console.log(`AI Score: ${aiScore.tiger_score}`);
console.log(`Upgraded: ${aiScore.rse_comparison.score_difference > 0 ? 'Yes!' : 'No'}`);
```

**Response:**
```json
{
  "success": true,
  "tiger_score": 380,
  "tier": "Silver",
  "confidence_level": 0.75,
  "rse_comparison": {
    "rse_score": 300,
    "rse_tier": "Bronze",
    "ai_score": 380,
    "ai_tier": "Silver",
    "score_difference": 80
  },
  "strengths": ["Human verified", "No defaults"],
  "weaknesses": ["New wallet with limited history"],
  "recommendations": ["Build transaction history", "Complete more loans"]
}
```

### Option 2: RSE Server Integration

Add this to your RSE server routes:

```typescript
// rse-server/src/routes.ts
router.post("/risk/recalculate", async (req, res) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: "wallet required" });
  }

  try {
    // Your existing RSE calculation
    const features = await buildFeatures(wallet);
    const score = computeTigerScore(features);
    const tier = getTier(score);

    const rseResult = {
      wallet,
      score,
      tier,
      features_used: features
    };

    // NEW: Also get AI-enhanced score
    try {
      const aiResponse = await fetch('http://localhost:5001/api/score/from-rse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rseResult)
      });
      
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        rseResult.ai_enhanced = {
          score: aiResult.tiger_score,
          tier: aiResult.tier,
          confidence: aiResult.confidence_level
        };
      }
    } catch (e) {
      console.log('AI scoring unavailable, using RSE only');
    }

    res.json(rseResult);

  } catch (e: any) {
    console.log("========== RSE ERROR ==========");
    console.log(e?.response?.data || e.message || e);
    console.log("================================");

    res.status(500).json({
      error: "failed to read wallet data",
      detail: e?.message
    });
  }
});
```

### Option 3: Python Integration Script

Use the provided example:

```bash
cd ai_scoring
python rse_integration_example.py
```

Or in your own code:

```python
import requests

def get_ai_score(wallet_address):
    # Get RSE data
    rse_response = requests.post(
        'http://localhost:4000/api/risk/recalculate',
        json={'wallet': wallet_address}
    )
    
    rse_data = rse_response.json()
    
    # Get AI score
    ai_response = requests.post(
        'http://localhost:5001/api/score/from-rse',
        json=rse_data
    )
    
    return ai_response.json()

# Usage
result = get_ai_score("4Du8GKHMaSevJqH5V7kvKy6J5GVbgC8cSuJnXBRqh2Ya")
print(f"Score: {result['tiger_score']} ({result['tier']})")
```

## Complete Flow Example

```
User Actions → RSE Server → AI Scoring → Display
```

### Step-by-Step:

**1. User completes human verification:**
```javascript
// After Face++ verification
await updateProfile(wallet, { humanVerified: true });
```

**2. Frontend requests score:**
```javascript
const rseData = await fetch('http://localhost:4000/api/risk/recalculate', {
  method: 'POST',
  body: JSON.stringify({ wallet: userWallet })
}).then(r => r.json());
// Returns: { score: 300, tier: "Bronze", features_used: {...} }
```

**3. Get AI-enhanced score:**
```javascript
const aiData = await fetch('http://localhost:5001/api/score/from-rse', {
  method: 'POST',
  body: JSON.stringify(rseData)
}).then(r => r.json());
// Returns: { tiger_score: 420, tier: "Silver", ... }
```

**4. Display to user:**
```javascript
<div>
  <h2>Your Credit Score</h2>
  <p>Traditional Score: {rseData.score} ({rseData.tier})</p>
  <p>AI-Enhanced Score: {aiData.tiger_score} ({aiData.tier})</p>
  {aiData.rse_comparison.score_difference > 0 && (
    <span>🎉 AI boosted your score by {aiData.rse_comparison.score_difference} points!</span>
  )}
</div>
```

## Event Triggers

### When User Takes Loan:
```javascript
// After loan disbursement
await fetch('http://localhost:5001/api/trigger/recalculate', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: userWallet,
    event_type: 'loan_taken'
  })
});
```

### When User Repays:
```javascript
// After repayment confirmation
await fetch('http://localhost:5001/api/trigger/recalculate', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: userWallet,
    event_type: 'repayment'
  })
});
// User's score will be recalculated and updated automatically
```

### When User Gets Verified:
```javascript
// After human verification
await fetch('http://localhost:5001/api/trigger/recalculate', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: userWallet,
    event_type: 'human_verified'
  })
});
```

## Data Mapping (Automatic)

Your RSE fields are automatically mapped:

| Your RSE Field | Maps To | AI Usage |
|---------------|---------|----------|
| `txCount` | `tx_count` | On-chain activity score |
| `walletAgeDays` | `wallet_age_days` | Trust indicator (+40 if >180d) |
| `nftCount` | `nft_count` | Asset holdings (+20) |
| `successfulRepayments` | `successful_repayments` | +60 points each! |
| `defaults` | `defaults` | -120 points each |
| `humanVerified` | `human_verified` | +100 points if true |
| `tokenCount` | `token_count` | Diversification score |
| `hasVC` | `has_vc` | +30 points |

## Quick Test

Start both servers and run:

```bash
# Terminal 1
cd rse-server && npm run dev

# Terminal 2
cd ai_scoring && python api.py

# Terminal 3
curl -X POST http://localhost:4000/api/risk/recalculate \
  -H "Content-Type: application/json" \
  -d '{"wallet":"4Du8GKHMaSevJqH5V7kvKy6J5GVbgC8cSuJnXBRqh2Ya"}' \
  | curl -X POST http://localhost:5001/api/score/from-rse \
  -H "Content-Type: application/json" \
  -d @-
```

## Summary

✅ **You don't need to change your RSE data structure**
✅ **Use the `/api/score/from-rse` endpoint**
✅ **It accepts your JSON exactly as-is**
✅ **Returns AI-enhanced score + comparison**
✅ **Works with your existing code**

The AI scoring is a drop-in enhancement to your existing system! 🚀
