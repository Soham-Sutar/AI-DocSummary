import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Testing model availability...")
try:
    models = genai.list_models()
    print("\nAvailable generative models:")
    for m in models:
        if "generateContent" in str(m.supported_generation_methods):
            print(f"  {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
    
# Test specific models
test_models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]
print("\nTesting specific models:")
for model_name in test_models:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"✓ {model_name} - Works!")
    except Exception as e:
        print(f"✗ {model_name} - Error: {str(e)[:100]}")
