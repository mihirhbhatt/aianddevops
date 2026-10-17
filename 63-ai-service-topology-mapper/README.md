# 63 · AI Service Topology Mapper

> Discover and maintain your real service topology from telemetry: who calls whom, how often, and through what — instead of a wiki page nobody updates.

![Area](https://img.shields.io/badge/Area-Platform%20Engineering-blueviolet) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🏢 Platform Engineering |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | OpenTelemetry / tracing backends · Istio / Linkerd / Cilium · Service catalog (Backstage etc.) · Kafka / queue topology |

---

## 📌 Problem

Every architecture diagram is out of date the week it's drawn; meanwhile the traces, metrics, and manifests already know the truth.

* Dependency maps live in diagrams and wiki pages that decay the moment they're written.
* Incident triage starts with 'what depends on this?' — answered by pinging people.
* Service catalogs capture declared ownership, not actual runtime relationships.
* Change impact, blast radius, and SLO scoping all silently depend on topology being right.

**Why it matters:** Without a truthful topology, impact analysis guesses, incidents escalate to the wrong teams, and architecture reviews run on folklore.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Runtime edge discovery | derives call edges from traces (OpenTelemetry), service mesh data, and metrics |
| Declared-vs-actual diff | compares discovered topology against catalog entries and diagrams; flags drift |
| Anomaly-aware mapping | marks edges that appear only under failure (retries, fallbacks, dead-letter paths) |
| Catalog backfill | proposes topology updates to the service catalog via PR (idea 49) |
| Query surface | natural-language questions: 'what breaks if checkout-api slows down?' |

## 💡 Proposed Solution

A topology service that consumes trace and mesh telemetry plus IaC manifests, continuously reconstructs the service graph, diffs it against declared topology, and proposes catalog updates. During incidents it becomes the dependency oracle: blast-radius queries, downstream SLO aggregation, and what-if answers — feeding ideas 49, 57, and 62.

### Workflow

1. **Ingest** — traces, mesh telemetry, DNS/queue configs, and IaC manifests
2. **Reconstruct** — build the service graph with edge metadata: volume, latency, protocol
3. **Diff** — compare against declared topology; flag new, missing, and drifted edges
4. **Propose** — catalog update PRs for confirmed changes
5. **Serve** — blast-radius and dependency queries during incidents and reviews

**Human-in-the-loop:** Topology changes are proposed, not pushed: catalog owners confirm via PR; incident answers cite their evidence.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| OpenTelemetry / tracing backends | primary edge evidence |
| Istio / Linkerd / Cilium | mesh-derived service graph |
| Service catalog (Backstage etc.) | declared topology to reconcile |
| Kafka / queue topology | async edges beyond HTTP |
| Grafana | topology overlays on dashboards |

## 📥 Context & Data Sources

* `distributed traces and span relationships`
* `mesh service graphs`
* `queue and event subscriptions`
* `IaC-declared resources`
* `declared catalog topology`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: trace APIs, mesh APIs, manifests
* Write tier: catalog PR creation only

## ✅ Expected Benefits

* A living topology with evidence, instead of annual diagram archaeology.
* Incident blast radius answered in seconds, with sources.
* Catalog quality improves as a side effect: declared vs. actual stays honest.
* Feeds SLO scoping (57) and impact analysis (62) with truthful inputs.

## 🔒 Safety & Guardrails

* Trace data may carry PII in attributes: use span names and service identifiers only; aggregate at the edge level.
* Topology is sensitive reconnaissance data: access follows catalog permissions.

## 🚀 Future Implementation

* Data-flow layer: classify edges carrying PII for compliance mapping (idea 61).
* Failure-graph mode: edges observed only during incidents, for resilience review.
* Multi-cluster and multi-cloud federation of topology views.

## 🔗 Related Ideas

- [49 · AI Service Catalog Assistant](../49-ai-service-catalog-assistant/README.md)
- [34 · AI Grafana Dashboard Assistant](../34-ai-grafana-dashboard-assistant/README.md)
- [32 · AI Root Cause Analysis Assistant](../32-ai-root-cause-analysis-assistant/README.md)
- [62 · AI Change Impact Analyzer](../62-ai-change-impact-analyzer/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
