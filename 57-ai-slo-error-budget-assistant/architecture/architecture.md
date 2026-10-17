# AI SLO & Error Budget Assistant — Architecture

> Turn 'we should have SLOs' into maintained ones: drafted from real traffic, backtested against history, with burn-rate alerts that don't cry wolf.

*Focus: 📊 Observability & SRE · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

An SLO copilot integrated with Prometheus/Grafana (or your vendor's SLO tooling): it drafts SLIs/SLOs from real traffic and history, generates sloth-compatible recording rules and multiwindow burn-rate alerts, backtests them against the last 90 days, and keeps definitions in Git with PR review. Maintenance is continuous: when endpoints and dashboards change, it opens update PRs before the SLO rots.

## 2. High-Level Architecture

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

## 3. Components

| Component | Responsibility |
| --- | --- |
| Traffic analyzer | metric/label and endpoint discovery from Prometheus or vendor APIs |
| SLO composer | definitions, recording rules, sloth-style alerts |
| Backtester | replays rules against history; reports page counts and detection lag |
| Drift watcher | SLI validity checks on deploys; update PRs |

## 4. Data Flow

1. Discovery proposes SLIs from what users actually hit, with volumes as evidence.
2. Drafts set targets from measured performance (p50/p95/p99 history), not aspiration.
3. Backtesting shows exactly when each alert would have fired across past incidents.
4. Everything ships as reviewed Git definitions; drift watching keeps them true.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "service": "checkout-api",
  "proposed_slos": [
    {"sli": "availability", "definition": "success_rate(checkout, code<500) >= 99.9 in 5m windows", "target": 99.9, "basis": "measured 30d"},
    {"sli": "latency", "definition": "90% of requests < 800ms (histogram_quantile)", "target": 90, "basis": "p90=612ms over 90d"}
  ],
  "backtest": {"window_days": 90, "alerts_would_have_fired": 3, "matching_incidents": 3, "false_pages": 0, "median_detection_min": 7},
  "budget_report": {"window": "28d", "consumed": "62%", "guidance": "freeze risky releases until burn < 1x"}
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

* `traffic volumes and golden signals`
* `historical latency/error data`
* `service topology and dependencies`
* `existing dashboards and alert rules`
* `past incident timelines`

## 8. Human-in-the-Loop & Approval

Targets and paging implications are always owner-approved via PR; the copilot backtests and drafts, humans decide what wakes people up.

## 9. Security Considerations

* SLI data is aggregated, but endpoint paths can leak route and feature names: apply the same export rules as other telemetry.
* Paging changes are sensitive: alert-routing PRs require explicit owner sign-off.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [33 · AI Prometheus Query Generator](../../33-ai-prometheus-query-generator/README.md)
- [34 · AI Grafana Dashboard Assistant](../../34-ai-grafana-dashboard-assistant/README.md)
- [30 · AI Alert Investigation Assistant](../../30-ai-alert-investigation-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../../35-ai-anomaly-investigation-agent/README.md)
