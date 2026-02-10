import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
genai.configure(api_key=GEMINI_API_KEY)

try:
    for m in genai.list_models():
        print(m.name)
except Exception as e:
    print("FAILURE:")
    print(str(e))
