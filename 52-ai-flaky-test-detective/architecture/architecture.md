# AI Flaky Test Detective — Architecture

> Find the tests that fail for no reason — statistically, across pipeline history — explain why they flake, and propose quarantine or fixes.

*Focus: 🔄 CI/CD · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A CI-side analyzer that ingests pipeline and test history (JUnit results, GitHub Actions/Jenkins/GitLab APIs), computes per-test flakiness scores, and — for the worst offenders — pulls failing runs' logs and diffs their error signatures to hypothesize the mechanism (shared state, race, timeout, environment). It proposes a path per test: quarantine with an expiry, a concrete fix PR, or an infra-level remedy (more runners, better isolation).

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Test history ingestion (with retries)              │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Flakiness scoring across runs                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Failure clustering + signature diff                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Mechanism hypothesis (race · state · time)         │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Quarantine / fix PR + re-triage                    │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| History collector | CI APIs and JUnit/pytest result ingestion, retry-aware |
| Flakiness engine | statistical scoring per test and per suite |
| Signature differ | log comparison across a test's failures |
| Action drafter | quarantine PRs, fix suggestions, infra recommendations, expiry tracker |

## 4. Data Flow

1. Nightly (or on a webhook), the collector refreshes per-test statistics from the CI system.
2. Tests above the flakiness threshold are flagged with their cost: retries wasted, minutes lost.
3. For top offenders, failure signatures are diffed and a mechanism hypothesis is drafted.
4. Owners get a quarantine or fix PR with evidence; expiry dates force re-triage.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "test_id": "checkout.E2E.test_payment_retry",
  "flakiness_score": 0.34,
  "observations": {"runs_last_30d": 412, "failures": 41, "pass_after_retry": 38, "retry_minutes_wasted": 96},
  "signature_clusters": [
    {"signature": "TimeoutError: waiting for #checkout-btn", "count": 29, "correlated_with": "parallelism=8 + p95 runner cpu 0.97"}
  ],
  "hypothesis": {"mechanism": "resource-contention-timeout", "confidence": "high", "evidence": ["fails on 8-way shards", "passes in isolation 50/50"]},
  "recommendation": {"action": "quarantine_with_fix_pr", "quarantine_expiry": "2026-11-12", "fix_pr": "PR-2841"}
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `per-test pass/fail history with retries`
* `failing-run logs and error signatures`
* `pipeline parallelism and runner metadata`
* `timing and resource metrics`
* `test ownership from CODEOWNERS`

## 8. Human-in-the-Loop & Approval

The detective never merges: quarantine and fix PRs are reviewed by test owners; re-triage reports keep quarantines honest and temporary.

## 9. Security Considerations

* Test logs can embed secrets or customer data from fixtures: redact before model calls; prefer self-hosted models for raw logs.
* Quarantine is audited: skipping tests is a security-relevant action; every skip names an owner and an expiry.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [10 · AI Test Failure Analyzer](../../10-ai-test-failure-analyzer/README.md)
- [01 · AI Pipeline Failure Analyzer](../../01-ai-pipeline-failure-analyzer/README.md)
- [11 · AI Build Optimization Assistant](../../11-ai-build-optimization-assistant/README.md)
- [07 · AI GitHub Actions Debugger](../../07-ai-github-actions-debugger/README.md)
