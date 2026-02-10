from app import app, db
from models import Medicine, Patient, Treatment
import random

def populate():
    with app.app_context():
        print("Resetting database...")
        db.drop_all() # Clear existing data
        print("Creating tables...")
        db.create_all()
        
        print("Adding Medicines...")
        meds = [
            Medicine(name="Donepezil", type="Tablet", description="Cholinesterase inhibitor, often used for all stages."),
            Medicine(name="Rivastigmine", type="Capsule", description="Cholinesterase inhibitor, used for mild to moderate."),
            Medicine(name="Galantamine", type="Tablet", description="Cholinesterase inhibitor, used for mild to moderate."),
            Medicine(name="Memantine", type="Tablet", description="NMDA receptor antagonist, used for moderate to severe."),
            Medicine(name="Donepezil + Memantine", type="Combo", description="Combination therapy for moderate to severe.")
        ]
        db.session.add_all(meds)
        db.session.commit()
        
        # Reload meds to get IDs
        med_list = Medicine.query.all()
        
        print("Adding Top 20 Patients...")
        stages = ["Early", "Middle", "Severe"]
        names = [
            "James Smith", "Mary Johnson", "Robert Williams", "Patricia Brown", "John Jones", 
            "Jennifer Garcia", "Michael Miller", "Linda Davis", "David Rodriguez", "Elizabeth Martinez", 
            "William Hernandez", "Barbara Lopez", "Richard Gonzalez", "Susan Wilson", "Joseph Anderson", 
            "Jessica Thomas", "Thomas Taylor", "Sarah Moore", "Charles Jackson", "Karen Martin"
        ]
        
        patients = []
        for name in names:
            p = Patient(
                name=name,
                age=random.randint(60, 95),
                gender=random.choice(["Male", "Female"]),
                disease_stage=random.choice(stages)
            )
            patients.append(p)
        db.session.add_all(patients)
        db.session.commit()
        
        # Reload patients to get IDs
        patient_list = Patient.query.all()
        
        print("Adding Historical Treatment Data...")
        # Simulate logic: 
        # Early -> Donepezil/Galantamine works best
        # Middle -> Rivastigmine/Memantine works ok
        # Severe -> Memantine/Combo works best
        
        for p in patient_list:
            # Give each patient 1-2 treatments
            num_treatments = random.randint(1, 2)
            for _ in range(num_treatments):
                med = random.choice(med_list)
                
                # Logic to bias improvement based on stage (Rule-based Simulation)
                base_improvement = random.uniform(20, 50)
                
                if p.disease_stage == "Early":
                    if med.name in ["Donepezil", "Galantamine"]:
                        base_improvement += 30 # Good for early
                    elif med.name == "Memantine":
                        base_improvement -= 10 # Not usually first line
                        
                elif p.disease_stage == "Middle":
                    if med.name in ["Rivastigmine", "Donepezil"]:
                        base_improvement += 20
                    elif med.name == "Memantine":
                        base_improvement += 25
                        
                elif p.disease_stage == "Severe":
                    if med.name == "Memantine":
                        base_improvement += 35
                    elif med.name == "Donepezil + Memantine":
                        base_improvement += 40
                    elif med.name == "Galantamine":
                        base_improvement -= 10
                
                # Clamp between 0 and 100
                final_imp = max(0, min(100, base_improvement + random.uniform(-10, 10)))
                
                t = Treatment(
                    patient_id=p.id,
                    medicine_id=med.id,
                    improvement_percent=final_imp,
                    doctor_notes=f"Administered {med.name} during {p.disease_stage} stage."
                )
                db.session.add(t)
        
        db.session.commit()
        print("Database initialized with dummy data successfully!")

if __name__ == "__main__":
    populate()
