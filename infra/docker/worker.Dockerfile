FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml uv.lock* ./
COPY services ./services
COPY python ./python

RUN pip install --no-cache-dir uv && uv sync --frozen || uv sync

CMD ["uv", "run", "python", "-m", "ghostbench_worker.main"]
