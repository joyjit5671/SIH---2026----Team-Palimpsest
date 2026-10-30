import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Date, ForeignKey, Integer
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    institution_code = Column(String(64), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)

    applications = relationship("Application", back_populates="institution", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="institution")
    undertakings = relationship("Undertaking", back_populates="institution")

class WorkflowRoute(Base):
    __tablename__ = "workflow_routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_code = Column(String(64), unique=True, nullable=False, index=True)
    version = Column(String(32), default="1.0")
    active = Column(Boolean, default=True)
    stages_json = Column(Text, nullable=False)  # JSON-encoded array of stages e.g. ["SCRUTINY", "EVC", "FINAL_REVIEW"]
    created_at = Column(DateTime, default=utc_now)

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    display_name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False, index=True)
    region_scope = Column(String(100), default="ALL")
    active = Column(Boolean, default=True)

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_number = Column(String(64), unique=True, nullable=False, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    application_type = Column(String(100), nullable=False)
    route_code = Column(String(64), default="SCRUTINY_EVC", nullable=False)
    current_stage = Column(String(64), default="SCRUTINY", nullable=False, index=True)
    operational_status = Column(String(64), default="IN_REVIEW", nullable=False, index=True)
    assigned_user_id = Column(String(64), nullable=True, index=True)
    due_date = Column(Date, nullable=True)
    last_return_reason = Column(Text, nullable=True)
    requested_clarifications_json = Column(Text, default="[]")
    submitted_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    institution = relationship("Institution", back_populates="applications")
    events = relationship("WorkflowEvent", back_populates="application", cascade="all, delete-orphan", order_by="WorkflowEvent.created_at")
    evc_events = relationship("EVCEvent", back_populates="application", cascade="all, delete-orphan")
    undertakings = relationship("Undertaking", back_populates="application")
    documents = relationship("Document", back_populates="application")

class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    from_stage = Column(String(64), nullable=True)
    to_stage = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)
    reason = Column(Text, nullable=True)
    actor_id = Column(String(64), nullable=False)
    actor_role = Column(String(64), nullable=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now, index=True)

    application = relationship("Application", back_populates="events")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False, index=True)
    assignee_id = Column(String(64), nullable=False)
    assigned_by = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=utc_now)

class EVCEvent(Base):
    __tablename__ = "evc_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    status = Column(String(64), default="PENDING", nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=True)
    due_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_team = Column(String(255), nullable=True)
    lead_expert = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    application = relationship("Application", back_populates="evc_events")

class Undertaking(Base):
    __tablename__ = "undertakings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=True, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    status = Column(String(64), default="PENDING", nullable=False, index=True)
    submitted_at = Column(DateTime, nullable=True)
    verified_by = Column(String(64), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    review_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    institution = relationship("Institution", back_populates="undertakings")
    application = relationship("Application", back_populates="undertakings")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=True, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    document_type = Column(String(100), nullable=False)
    storage_key = Column(String(255), nullable=False)
    valid_from = Column(Date, nullable=False)
    expires_on = Column(Date, nullable=False, index=True)
    review_status = Column(String(64), default="VALID", nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)

    institution = relationship("Institution", back_populates="documents")
    application = relationship("Application", back_populates="documents")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_id = Column(String(64), nullable=False, index=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), default="INFO", nullable=False)
    message = Column(Text, nullable=False)
    due_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now, index=True)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(64), nullable=False, index=True)
    actor_role = Column(String(64), nullable=True)
    action = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False, index=True)
    before_json = Column(Text, nullable=True)
    after_json = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now, index=True)
