# AI Alert Quality Engineer — Architecture

> Reduce pager noise systematically: deduplicate overlapping alerts, correlate bursts into incidents, and tune thresholds from evidence — as reviewed changes, not vibes.

*Focus: 📊 Observability & SRE · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A weekly alert-quality review that never forgets: it computes per-rule noise metrics from your alerting history, correlates storms to root causes via topology, and files reviewed PRs — tune, deduplicate, route differently, or retire. Simulations show exactly how many past pages each change would have removed, and which real incidents would still have paged.

## 2. High-Level Architecture

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

## 3. Components

| Component | Responsibility |
| --- | --- |
| History analyzer | per-rule page counts, ack times, action rates, sleep patterns |
| Correlation engine | storm grouping with topology and timing evidence |
| Simulation harness | replays proposed rules against recorded history |
| PR drafter | alert rule changes with before/after evidence |

## 4. Data Flow

1. Weekly, the analyzer ranks rules by noise contributed and value delivered.
2. Storms are traced to single causes; fan-out candidates for deduplication are named.
3. Each proposal ships as a PR with a simulation: pages removed, incidents kept.
4. Noise-ratio trends prove improvement; over-filtering gets caught by the same loop.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "period": "2026-W41",
  "noise_metrics": {"pages_total": 214, "actioned_within_15m": 0.31, "top_offender": "cpu>80% (static, 6 services)", "storm_groups": 9},
  "proposals": [
    {"rule": "cpu>80%@prod-api", "action": "replace with multiwindow burn", "simulated": {"pages_removed": 38, "real_incidents_missed": 0}},
    {"rule": "orders-lag@worker-*", "action": "dedupe into one alert", "simulated": {"pages_removed": 22, "real_incidents_missed": 0}}
  ],
  "trend": {"noise_ratio_4w": [0.72, 0.68, 0.55, 0.48]}
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

* `alert rules and their definitions`
* `firing and acknowledgment history`
* `topology for burst correlation`
* `SLO burn data`
* `on-call feedback on page quality`

## 8. Human-in-the-Loop & Approval

Every alert change is a reviewed PR with simulation evidence; paging behavior changes require on-call owners' sign-off.

## 9. Security Considerations

* Alert payloads can include customer-impacting detail: aggregate before model calls.
* Tuning that suppresses pages is riskier than noise: simulations and owner sign-off are mandatory, and changes are revertable.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [30 · AI Alert Investigation Assistant](../../30-ai-alert-investigation-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../../35-ai-anomaly-investigation-agent/README.md)
- [57 · AI SLO & Error Budget Assistant](../../57-ai-slo-error-budget-assistant/README.md)
- [31 · AI Incident Summarizer](../../31-ai-incident-summarizer/README.md)
