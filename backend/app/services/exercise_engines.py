import math
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

def calculate_angle_2d(a: List[float], b: List[float], c: List[float]) -> float:
    """
    Calculate 2D angle at vertex b formed by points a-b-c.
    """
    if not a or not b or not c or len(a) < 2 or len(b) < 2 or len(c) < 2:
        return 0.0
    ba_x, ba_y = a[0] - b[0], a[1] - b[1]
    bc_x, bc_y = c[0] - b[0], c[1] - b[1]
    
    dot_product = ba_x * bc_x + ba_y * bc_y
    mag_ba = math.sqrt(ba_x * ba_x + ba_y * ba_y)
    mag_bc = math.sqrt(bc_x * bc_x + bc_y * bc_y)
    
    if mag_ba == 0.0 or mag_bc == 0.0:
        return 0.0
        
    cos_angle = dot_product / (mag_ba * mag_bc)
    clamped_cos = max(-1.0, min(1.0, cos_angle))
    radians = math.acos(clamped_cos)
    return round((radians * 180.0) / math.pi, 1)

class ExerciseConfig:
    """
    Exercise Configuration class to define landmarks, target joints, 
    thresholds, and feedback guidelines for the exercise framework.
    """
    def __init__(
        self,
        name: str,
        target_joints: List[str],
        target_rom: float,
        rom_operator: str = ">=",
        rom_weight: float = 0.40,
        symmetry_weight: float = 0.25,
        smoothness_weight: float = 0.20,
        speed_weight: float = 0.15
    ):
        self.name = name
        self.target_joints = target_joints
        self.target_rom = target_rom
        self.rom_operator = rom_operator
        self.rom_weight = rom_weight
        self.symmetry_weight = symmetry_weight
        self.smoothness_weight = smoothness_weight
        self.speed_weight = speed_weight

# Static configs for supported exercises
EXERCISE_CONFIGS = {
    "squat": ExerciseConfig(
        name="Squat",
        target_joints=["knee_l", "knee_r", "hip_l", "hip_r"],
        target_rom=90.0,
        rom_operator="<=" # Lower knee angle indicates deeper squat
    ),
    "shoulder raise": ExerciseConfig(
        name="Shoulder Raise",
        target_joints=["shoulder_l", "shoulder_r"],
        target_rom=150.0,
        rom_operator=">="
    ),
    "shoulder abduction": ExerciseConfig(
        name="Shoulder Abduction",
        target_joints=["shoulder_l", "shoulder_r"],
        target_rom=120.0,
        rom_operator=">="
    ),
    "elbow flexion": ExerciseConfig(
        name="Elbow Flexion",
        target_joints=["elbow_l", "elbow_r"],
        target_rom=55.0,
        rom_operator="<="
    ),
    "knee extension": ExerciseConfig(
        name="Knee Extension",
        target_joints=["knee_l", "knee_r"],
        target_rom=140.0,
        rom_operator=">="
    )
}

class SquatEngine:
    """
    Specialized engine for analyzing Squat exercises.
    Implements standing -> descending -> bottom -> ascending state machine,
    quality rules, error detection, live feedback, and accuracy scoring.
    """
    def __init__(self, config: ExerciseConfig):
        self.config = config

    def apply_smoothing(self, values: List[float], alpha: float = 0.4) -> List[float]:
        """
        Applies Exponential Moving Average (EMA) to reduce tracking jitter.
        """
        if not values:
            return []
        smoothed = [values[0]]
        for i in range(1, len(values)):
            smoothed.append(alpha * values[i] + (1 - alpha) * smoothed[-1])
        return smoothed

    def process_frames(self, frames: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a sequence of squat frames.
        """
        if not frames:
            return {
                "reps": 0,
                "feedback": "Align with camera",
                "status": "idle",
                "angles": {},
                "metrics": {
                    "rom": 0.0,
                    "speed": 0.0,
                    "symmetry": 100.0,
                    "smoothness": 100.0,
                    "repetitions": 0,
                    "accuracy_score": 100.0,
                    "max_rom": 0.0,
                    "min_knee_angle": 180.0,
                    "avg_knee_angle": 180.0
                },
                "detected_errors": [],
                "current_error": None
            }

        # 1. First Pass: Compute angles and coordinate vectors
        raw_knee_l = []
        raw_knee_r = []
        raw_hip_l = []
        raw_hip_r = []
        raw_torso = []
        timestamps = []
        valid_frames = []

        for frame in frames:
            jc = frame.get("joint_coordinates") or {}
            ts = frame.get("timestamp_millis") or frame.get("timestamp_ms") or 0
            
            s_l = jc.get("shoulder_l")
            s_r = jc.get("shoulder_r")
            h_l = jc.get("hip_l")
            h_r = jc.get("hip_r")
            k_l = jc.get("knee_l")
            k_r = jc.get("knee_r")
            a_l = jc.get("ankle_l")
            a_r = jc.get("ankle_r")

            # Verify necessary points are present
            if not all([h_l, h_r, k_l, k_r, a_l, a_r]):
                continue

            valid_frames.append(frame)
            timestamps.append(ts)

            # Knee angles (Hip -> Knee -> Ankle)
            knee_ang_l = calculate_angle_2d(h_l, k_l, a_l)
            knee_ang_r = calculate_angle_2d(h_r, k_r, a_r)
            raw_knee_l.append(knee_ang_l)
            raw_knee_r.append(knee_ang_r)

            # Hip angles (Shoulder -> Hip -> Knee, fallback to Hip vertical if shoulder missing)
            shoulder_left = s_l if s_l else [h_l[0], h_l[1] - 0.5]
            shoulder_right = s_r if s_r else [h_r[0], h_r[1] - 0.5]
            raw_hip_l.append(calculate_angle_2d(shoulder_left, h_l, k_l))
            raw_hip_r.append(calculate_angle_2d(shoulder_right, h_r, k_r))

            # Torso Angle (deviation of shoulder-hip line from vertical)
            # Torso is computed relative to vertical axis
            dy = abs(shoulder_right[1] - h_r[1])
            dx = abs(shoulder_right[0] - h_r[0])
            torso_ang = math.atan2(dx, dy) * 180 / math.pi if dy > 0 else 0
            raw_torso.append(round(torso_ang, 1))

        if not valid_frames:
            return self.process_frames([]) # Empty fallback

        # Apply smoothing filter to reduce jitter
        knee_l = self.apply_smoothing(raw_knee_l)
        knee_r = self.apply_smoothing(raw_knee_r)
        hip_l = self.apply_smoothing(raw_hip_l)
        hip_r = self.apply_smoothing(raw_hip_r)
        torso = self.apply_smoothing(raw_torso)

        # Average knee angle across left and right for depth metrics
        knee_avg = [(knee_l[i] + knee_r[i]) / 2 for i in range(len(valid_frames))]

        # 2. Run State Machine and Quality/Error Checks
        # States: "standing", "descending", "bottom", "ascending"
        reps_count = 0
        rep_state = "standing"
        rep_min_knee_angle = 180.0
        rep_start_ts = timestamps[0]
        rep_bottom_start_ts = None
        rep_durations = []
        
        detected_errors = []
        live_feedback = "Good posture"
        current_error = None

        # Tracking variables for error frequencies
        incomplete_depth_count = 0
        knees_cave_count = 0
        torso_lean_count = 0
        uneven_weight_count = 0
        fast_descent_count = 0
        fast_ascent_count = 0

        for i in range(len(valid_frames)):
            ts = timestamps[i]
            kl = knee_l[i]
            kr = knee_r[i]
            k_a = knee_avg[i]
            hl = hip_l[i]
            hr = hip_r[i]
            t_a = torso[i]
            
            jc = valid_frames[i].get("joint_coordinates") or {}
            h_l_coord = jc.get("hip_l")
            h_r_coord = jc.get("hip_r")
            k_l_coord = jc.get("knee_l")
            k_r_coord = jc.get("knee_r")
            a_l_coord = jc.get("ankle_l")
            a_r_coord = jc.get("ankle_r")

            # Velocity calculations
            dt = (ts - timestamps[i-1]) / 1000.0 if i > 0 else 0.0
            knee_vel = abs(k_a - knee_avg[i-1]) / dt if (dt > 0.01) else 0.0

            # State Transitions
            if rep_state == "standing":
                if k_a < 160:
                    rep_state = "descending"
                    rep_min_knee_angle = k_a
                    rep_start_ts = ts
            elif rep_state == "descending":
                if k_a < rep_min_knee_angle:
                    rep_min_knee_angle = k_a
                
                # Check for caving knees during descent
                if k_l_coord and k_r_coord and a_l_coord and a_r_coord:
                    knee_dist = abs(k_l_coord[0] - k_r_coord[0])
                    ankle_dist = abs(a_l_coord[0] - a_r_coord[0])
                    if ankle_dist > 0 and (knee_dist / ankle_dist) < 0.82:
                        knees_cave_count += 1
                        current_error = {
                            "type": "Knees Caving In",
                            "severity": "medium",
                            "timestamp_ms": ts,
                            "description": "Knees are moving inwards relative to ankle width."
                        }
                        live_feedback = "Push Your Knees Out"

                # Check for fast descent
                if knee_vel > 100.0:
                    fast_descent_count += 1
                    current_error = {
                        "type": "Fast Descent",
                        "severity": "medium",
                        "timestamp_ms": ts,
                        "description": f"Descent speed of {round(knee_vel, 1)}°/s is too fast."
                    }
                    live_feedback = "Slow Down"

                # Check bottom transition
                # Knee angle reaches target bottom depth range or starts ascending
                if k_a <= 110:
                    rep_state = "bottom"
                    rep_bottom_start_ts = ts
                    live_feedback = "Good Depth"

            elif rep_state == "bottom":
                if k_a < rep_min_knee_angle:
                    rep_min_knee_angle = k_a

                # Keep track of depth and hip level relative to knee
                # Y increases downwards in screen space, so hip.y > knee.y means hip is lower
                hip_y = (h_l_coord[1] + h_r_coord[1]) / 2 if (h_l_coord and h_r_coord) else 0
                knee_y = (k_l_coord[1] + k_r_coord[1]) / 2 if (k_l_coord and k_r_coord) else 0
                
                # Torso stability check
                if t_a > 35.0:
                    torso_lean_count += 1
                    current_error = {
                        "type": "Torso Lean",
                        "severity": "medium",
                        "timestamp_ms": ts,
                        "description": f"Torso is leaning excessively forward ({round(t_a, 1)}°)."
                    }
                    live_feedback = "Keep Your Back Straight"

                # Uneven weight / asymmetry check
                if abs(kl - kr) > 15.0:
                    uneven_weight_count += 1
                    current_error = {
                        "type": "Uneven Weight Distribution",
                        "severity": "medium",
                        "timestamp_ms": ts,
                        "description": f"Weight shifted unevenly: Left Knee {round(kl, 1)}°, Right Knee {round(kr, 1)}°."
                    }
                    live_feedback = "Maintain Balance"

                # Transition to ascent
                if k_a > rep_min_knee_angle + 10:
                    # Assess bottom position quality on departure
                    if rep_min_knee_angle > 110:
                        incomplete_depth_count += 1
                        detected_errors.append({
                            "type": "Incomplete Depth",
                            "severity": "high",
                            "timestamp_ms": rep_bottom_start_ts or ts,
                            "description": f"Squat did not reach bottom depth (minimum knee angle was {round(rep_min_knee_angle, 1)}°, target 80°-110°)."
                        })
                    rep_state = "ascending"
                    live_feedback = "Drive Upwards"

            elif rep_state == "ascending":
                # Check for fast ascent
                if knee_vel > 100.0:
                    fast_ascent_count += 1
                    current_error = {
                        "type": "Fast Ascent",
                        "severity": "medium",
                        "timestamp_ms": ts,
                        "description": f"Ascent speed of {round(knee_vel, 1)}°/s is too fast."
                    }
                    live_feedback = "Drive Steadily"

                # Complete repetition cycle
                if k_a >= 165:
                    rep_state = "standing"
                    reps_count += 1
                    rep_durations.append((ts - rep_start_ts) / 1000.0)
                    live_feedback = "Good Squat"
                    
                    # Log active errors if any occurred in bottom
                    if current_error:
                        detected_errors.append(current_error)
                        current_error = None

        # Add overall session errors
        if incomplete_depth_count > 0 and not any(e["type"] == "Incomplete Depth" for e in detected_errors):
            detected_errors.append({
                "type": "Incomplete Depth",
                "severity": "high",
                "timestamp_ms": timestamps[0],
                "description": f"Incomplete squat depth detected on {incomplete_depth_count} reps."
            })
        if knees_cave_count > 15:
            detected_errors.append({
                "type": "Knees Caving In",
                "severity": "medium",
                "timestamp_ms": timestamps[0],
                "description": "Frequent knee caving detected during squats."
            })
        if torso_lean_count > 15:
            detected_errors.append({
                "type": "Torso Lean",
                "severity": "medium",
                "timestamp_ms": timestamps[0],
                "description": "Torso leaned excessively forward frequently."
            })

        # Calculate final metrics
        min_knee = min(knee_avg) if knee_avg else 180.0
        max_knee = max(knee_avg) if knee_avg else 180.0
        avg_knee = sum(knee_avg) / len(knee_avg) if knee_avg else 180.0
        
        # ROM is maximum flexion range (straight standing vs deepest bent)
        rom_range = abs(max_knee - min_knee)
        
        # Speed: average angular speed (deg/s)
        total_time = (timestamps[-1] - timestamps[0]) / 1000.0 if len(timestamps) > 1 else 1.0
        avg_speed = rom_range / (total_time / max(1, reps_count)) if reps_count > 0 else 0.0

        # Symmetry: comparison of left and right knee minimum flexion angles
        symmetry_diff = abs(min(knee_l) - min(knee_r)) if (knee_l and knee_r) else 0.0
        symmetry = max(10.0, min(100.0, 100.0 - (symmetry_diff * 3)))

        # Smoothness: average jitter variations
        velocities = []
        for j in range(1, len(knee_avg)):
            t_diff = (timestamps[j] - timestamps[j-1]) / 1000.0
            if t_diff > 0.01:
                velocities.append(abs(knee_avg[j] - knee_avg[j-1]) / t_diff)
        if len(velocities) > 1:
            vel_jitter = [abs(velocities[k] - velocities[k-1]) for k in range(1, len(velocities))]
            avg_jitter = sum(vel_jitter) / len(vel_jitter)
            smoothness = max(10.0, min(100.0, 100.0 - avg_jitter * 1.2))
        else:
            smoothness = 100.0

        # Accuracy Score Components
        # 1. ROM Achievement = 40% (target bottom range: 80°-110°)
        rom_score = 100.0
        if min_knee > 110: # didn't squat low enough
            rom_score = max(0.0, 100.0 - (min_knee - 110) * 4.0)
        elif min_knee < 70: # too deep, potential balance loss
            rom_score = max(50.0, 100.0 - (70 - min_knee) * 2.0)
            
        # 2. Symmetry = 25% (already calculated)
        # 3. Smoothness = 20% (already calculated)
        
        # 4. Speed Consistency = 15% (standard deviation of rep durations)
        speed_score = 100.0
        if len(rep_durations) > 1:
            std_dev = np.std(rep_durations)
            speed_score = max(30.0, min(100.0, 100.0 - std_dev * 25.0))

        accuracy_score = (
            self.config.rom_weight * rom_score +
            self.config.symmetry_weight * symmetry +
            self.config.smoothness_weight * smoothness +
            self.config.speed_weight * speed_score
        )
        accuracy_score = round(max(0.0, min(100.0, accuracy_score)), 1)

        # Status check
        if accuracy_score >= 90:
            status = "Excellent"
        elif accuracy_score >= 75:
            status = "Good"
        else:
            status = "Needs Improvement"

        # Determine overall live status indicator (color)
        live_status = "success"
        if len(detected_errors) > 0 or current_error:
            live_status = "warning"
        elif reps_count == 0:
            live_status = "idle"

        metrics = {
            "rom": round(rom_range, 1),
            "speed": round(avg_speed, 1),
            "symmetry": round(symmetry, 1),
            "smoothness": round(smoothness, 1),
            "repetitions": reps_count,
            "accuracy_score": accuracy_score,
            "max_rom": round(rom_range, 1),
            "min_knee_angle": round(min_knee, 1),
            "avg_knee_angle": round(avg_knee, 1),
            "status": status
        }

        # Resolve live angles for response
        last_idx = -1
        current_angles = {
            "hip_l": round(hip_l[last_idx], 1),
            "hip_r": round(hip_r[last_idx], 1),
            "knee_l": round(knee_l[last_idx], 1),
            "knee_r": round(knee_r[last_idx], 1),
            "torso": round(torso[last_idx], 1),
        }

        return {
            "reps": reps_count,
            "feedback": live_feedback,
            "status": live_status,
            "angles": current_angles,
            "metrics": metrics,
            "detected_errors": detected_errors,
            "current_error": current_error
        }

class GenericExerciseEngine:
    """
    Generic execution engine that can analyze any exercise based on its ExerciseConfig.
    Extracts joint coordinates, computes joint angles, runs a general repetition detector
    based on ROM thresholds, and computes symmetry, smoothness, speed, and accuracy scores.
    """
    def __init__(self, config: ExerciseConfig):
        self.config = config

    def apply_smoothing(self, values: List[float], alpha: float = 0.4) -> List[float]:
        if not values:
            return []
        smoothed = [values[0]]
        for i in range(1, len(values)):
            smoothed.append(alpha * values[i] + (1 - alpha) * smoothed[-1])
        return smoothed

    def process_frames(self, frames: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not frames:
            return {
                "reps": 0,
                "feedback": "Align with camera",
                "status": "idle",
                "angles": {},
                "metrics": {
                    "rom": 0.0,
                    "speed": 0.0,
                    "symmetry": 100.0,
                    "smoothness": 100.0,
                    "repetitions": 0,
                    "accuracy_score": 100.0,
                    "max_rom": 0.0
                },
                "detected_errors": [],
                "current_error": None
            }

        # 1. Identify primary joints to calculate angles
        # Config target joints can contain names like 'knee_l', 'knee_r', 'shoulder_l', etc.
        raw_angles_l = []
        raw_angles_r = []
        timestamps = []
        valid_frames = []

        is_flexion_exercise = self.config.rom_operator == "<="

        for frame in frames:
            jc = frame.get("joint_coordinates") or {}
            ts = frame.get("timestamp_millis") or frame.get("timestamp_ms") or 0
            
            s_l = jc.get("shoulder_l")
            s_r = jc.get("shoulder_r")
            e_l = jc.get("elbow_l")
            e_r = jc.get("elbow_r")
            w_l = jc.get("wrist_l")
            w_r = jc.get("wrist_r")
            h_l = jc.get("hip_l")
            h_r = jc.get("hip_r")
            k_l = jc.get("knee_l")
            k_r = jc.get("knee_r")
            a_l = jc.get("ankle_l")
            a_r = jc.get("ankle_r")

            angle_l = 0.0
            angle_r = 0.0
            has_l, has_r = False, False

            # Check config joints
            # If joint matches knee: calculate hip-knee-ankle
            if any("knee" in j for j in self.config.target_joints):
                if all([h_l, k_l, a_l]):
                    angle_l = calculate_angle_2d(h_l, k_l, a_l)
                    has_l = True
                if all([h_r, k_r, a_r]):
                    angle_r = calculate_angle_2d(h_r, k_r, a_r)
                    has_r = True
            elif any("shoulder" in j for j in self.config.target_joints):
                if all([h_l, s_l, e_l]):
                    angle_l = calculate_angle_2d(h_l, s_l, e_l)
                    has_l = True
                if all([h_r, s_r, e_r]):
                    angle_r = calculate_angle_2d(h_r, s_r, e_r)
                    has_r = True
            elif any("elbow" in j for j in self.config.target_joints):
                if all([s_l, e_l, w_l]):
                    angle_l = calculate_angle_2d(s_l, e_l, w_l)
                    has_l = True
                if all([s_r, e_r, w_r]):
                    angle_r = calculate_angle_2d(s_r, e_r, w_r)
                    has_r = True
            else:
                # Default fallback: Elbow
                if all([s_l, e_l, w_l]):
                    angle_l = calculate_angle_2d(s_l, e_l, w_l)
                    has_l = True
                if all([s_r, e_r, w_r]):
                    angle_r = calculate_angle_2d(s_r, e_r, w_r)
                    has_r = True

            if not (has_l or has_r):
                continue

            valid_frames.append(frame)
            timestamps.append(ts)
            raw_angles_l.append(angle_l if has_l else angle_r)
            raw_angles_r.append(angle_r if has_r else angle_l)

        if not valid_frames:
            return self.process_frames([])

        # Smooth angles
        angles_l = self.apply_smoothing(raw_angles_l)
        angles_r = self.apply_smoothing(raw_angles_r)
        
        # Primary side angle for rep counting (usually right side, or max)
        angles_primary = [max(angles_l[j], angles_r[j]) for j in range(len(valid_frames))]

        # Repetition State Machine
        reps_count = 0
        rep_state = "extended" if is_flexion_exercise else "relaxed"
        rep_start_ts = timestamps[0]
        rep_durations = []
        detected_errors = []
        live_feedback = "Good alignment"
        current_error = None

        # Thresholds
        target = self.config.target_rom
        if is_flexion_exercise:
            # e.g., Elbow Flexion: target is 55 deg (lower is more flexed)
            flex_threshold = target + 25.0
            extend_threshold = flex_threshold + 40.0
            
            for j in range(len(valid_frames)):
                a = angles_primary[j]
                ts = timestamps[j]
                
                if rep_state == "extended":
                    if a < flex_threshold:
                        rep_state = "flexed"
                        rep_start_ts = ts
                elif rep_state == "flexed":
                    if a > extend_threshold:
                        rep_state = "extended"
                        reps_count += 1
                        rep_durations.append((ts - rep_start_ts) / 1000.0)
                        live_feedback = f"Rep {reps_count} complete"
        else:
            # e.g., Shoulder Raise: target is 150 deg (higher is more flexed)
            raise_threshold = 95.0
            relax_threshold = 45.0
            
            for j in range(len(valid_frames)):
                a = angles_primary[j]
                ts = timestamps[j]
                
                if rep_state == "relaxed":
                    if a > raise_threshold:
                        rep_state = "raised"
                        rep_start_ts = ts
                elif rep_state == "raised":
                    if a < relax_threshold:
                        rep_state = "relaxed"
                        reps_count += 1
                        rep_durations.append((ts - rep_start_ts) / 1000.0)
                        live_feedback = f"Rep {reps_count} complete"

        # Calculate final metrics
        max_rom = max(angles_primary) if angles_primary else 0.0
        min_rom = min(angles_primary) if angles_primary else 180.0
        rom_range = abs(max_rom - min_rom) if is_flexion_exercise else max_rom

        total_time = (timestamps[-1] - timestamps[0]) / 1000.0 if len(timestamps) > 1 else 1.0
        avg_speed = rom_range / (total_time / max(1, reps_count)) if reps_count > 0 else 0.0

        # Symmetry comparison
        symmetry_diff = sum(abs(angles_l[j] - angles_r[j]) for j in range(len(valid_frames))) / len(valid_frames) if valid_frames else 0.0
        symmetry = max(10.0, min(100.0, 100.0 - (symmetry_diff * 2)))

        # Smoothness
        velocities = []
        for j in range(1, len(angles_primary)):
            t_diff = (timestamps[j] - timestamps[j-1]) / 1000.0
            if t_diff > 0.01:
                velocities.append(abs(angles_primary[j] - angles_primary[j-1]) / t_diff)
        if len(velocities) > 1:
            vel_jitter = [abs(velocities[k] - velocities[k-1]) for k in range(1, len(velocities))]
            avg_jitter = sum(vel_jitter) / len(vel_jitter)
            smoothness = max(10.0, min(100.0, 100.0 - avg_jitter * 1.5))
        else:
            smoothness = 100.0

        # Accuracy Score (ROM + Symmetry + Smoothness + Speed Consistency)
        rom_score = 100.0
        if is_flexion_exercise:
            if min_rom > target:
                rom_score = max(0.0, 100.0 - (min_rom - target) * 3.0)
        else:
            if max_rom < target:
                rom_score = max(0.0, 100.0 - (target - max_rom) * 2.0)

        speed_score = 100.0
        if len(rep_durations) > 1:
            std_dev = np.std(rep_durations)
            speed_score = max(30.0, min(100.0, 100.0 - std_dev * 20.0))

        accuracy_score = (
            self.config.rom_weight * rom_score +
            self.config.symmetry_weight * symmetry +
            self.config.smoothness_weight * smoothness +
            self.config.speed_weight * speed_score
        )
        accuracy_score = round(max(0.0, min(100.0, accuracy_score)), 1)

        # Status
        if accuracy_score >= 90:
            status = "Excellent"
        elif accuracy_score >= 75:
            status = "Good"
        else:
            status = "Needs Improvement"

        # Errors: ROM check
        if is_flexion_exercise and min_rom > target + 15.0:
            detected_errors.append({
                "type": "Incomplete ROM",
                "severity": "high",
                "timestamp_ms": timestamps[0],
                "description": f"Target contraction of {target}° was not reached (best contraction was {round(min_rom, 1)}°)."
            })
        elif not is_flexion_exercise and max_rom < target - 15.0:
            detected_errors.append({
                "type": "Incomplete ROM",
                "severity": "high",
                "timestamp_ms": timestamps[0],
                "description": f"Target ROM of {target}° was not reached (best ROM was {round(max_rom, 1)}°)."
            })

        # Resolve live angles for response
        last_idx = -1
        current_angles = {
            "primary": round(angles_primary[last_idx], 1),
            "left": round(angles_l[last_idx], 1),
            "right": round(angles_r[last_idx], 1)
        }

        metrics = {
            "rom": round(rom_range, 1),
            "speed": round(avg_speed, 1),
            "symmetry": round(symmetry, 1),
            "smoothness": round(smoothness, 1),
            "repetitions": reps_count,
            "accuracy_score": accuracy_score,
            "max_rom": round(max_rom, 1),
            "status": status
        }

        return {
            "reps": reps_count,
            "feedback": live_feedback,
            "status": "success" if accuracy_score >= 75 else "warning",
            "angles": current_angles,
            "metrics": metrics,
            "detected_errors": detected_errors,
            "current_error": current_error
        }

def get_exercise_engine(exercise_name: str) -> Any:
    """
    Factory function to retrieve the specialized or generic exercise engine.
    This fulfills the extensible exercise framework requirements.
    """
    name_lower = exercise_name.lower()
    if "squat" in name_lower:
        return SquatEngine(EXERCISE_CONFIGS["squat"])
    
    # Check configurations registry
    for config_key, config in EXERCISE_CONFIGS.items():
        if config_key in name_lower:
            return GenericExerciseEngine(config)
            
    # Fallback to general elbow flexion configuration if not registered
    fallback_config = ExerciseConfig(
        name=exercise_name,
        target_joints=["elbow_l", "elbow_r"],
        target_rom=55.0,
        rom_operator="<="
    )
    return GenericExerciseEngine(fallback_config)

