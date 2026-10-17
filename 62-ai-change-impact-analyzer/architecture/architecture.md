# AI Change Impact Analyzer — Architecture

> Answer 'what does this change touch?' before merge: blast radius across code, services, infrastructure, and teams — with evidence.

*Focus: 🧑‍💻 Developer Experience · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A PR-time analyzer that builds a change's blast radius from the union of code dependency graphs, service topology (idea 63), infrastructure relationships, and data schemas — then translates it into a human summary: what's affected, who owns it, what to test, and what to watch after deploy. Posted as a PR comment and a release-checklist section, feeding the deploy risk score (idea 08).

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ PR diff parsing (code · IaC · schema)              │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Dependency + topology traversal                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Owner + criticality resolution                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Blast-radius summary in PR                         │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Reviewer routing + risk feed                       │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Diff parser | unified handling of code, config, IaC, and schema changes |
| Graph engine | code imports, service calls, infra relationships, data flows |
| Catalog bridge | owners, criticality, and environments from the service catalog |
| Summarizer | ranked human-readable impact report with evidence links |

## 4. Data Flow

1. On PR open, the change is parsed across every artifact type it touches.
2. Traversal expands the blast radius through runtime dependencies and shared infra.
3. Affected surfaces are resolved to owning teams with criticality from the catalog.
4. The PR carries the summary; the release pipeline carries the risk score.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "pr": "orders-service#412",
  "change_types": ["code", "schema", "config"],
  "blast_radius": {
    "services": ["orders-service", "order-event-worker (consumes orders.change event)", "reporting-etl (reads orders.status)"],
    "shared_infra": ["pg-orders primary (new index)", "kafka topic orders.change"],
    "teams": ["@payments", "@data-platform"]
  },
  "risk": {"level": "medium", "drivers": ["schema addition consumed by ETL", "event payload extended"], "similar_past_incidents": ["INC-7741"]},
  "suggested_reviewers": ["@payments-oncall", "@data-platform-lead"],
  "watch_after_deploy": ["consumer lag on orders.change", "etl freshness metric"]
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `the PR diff across artifact types`
* `code dependency graph`
* `service topology and call edges`
* `infrastructure relationships`
* `ownership and criticality metadata`
* `past incidents by component`

## 8. Human-in-the-Loop & Approval

Advisory by design: the analyzer informs reviewers and release captains; it never blocks or reroutes by itself.

## 9. Security Considerations

* Dependency graphs can reveal architecture detail: keep analysis inside your boundary; summaries shared externally are redacted.
* Trace-derived edges can carry PII in spans: use aggregated, name-level data only.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Alternative Approaches

* Start static-only (code + IaC graphs); add trace-derived runtime edges later.
* Embed in the platform portal as a 'what if I change X?' query, not just PR comments.

## 14. Related Ideas

- [45 · AI Pull Request Infrastructure Reviewer](../../45-ai-pull-request-infrastructure-reviewer/README.md)
- [44 · AI Repository Infrastructure Analyzer](../../44-ai-repository-infrastructure-analyzer/README.md)
- [63 · AI Service Topology Mapper](../../63-ai-service-topology-mapper/README.md)
- [49 · AI Service Catalog Assistant](../../49-ai-service-catalog-assistant/README.md)
