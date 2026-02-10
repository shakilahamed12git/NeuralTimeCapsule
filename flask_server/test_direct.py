import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
genai.configure(api_key=GEMINI_API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print("SUCCESS:")
    print(response.text)
except Exception as e:
    print("FAILURE:")
    print(str(e))
