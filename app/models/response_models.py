from pydantic import BaseModel, Field
from typing import List

class HackRXResponse(BaseModel):
    answers: List[str] = Field(
        ...,
        description="List of answers corresponding to the input questions",
        examples=[["Answer 1 with clause references...", "Answer 2 with reasoning..."]]
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "answers": [
                    "Decision: APPROVED\nRelevant Clauses: Section 3.1 states grace period is 30 days\nExplanation: Premium payment grace period is clearly defined as 30 days from due date.",
                    "Decision: PARTIAL COVERAGE\nRelevant Clauses: Clause 5.2 mentions maternity coverage with conditions\nExplanation: Maternity expenses are covered after a waiting period of 9 months from policy inception."
                ]
            }
        }