"""Test Gemini AI directly with current quota"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

print(f"Testing Gemini: {model_name}")
print(f"API Key: {api_key[:20]}...\n")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    
    test_prompt = """Calculate a credit score (0-1000) for this user and return JSON:
    {"tiger_score": 750, "tier": "Gold", "reasoning": "Good history"}
    
    User: 5 successful repayments, human verified, 100 transactions"""
    
    response = model.generate_content(test_prompt)
    
    print("✅ SUCCESS! Gemini is working!")
    print(f"\nResponse:\n{response.text}\n")
    print(f"Model: {model_name}")
    
except Exception as e:
    error_type = type(e).__name__
    error_msg = str(e)
    
    print(f"❌ ERROR: {error_type}")
    print(f"Details: {error_msg}\n")
    
    if 'ResourceExhausted' in error_type or 'quota' in error_msg.lower():
        print("🔴 QUOTA EXHAUSTED")
        print("Solution: Enable billing at https://console.cloud.google.com/billing")
    elif '404' in error_msg or 'not found' in error_msg.lower():
        print("🔴 MODEL NOT FOUND")
        print(f"Try: gemini-2.0-flash or gemini-pro-latest instead of {model_name}")
    else:
        print("🔴 UNKNOWN ERROR")
        print("Check your API key and internet connection")
