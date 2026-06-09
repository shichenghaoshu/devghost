import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json"]
    }
  },
  resolve: {
    alias: {
      "@devghost/arena-core": "/packages/arena-core/src/index.ts",
      "@devghost/config": "/packages/config/src/index.ts",
      "@devghost/contracts": "/packages/contracts/src/index.ts",
      "@devghost/evidence": "/packages/evidence/src/index.ts",
      "@devghost/redaction": "/packages/redaction/src/index.ts",
      "@devghost/report": "/packages/report/src/index.ts",
      "@devghost/scanner": "/packages/scanner/src/index.ts",
      "@devghost/scoring": "/packages/scoring/src/index.ts",
      "@devghost/skill-adapters": "/packages/skill-adapters/src/index.ts",
      "@devghost/skill-compiler": "/packages/skill-compiler/src/index.ts",
      "@devghost/skill-ir": "/packages/skill-ir/src/index.ts",
      "@devghost/source-discovery": "/packages/source-discovery/src/index.ts"
    }
  }
});
