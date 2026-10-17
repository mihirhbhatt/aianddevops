# AI Runbook Generator — Architecture

> Turn tribal incident knowledge into living runbooks: generated from real incidents, telemetry, and topology, and kept current instead of rotting in the wiki.

*Focus: 🧑‍💻 Developer Experience · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A runbook service that sits next to your observability and incident stack: it drafts runbooks per service and failure mode from real incident data (postmortems, timelines, the queries and commands that actually got used), keeps them grounded in the current architecture via the service catalog (idea 49), and re-checks them when topology or tooling changes. Output lands next to the service or in the wiki as markdown — reviewable in PRs, rendered everywhere.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Incident + topology ingestion                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← read-only
┌────────────────────────────────────────────────────┐
│ Runbook drafting (per failure mode)                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Grounding: real commands · dashboards              │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← link-validated
┌────────────────────────────────────────────────────┐
│ Owner review via pull request                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Continuous re-validation on change                 │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Ingestion collectors | postmortems, incident channels, alert definitions, service catalog, dashboards |
| Runbook composer | LLM drafting with a strict runbook schema and house style |
| Grounding validator | checks commands, dashboard links, alert names, and owners against live systems |
| Drift watcher | re-runs validation on deploys and topology changes; files update PRs |

## 4. Data Flow

1. A service is onboarded by pointing the tool at its catalog entry, repo, dashboards, and incident history.
2. The composer drafts runbooks for the service's real failure modes, mined from past incidents.
3. The grounding validator rewrites generic steps into the org's actual commands, queries, and links.
4. Owners review via PR; the drift watcher keeps every runbook honest as the system changes.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "service": "payments-api",
  "failure_mode": "consumer-lag-spike",
  "runbook": {
    "title": "payments-api: Kafka consumer lag spike",
    "detection": [{"signal": "kafka_consumergroup_lag > 100000 for 5m", "dashboard": "grafana/d/payments-lag"}],
    "diagnosis_steps": [
      {"step": 1, "action": "kubectl -n payments logs deploy/order-worker --tail=200", "expect": "DB lock errors or rebalance storms"}
    ],
    "mitigation_steps": [
      {"step": 1, "action": "scale consumer deployment to 6 replicas", "expect": "lag slope turns negative within 10m"}
    ],
    "escalation": {"owner": "@payments-oncall", "when": "lag still rising after mitigation step 2"}
  },
  "grounding_report": {"links_validated": 7, "links_broken": 1, "stale_steps_flagged": 2},
  "last_validated": "2026-10-12T09:00:00Z"
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `incident and postmortem history`
* `service topology and ownership`
* `alert definitions and thresholds`
* `dashboard and query inventory`
* `existing runbooks and wiki pages`

## 8. Human-in-the-Loop & Approval

Every runbook is PR-reviewed by the service owner before publication; the AI drafts and re-validates, humans own accuracy.

## 9. Security Considerations

* Incident channels and postmortems contain sensitive detail: redact secrets/PII before any model call; prefer in-VPC or open-weight models for raw transcripts.
* Runbook PRs are reviewed like code; generated commands pass destructive-pattern lint before anyone copies them.
* Read-only everywhere except the PR write path; no direct edits to wikis.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [36 · AI Postmortem Generator](../../36-ai-postmortem-generator/README.md)
- [49 · AI Service Catalog Assistant](../../49-ai-service-catalog-assistant/README.md)
- [31 · AI Incident Summarizer](../../31-ai-incident-summarizer/README.md)
- [30 · AI Alert Investigation Assistant](../../30-ai-alert-investigation-assistant/README.md)
