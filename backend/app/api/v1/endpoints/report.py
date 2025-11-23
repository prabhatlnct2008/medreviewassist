"""Report draft API endpoints."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Review, ReportDraft, Consent, ReviewStatus
from app.services.report_service import ReportService
from app.services.pdf_service import PDFService

router = APIRouter(prefix="/reviews/{review_id}/report", tags=["report"])


class SectionContent(BaseModel):
    content: str
    reviewed: bool = False


class ReportDraftResponse(BaseModel):
    id: str
    review_id: str
    sections: Dict[str, Dict[str, Any]]
    generated_at: Optional[str] = None
    last_edited_at: Optional[str] = None
    is_finalized: bool

    class Config:
        from_attributes = True


class SectionUpdateRequest(BaseModel):
    content: str
    reviewed: bool = False


class FinalizeRequest(BaseModel):
    delivery_method: str = "email"  # email, print, both
    pharmacist_signature: str = ""
    consent_confirmed: bool = False


@router.post("/generate", response_model=ReportDraftResponse)
async def generate_report_draft(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate or regenerate report draft from review data."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    service = ReportService(db)
    draft = service.generate_draft(review)

    return _format_draft_response(draft)


@router.get("", response_model=Optional[ReportDraftResponse])
async def get_report_draft(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current report draft for a review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    service = ReportService(db)
    draft = service.get_draft(review_id)

    if not draft:
        return None

    return _format_draft_response(draft)


@router.put("/sections/{section}", response_model=ReportDraftResponse)
async def update_report_section(
    review_id: str,
    section: str,
    update: SectionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a specific section of the report draft."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found. Generate a draft first.",
        )

    if draft.is_finalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a finalized report. Reopen for amendment first.",
        )

    try:
        service = ReportService(db)
        updated_draft = service.update_draft_section(
            draft, section, update.content, update.reviewed
        )
        return _format_draft_response(updated_draft)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/sections/{section}/review", response_model=ReportDraftResponse)
async def mark_section_reviewed(
    review_id: str,
    section: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a report section as reviewed."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found",
        )

    try:
        service = ReportService(db)
        updated_draft = service.mark_section_reviewed(draft, section)
        return _format_draft_response(updated_draft)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/preview/pdf")
async def preview_pdf(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and return PDF preview of the report."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found. Generate a draft first.",
        )

    try:
        pdf_service = PDFService(db)
        pdf_bytes = pdf_service.generate_pdf(
            review=review,
            draft=draft,
            is_draft=not draft.is_finalized
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="report_{review_id}.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}",
        )


@router.get("/download/pdf")
async def download_pdf(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and download PDF of the report."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found. Generate a draft first.",
        )

    try:
        pdf_service = PDFService(db)
        pdf_bytes = pdf_service.generate_pdf(
            review=review,
            draft=draft,
            is_draft=not draft.is_finalized
        )

        patient_name = review.patient.full_name.replace(' ', '_')
        filename = f"MedReview_{patient_name}_{review.review_type.value.upper()}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}",
        )


@router.post("/finalize", response_model=ReportDraftResponse)
async def finalize_report(
    review_id: str,
    finalize_data: FinalizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Finalize the report and lock it from further edits."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    # Check if already submitted
    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review has already been finalized",
        )

    # Get draft
    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found. Generate a draft first.",
        )

    # Check consent is obtained
    consent = db.query(Consent).filter(Consent.review_id == review_id).first()
    if not consent or not consent.obtained:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient consent must be obtained before finalizing",
        )

    # Verify all sections are reviewed
    sections = draft.sections or {}
    unreviewed = [k for k, v in sections.items() if not v.get('reviewed', False)]
    if unreviewed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The following sections have not been reviewed: {', '.join(unreviewed)}",
        )

    # Add pharmacist signature to sign-off section
    if finalize_data.pharmacist_signature:
        sections['pharmacist_signoff'] = {
            'content': f"Signed: {current_user.full_name}\n{finalize_data.pharmacist_signature}\nDate: {datetime.utcnow().strftime('%d/%m/%Y %H:%M')}",
            'reviewed': True,
        }
        draft.sections = sections

    # Generate final PDF
    try:
        pdf_service = PDFService(db)
        pdf_bytes = pdf_service.generate_pdf(review, draft, is_draft=False)
        pdf_path = pdf_service.save_pdf(pdf_bytes, review_id, is_final=True)
        draft.pdf_path = pdf_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate final PDF: {str(e)}",
        )

    # Finalize
    draft.is_finalized = True
    review.status = ReviewStatus.SUBMITTED

    db.commit()
    db.refresh(draft)

    return _format_draft_response(draft)


@router.post("/reopen")
async def reopen_report(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reopen a finalized report for amendments."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.status != ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted reviews can be reopened",
        )

    draft = db.query(ReportDraft).filter(ReportDraft.review_id == review_id).first()
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report draft not found",
        )

    # Reopen
    draft.is_finalized = False
    review.status = ReviewStatus.IN_PROGRESS

    db.commit()
    db.refresh(draft)

    return _format_draft_response(draft)


def _format_draft_response(draft: ReportDraft) -> dict:
    """Format draft for API response."""
    return {
        "id": draft.id,
        "review_id": draft.review_id,
        "sections": draft.sections,
        "generated_at": draft.generated_at.isoformat() if draft.generated_at else None,
        "last_edited_at": draft.last_edited_at.isoformat() if draft.last_edited_at else None,
        "is_finalized": draft.is_finalized,
    }
