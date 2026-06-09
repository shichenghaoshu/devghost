def run_mock_job(run_id: str) -> dict[str, str]:
    return {
        "runId": run_id,
        "status": "artifact_deleted",
        "worker": "mock",
        "retention": "skill package deleted after mock run",
    }


def main() -> None:
    result = run_mock_job("run_worker_demo")
    print(result)


if __name__ == "__main__":
    main()
