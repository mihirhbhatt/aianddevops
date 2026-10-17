# AI Drift Detective — Architecture

> Explain infrastructure drift: what changed, who changed it, whether it matters, and the safest path back to declared state — as a reviewed PR.

*Focus: 🏗️ IaC · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A scheduled and webhook-triggered detector that runs plan/diff across your IaC and GitOps apps, triages every difference with attribution from cloud audit logs and CI history, and files a classified report — each item resolved by a reviewed PR: absorb (update code to match reality), revert (pipeline-applied), or waive (documented exception with expiry). It works as the investigation layer under existing drift alerts, not a replacement for them.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Plan/diff across IaC + GitOps                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← scheduled
┌────────────────────────────────────────────────────┐
│ Attribution: audit logs · deploys                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← who & why
┌────────────────────────────────────────────────────┐
│ Intent classification with evidence                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Absorb PR · revert PR · waiver                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← human decision
┌────────────────────────────────────────────────────┐
│ Waiver expiry + drift trends                       │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Diff collector | terraform plan JSON, Argo CD / Flux diff APIs |
| Attribution engine | CloudTrail / Azure Activity / GCP Audit Logs, CI and sync history, tickets |
| Triage engine | LLM classification with strict output schema and evidence citations |
| Reconciliation drafter | absorb/revert PRs via normal GitOps flow; waiver records with expiry |

## 4. Data Flow

1. On schedule or webhook, diffs are collected across the managed estate.
2. Each difference is attributed: audit trail, deploy, or unknown actor.
3. The triage engine labels intent and drafts the matching reconciliation PR.
4. Owners choose absorb, revert, or waive; waivers carry expiries that re-open the question.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "scope": "aws:prod-network",
  "drifted_resources": 5,
  "findings": [
    {
      "resource": "aws_security_group.sg-alpha",
      "diff": "ingress rule 0.0.0.0/0:443 added",
      "attribution": {"actor": "jane@corp", "source": "CloudTrail evt-9f21", "when": "2026-10-09T14:22Z", "ticket": "INC-8312 hotfix"},
      "classification": "deliberate_hotfix",
      "recommendation": "absorb",
      "proposal": "PR-441 (adds the rule to TF with comment)"
    }
  ],
  "trend": {"drift_events_30d": 14, "top_offender": "aws_security_group", "waivers_open": 2}
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `declared state (IaC + GitOps)`
* `live resource state and diffs`
* `cloud audit logs`
* `deploy and sync history`
* `past drift decisions and waivers`

## 8. Human-in-the-Loop & Approval

Every reconciliation path is a reviewed PR or pipeline run — the detective investigates and drafts, humans decide absorb vs. revert vs. waive.

## 9. Security Considerations

* Audit-log queries and diffs are read-only; the write path is exactly the PR pipeline everyone already reviews.
* Diffs can embed tags, AMIs, and network detail: route raw state through self-hosted models if your boundary requires it.
* Attribution data is access-controlled: the detective sees audit logs, so its own access is logged too.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [40 · AI Cloud Misconfiguration Analyzer](../../40-ai-cloud-misconfiguration-analyzer/README.md)
- [03 · AI Terraform Reviewer](../../03-ai-terraform-reviewer/README.md)
- [21 · AI Terraform Plan Explainer](../../21-ai-terraform-plan-explainer/README.md)
- [19 · AI Cluster Operations Agent](../../19-ai-cluster-operations-agent/README.md)
