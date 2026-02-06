"""Direct test of Gemini API"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:20]}..." if api_key else "No API key found")

try:
    genai.configure(api_key=api_key)
    
    # List available models
    print("\n📋 Available Models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
    
    print("\n\nTrying gemini-2.0-flash...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    response = model.generate_content("Say hello in JSON format: {\"message\": \"...\"}")
    print(f"\n✅ SUCCESS! Gemini AI is working!")
    print(f"Response: {response.text}")
    print(f"\nModel used: {model.model_name}")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}")
    print(f"Details: {str(e)}")
