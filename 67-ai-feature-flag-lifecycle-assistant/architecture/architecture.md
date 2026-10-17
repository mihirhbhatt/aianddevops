# AI Feature Flag Lifecycle Assistant — Architecture

> Manage flag debt automatically: find stale flags, verify kill-switch readiness, and clean up through reviewed PRs — so flags stay a tool, not a tar pit.

*Focus: 🏢 Platform Engineering · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A flag governance layer over your flag system (LaunchDarkly, Flagsmith, Unleash, OpenFeature, homegrown): it merges the flag registry with the code index and evaluation telemetry, classifies lifecycle state (active, dormant, dead), proposes kill-switch drills, and drafts cleanup PRs. Expiry metadata becomes policy: new flags declare an owner and review date at creation, enforced by the guardrail generator (idea 60).

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Registry + code + telemetry merge                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Lifecycle classification per flag                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Kill-switch drill proposals                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← staging only
┌────────────────────────────────────────────────────┐
│ Cleanup PRs (code + config)                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Expiry governance + renewal prompts                │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Inventory engine | registry/API sync plus code-index cross-reference |
| Lifecycle classifier | telemetry-backed staleness verdicts with evidence |
| Cleanup drafter | flag and code-path removal PRs across repos |
| Governance hooks | creation-time metadata checks and renewal workflows |

## 4. Data Flow

1. The inventory reconciles what the flag system, the code, and production actually do.
2. Dead flags surface with evidence; dormant ones get an owner ping before death row.
3. Cleanup PRs remove both branches of the toggle, config keys included.
4. Expiry metadata keeps the inventory from refilling.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "flag": "checkout-new-pricing",
  "state": "dormant",
  "evidence": {"created": "2024-03-02", "last_evaluated": "2025-11-18", "code_refs": 4, "evaluations_90d": 0},
  "exposure": {"segments": ["internal-dogfood"], "envs": ["staging", "prod"]},
  "actions": [
    {"kind": "kill_switch_drill", "status": "proposed", "where": "staging"},
    {"kind": "removal_pr", "status": "drafted", "pr": "PR-889", "note": "removes default-off path + 2 env keys"}
  ],
  "owner": "@checkout-team",
  "expires": "2024-06-02 (overdue 860d)"
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `flag registry and targeting rules`
* `evaluation telemetry (who saw what)`
* `code references from the index`
* `environment configuration`
* `ownership metadata`

## 8. Human-in-the-Loop & Approval

Removals and drills are owner-approved; the assistant never flips flags in production — drills run in staging or as shadow evaluations.

## 9. Security Considerations

* Evaluation telemetry can be user-level: aggregate before analysis; segment data stays in the flag system.
* Cleanup PRs touching auth or billing flags get extra review gates.
* The assistant holds read-only flag credentials — flag flipping stays human.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [60 · AI Platform Guardrail Generator](../../60-ai-platform-guardrail-generator/README.md)
- [48 · AI Golden Path Generator](../../48-ai-golden-path-generator/README.md)
- [45 · AI Pull Request Infrastructure Reviewer](../../45-ai-pull-request-infrastructure-reviewer/README.md)
- [12 · AI Deployment Troubleshooting Agent](../../12-ai-deployment-troubleshooting-agent/README.md)
