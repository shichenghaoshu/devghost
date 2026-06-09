.PHONY: setup dev lint typecheck test test-unit test-integration test-security build docker-up docker-down demo clean

setup:
	pnpm install
	uv sync

dev:
	pnpm dev

lint:
	pnpm lint
	uv run ruff check .

typecheck:
	pnpm typecheck
	uv run mypy python services

test:
	pnpm test
	uv run pytest

test-unit:
	pnpm test:unit
	uv run pytest python services

test-integration:
	pnpm test:integration

test-security:
	pnpm test:security

build:
	pnpm build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

demo:
	pnpm demo

clean:
	rm -rf .devghost coverage .turbo .next dist .pytest_cache .mypy_cache .ruff_cache
