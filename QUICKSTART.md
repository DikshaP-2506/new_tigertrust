# TigerTrust Quick Reference Guide

## 🚀 Quick Commands

### Setup (First Time)
```bash
# 1. Setup AI Scoring
cd ai_scoring
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys

# 2. Run system test
python test_system.py

# 3. Deploy Anchor program
cd ../anchor
anchor build
anchor deploy
```

### Daily Development

```bash
# Start all services (separate terminals)
cd ai_scoring && python api.py              # Terminal 1 (Port 5001)
cd rse-server && npm run dev                # Terminal 2 (Port 4000)
cd human_verification && python app.py      # Terminal 3 (Port 5000)
npm run dev                                 # Terminal 4 (Port 3000)
cd ai_scoring && python scheduler.py        # Terminal 5 (Optional)
```

### Windows Quick Start
```bash
cd ai_scoring
start.bat api          # Start API
start.bat scheduler    # Start scheduler
start.bat test         # Run test
```

### Linux/Mac Quick Start
```bash
cd ai_scoring
./start.sh api          # Start API
./start.sh scheduler    # Start scheduler
./start.sh test         # Run test
```

## 🔑 API Quick Reference

### Calculate Score (Off-Chain)
```bash
curl -X POST http://localhost:5001/api/score/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "wallet_age_days": 365,
    "tx_count": 250,
    "human_verified": true,
    "total_loans": 3,
    "successful_repayments": 3,
    "defaults": 0
  }'
```

### Calculate and Update (On-Chain)
```bash
curl -X POST http://localhost:5001/api/score/calculate-and-update \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "wallet_age_days": 365,
    "human_verified": true
  }'
```

### Get User Profile
```bash
curl http://localhost:5001/api/profile/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### Health Checks
```bash
curl http://localhost:5001/health          # AI Scoring
curl http://localhost:4000/                # RSE Server
curl http://localhost:5000/health          # Human Verification
curl http://localhost:3000/api/health      # Frontend
```

## 📊 TigerScore Tiers

| Score | Tier | Icon | Risk |
|-------|------|------|------|
| 851-1000 | Diamond | 💎 | Very Low |
| 701-850 | Platinum | 🏆 | Low |
| 501-700 | Gold | 🥇 | Medium |
| 301-500 | Silver | 🥈 | Medium-High |
| 0-300 | Bronze | 🥉 | High |

## 🎯 Scoring Factors

### Factor Weights
- **40%** - Repayment History
- **25%** - Verifiable Credentials
- **20%** - On-Chain Activity
- **15%** - Behavioral Patterns

### Point Values
- Human Verification: +80 to +120
- Successful Repayment: +60
- Default: -120
- Wallet Age (>180 days): +40
- High TX Count (>100): +40
- NFT Holdings: +20
- VCs: +20 to +70 (varies)

## 🔄 Event Triggers

Events that trigger automatic score recalculation:

1. **loan_taken** - New loan issued
2. **repayment** - Successful repayment
3. **default** - Loan default
4. **vc_issued** - New credential issued
5. **human_verified** - Passed human verification

## 🔧 Troubleshooting

### Gemini API Issues
```python
# Test connection
curl http://localhost:5001/api/test/gemini

# Check quota
# Visit: https://makersuite.google.com/app/prompts

# Try different model
# In .env: GEMINI_MODEL=gemini-1.5-flash
```

### Solana Issues
```bash
# Check balance
solana balance

# Check program
solana program show <PROGRAM_ID>

# Get logs
solana logs <SIGNATURE>
```

### Service Not Starting
```bash
# Check if port is in use
netstat -ano | findstr :5001  # Windows
lsof -i :5001                 # Mac/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

## 📝 Environment Variables

### Required
```bash
GEMINI_API_KEY=your_key              # Get from Google AI Studio
SOLANA_RPC_URL=https://api.devnet... # Solana endpoint
TIGERTRUST_PROGRAM_ID=Count3A...     # Deployed program ID
```

### Optional
```bash
AUTHORITY_PRIVATE_KEY=base58_key     # For on-chain updates
AI_SCORING_PORT=5001                 # API port
SCORE_UPDATE_INTERVAL_HOURS=24       # Update frequency
MONITORED_WALLETS=wallet1,wallet2    # Auto-monitor list
```

## 🧪 Testing

```bash
# Run system test
cd ai_scoring && python test_system.py

# Test individual components
python gemini_scorer.py          # Test AI scorer
python score_updater.py          # Test updater
python integration.py            # Test integration

# Run with sample data
python -c "
from gemini_scorer import TigerScoreAI
scorer = TigerScoreAI()
result = scorer.calculate_score({
    'wallet_address': 'test',
    'wallet_age_days': 365,
    'human_verified': True,
    'successful_repayments': 3,
    'defaults': 0
})
print(f'Score: {result[\"tiger_score\"]} ({result[\"tier\"]})')
"
```

## 📦 Python Packages

```bash
# Install all
pip install -r requirements.txt

# Individual packages
pip install google-generativeai  # Gemini AI
pip install flask flask-cors     # API server
pip install solana solders       # Blockchain
pip install requests             # HTTP
pip install python-dotenv        # Config
```

## 🔗 Useful URLs

- **Frontend**: http://localhost:3000
- **AI Scoring API**: http://localhost:5001
- **RSE Server**: http://localhost:4000
- **Human Verification**: http://localhost:5000

### API Docs
- AI Scoring: http://localhost:5001/health
- Test Gemini: http://localhost:5001/api/test/gemini

### External Services
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Solana Explorer](https://explorer.solana.com/)
- [Helius Dashboard](https://dashboard.helius.dev/)

## 💡 Pro Tips

1. **Always test with `test_system.py` first**
2. **Keep `.env` files secure, never commit them**
3. **Monitor logs for errors**
4. **Use fallback scoring if Gemini is down**
5. **Set up monitoring for production**
6. **Batch process for multiple wallets**
7. **Cache on-chain data to reduce RPC calls**

## 🆘 Common Commands

```bash
# Check Python version
python --version  # Need 3.9+

# Check Node version
node --version    # Need 18+

# Check Anchor
anchor --version

# Update packages
pip install --upgrade -r requirements.txt
npm update

# Clear cache
pip cache purge
npm cache clean --force

# Reinstall
rm -rf venv node_modules
python -m venv venv && pip install -r requirements.txt
npm install
```

## 📞 Get Help

1. Check logs in `ai_scoring/logs/`
2. Run `python test_system.py`
3. Review error messages
4. Check this guide
5. Read full docs in `README.md`
6. Contact team

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Platform:** Solana Devnet
