# AI Backup & DR Readiness Reviewer — Architecture

> Audit whether you can actually recover: backup coverage vs. RTO/RPO, expired retention, untested restores, and DR drills that run on schedule.

*Focus: ☁️ Cloud · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A scheduled reviewer that reads backup configurations across cloud providers (AWS Backup, Azure Recovery Services, GCP Backup and DR, plus in-cluster options like Velero), reconciles them against a criticality register (from the service catalog), and produces a readiness report: coverage, RPO gaps, retention risks, and scheduled restore drills with generated runbooks. Findings file issues; drills run in sandboxed scratch accounts.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Datastore & backup config inventory                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Reconcile vs. criticality + RTO/RPO                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Readiness report + filed issues                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Scheduled restore drills (scratch)                 │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← sandboxed
┌────────────────────────────────────────────────────┐
│ Proven runbooks + trend tracking                   │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Inventory collector | backup policies, snapshots, replication across clouds and Velero |
| Reconciliation engine | criticality register vs. actual config; RPO math |
| Drill orchestrator | scratch-env restore tests with integrity and timing checks |
| Reporter | readiness scorecard, issues, and runbook PRs |

## 4. Data Flow

1. The collector inventories what is backed up, where, how often, and retained how long.
2. The reconciler names every gap between documented recovery targets and actual configuration.
3. Restore drills run on schedule in scratch environments, measuring real time-to-restore.
4. Gaps become issues; proven procedures become runbooks; trends show readiness over time.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "scan_date": "2026-10-12",
  "coverage": {
    "datastores": 47,
    "protected": 41,
    "unprotected": [{"store": "prod-eu redis-cache", "reason": "no policy attached", "criticality": "medium"}]
  },
  "rpo_gaps": [
    {"store": "orders-db", "doc_rpo": "15m", "actual_rpo": "24h", "gap": "daily snapshots; PITR not enabled"}
  ],
  "drill": {"last": "2026-09-30", "store": "orders-db", "result": "pass", "time_to_restore": "38m vs RTO 60m"},
  "score": {"readiness": "amber", "open_issues": 6}
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

* `backup policies and schedules`
* `snapshot inventory and retention`
* `cross-region replication state`
* `criticality register and RTO/RPO docs`
* `past drill results`

## 8. Human-in-the-Loop & Approval

Read-only auditing and report drafting; restore drills run only in scratch environments with explicit enablement per team.

## 9. Security Considerations

* Restore drills touch copies of production data: isolated scratch accounts, encryption at rest, teardown on completion; redact before any model sees drill output.
* The reviewer is read-only on production by design; it never mutates backup policies.
* Backup systems are exfiltration paths in the wrong hands: drill credentials are scoped and short-lived.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [28 · AI Cloud Architecture Advisor](../../28-ai-cloud-architecture-advisor/README.md)
- [29 · AI Cloud Resource Optimization Assistant](../../29-ai-cloud-resource-optimization-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../../26-ai-cloud-cost-analysis-assistant/README.md)
- [51 · AI Runbook Generator](../../51-ai-runbook-generator/README.md)
