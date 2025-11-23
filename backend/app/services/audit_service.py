"""Audit logging service."""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import AuditLog
from app.models.enums import AuditAction


class AuditService:
    """Service for audit logging."""

    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        review_id: str,
        user_id: str,
        action: AuditAction,
        details: Optional[dict] = None,
    ) -> AuditLog:
        """Create an audit log entry."""
        log_entry = AuditLog(
            review_id=review_id,
            user_id=user_id,
            action=action,
            details=details or {},
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def get_logs(self, review_id: str, limit: int = 50) -> List[AuditLog]:
        """Get audit logs for a review."""
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.review_id == review_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )

    def log_review_created(self, review_id: str, user_id: str) -> AuditLog:
        """Log review creation."""
        return self.log(review_id, user_id, AuditAction.CREATED, {"event": "Review created"})

    def log_medications_added(self, review_id: str, user_id: str, count: int) -> AuditLog:
        """Log medications added."""
        return self.log(
            review_id, user_id, AuditAction.MEDICATIONS_ADDED,
            {"count": count, "event": f"{count} medications added"}
        )

    def log_ai_generated(self, review_id: str, user_id: str, suggestion_count: int) -> AuditLog:
        """Log AI suggestions generated."""
        return self.log(
            review_id, user_id, AuditAction.AI_GENERATED,
            {"suggestion_count": suggestion_count, "event": f"AI generated {suggestion_count} suggestions"}
        )

    def log_draft_generated(self, review_id: str, user_id: str) -> AuditLog:
        """Log report draft generated."""
        return self.log(review_id, user_id, AuditAction.DRAFT_GENERATED, {"event": "Report draft generated"})

    def log_section_edited(self, review_id: str, user_id: str, section: str) -> AuditLog:
        """Log section edited."""
        return self.log(
            review_id, user_id, AuditAction.EDITED,
            {"section": section, "event": f"Section '{section}' edited"}
        )

    def log_finalized(self, review_id: str, user_id: str) -> AuditLog:
        """Log report finalized."""
        return self.log(review_id, user_id, AuditAction.FINALIZED, {"event": "Report finalized"})

    def log_reopened(self, review_id: str, user_id: str, reason: str = "") -> AuditLog:
        """Log report reopened."""
        return self.log(
            review_id, user_id, AuditAction.REOPENED,
            {"reason": reason, "event": "Report reopened for amendment"}
        )

    def log_exported(self, review_id: str, user_id: str, method: str) -> AuditLog:
        """Log report exported/sent."""
        return self.log(
            review_id, user_id, AuditAction.EXPORTED,
            {"method": method, "event": f"Report exported via {method}"}
        )
