from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import String, ForeignKey, DateTime, JSON, Float, Integer, Boolean, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="patient", nullable=False) # 'admin' or 'patient'
    first_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient_profile: Mapped[Optional["Patient"]] = relationship(
        "Patient", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    assignments_created: Mapped[List["ExerciseAssignment"]] = relationship(
        "ExerciseAssignment", 
        back_populates="assigner"
    )


class Patient(Base):
    __tablename__ = "patients"

    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    diagnosis: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    assigned_admin_id: Mapped[Optional[str]] = mapped_column(String(255), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    consents: Mapped[List["Consent"]] = relationship("Consent", back_populates="patient", cascade="all, delete-orphan")
    assignments: Mapped[List["ExerciseAssignment"]] = relationship("ExerciseAssignment", back_populates="patient", cascade="all, delete-orphan")
    sessions: Mapped[List["MotionSession"]] = relationship("MotionSession", back_populates="patient", cascade="all, delete-orphan")

    @property
    def id(self) -> str:
        return self.user_id


class Consent(Base):
    __tablename__ = "consents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(String(255), ForeignKey("patients.user_id", ondelete="CASCADE"), nullable=False)
    consent_level: Mapped[str] = mapped_column(String(100), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="consents")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2000))
    instructions: Mapped[Optional[str]] = mapped_column(String(2000))
    target_rom: Mapped[Optional[float]] = mapped_column(Float)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    target_joints: Mapped[Optional[dict]] = mapped_column(JSON) # JSONB matching list of tracked points
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assignments: Mapped[List["ExerciseAssignment"]] = relationship("ExerciseAssignment", back_populates="exercise")
    sessions: Mapped[List["MotionSession"]] = relationship("MotionSession", back_populates="exercise")
    rules: Mapped[List["ExerciseRule"]] = relationship(
        "ExerciseRule", 
        back_populates="exercise", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class ExerciseAssignment(Base):
    __tablename__ = "exercise_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(String(255), ForeignKey("patients.user_id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    assigned_by: Mapped[Optional[str]] = mapped_column(String(255), ForeignKey("users.id", ondelete="SET NULL"))
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="assignments")
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="assignments")
    assigner: Mapped[Optional["User"]] = relationship("User", back_populates="assignments_created")


class MotionSession(Base):
    __tablename__ = "motion_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(String(255), ForeignKey("patients.user_id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("exercises.id", ondelete="SET NULL"))
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    status: Mapped[Optional[str]] = mapped_column(String(50))

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="sessions")
    exercise: Mapped[Optional["Exercise"]] = relationship("Exercise", back_populates="sessions")
    metrics: Mapped[List["MotionMetric"]] = relationship("MotionMetric", back_populates="session", cascade="all, delete-orphan")

    @property
    def title(self) -> str:
        return self.exercise.name if self.exercise else "Motion Tracking Session"

    @property
    def description(self) -> str:
        return self.exercise.description if (self.exercise and self.exercise.description) else "General movement session"

    @property
    def avg_score(self) -> float:
        return float(self.score) if self.score is not None else 0.0

    @property
    def range_of_motion(self) -> float:
        if self.metrics and len(self.metrics) > 0:
            return self.metrics[0].rom if self.metrics[0].rom is not None else 0.0
        return 0.0

    @property
    def metrics_summary(self) -> dict:
        if self.metrics and len(self.metrics) > 0:
            m = self.metrics[0]
            return {
                "rom": m.rom or 0.0,
                "speed": m.speed or 0.0,
                "symmetry": m.symmetry or 0.0
            }
        return {"rom": 0.0, "speed": 0.0, "symmetry": 0.0}

    @property
    def duration_seconds(self) -> int:
        if self.metrics and len(self.metrics) > 0:
            m = self.metrics[0]
            if m.telemetry_frames and isinstance(m.telemetry_frames, dict) and "frames" in m.telemetry_frames:
                frames = m.telemetry_frames["frames"]
                if len(frames) > 1:
                    start_t = frames[0].get("timestamp_millis", 0)
                    end_t = frames[-1].get("timestamp_millis", 0)
                    return max(int((end_t - start_t) / 1000), 0)
        return 180  # Default fallback

    @property
    def telemetry_data(self) -> list:
        if self.metrics and len(self.metrics) > 0:
            m = self.metrics[0]
            if m.telemetry_frames and isinstance(m.telemetry_frames, dict) and "frames" in m.telemetry_frames:
                frames = m.telemetry_frames["frames"]
                mapped_frames = []
                for idx, frame in enumerate(frames):
                    mapped_frames.append({
                        "id": idx + 1,
                        "session_id": self.id,
                        "timestamp_millis": frame.get("timestamp_millis", 0),
                        "joint_coordinates": frame.get("joint_coordinates", {}),
                        "sensor_signals": frame.get("sensor_signals")
                    })
                return mapped_frames
        return []


class MotionMetric(Base):
    __tablename__ = "motion_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("motion_sessions.id", ondelete="CASCADE"), nullable=False)
    rom: Mapped[Optional[float]] = mapped_column(Float) # Range of Motion
    speed: Mapped[Optional[float]] = mapped_column(Float)
    symmetry: Mapped[Optional[float]] = mapped_column(Float)
    telemetry_frames: Mapped[Optional[dict]] = mapped_column(JSON) # Raw coordinates arrays

    # Relationships
    session: Mapped["MotionSession"] = relationship("MotionSession", back_populates="metrics")


class WebsiteContent(Base):
    __tablename__ = "website_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    page_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    content_data: Mapped[dict] = mapped_column(JSON, nullable=False) # Structured content config
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    setting_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    setting_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ExerciseRule(Base):
    __tablename__ = "exercise_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rule_type: Mapped[str] = mapped_column(String(100), nullable=False)
    parameters: Mapped[dict] = mapped_column(JSON, nullable=False)
    status_on_success: Mapped[str] = mapped_column(String(50), default="success", nullable=False)
    status_on_fail: Mapped[str] = mapped_column(String(50), default="warning", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="rules")
