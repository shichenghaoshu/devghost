from pydantic import BaseModel


class MockScore(BaseModel):
    total: float
    scorer_version: str = "0.1.0"
