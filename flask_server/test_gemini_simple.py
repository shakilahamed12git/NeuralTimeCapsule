import os
from langchain_google_genai import ChatGoogleGenerativeAI

GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

try:
    print("Testing Gemini API connection...")
    llm = ChatGoogleGenerativeAI(model="gemini-pro"
, temperature=0.3)
    
    response = llm.invoke("Say hello in JSON format: {\"message\": \"your message here\"}")
    print(f"Success!\nResponse: {response.content}")
    
except Exception as e:
    import traceback
    print(f"Error: {e}")
    print(f"\nFull trace:\n{traceback.format_exc()}")
