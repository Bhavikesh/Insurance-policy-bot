from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import List, Optional

class HackRXRequest(BaseModel):
    document_url: Optional[HttpUrl] = Field(
        None,
        description="URL to the document (PDF, DOCX, or EML)",
        examples=["https://example.com/policy.pdf"]
    )
    document_id: Optional[str] = Field(
        None,
        description="ID of document from database or uploads",
        examples=["abc123def456"]
    )
    questions: List[str] = Field(
        ...,
        description="List of questions to answer based on the document",
        min_length=1,
        max_length=20,
        examples=[["What is the grace period for premium payment?"]]
    )
    
    @field_validator('questions')
    @classmethod
    def validate_questions(cls, v):
        if not v:
            raise ValueError("At least one question is required")
        return v
    
    @field_validator('document_url', 'document_id')
    @classmethod
    def validate_document_source(cls, v, info):
        # Check if at least one document source is provided
        if info.field_name == 'document_id':
            doc_url = info.data.get('document_url')
            if not v and not doc_url:
                raise ValueError("Either document_url or document_id must be provided")
        return v
    
    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "document_url": "https://example.com/policy.pdf",
                    "questions": ["What is the grace period?"]
                },
                {
                    "document_id": "abc123def456",
                    "questions": ["What are the exclusions?"]
                }
            ]
        }