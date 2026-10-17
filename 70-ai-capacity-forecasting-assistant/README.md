# 70 · AI Capacity Forecasting Assistant

> See the capacity wall before you hit it: forecasts of compute, storage, and quota headroom from trend data, with what-if planning for growth and events.

![Area](https://img.shields.io/badge/Area-Cloud-orange) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | ☁️ Cloud |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | Cloud quota & billing APIs · Prometheus / cloud metrics · Kubernetes metrics & node groups · Jira / Linear |

---

## 📌 Problem

Capacity planning is either over-provisioned fear or under-provisioned surprise; the trend data that predicts the wall already exists in your metrics.

* Quotas and limits (cloud, k8s, IP space, service limits) sit invisible until a launch or scale event collides with them.
* Linear extrapolation is wrong: growth is seasonal, stepwise (customer onboarding), and workload-shaped.
* Autoscaling hides exhaustion: headroom shrinks quietly while the system 'works fine'.
* Procurement and reservation decisions need months of lead time; alerts fire minutes before impact.

**Why it matters:** The wall is always further away than panic suggests and closer than comfort assumes — forecasting turns it into a scheduled engineering task.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Trend forecasting | per-resource growth models from historical usage with seasonality and step functions |
| Quota inventory | current limits vs. forecast demand across cloud accounts, regions, and clusters |
| What-if planning | model launches, migrations, and marketing events against headroom before committing |
| Reservation guidance | when to buy committed-use and savings plans based on stable baseline vs. spiky demand |
| Early warnings | exhaustion-ETA alerts with lead time matched to procurement reality (weeks, not minutes) |

## 💡 Proposed Solution

A forecasting service over metrics and cloud quota APIs: it models demand per resource (compute, storage, IP, connections, quotas), reports headroom and time-to-exhaustion with confidence bands, and simulates what-if scenarios (2x customers, new region, decommissioning). Output drives real decisions — quota increases, reservations, node-group plans — tracked as tickets with the evidence attached.

### Workflow

1. **Inventory** — enumerate resources, quotas, and limits across accounts and clusters
2. **Model** — fit demand trends per resource with seasonality and growth shape
3. **Forecast** — headroom and exhaustion ETAs with confidence bands
4. **Simulate** — what-if scenarios: growth, events, migrations, decommissions
5. **Advise** — quota, reservation, and node-group actions as tickets with evidence

**Human-in-the-loop:** Forecasts inform quarterly planning and procurement; humans decide purchases and architecture. The assistant owns the math, not the money.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Resource + quota inventory                         │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Demand modeling per resource                       │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Headroom + exhaustion ETAs                         │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← confidence bands
┌────────────────────────────────────────────────────┐
│ What-if scenario simulation                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Advice to tickets with evidence                    │
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
| Cloud quota & billing APIs | AWS / Azure / GCP service quotas and usage |
| Prometheus / cloud metrics | demand history |
| Kubernetes metrics & node groups | cluster headroom |
| Jira / Linear | capacity tickets and planning review |
| Grafana | headroom dashboards |

## 📥 Context & Data Sources

* `usage history per resource`
* `quota and limit inventory`
* `growth plans and events (launches, contracts)`
* `seasonality patterns`
* `past exhaustion incidents`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: metrics, quota APIs, billing exports
* Write tier: ticket filing; no quota changes or purchases

## ✅ Expected Benefits

* Exhaustion becomes an ETA on a dashboard, not a 3am surprise.
* What-if answers before commitments: launches sized correctly the first time.
* Spend shaped by data: reservations sized to stable baselines, not fear.
* Quota increases requested weeks ahead, on evidence.

## 🔒 Safety & Guardrails

* Usage and billing data is business-sensitive: keep forecasting in-boundary; share only aggregated outputs.
* Advice is advisory: no automated quota changes or purchases, ever.

## 🚀 Future Implementation

* Coupling with cost analytics (idea 26): headroom priced in dollars per scenario.
* Autoscaler-aware modeling that treats HPA/Karpenter behavior as part of the system.
* Cross-team capacity ledger for shared platforms, using topology (idea 63) as the demand graph.

## 🔗 Related Ideas

- [29 · AI Cloud Resource Optimization Assistant](../29-ai-cloud-resource-optimization-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../26-ai-cloud-cost-analysis-assistant/README.md)
- [18 · AI HPA Recommendation Assistant](../18-ai-hpa-recommendation-assistant/README.md)
- [57 · AI SLO & Error Budget Assistant](../57-ai-slo-error-budget-assistant/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
