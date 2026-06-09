from ghostbench_core.models import BenchmarkRun, SubmissionState


def test_benchmark_run_records_reproducible_context() -> None:
    run = BenchmarkRun(
        run_id="run_001",
        mode="local_unverified",
        condition="personalized",
        model_provider="mock",
        model_version="mock-model",
        agent="mock",
        harness_version="0.1.0",
        skill_hash="sha256:abc",
        task_set_version="public-v0.1",
        token_budget=4000,
        wall_clock_limit_seconds=900,
        network="none",
        random_seed=7,
        scorer_version="0.1.0",
    )

    assert run.raw_source_uploaded is False
    assert run.network == "none"


def test_submission_state_advances_by_allowed_transitions() -> None:
    state = SubmissionState(submission_id="sub_001")

    state.advance("uploading")
    state.advance("uploaded")
    state.advance("security_scanning")
    state.advance("accepted")
    state.advance("frozen")

    assert state.status == "frozen"
    assert len(state.audit_events) == 5
