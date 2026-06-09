import type { PromptInjectionFinding, RedactionFinding } from "@devghost/contracts";

interface PatternSpec {
  type: string;
  action: RedactionFinding["action"];
  pattern: RegExp;
}

const secretPatterns: PatternSpec[] = [
  { type: "github-token", action: "removed", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { type: "openai-token", action: "removed", pattern: /sk-(?:proj_)?[A-Za-z0-9_-]{24,}/g },
  {
    type: "pem-private-key",
    action: "block-upload",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g
  },
  { type: "jwt", action: "removed", pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  {
    type: "database-url",
    action: "removed",
    pattern: /(?:postgres|mysql|mongodb):\/\/[^\s"'`]+/g
  }
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g;
const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function lineForOffset(text: string, offset: number): number {
  return text.slice(0, offset).split("\n").length;
}

function mask(value: string): string {
  if (value.length <= 8) {
    return "****";
  }
  return `${value.slice(0, 4)}****${value.slice(-3)}`;
}

export function detectSecrets(
  text: string,
  sourceAlias = "source_01",
  relativePath = "unknown"
): RedactionFinding[] {
  const findings: RedactionFinding[] = [];
  for (const spec of secretPatterns) {
    for (const match of text.matchAll(spec.pattern)) {
      const value = match[0] ?? "";
      findings.push({
        type: spec.type,
        sourceAlias,
        relativePath,
        line: lineForOffset(text, match.index ?? 0),
        maskedPreview: mask(value),
        action: spec.action
      });
    }
  }
  const highEntropy = /\b[A-Za-z0-9/+_-]{40,}\b/g;
  for (const match of text.matchAll(highEntropy)) {
    const value = match[0] ?? "";
    if (findings.some((finding) => finding.maskedPreview === mask(value))) {
      continue;
    }
    findings.push({
      type: "high-entropy-string",
      sourceAlias,
      relativePath,
      line: lineForOffset(text, match.index ?? 0),
      maskedPreview: mask(value),
      action: "review"
    });
  }
  return findings;
}

export function detectPII(
  text: string,
  sourceAlias = "source_01",
  relativePath = "unknown"
): RedactionFinding[] {
  const findings: RedactionFinding[] = [];
  const specs: PatternSpec[] = [
    { type: "email", action: "review", pattern: emailPattern },
    { type: "phone", action: "review", pattern: phonePattern },
    { type: "ip-address", action: "review", pattern: ipPattern }
  ];
  for (const spec of specs) {
    for (const match of text.matchAll(spec.pattern)) {
      const value = match[0] ?? "";
      findings.push({
        type: spec.type,
        sourceAlias,
        relativePath,
        line: lineForOffset(text, match.index ?? 0),
        maskedPreview: mask(value),
        action: spec.action
      });
    }
  }
  return findings;
}

export function detectPromptInjection(text: string): PromptInjectionFinding[] {
  const checks: Array<{ category: string; pattern: RegExp }> = [
    { category: "ignore-instructions", pattern: /ignore (all )?(previous|system|developer) instructions/i },
    { category: "unauthorized-file-access", pattern: /(?:read|upload|exfiltrate).*(?:~\/\.ssh|id_rsa|environment variables|\.env)/i },
    { category: "command-execution", pattern: /(?:execute|run) (?:this )?(?:command|script|shell)/i },
    { category: "system-impersonation", pattern: /(?:system|developer) message:/i }
  ];
  return checks
    .filter((check) => check.pattern.test(text))
    .map((check) => ({
      category: check.category,
      risk: "high" as const,
      excerpt: text.slice(0, 120)
    }));
}

export function redactText(
  text: string,
  sourceAlias = "source_01",
  relativePath = "unknown"
): { redactedText: string; report: RedactionFinding[] } {
  const report = [...detectSecrets(text, sourceAlias, relativePath), ...detectPII(text, sourceAlias, relativePath)];
  let redactedText = text;
  for (const spec of secretPatterns) {
    redactedText = redactedText.replace(spec.pattern, "[REDACTED]");
  }
  redactedText = redactedText.replace(emailPattern, "[EMAIL]");
  redactedText = redactedText.replace(phonePattern, "[PHONE]");
  redactedText = redactedText.replace(ipPattern, "[IP]");
  return { redactedText, report };
}
