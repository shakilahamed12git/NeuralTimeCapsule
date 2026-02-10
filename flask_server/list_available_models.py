import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
genai.configure(api_key=GEMINI_API_KEY)

print("Listing available Gemini models with your API key:\n")
try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name} (Display: {model.display_name})")
except Exception as e:
    print(f"Error listing models: {e}")
