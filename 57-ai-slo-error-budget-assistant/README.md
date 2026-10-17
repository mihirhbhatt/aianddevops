# 57 · AI SLO & Error Budget Assistant

> Turn 'we should have SLOs' into maintained ones: drafted from real traffic, backtested against history, with burn-rate alerts that don't cry wolf.

![Area](https://img.shields.io/badge/Area-Observability%20%26%20SRE-green) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 📊 Observability & SRE |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | Prometheus / Thanos / Mimir · Grafana · Sloth / Pyrra · PagerDuty / Opsgenie |

---

## 📌 Problem

SLOs fail in practice for boring reasons: they're guessed instead of measured, never maintained, and their alerts fire too often or too late to be useful.

* Teams don't know which user journeys matter, so they either SLO everything or nothing.
* Hand-written burn-rate alerts use bad windows and thresholds — they spam pages or never fire.
* SLOs drift from reality: the SLI measures the wrong endpoint after a refactor, and nobody notices.
* Error budgets exist on paper but don't drive decisions because the numbers are stale.

**Why it matters:** Without working SLOs, every incident is judged by vibes — and reliability work competes with features on unequal, anecdotal footing.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| SLI discovery | mines traffic data to find the real user journeys and their volumes |
| SLO drafting | proposes targets grounded in measured historical performance, not round numbers |
| Burn-rate implementation | generates multiwindow burn-rate alerts validated against historical data to tune sensitivity |
| Backtesting | replays proposed alerts over past incidents and quiet periods: would it page? how often? how early? |
| Drift maintenance | watches SLI definitions vs. actual endpoints and dashboards, opening update PRs when they diverge |

## 💡 Proposed Solution

An SLO copilot integrated with Prometheus/Grafana (or your vendor's SLO tooling): it drafts SLIs/SLOs from real traffic and history, generates sloth-compatible recording rules and multiwindow burn-rate alerts, backtests them against the last 90 days, and keeps definitions in Git with PR review. Maintenance is continuous: when endpoints and dashboards change, it opens update PRs before the SLO rots.

### Workflow

1. **Discover** — analyze traffic and dashboards to propose SLIs for real user journeys
2. **Draft** — SLO targets grounded in measured history; write definitions to a Git repo
3. **Backtest** — simulate burn-rate alerts over past incidents and quiet periods
4. **Ship** — PR with recording rules, alerts, and dashboard panels; owner review
5. **Maintain** — watch SLI health and drift; weekly budget reports with decision guidance

**Human-in-the-loop:** Targets and paging implications are always owner-approved via PR; the copilot backtests and drafts, humans decide what wakes people up.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Traffic + dashboard discovery                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ SLI/SLO drafting (Git, PR review)                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Burn-rate backtest over 90 days                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← tune before paging
┌────────────────────────────────────────────────────┐
│ Recording rules + alerts + panels                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Drift watch + weekly budget report                 │
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
| Prometheus / Thanos / Mimir | SLI queries and history |
| Grafana | SLO dashboards and annotations |
| Sloth / Pyrra | rule generation to build on |
| PagerDuty / Opsgenie | burn-rate routing |
| GitHub | SLOs as reviewed code |

## 📥 Context & Data Sources

* `traffic volumes and golden signals`
* `historical latency/error data`
* `service topology and dependencies`
* `existing dashboards and alert rules`
* `past incident timelines`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: Prometheus queries, dashboard metadata, incident history
* Write tier: PR creation for SLO definitions, rules, and dashboards

## ✅ Expected Benefits

* SLOs grounded in measured reality, covering the journeys that matter.
* Burn-rate alerts tuned by backtesting — pages that fire when needed, not twice a week.
* SLOs maintained like code: drift-prone definitions get update PRs.
* Error budgets that actually arbitrate release decisions.

## 🔒 Safety & Guardrails

* SLI data is aggregated, but endpoint paths can leak route and feature names: apply the same export rules as other telemetry.
* Paging changes are sensitive: alert-routing PRs require explicit owner sign-off.

## 🚀 Future Implementation

* SLO-to-chaos integration: prioritize experiments where budget-burn risk is highest.
* Cross-service SLO composition for journeys spanning multiple teams.
* Release-gate integration: budget state warns or blocks in the deploy pipeline.

## 🔗 Related Ideas

- [33 · AI Prometheus Query Generator](../33-ai-prometheus-query-generator/README.md)
- [34 · AI Grafana Dashboard Assistant](../34-ai-grafana-dashboard-assistant/README.md)
- [30 · AI Alert Investigation Assistant](../30-ai-alert-investigation-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../35-ai-anomaly-investigation-agent/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
