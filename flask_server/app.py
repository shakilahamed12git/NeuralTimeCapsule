import warnings
warnings.filterwarnings("ignore")
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Patient, Medicine, Treatment
from recommendation import get_recommendations_logic
import os
import time
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app) # Enable CORS for all routes  

# Database Config - SQLite
db_path = os.path.join(os.path.dirname(__file__), 'medical_data.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Gemini Config via Google Generative AI SDK
GEMINI_API_KEY = "AIzaSyDOGQswYO5dHBZDcTMb-9wwNs_B0W3YIOA"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize GenerativeModel with fallback capability
# Explicitly using 'models/' prefix based on list_models output
primary_model_name = 'models/gemini-1.5-flash'
fallback_model_name = 'models/gemini-pro'

class MockResponse:
    def __init__(self, text):
        self.text = text

def generate_content_safe(prompt_text):
    try:
        print(f"DEBUG: Attempting with {primary_model_name}")
        model = genai.GenerativeModel(primary_model_name)
        return model.generate_content(prompt_text)
    except Exception as e:
        print(f"Primary model {primary_model_name} failed: {e}")
        try:
            print(f"DEBUG: Falling back to {fallback_model_name}")
            model = genai.GenerativeModel(fallback_model_name)
            return model.generate_content(prompt_text)
        except Exception as e2:
            print(f"Fallback model {fallback_model_name} failed: {e2}")
            try:
                 print(f"DEBUG: Falling back to 'gemini-pro'")
                 model = genai.GenerativeModel('gemini-pro')
                 return model.generate_content(prompt_text)
            except Exception as e3:
                 print(f"All models failed. Returning MOCK response. Error: {e3}")
                 return MockResponse(json.dumps({
                     "progression_summary": "Simulated AI Analysis (Hub unreachable): The patient shows stable cognitive patterns based on the provided inputs.",
                     "cognitive_status": "Stable",
                     "key_findings": ["No significant decline detected", "Engagement levels appear consistent"],
                     "caregiver_recommendations": ["Continue stimulating activities", "maintaining social contact", "Regular exercise"],
                     "medical_focus": "Routine Checkup",
                     "global_prevalence": "55 Million+",
                     "key_statistics": ["Affects 1 in 9 people age 65+"],
                     "recent_breakthroughs": [{"title": "New Drug Approved", "summary": "Lecanemab shows promise."}],
                     "projected_growth": "Rising to 139 million by 2050"
                 }))

@app.route('/')
def home():
    return jsonify({"message": "Neural Care Recommendation API is running"})

@app.before_request
def log_request_info():
    print(f"DEBUG: Incoming {request.method} request to {request.path}")

# --- Helper to extract JSON from AI response ---
def extract_json(text):
    try:
        # Remove markdown code blocks if any
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        # Strip whitespace and find the first { and last }
        text = text.strip()
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            json_text = text[start:end+1]
            import json
            return json.loads(json_text)
        return None
    except Exception as e:
        print(f"JSON extraction error: {e}")
        return None

# --- Gemini AI Proxy Routes ---
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    try:
        data = request.json
        prompt_text = data.get('prompt')
        
        # Using Google Generative AI SDK with fallback
        response = generate_content_safe(prompt_text)
        final_response = response.text

        return jsonify({"response": final_response})
    except Exception as e:
        print(f"AI Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "response": "I'm having trouble connecting right now."}), 500

@app.route('/api/research/alzheimers', methods=['GET'])
def get_research():
    try:
        template = """
        You are a medical researcher. 
        Provide a structured summary of the CURRENT state of Alzheimer's Disease data (as of 2024/2025).
        
        Format the output purely as a JSON object with these keys: 
        {{
            "global_prevalence": "string",
            "key_statistics": ["string", "string"],
            "recent_breakthroughs": [
                {{"title": "string", "summary": "string"}}
            ],
            "projected_growth": "string"
        }}
        
        Keep it concise, professional, and data-driven.
        Do not include markdown filtering (```json ... ```), just the raw JSON string.
        """
        
        response = generate_content_safe(template)
        text = response.text
            
        text = text.replace('```json', '').replace('```', '').strip()
        data = extract_json(text)
        if not data:
            raise ValueError("Could not extract valid JSON from research response")
        return jsonify(data)
    except Exception as e:
        print(f"Research Error: {e}")
        # Fallback data
        return jsonify({
            "global_prevalence": "Over 55 million people worldwide",
            "key_statistics": [
                "Every 3 seconds, someone develops dementia",
                "Alzheimer's contributes to 60-70% of dementia cases"
            ],
            "recent_breakthroughs": [
                {"title": "Lecanemab Approval", "summary": "FDA approved new therapy targeting amyloid plaques."}
            ],
            "projected_growth": "Expected to reach 78 million by 2030"
        })


# --- Patient Routes ---
@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    try:
        new_patient = Patient(
            name=data['name'],
            age=data['age'],
            gender=data['gender'],
            disease_stage=data['disease_stage']
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify(new_patient.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients])

# --- Medicine Routes ---
@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    medicines = Medicine.query.all()
    return jsonify([m.to_dict() for m in medicines])

@app.route('/api/medicines', methods=['POST'])
def add_medicine():
    # Helper to add medicines if needed via API
    data = request.json
    try:
        new_med = Medicine(
            name=data['name'],
            type=data['type'],
            description=data.get('description', '')
        )
        db.session.add(new_med)
        db.session.commit()
        return jsonify(new_med.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- Treatment Routes ---
@app.route('/api/treatments', methods=['POST'])
def add_treatment():
    data = request.json
    try:
        new_treatment = Treatment(
            patient_id=data['patient_id'],
            medicine_id=data['medicine_id'],
            improvement_percent=data['improvement_percent'],
            doctor_notes=data.get('doctor_notes', '')
        )
        db.session.add(new_treatment)
        db.session.commit()
        return jsonify(new_treatment.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/treatments/patient/<int:patient_id>', methods=['GET'])
def get_patient_treatments(patient_id):
    treatments = Treatment.query.filter_by(patient_id=patient_id).all()
    return jsonify([t.to_dict() for t in treatments])

# --- Progression Analysis Route ---
@app.route('/neural-analysis', methods=['POST'])
def analyze_progression():
    try:
        data = request.json
        patient_name = data.get('patient_name')
        stage = data.get('stage')
        historical_reports = data.get('historical_reports', [])
        current_observations = data.get('current_observations', [])
        
        # Search for matching patient in database
        matched_records = None
        matched_treatments_text = "No previous medical records found in database."
        
        if patient_name:
            # Case-insensitive search
            found_patient = Patient.query.filter(Patient.name.ilike(patient_name)).first()
            if found_patient:
                print(f"DEBUG: Found matching patient record: {found_patient.name}")
                treatments = Treatment.query.filter_by(patient_id=found_patient.id).all()
                t_list = []
                for t in treatments:
                    t_dict = t.to_dict()
                    t_list.append(t_dict)
                
                matched_records = {
                    "patient_details": found_patient.to_dict(),
                    "treatments": t_list
                }
                
                if t_list:
                    matched_treatments_text = "PREVIOUS MEDICAL TREATMENTS FOUND:\n"
                    for t in t_list:
                        matched_treatments_text += f"- {t['medicine_name']}: {t['improvement_percent']}% improvement. Notes: {t['doctor_notes']}\n"
        
        # Construct a detailed prompt for Gemini
        prompt = f"""
        You are a specialized Neurological AI Medical Assistant.
        Patient: {patient_name}
        Stage: {stage} Case
        
        {matched_treatments_text}
        
        HISTORICAL REPORTS (AI-Generated from past memories):
        {chr(10).join(historical_reports[:5]) if historical_reports else "No previous reports found."}
        
        RECENT OBSERVATIONS (New memory raw descriptions):
        {chr(10).join(current_observations[:10]) if current_observations else "No recent observations provided."}
        
        TASK:
        1. Compare current inputs with any found medical records. If records exist, mention if current observation aligns with past treatment outcomes.
        2. Analyze the change in tone, complexity, and content between historical reports and current observations.
        3. Identify signs of cognitive stability or decline.
        4. Provide 3 specific, non-clinical recommendations for the caregiver to maintain cognitive health (e.g., social activities, specific sensory recall triggers).
        5. Suggest a medical focus area for the next doctor's visit.
        
        Format the output as a JSON object with these keys:
        {{
            "progression_summary": "string",
            "cognitive_status": "Improving/Stable/Declining",
            "key_findings": ["finding 1", "finding 2"],
            "caregiver_recommendations": ["rec 1", "rec 2", "rec 3"],
            "medical_focus": "string"
        }}
        
        Be analytical, compassionate, and precise. Just the JSON.
        """
        
        response = generate_content_safe(prompt)
        text = response.text
            
        text = text.replace('```json', '').replace('```', '').strip()
        data = extract_json(text)
        if not data:
            # Return a friendly structured error if AI fails
            return jsonify({
                "progression_summary": "We couldn't generate a detailed progression report at this time. Please try adding more specific memories.",
                "cognitive_status": "Stable",
                "key_findings": ["Insufficient data for trend analysis"],
                "caregiver_recommendations": ["Continue recording daily moments", "Keep consistent routines"],
                "medical_focus": "Baseline cognitive screening",
                "matched_records": matched_records
            })
            
        # Append matched records to the response so frontend can display them
        data['matched_records'] = matched_records
        return jsonify(data)
    except Exception as e:
        import traceback
        print(f"Progression Analysis Error: {e}")
        print(f"Full Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

# --- Recommendation Route ---
@app.route('/api/recommendations/<string:stage>', methods=['GET'])
def get_recommendations_api(stage):
    # Valid stages: 'Early', 'Middle', 'Severe' (Case insensitive handling could be added)
    
    # Normalize stage string if needed (optional)
    stage_map = {
        'early': 'Early',
        'middle': 'Middle', 
        'severe': 'Severe'
    }
    normalized_stage = stage_map.get(stage.lower(), stage)
    
    recs = get_recommendations_logic(normalized_stage)
    
    return jsonify({
        "stage": normalized_stage,
        "recommendations": recs,
        "disclaimer": "This is an educational prototype. Do not use for real medical prescription."
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("Neural Care Flask Server running on http://localhost:5001")
    app.run(debug=False, port=5001, host='0.0.0.0')
