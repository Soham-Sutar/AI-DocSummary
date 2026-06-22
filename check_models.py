import google.generativeai as genai
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
models = genai.list_models()

print("Available generative models:")
for m in models:
    if "generateContent" in str(m.supported_generation_methods):
        print(f"  {m.name}")
