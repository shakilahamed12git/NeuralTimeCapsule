import os
from langchain_google_genai import ChatGoogleGenerativeAI

GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

try:
    llm = ChatGoogleGenerativeAI(model="gemini-pro"
, temperature=0.3)
    response = llm.invoke("Hello, are you working?")
    print("SUCCESS:")
    print(response.content)
except Exception as e:
    print("FAILURE:")
    print(str(e))
