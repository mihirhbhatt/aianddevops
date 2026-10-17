# AI Service Topology Mapper — Architecture

> Discover and maintain your real service topology from telemetry: who calls whom, how often, and through what — instead of a wiki page nobody updates.

*Focus: 🏢 Platform Engineering · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A topology service that consumes trace and mesh telemetry plus IaC manifests, continuously reconstructs the service graph, diffs it against declared topology, and proposes catalog updates. During incidents it becomes the dependency oracle: blast-radius queries, downstream SLO aggregation, and what-if answers — feeding ideas 49, 57, and 62.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Telemetry + manifest ingestion                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Service graph reconstruction                       │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Declared-vs-actual diff                            │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Catalog update PRs                                 │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← owner confirmed
┌────────────────────────────────────────────────────┐
│ Blast-radius query surface                         │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Edge extractor | spans and mesh data normalized into a call graph with volumes |
| Graph store | versioned topology with history (what changed, when) |
| Reconciler | declared vs. actual comparison, drift classification |
| Query interface | natural-language and API access for impact questions |

## 4. Data Flow

1. Telemetry flows in continuously; the graph updates with evidence and timestamps.
2. The reconciler diffs reality against the catalog and drafts update PRs.
3. Owners confirm changes; topology history keeps the audit trail.
4. Incidents and reviews query the graph instead of paging humans for guesses.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "service": "checkout-api",
  "upstream": [
    {"caller": "web-bff", "protocol": "http", "rps_7d_p50": 412, "evidence": "otel spans + istio"}
  ],
  "downstream": [
    {"dependency": "pg-orders", "protocol": "sql", "rps_7d_p50": 380, "evidence": "otel db spans"},
    {"dependency": "kafka:orders.change", "protocol": "kafka-produce", "rps_7d_p50": 95, "evidence": "manifest + metrics"}
  ],
  "reconciliation": {"new_edges": 1, "missing_edges": 0, "catalog_pr": "backstage#2210"},
  "blast_radius_hint": {"if_slow": ["web-bff latency SLO at risk", "checkout conversion funnel"]}
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `distributed traces and span relationships`
* `mesh service graphs`
* `queue and event subscriptions`
* `IaC-declared resources`
* `declared catalog topology`

## 8. Human-in-the-Loop & Approval

Topology changes are proposed, not pushed: catalog owners confirm via PR; incident answers cite their evidence.

## 9. Security Considerations

* Trace data may carry PII in attributes: use span names and service identifiers only; aggregate at the edge level.
* Topology is sensitive reconnaissance data: access follows catalog permissions.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [49 · AI Service Catalog Assistant](../../49-ai-service-catalog-assistant/README.md)
- [34 · AI Grafana Dashboard Assistant](../../34-ai-grafana-dashboard-assistant/README.md)
- [32 · AI Root Cause Analysis Assistant](../../32-ai-root-cause-analysis-assistant/README.md)
- [62 · AI Change Impact Analyzer](../../62-ai-change-impact-analyzer/README.md)
