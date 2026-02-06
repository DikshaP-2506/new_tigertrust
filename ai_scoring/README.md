# TigerTrust AI Scoring Service

Intelligent credit scoring engine for TigerTrust using Google Gemini AI and Solana blockchain.

## Features

- **AI-Powered Scoring**: Uses Google Gemini API to analyze comprehensive user data and calculate TigerScore (0-1000)
- **On-Chain Updates**: Automatically updates User Profile PDAs on Solana blockchain
- **Dynamic Weighting**: Intelligently weighs factors like repayment history, VCs, on-chain activity, and behavioral patterns
- **Anomaly Detection**: Identifies suspicious patterns and potential fraud
- **Batch Processing**: Efficiently processes multiple score calculations
- **Event-Driven**: Triggers recalculation based on significant events (loans, repayments, VC issuance)
- **REST API**: Easy integration with frontend and backend services

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TigerTrust AI Scoring                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Gemini AI  │──────│   Scorer     │──────│  API      │ │
│  │    Model     │      │   Engine     │      │  Service  │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                     │         │
│                                                     ▼         │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Solana     │◄─────│   Score      │      │  Event    │ │
│  │   Program    │      │   Updater    │◄─────│  Triggers │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Python 3.9 or higher
- Solana CLI tools (optional, for testing)
- Google Gemini API key
- Solana RPC access (Alchemy, Helius, or QuickNode)

### Setup

1. **Clone and navigate to the directory**:
   ```bash
   cd ai_scoring
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `SOLANA_RPC_URL`: Your Solana RPC endpoint
   - `TIGERTRUST_PROGRAM_ID`: Your deployed program ID
   - `AUTHORITY_PRIVATE_KEY`: Base58 encoded private key with update authority

## Usage

### 1. Test the AI Scorer

```bash
python gemini_scorer.py
```

This will run a test calculation with sample data and display the results.

### 2. Start the API Service

```bash
python api.py
```

The API will start on `http://localhost:5001` (or the port specified in `.env`).

### 3. API Endpoints

#### Calculate Score (Off-Chain Only)
```bash
POST /api/score/calculate
Content-Type: application/json

{
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "wallet_age_days": 365,
  "tx_count": 250,
  "total_volume": 150.5,
  "nft_count": 5,
  "token_count": 12,
  "human_verified": true,
  "total_loans": 3,
  "successful_repayments": 3,
  "defaults": 0,
  "on_time_rate": 100
}
```

#### Calculate and Update On-Chain
```bash
POST /api/score/calculate-and-update
Content-Type: application/json

{
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "wallet_age_days": 365,
  "tx_count": 250,
  ...
}
```

#### Update Score Only (Without Recalculation)
```bash
POST /api/score/update
Content-Type: application/json

{
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "score": 750,
  "tier": "Platinum"
}
```

#### Get User Profile
```bash
GET /api/profile/{wallet_address}
```

#### Batch Calculate
```bash
POST /api/batch/calculate
Content-Type: application/json

{
  "users": [
    { "wallet_address": "...", ... },
    { "wallet_address": "...", ... }
  ]
}
```

#### Trigger Recalculation
```bash
POST /api/trigger/recalculate
Content-Type: application/json

{
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "event_type": "repayment"
}
```

#### Health Check
```bash
GET /health
```

#### Test Gemini Connection
```bash
GET /api/test/gemini
```

## Scoring Model

### TigerScore Range: 0-1000

- **0-300**: Bronze (High Risk)
- **301-500**: Silver (Medium-High Risk)
- **501-700**: Gold (Medium Risk)
- **701-850**: Platinum (Low Risk)
- **851-1000**: Diamond (Very Low Risk)

### Scoring Factors

1. **Repayment History (40%)**
   - Successful repayments: +60 points each
   - Defaults: -120 points each
   - On-time payment rate

2. **Verifiable Credentials (25%)**
   - Human verification: +80-120 points
   - Education VCs: +20-50 points
   - Employment VCs: +20-50 points
   - Financial VCs: +30-70 points

3. **On-Chain Activity (20%)**
   - Wallet age: +40 points (if > 180 days)
   - Transaction count: +40 points (if > 100)
   - NFT holdings: +20 points
   - DeFi participation: +20-50 points

4. **Behavioral Analysis (15%)**
   - Recent activity patterns
   - Network quality score
   - Smart contract interactions
   - Anomaly detection penalties

## Integration with TigerTrust

### Event-Driven Updates

The scoring system can be triggered by events:

1. **Loan Taken**: Recalculate to account for new debt
2. **Repayment Made**: Boost score for on-time payment
3. **Default Occurred**: Heavily penalize score
4. **VC Issued**: Increase score based on credential type
5. **Human Verified**: Significant boost to trustworthiness

### Periodic Updates

Configure automatic recalculation intervals:

```python
from score_updater import TigerScoreUpdater

updater = TigerScoreUpdater()

# Update list of wallets every 24 hours
await updater.periodic_update_task(
    wallets=['wallet1', 'wallet2', ...],
    interval_hours=24
)
```

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black .
```

### Project Structure

```
ai_scoring/
├── gemini_scorer.py       # AI scoring engine using Gemini
├── score_updater.py       # On-chain PDA updater
├── api.py                 # Flask REST API
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Security Considerations

1. **Authority Key**: Keep `AUTHORITY_PRIVATE_KEY` secure. This key has permission to update user scores.
2. **API Authentication**: In production, implement proper API key authentication.
3. **Rate Limiting**: Implement rate limiting to prevent abuse.
4. **Input Validation**: All user inputs are validated before processing.
5. **Gemini API Key**: Never commit your Gemini API key to version control.

## Troubleshooting

### Gemini API Errors

If you get authentication errors:
1. Verify your API key is correct in `.env`
2. Check if your API key has quota remaining
3. Try using a different Gemini model (e.g., `gemini-1.5-flash`)

### Solana Connection Issues

If transactions fail:
1. Check your RPC URL is correct and accessible
2. Ensure the program ID matches your deployed program
3. Verify the authority keypair has SOL for transaction fees
4. Check that the User Profile PDA exists for the wallet

### Fallback Scoring

If Gemini API is unavailable, the system automatically falls back to rule-based scoring to ensure continuity.

## Future Enhancements

- [ ] Machine Learning model for pattern recognition
- [ ] Historical score tracking and visualization
- [ ] Multi-model ensemble scoring (Gemini + GPT + Claude)
- [ ] Real-time WebSocket updates
- [ ] Advanced anomaly detection algorithms
- [ ] Integration with more VC providers
- [ ] Score explanation API (why did score change?)
- [ ] Predictive analytics for default risk

## License

Copyright © 2026 TigerTrust. All rights reserved.

## Support

For questions or issues, please contact the TigerTrust team.
