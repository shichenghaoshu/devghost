from typing import Literal

from pydantic import BaseModel, Field

BenchmarkMode = Literal["local_unverified", "server_verified", "research"]
BenchmarkCondition = Literal[
    "vanilla", "generic", "personalized", "cross_user", "oracle", "full_history"
]
SubmissionStatus = Literal[
    "draft",
    "uploading",
    "uploaded",
    "security_scanning",
    "rejected",
    "accepted",
    "frozen",
    "queued",
    "provisioning",
    "running",
    "scoring",
    "completed",
    "failed",
    "artifact_deleted",
]


class BenchmarkRun(BaseModel):
    run_id: str
    mode: BenchmarkMode
    condition: BenchmarkCondition
    model_provider: str
    model_version: str
    agent: str
    harness_version: str
    skill_hash: str
    task_set_version: str
    token_budget: int = Field(gt=0)
    wall_clock_limit_seconds: int = Field(gt=0)
    network: Literal["none", "limited", "enabled"]
    random_seed: int
    scorer_version: str
    raw_source_uploaded: bool = False


allowed_transitions: dict[str, set[str]] = {
    "draft": {"uploading", "frozen"},
    "uploading": {"uploaded"},
    "uploaded": {"security_scanning", "frozen"},
    "security_scanning": {"rejected", "accepted"},
    "accepted": {"frozen"},
    "frozen": {"queued"},
    "queued": {"provisioning"},
    "provisioning": {"running"},
    "running": {"scoring", "failed"},
    "scoring": {"completed", "failed"},
    "completed": {"artifact_deleted"},
    "failed": {"artifact_deleted"},
    "rejected": {"artifact_deleted"},
    "artifact_deleted": set(),
}


class SubmissionState(BaseModel):
    submission_id: str
    status: SubmissionStatus = "draft"
    audit_events: list[dict[str, str]] = Field(default_factory=list)

    def advance(self, next_status: SubmissionStatus) -> None:
        if next_status not in allowed_transitions[self.status]:
            message = f"Invalid transition from {self.status} to {next_status}"
            raise ValueError(message)
        self.status = next_status
        self.audit_events.append({"submissionId": self.submission_id, "status": next_status})
