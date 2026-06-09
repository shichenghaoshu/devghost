from fastapi.testclient import TestClient
from ghostbench_api.main import app


def test_health_and_submission_flow() -> None:
    client = TestClient(app)

    assert client.get("/health").json() == {"status": "ok"}
    created = client.post("/v1/submissions").json()
    submission_id = created["submissionId"]

    assert created["status"] == "draft"
    frozen = client.post(f"/v1/submissions/{submission_id}/freeze").json()
    assert frozen["status"] == "frozen"
