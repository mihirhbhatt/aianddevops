# AI Database Performance Advisor — Architecture

> Explain slow queries before they become incidents: plan analysis, index recommendations, and capacity signals grounded in your real workload statistics.

*Focus: ☁️ Cloud · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A database advisor that consumes your engine's own telemetry (pg_stat_statements, slow log, performance schema, cloud performance insights), explains the top cost drivers in plain language, and proposes changes as reviewed artifacts: index DDL with write-cost estimates, query rewrites, and configuration tuning — each with expected effect and rollback. Continuous mode watches for plan flips and latency drift between deploys.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Workload telemetry ingestion                       │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Cost-driver ranking (total time)                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Per-query diagnosis + plans                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Index / rewrite / config proposals                 │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Post-change verification loop                      │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Telemetry collector | pg_stat_statements, performance schema, slow logs, cloud insights |
| Plan analyzer | EXPLAIN digestion with regression tracking per query fingerprint |
| Advisor engine | index and rewrite recommendations with write-cost modeling |
| Verification loop | before/after comparison on the same workload slices |

## 4. Data Flow

1. Telemetry lands on schedule; the advisor ranks what actually costs the database time.
2. Each top query gets a diagnosis grounded in its real plans and statistics.
3. Proposals arrive as reviewable DDL and PRs with expected effect and tradeoffs.
4. After application, the same telemetry confirms the win or flags the regression.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "database": "pg-orders-replica",
  "window": "7d",
  "top_findings": [
    {
      "query_fingerprint": "SELECT ... FROM orders JOIN customers ...",
      "total_db_time_share": 0.34,
      "diagnosis": "seq scan on orders (412M rows) due to status filter without index",
      "proposal": {"kind": "index", "ddl": "CREATE INDEX CONCURRENTLY idx_orders_status_created ON orders (status, created_at)", "expected": "p95 1.8s to 120ms", "write_cost": "low (status low cardinality)"},
      "evidence": {"plan_lines": ["Seq Scan on orders ... rows=412000000"], "calls_7d": 812000}
    }
  ],
  "regressions": [{"fingerprint": "...", "flipped": "2026-10-09", "cause": "stats refresh: hash join became nested loop"}]
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

* `workload statistics per query fingerprint`
* `execution plans`
* `table and index sizes`
* `lock and pool metrics`
* `schema and constraint definitions`

## 8. Human-in-the-Loop & Approval

Advisory: every change ships as a reviewed migration or config PR; the advisor never alters the database directly.

## 9. Security Considerations

* Query texts can embed PII in literals: normalize fingerprints and redact literals before model calls.
* EXPLAIN ANALYZE executes queries: prefer read-replicas and statement timeouts; plain EXPLAIN where possible.
* Telemetry access is read-only by role design; no credentials ever reach the model.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [53 · AI Database Migration Reviewer](../../53-ai-database-migration-reviewer/README.md)
- [25 · AI Cloud Troubleshooting Assistant](../../25-ai-cloud-troubleshooting-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../../26-ai-cloud-cost-analysis-assistant/README.md)
- [32 · AI Root Cause Analysis Assistant](../../32-ai-root-cause-analysis-assistant/README.md)
