# Human Verification Backend Service

## Overview
Python Flask backend for human liveness verification using Face++ API.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Face++ API credentials:
   - Copy `.env.example` to `.env`
   - Add your Face++ API Key and Secret from https://console.faceplusplus.com/

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/verify/human
Verify human liveness from facial image.

**Request:**
```json
{
  "image": "base64_encoded_image_data",
  "wallet_address": "user_wallet_address"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "confidence": 85.5,
  "message": "Human verified successfully!",
  "details": {
    "face_quality": 85.5,
    "blur_level": 15.2,
    "eyes_open": {
      "left": 95,
      "right": 92
    },
    "head_pose": {
      "yaw": 2.5,
      "pitch": -1.2,
      "roll": 0.8
    }
  }
}
```

### GET /health
Health check endpoint.

### GET /api/test/connection
Test Face++ API connection and credentials.
