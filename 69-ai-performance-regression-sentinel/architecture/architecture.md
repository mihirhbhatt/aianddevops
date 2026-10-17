# AI Performance Regression Sentinel — Architecture

> Catch performance regressions in CI, not in production: continuous benchmark tracking, statistical gating, and automated bisection when something gets slower.

*Focus: 🔄 CI/CD · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A performance gate for CI: benchmarks run on a schedule and on PRs touching hot paths, results land in a time-series store with statistical gating (noise-aware, confidence-scored), and regressions trigger automated bisection. Budgets live as code next to the tests; the sentinel files its findings as PR checks and issues with evidence, not vibes.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Benchmark scenarios + environments                 │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Continuous result collection                       │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Statistical gate on PRs                            │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← noise-aware
┌────────────────────────────────────────────────────┐
│ Automated bisection on regression                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Budgets + trend reports                            │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Benchmark runner | deterministic execution with environment pinning |
| Results store | time-series of scores with metadata |
| Statistics engine | change-point detection, confidence scoring, noise models |
| Bisector | commit-window narrowing with per-commit runs |

## 4. Data Flow

1. Hot paths get benchmark scenarios derived from production traffic shape.
2. PRs touching those paths get a statistical verdict, not a single-run panic.
3. Real regressions trigger bisection that names the commit and the delta.
4. Budgets and trends make performance a reviewed, visible property.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "service": "checkout-api",
  "scenario": "checkout_flow_p95",
  "verdict": "regression",
  "statistics": {"baseline_p95_ms": 612, "candidate_p95_ms": 738, "delta_pct": 20.6, "confidence": 0.97, "runs": 12},
  "bisection": {"window": ["9f2c1e", "44b0aa"], "culprit": "44b0aa (orders client: sync retry added)", "evidence": "each commit benched 3x"},
  "budget": {"file": "perf/budgets.yaml", "limit_p95_ms": 700, "status": "exceeded"},
  "action": "PR check failed with evidence; override requires perf-owner sign-off"
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| Model routing & AI gateways | LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway | provider-agnostic routing with fallbacks, budgets, caching, and audit logs |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `benchmark results with metadata`
* `PR diff and hot-path mapping`
* `production traffic shape`
* `hardware/runner characteristics`
* `historical regressions and fixes`

## 8. Human-in-the-Loop & Approval

Gates block with evidence; overriding is explicit and logged. The sentinel diagnoses — humans decide whether a tradeoff is worth it.

## 9. Security Considerations

* Benchmarks run on synthetic data in isolated environments — no production data in CI performance runs.
* The results store is internal; benchmark metadata can reveal stack detail.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [52 · AI Flaky Test Detective](../../52-ai-flaky-test-detective/README.md)
- [10 · AI Test Failure Analyzer](../../10-ai-test-failure-analyzer/README.md)
- [11 · AI Build Optimization Assistant](../../11-ai-build-optimization-assistant/README.md)
- [08 · AI Deployment Risk Analyzer](../../08-ai-deployment-risk-analyzer/README.md)
