import requests
import json

try:
    print("Testing /neural-analysis endpoint...")
    res = requests.post('http://127.0.0.1:5001/neural-analysis', 
        json={
            "patient_name": "Test Patient",
            "stage": "Early",
            "historical_reports": ["The patient showed clear recall of childhood memories."],
            "current_observations": ["Patient seems engaged and participative in activities."]
        },
        headers={'Content-Type': 'application/json'}
    )
    print(f"\nStatus Code: {res.status_code}")
    print(f"Headers: {dict(res.headers)}")
    print(f"\nResponse Body:\n{res.text[:500]}")
    
    if res.status_code == 200:
        try:
            data = res.json()
            print(f"\nParsed JSON Keys: {list(data.keys())}")
        except:
            print("Could not parse as JSON")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
