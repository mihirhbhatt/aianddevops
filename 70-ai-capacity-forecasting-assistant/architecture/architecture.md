# AI Capacity Forecasting Assistant — Architecture

> See the capacity wall before you hit it: forecasts of compute, storage, and quota headroom from trend data, with what-if planning for growth and events.

*Focus: ☁️ Cloud · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A forecasting service over metrics and cloud quota APIs: it models demand per resource (compute, storage, IP, connections, quotas), reports headroom and time-to-exhaustion with confidence bands, and simulates what-if scenarios (2x customers, new region, decommissioning). Output drives real decisions — quota increases, reservations, node-group plans — tracked as tickets with the evidence attached.

## 2. High-Level Architecture

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

## 3. Components

| Component | Responsibility |
| --- | --- |
| Inventory collector | usage metrics plus cloud and k8s quota/limit APIs |
| Forecast engine | trend models with seasonality; explicit uncertainty |
| Scenario simulator | what-if arithmetic against the modeled baseline |
| Advisor | actions ranked by lead time and risk, exported to tickets |

## 4. Data Flow

1. The collector merges usage telemetry with the true limit inventory.
2. Models fit per resource; exhaustion dates come with confidence, not false precision.
3. What-ifs answer planning questions before commitments are made.
4. Recommendations land as tickets where procurement and platform work happens.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "resource": "aws:vpc-ips:prod-eu",
  "current": {"limit": 64512, "used": 58100, "headroom_pct": 9.9},
  "forecast": {"exhaustion_eta": "2026-12-08", "confidence": 0.85, "model": "linear + onboarding steps"},
  "drivers": ["new cluster join in November (+2k IPs)", "EKS pod-density growth 3%/wk"],
  "what_if": [{"scenario": "black-friday 2x", "exhaustion_eta": "2026-11-21"}],
  "advice": {"action": "request CIDR expansion / second VPC", "lead_time": "3-4 weeks", "ticket": "INFRA-5012"}
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

* `usage history per resource`
* `quota and limit inventory`
* `growth plans and events (launches, contracts)`
* `seasonality patterns`
* `past exhaustion incidents`

## 8. Human-in-the-Loop & Approval

Forecasts inform quarterly planning and procurement; humans decide purchases and architecture. The assistant owns the math, not the money.

## 9. Security Considerations

* Usage and billing data is business-sensitive: keep forecasting in-boundary; share only aggregated outputs.
* Advice is advisory: no automated quota changes or purchases, ever.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Alternative Approaches

* Start spreadsheet-simple: scheduled quota inventory + linear trend report, then add models.
* Vendor capacity tools (cloud-native forecasters) as data sources; AI for the planning layer.

## 14. Related Ideas

- [29 · AI Cloud Resource Optimization Assistant](../../29-ai-cloud-resource-optimization-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../../26-ai-cloud-cost-analysis-assistant/README.md)
- [18 · AI HPA Recommendation Assistant](../../18-ai-hpa-recommendation-assistant/README.md)
- [57 · AI SLO & Error Budget Assistant](../../57-ai-slo-error-budget-assistant/README.md)
