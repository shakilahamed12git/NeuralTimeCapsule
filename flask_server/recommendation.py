from models import Treatment, Medicine, Patient
from sqlalchemy import func

def get_recommendations_logic(disease_stage):
    """
    Analyzes historical treatment data to recommend medicines
    based on average improvement percentage for the given stage.
    """
    
    # Query treatments joined with Patient to filter by stage
    results = (
        Treatment.query
        .join(Patient)
        .filter(Patient.disease_stage == disease_stage)
        .join(Medicine)
        .with_entities(
            Medicine.id,
            Medicine.name,
            Medicine.description,
            func.avg(Treatment.improvement_percent).label('average_improvement'),
            func.count(Treatment.id).label('treatment_count')
        )
        .group_by(Medicine.id)
        .order_by(func.avg(Treatment.improvement_percent).desc())
        .all()
    )
    
    recommendations = []
    for r in results:
        recommendations.append({
            'medicine_id': r.id,
            'medicine_name': r.name,
            'description': r.description,
            'average_improvement': round(r.average_improvement, 2),
            'treatment_count': r.treatment_count,
            'confidence_level': 'High' if r.treatment_count > 10 else 'Moderate' if r.treatment_count > 5 else 'Low'
        })
        
    return recommendations
