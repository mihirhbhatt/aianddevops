# 66 · AI Alert Quality Engineer

> Reduce pager noise systematically: deduplicate overlapping alerts, correlate bursts into incidents, and tune thresholds from evidence — as reviewed changes, not vibes.

![Area](https://img.shields.io/badge/Area-Observability%20%26%20SRE-green) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 📊 Observability & SRE |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | Prometheus / Alertmanager · PagerDuty / Opsgenie · Grafana · GitHub |

---

## 📌 Problem

Alert fatigue is self-inflicted: overlapping rules, static thresholds, and no deduplication mean the pager cries wolf until engineers mute it.

* Alert rules accrete per-incident; nobody removes the alert for the service that was renamed a year ago.
* Static thresholds ignore daily and weekly seasonality, generating known-noise pages.
* One underlying failure fans out into dozens of pages from dependent services.
* Alert quality is nobody's metric: pages-per-shift and noise ratio aren't measured, so they can't improve.

**Why it matters:** Every noisy page buys the next real alert a little less attention — fatigue is the tax that turns minor incidents into missed ones.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Noise analytics | pages-per-rule, acknowledgment latency, action-rate: the metrics that name the worst offenders |
| Burst correlation | groups alert storms into single causes using topology and timing (idea 63) |
| Seasonality-aware tuning | proposes dynamic thresholds and multi-window burns informed by history (idea 57) |
| Rule hygiene | finds dead rules (renamed metrics/services), duplicates, and never-actioned alerts |
| Change via PR | alert rule edits as reviewed changes with before/after page simulations |

## 💡 Proposed Solution

A weekly alert-quality review that never forgets: it computes per-rule noise metrics from your alerting history, correlates storms to root causes via topology, and files reviewed PRs — tune, deduplicate, route differently, or retire. Simulations show exactly how many past pages each change would have removed, and which real incidents would still have paged.

### Workflow

1. **Measure** — per-rule noise metrics from alert and acknowledgment history
2. **Correlate** — group alert bursts into causes using topology and timing
3. **Diagnose** — why each noisy rule misfires: threshold, duplication, staleness, fan-out
4. **Propose** — tune/dedup/retire/reroute changes as PRs with page simulations
5. **Track** — noise-ratio trend after each change; revert what over-filters

**Human-in-the-loop:** Every alert change is a reviewed PR with simulation evidence; paging behavior changes require on-call owners' sign-off.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Alert history + rule inventory                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Per-rule noise analytics                           │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Burst correlation via topology                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Tune / dedup / retire PRs                          │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← simulated first
┌────────────────────────────────────────────────────┐
│ Noise-ratio trend tracking                         │
└────────────────────────────────────────────────────┘
```

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Prometheus / Alertmanager | rules, silences, and notification history |
| PagerDuty / Opsgenie | page outcomes and acknowledgment data |
| Grafana | alert panel evidence |
| GitHub | rule-change PRs |
| Slack | weekly alert-quality digest |

## 📥 Context & Data Sources

* `alert rules and their definitions`
* `firing and acknowledgment history`
* `topology for burst correlation`
* `SLO burn data`
* `on-call feedback on page quality`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: alert APIs, paging history, topology
* Write tier: rule-change PRs (owner-approved)

## ✅ Expected Benefits

* A managed noise ratio instead of a slowly rising pager tax.
* Storms page once, not forty times.
* Dead and duplicate rules retire with evidence, not politics.
* Every paging change is simulated before it touches the on-call.

## 🔒 Safety & Guardrails

* Alert payloads can include customer-impacting detail: aggregate before model calls.
* Tuning that suppresses pages is riskier than noise: simulations and owner sign-off are mandatory, and changes are revertable.

## 🚀 Future Implementation

* Feedback loop from the on-call copilot (idea 50): which pages actually led to action.
* Alert-as-code linting in CI: new rules are simulated before they exist.
* Cross-team noise budgets with trend targets.

## 🔗 Related Ideas

- [30 · AI Alert Investigation Assistant](../30-ai-alert-investigation-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../35-ai-anomaly-investigation-agent/README.md)
- [57 · AI SLO & Error Budget Assistant](../57-ai-slo-error-budget-assistant/README.md)
- [31 · AI Incident Summarizer](../31-ai-incident-summarizer/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
