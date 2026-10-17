# 64 · AI Database Performance Advisor

> Explain slow queries before they become incidents: plan analysis, index recommendations, and capacity signals grounded in your real workload statistics.

![Area](https://img.shields.io/badge/Area-Cloud-orange) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | ☁️ Cloud |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | PostgreSQL / MySQL / SQL Server · RDS / Cloud SQL / Azure SQL · PgBouncer / proxies · Grafana / Prometheus |

---

## 📌 Problem

Database performance degrades quietly — a query that ran in 10ms meets new data volume, a plan flips, a connection pool saturates — and the first alert is usually user-facing latency.

* Slow query logs and workload statistics exist, but turning them into safe actions (indexes, rewrites, config) is specialist work.
* Index recommendations from tools ignore write cost: adding the 'obvious' index can degrade ingest-heavy tables.
* Plan regressions after stats or upgrade changes are invisible until someone diffs plans by hand.
* Connection-pool, lock, and bloat issues hide between query tuning and infrastructure monitoring.

**Why it matters:** Database latency is often the last mile of every user request — tuning it buys back latency and headroom across the whole stack.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Plan analysis | reads EXPLAIN plans and workload stats to explain why queries are slow, in plain language |
| Index engineering | recommends indexes with write-cost accounting and workload-aware column ordering |
| Regression detection | tracks plan changes and latency distributions per query over time; names the flip point |
| Saturation diagnosis | correlates pool exhaustion, locks, and bloat with query patterns |
| Safe application | drafts migrations (CONCURRENTLY, online DDL) with the migration reviewer's discipline (idea 53) |

## 💡 Proposed Solution

A database advisor that consumes your engine's own telemetry (pg_stat_statements, slow log, performance schema, cloud performance insights), explains the top cost drivers in plain language, and proposes changes as reviewed artifacts: index DDL with write-cost estimates, query rewrites, and configuration tuning — each with expected effect and rollback. Continuous mode watches for plan flips and latency drift between deploys.

### Workflow

1. **Collect** — workload stats, plans, and latency distributions from engine telemetry
2. **Rank** — top cost drivers by total DB time, not single-query worst case
3. **Explain** — per query: why it's slow (scan, join order, spill, lock, pool)
4. **Propose** — index/rewrite/config changes with expected effect and write-cost tradeoffs
5. **Verify** — post-change validation against the same telemetry; regressions flagged

**Human-in-the-loop:** Advisory: every change ships as a reviewed migration or config PR; the advisor never alters the database directly.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| Model routing & AI gateways | LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway | provider-agnostic routing with fallbacks, budgets, caching, and audit logs |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| PostgreSQL / MySQL / SQL Server | telemetry and EXPLAIN |
| RDS / Cloud SQL / Azure SQL | performance insights APIs |
| PgBouncer / proxies | pool diagnostics |
| Grafana / Prometheus | latency and saturation dashboards |
| GitHub | migration PRs |

## 📥 Context & Data Sources

* `workload statistics per query fingerprint`
* `execution plans`
* `table and index sizes`
* `lock and pool metrics`
* `schema and constraint definitions`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: engine telemetry, EXPLAIN execution, catalog queries
* Write tier: migration PR creation only

## ✅ Expected Benefits

* DB time spent where it matters: ranked by total workload cost.
* Index recommendations that respect write cost and ingest patterns.
* Plan regressions caught by fingerprint tracking, not by user complaints.
* Every change reviewed, reversible, and verified against the same telemetry.

## 🔒 Safety & Guardrails

* Query texts can embed PII in literals: normalize fingerprints and redact literals before model calls.
* EXPLAIN ANALYZE executes queries: prefer read-replicas and statement timeouts; plain EXPLAIN where possible.
* Telemetry access is read-only by role design; no credentials ever reach the model.

## 🚀 Future Implementation

* Workload simulation: replay sampled production patterns against proposed indexes.
* Cost coupling: tie query efficiency to cloud spend (idea 26) for managed databases.
* Cross-database join hygiene: flag cross-service joins that should be API contracts.

## 🔗 Related Ideas

- [53 · AI Database Migration Reviewer](../53-ai-database-migration-reviewer/README.md)
- [25 · AI Cloud Troubleshooting Assistant](../25-ai-cloud-troubleshooting-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../26-ai-cloud-cost-analysis-assistant/README.md)
- [32 · AI Root Cause Analysis Assistant](../32-ai-root-cause-analysis-assistant/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
