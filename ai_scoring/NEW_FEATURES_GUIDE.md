# New RSE Features Integration Guide

## What's New in RSE Server:

### 1. Stripe Income Features
- `monthlyIncome` - User's verified monthly income
- `debt` - User's current debt
- `incomeVerified` - Boolean if income > 0
- `incomeBracket` - "low" (<$2000), "mid" ($2000-$5000), "high" (>$5000)
- `incomeDebtRatio` - Income divided by debt (higher is better)

### 2. Activity Regularity Features
- `activeDaysLast30` - Number of active days in last 30 days
- `avgTxPerActiveDay` - Average transactions per active day
- `activityRegularityScore` - Overall activity consistency score

## Updated RSE Response Format:

```json
{
  "wallet": "4Du8GKHMaSevJqH5V7kvKy6J5GVbgC8cSuJnXBRqh2Ya",
  "score": 450,
  "tier": "Silver",
  "features_used": {
    "txCount": 50,
    "walletAgeDays": 180,
    "nftCount": 2,
    "tokenCount": 5,
    "successfulRepayments": 3,
    "defaults": 0,
    "humanVerified": true,
    "hasVC": true,
    
    // NEW: Activity Regularity
    "activeDaysLast30": 15,
    "avgTxPerActiveDay": 3.5,
    "activityRegularityScore": 65,
    
    // NEW: Stripe Income
    "monthlyIncome": 3500,
    "debt": 1200,
    "incomeVerified": true,
    "incomeBracket": "mid",
    "incomeDebtRatio": 2.92
  }
}
```

## How to Test in Postman:

### Endpoint: POST http://localhost:5001/api/score/from-rse

### Test Case 1: User with Good Income & Regular Activity
```json
{
  "wallet": "user123",
  "score": 400,
  "tier": "Silver",
  "features_used": {
    "txCount": 80,
    "walletAgeDays": 200,
    "nftCount": 3,
    "tokenCount": 6,
    "successfulRepayments": 5,
    "defaults": 0,
    "humanVerified": true,
    "hasVC": true,
    "activeDaysLast30": 22,
    "avgTxPerActiveDay": 4.2,
    "activityRegularityScore": 75,
    "monthlyIncome": 5500,
    "debt": 1000,
    "incomeVerified": true,
    "incomeBracket": "high",
    "incomeDebtRatio": 5.5
  }
}
```

**Expected AI Score:** ~850-950 (Platinum/Diamond)
**Boost from:** +110 (income) + +40 (regular activity)

---

### Test Case 2: User with Low Income, Irregular Activity
```json
{
  "wallet": "user456",
  "score": 320,
  "tier": "Silver",
  "features_used": {
    "txCount": 25,
    "walletAgeDays": 90,
    "nftCount": 0,
    "tokenCount": 2,
    "successfulRepayments": 1,
    "defaults": 0,
    "humanVerified": false,
    "hasVC": false,
    "activeDaysLast30": 5,
    "avgTxPerActiveDay": 1.5,
    "activityRegularityScore": 20,
    "monthlyIncome": 1500,
    "debt": 2000,
    "incomeVerified": true,
    "incomeBracket": "low",
    "incomeDebtRatio": 0.75
  }
}
```

**Expected AI Score:** ~380-420 (Silver)
**Limited boost:** +60 (income verified) but low ratio hurts

---

### Test Case 3: User with No Income Data (Backward Compatible)
```json
{
  "wallet": "user789",
  "score": 300,
  "tier": "Bronze",
  "features_used": {
    "txCount": 10,
    "walletAgeDays": 30,
    "nftCount": 0,
    "tokenCount": 1,
    "successfulRepayments": 0,
    "defaults": 0,
    "humanVerified": false,
    "hasVC": false
  }
}
```

**Expected AI Score:** ~300-350 (Silver)
**Still works!** System is backward compatible

---

## Updated RSE Server Request:

When calling your RSE endpoint, include the new parameters:

```typescript
POST /risk/recalculate

{
  "wallet": "4Du8GKHMaSevJqH5V7kvKy6J5GVbgC8cSuJnXBRqh2Ya",
  "monthlyIncome": 4000,  // NEW
  "debt": 1500             // NEW
}
```

## Scoring Impact:

| Feature | Impact | Score Boost |
|---------|--------|-------------|
| **Income Verified** | ✅ Significant | +60 pts |
| **High Income/Debt Ratio (>2)** | ✅ Very Positive | +50 pts |
| **Medium Income/Debt Ratio (>1)** | ✅ Positive | +25 pts |
| **High Activity Regularity (>60)** | ✅ Reliable | +40 pts |
| **Medium Activity Regularity (>30)** | ✅ Decent | +20 pts |
| **Combined Max Boost** | 🚀 | +150 pts |

## Key Benefits:

1. **More Accurate Scoring**: Real financial data improves credit assessment
2. **Trust Verification**: Stripe income verification adds credibility
3. **Behavioral Analysis**: Activity patterns show consistency and reliability
4. **Higher Scores**: Good financial standing can boost scores significantly
5. **Backward Compatible**: Works with or without new features

## Next Steps:

1. Update frontend to collect `monthlyIncome` and `debt` from users
2. Send these to RSE `/risk/recalculate` endpoint
3. RSE automatically calculates income features
4. Pass complete RSE response to AI scoring
5. Get enhanced scores with financial insights!

🚀 **Your users with verified income and regular activity will see score boosts of 100-150 points!**
