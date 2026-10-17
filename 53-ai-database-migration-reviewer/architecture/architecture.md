# AI Database Migration Reviewer — Architecture

> Review every schema migration before it ships: lock risk, backward compatibility, data loss, and a rehearsed backout plan.

*Focus: 🔄 CI/CD · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A PR-facing reviewer for migration files (SQL, Alembic, Flyway, Liquibase, Prisma, Rails): it parses the migration, queries read-only metadata about production table sizes and indexes, and returns a risk report — blocking estimate, compatibility with the currently deployed version, destructiveness, and a backout sketch — as PR comments. It learns your patterns: expand-contract discipline, lock-timeout usage, batched backfills.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Migration diff from pull request                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Prod metadata grounding (read-only)                │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← sizes · locks · indexes
┌────────────────────────────────────────────────────┐
│ Risk analysis: locks · compat · loss               │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ PR review comments + severity                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Backout plan + deploy-order guidance               │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Migration parser | dialect-aware parsing of the migration diff |
| Metadata probe | read-only information_schema / pg_stat / cloud catalog queries |
| Risk engine | lock modeling, expand-contract checks, destructiveness heuristics + LLM reasoning |
| PR reviewer | inline comments, severity labels, checklist attachments |

## 4. Data Flow

1. The CI pipeline posts the migration diff to the reviewer.
2. The probe grounds the analysis in real table sizes and lock behavior.
3. The engine returns inline findings: blocking risk, compat breaks, destructive steps.
4. A backout plan and deploy ordering ride along with the release checklist.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "migration": "V042__add_orders_status_index.sql",
  "dialect": "postgresql",
  "risk_verdict": "HIGH",
  "findings": [
    {"severity": "high", "kind": "lock", "detail": "CREATE INDEX without CONCURRENTLY on orders (412M rows); estimated exclusive-lock hold 8-20 min", "mitigation": "use CREATE INDEX CONCURRENTLY"},
    {"severity": "medium", "kind": "compat", "detail": "NOT NULL on status breaks deployed v1.14 writers", "mitigation": "add nullable, backfill, then constrain"}
  ],
  "backout": {"reversible": true, "plan": "DROP INDEX CONCURRENTLY orders_status_idx; no data loss"},
  "deploy_order": ["migration 042", "app v1.15"]
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

* `migration diff and dialect`
* `table sizes, row counts, indexes`
* `currently deployed app version's expectations`
* `migration history and conventions`
* `replication topology`

## 8. Human-in-the-Loop & Approval

Advisory by default: the reviewer blocks nothing itself, but protected paths can require a named migration owner to sign off on high-risk items.

## 9. Security Considerations

* Metadata access is read-only and least-privileged; no table data leaves the database — only schema statistics.
* Schema names and comments can be sensitive: redact or use self-hosted models if required.
* Findings are advisory; enforcement happens through required reviews, not secret gates.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [45 · AI Pull Request Infrastructure Reviewer](../../45-ai-pull-request-infrastructure-reviewer/README.md)
- [03 · AI Terraform Reviewer](../../03-ai-terraform-reviewer/README.md)
- [21 · AI Terraform Plan Explainer](../../21-ai-terraform-plan-explainer/README.md)
- [12 · AI Deployment Troubleshooting Agent](../../12-ai-deployment-troubleshooting-agent/README.md)
