from ghostbench_worker.main import run_mock_job


def test_worker_mock_job_completes_and_deletes_artifact() -> None:
    result = run_mock_job("run_001")

    assert result["status"] == "artifact_deleted"
    assert result["runId"] == "run_001"
