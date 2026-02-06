import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

# Test minimal JSON generation
prompt = """Return this exact JSON structure:
{
  "tiger_score": 750,
  "tier": "Gold",
  "reasoning": "Test response"
}"""

config = {
    "temperature": 0.1,
    "max_output_tokens": 2048
}

response = model.generate_content(prompt, generation_config=config)

if hasattr(response, 'candidates') and response.candidates:
    finish_reason = response.candidates[0].finish_reason
    print(f"Finish reason: {finish_reason}")
    
if hasattr(response, 'usage_metadata'):
    print(f"Usage: {response.usage_metadata}")

print(f"\nResponse length: {len(response.text)} chars")
print(f"Response:\n{response.text}")
