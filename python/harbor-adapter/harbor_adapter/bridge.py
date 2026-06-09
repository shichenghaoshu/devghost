from pydantic import BaseModel


class HarborTaskRef(BaseModel):
    task_id: str
    task_version: str
    public_only: bool = True
