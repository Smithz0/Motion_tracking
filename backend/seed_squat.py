import os
import json
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.models import Exercise, ExerciseRule

def seed():
    db = SessionLocal()
    try:
        # Check if Squat already exists
        squat = db.query(Exercise).filter(Exercise.name == "Squat").first()
        if not squat:
            print("Squat exercise not found. Inserting Squat...")
            # We will insert it. Let's check if ID 5 is available
            exists_5 = db.query(Exercise).filter(Exercise.id == 5).first()
            if not exists_5:
                # Force ID to 5 to align with config using ORM
                squat = Exercise(
                    id=5,
                    name="Squat",
                    description="Lower hips from a standing position until thighs are parallel to the floor, then return to standing. Best assessed from a side profile view.",
                    instructions="Stand sideways to the camera. Keep your feet shoulder-width apart. Lower your hips until they are level with or below your knees (knee angle around 80°-110°). Keep your back straight, chest up, and drive back up through your heels to a full standing position.",
                    target_rom=90.0,
                    thumbnail_url="https://chosen-motion-assets.s3.amazonaws.com/thumbnails/squat.png",
                    target_joints={"joints": ["shoulder_l", "shoulder_r", "hip_l", "hip_r", "knee_l", "knee_r", "ankle_l", "ankle_r"]}
                )
                db.add(squat)
                db.commit()
                # Reset sequence
                db.execute(text("SELECT setval(pg_get_serial_sequence('exercises', 'id'), COALESCE((SELECT MAX(id)+1 FROM exercises), 1), false);"))
                db.commit()
                squat_id = 5
            else:
                squat = Exercise(
                    name="Squat",
                    description="Lower hips from a standing position until thighs are parallel to the floor, then return to standing. Best assessed from a side profile view.",
                    instructions="Stand sideways to the camera. Keep your feet shoulder-width apart. Lower your hips until they are level with or below your knees (knee angle around 80°-110°). Keep your back straight, chest up, and drive back up through your heels to a full standing position.",
                    target_rom=90.0,
                    thumbnail_url="https://chosen-motion-assets.s3.amazonaws.com/thumbnails/squat.png",
                    target_joints={"joints": ["shoulder_l", "shoulder_r", "hip_l", "hip_r", "knee_l", "knee_r", "ankle_l", "ankle_r"]}
                )
                db.add(squat)
                db.commit()
                db.refresh(squat)
                squat_id = squat.id
            
            print(f"Squat exercise inserted with ID: {squat_id}")
        else:
            squat_id = squat.id
            print(f"Squat exercise already exists with ID: {squat_id}")

        # Check if the rule exists
        rule = db.query(ExerciseRule).filter(ExerciseRule.exercise_id == squat_id).first()
        if not rule:
            print("Squat rule not found. Inserting Squat Target ROM rule...")
            squat_rule = ExerciseRule(
                exercise_id=squat_id,
                rule_name="Squat Target ROM",
                rule_type="threshold_comparison",
                parameters={"joint": "knee", "side": "right", "parameter": "angle", "operator": "<=", "value": 90.0},
                status_on_success="success",
                status_on_fail="warning"
            )
            db.add(squat_rule)
            db.commit()
            print("Squat target ROM rule inserted.")
        else:
            print("Squat rules already seeded.")
            
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

