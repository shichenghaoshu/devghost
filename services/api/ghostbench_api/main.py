from uuid import uuid4

from fastapi import FastAPI, HTTPException
from ghostbench_core.models import SubmissionState

app = FastAPI(title="GhostBench API", version="0.1.0")

submissions: dict[str, SubmissionState] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready"}


@app.post("/v1/submissions")
def create_submission() -> dict[str, str]:
    submission_id = f"sub_{uuid4().hex[:12]}"
    state = SubmissionState(submission_id=submission_id)
    submissions[submission_id] = state
    return {"submissionId": submission_id, "status": state.status}


@app.get("/v1/submissions/{submission_id}")
def get_submission(submission_id: str) -> dict[str, object]:
    state = submissions.get(submission_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {
        "submissionId": submission_id,
        "status": state.status,
        "auditEvents": state.audit_events,
    }


@app.post("/v1/submissions/{submission_id}/upload-complete")
def upload_complete(submission_id: str) -> dict[str, str]:
    state = submissions.get(submission_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if state.status == "draft":
        state.advance("uploading")
    state.advance("uploaded")
    return {"submissionId": submission_id, "status": state.status}


@app.post("/v1/submissions/{submission_id}/freeze")
def freeze_submission(submission_id: str) -> dict[str, str]:
    state = submissions.get(submission_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if state.status == "uploaded":
        state.advance("security_scanning")
        state.advance("accepted")
    state.advance("frozen")
    return {"submissionId": submission_id, "status": state.status}


@app.post("/v1/runs")
def create_run() -> dict[str, str]:
    return {"runId": f"run_{uuid4().hex[:12]}", "status": "queued"}


@app.get("/v1/runs/{run_id}")
def get_run(run_id: str) -> dict[str, str]:
    return {"runId": run_id, "status": "completed"}


@app.get("/v1/runs/{run_id}/scores")
def get_scores(run_id: str) -> dict[str, object]:
    return {"runId": run_id, "verification": "mock", "score": 84.2}


@app.get("/v1/leaderboards")
def leaderboards() -> dict[str, list[str]]:
    return {"boards": ["mock-public-v0.1"]}


@app.get("/v1/leaderboards/{board}")
def leaderboard(board: str) -> dict[str, object]:
    return {"board": board, "partitioned": True, "entries": []}


@app.get("/v1/cards/{run_id}")
def card(run_id: str) -> dict[str, str]:
    return {"runId": run_id, "format": "svg", "status": "planned"}


@app.get("/v1/tasksets/public")
def public_tasksets() -> dict[str, list[str]]:
    return {"tasksets": ["public-v0.1"]}
