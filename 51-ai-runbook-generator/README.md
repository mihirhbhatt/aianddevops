# 51 · AI Runbook Generator

> Turn tribal incident knowledge into living runbooks: generated from real incidents, telemetry, and topology, and kept current instead of rotting in the wiki.

![Area](https://img.shields.io/badge/Area-Developer%20Experience-yellow) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🧑‍💻 Developer Experience |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | Postmortem & incident tools · Service catalog (Backstage etc.) · Grafana / Prometheus / Loki · GitHub / GitLab |

---

## 📌 Problem

When something breaks, the fastest path to recovery is a runbook — and the most common state of a runbook is missing, stale, or written for an architecture that no longer exists.

* Runbooks are written under pressure (or not at all) and describe yesterday's architecture, commands, and dashboards.
* The person who knows the fix is the person who is on vacation; institutional knowledge leaves with them.
* Stale runbooks are actively dangerous: wrong commands, renamed services, dashboards that 404 mid-incident.
* Writing and maintaining runbooks for every service is nobody's day job, so coverage decays.

**Why it matters:** Every missing or stale runbook converts a five-minute fix into an hour of archaeology, and on-call quality quietly depends on who happens to remember.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Runbook synthesis | drafts detection → diagnosis → mitigation → escalation runbooks from incident history, telemetry, and service topology |
| Incident mining | extracts what actually worked from postmortems, incident threads, and the PRs that fixed things |
| Architecture grounding | binds steps to the dashboards, commands, and owners that exist today; flags references to the renamed or deleted |
| Drift detection | re-validates runbooks on deploys and topology changes, proposing updates for stale steps |
| Executable steps | renders steps as copy-paste commands with links to live dashboards and queries |

## 💡 Proposed Solution

A runbook service that sits next to your observability and incident stack: it drafts runbooks per service and failure mode from real incident data (postmortems, timelines, the queries and commands that actually got used), keeps them grounded in the current architecture via the service catalog (idea 49), and re-checks them when topology or tooling changes. Output lands next to the service or in the wiki as markdown — reviewable in PRs, rendered everywhere.

### Workflow

1. **Ingest** — collect incident history, postmortems, alert definitions, service topology, and dashboard inventory
2. **Draft** — per service and failure mode, generate runbook structure: detection, diagnosis, mitigation, escalation
3. **Ground** — bind steps to real commands, dashboards, queries, and owners; validate that links and commands exist
4. **Review** — service owner reviews and merges via PR; edits feed back as preferences
5. **Maintain** — on deploys or topology changes, re-validate and propose updates for drifted steps

**Human-in-the-loop:** Every runbook is PR-reviewed by the service owner before publication; the AI drafts and re-validates, humans own accuracy.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Postmortem & incident tools | source material: what happened and what fixed it |
| Service catalog (Backstage etc.) | per-service runbook binding and ownership |
| Grafana / Prometheus / Loki | live dashboard and query links per step |
| GitHub / GitLab | runbooks as code, PR review, drift updates |
| PagerDuty / Opsgenie | link runbooks to alerts so pages arrive with the right doc |

## 📥 Context & Data Sources

* `incident and postmortem history`
* `service topology and ownership`
* `alert definitions and thresholds`
* `dashboard and query inventory`
* `existing runbooks and wiki pages`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: incident/postmortem APIs, service catalog, dashboard inventory, alert definitions
* Write tier: PR creation to the runbook repository (human-reviewed)

## ✅ Expected Benefits

* Runbook coverage for every service, without a side project dying for it.
* Runbooks that reference what exists today — commands, dashboards, and owners validated, not remembered.
* Pages arrive with the right runbook attached, cutting time-to-mitigation.
* Institutional knowledge survives attrition.

## 🔒 Safety & Guardrails

* Incident channels and postmortems contain sensitive detail: redact secrets/PII before any model call; prefer in-VPC or open-weight models for raw transcripts.
* Runbook PRs are reviewed like code; generated commands pass destructive-pattern lint before anyone copies them.
* Read-only everywhere except the PR write path; no direct edits to wikis.

## 🚀 Future Implementation

* Runbook rehearsal: pair with chaos experiments (idea 58) to verify steps actually work.
* Interactive mode: walk the on-call through the runbook during a page and learn which steps helped.
* Coverage analytics: which services lack runbooks for their top failure modes.

## 🔗 Related Ideas

- [36 · AI Postmortem Generator](../36-ai-postmortem-generator/README.md)
- [49 · AI Service Catalog Assistant](../49-ai-service-catalog-assistant/README.md)
- [31 · AI Incident Summarizer](../31-ai-incident-summarizer/README.md)
- [30 · AI Alert Investigation Assistant](../30-ai-alert-investigation-assistant/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
