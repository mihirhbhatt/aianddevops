# AI Platform Guardrail Generator — Architecture

> Turn your golden paths and past violations into policy-as-code: guardrails that explain themselves and propose the compliant alternative when they block you.

*Focus: 🏢 Platform Engineering · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A guardrail pipeline for the internal platform: it mines the platform's conventions (golden-path templates, review history, incident root causes), drafts policy-as-code with tests, and ships it through the platform's own GitOps flow. Enforcement surfaces in CI and admission control with human-readable messages and concrete alternatives — 'blocked' always comes with 'here's the diff that passes'. Waivers are first-class: owned, expiring, and visible in the catalog (idea 49).

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Convention mining (paths · reviews · incidents)    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Policy-as-code synthesis + tests                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← Kyverno · OPA · Sentinel
┌────────────────────────────────────────────────────┐
│ Staged rollout: audit → warn → enforce             │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Violation assist: explain + fix diff               │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Analytics · waiver expiry · rule retirement        │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Convention miner | golden-path templates, review history, incident RCA mining |
| Policy composer | policy-as-code generation with unit tests per rule |
| Violation assistant | inline explanations and compliant-diff suggestions in CI |
| Rollout & analytics | audit-mode metrics, waiver registry, rule effectiveness |

## 4. Data Flow

1. Mining turns implicit platform knowledge into a ranked list of encodable rules.
2. Each rule ships as tested policy-as-code, starting in audit mode.
3. Violations arrive with an explanation and a diff that passes — rarely a second violation.
4. Analytics retire rules that never fire usefully; waivers expire on schedule.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "rule_id": "GR-014",
  "convention": "all public services require resource limits + PDB",
  "source": "mined from incident INC-8093 (OOM cascade) + golden path v3",
  "policy": {"engine": "kyverno", "file": "policies/require-limits-pdb.yaml", "tests": 4},
  "rollout": {"stage": "warn", "since": "2026-10-01", "violations_30d": 9},
  "violation_assist": {"example": "missing PDB on recommendations-svc", "suggested_diff": "+ PDB minAvailable 1", "mutation": false},
  "waivers": [{"service": "legacy-search", "owner": "@search", "expires": "2026-11-30"}]
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `golden-path templates and docs`
* `PR review comments and rejections`
* `incident root causes`
* `existing policies and their hit rates`
* `service ownership from catalog`

## 8. Human-in-the-Loop & Approval

Policies ship as reviewed PRs with staged rollout (audit-mode first); every enforcement action explains itself; waivers need a named owner and expiry.

## 9. Security Considerations

* Policies are security controls: their generation, tests, and rollout are audited; the composer cannot weaken existing policies.
* Admission-control changes require platform-owner approval and staged rollout with instant rollback.
* Mined text (review comments, incident notes) is untrusted input: prompt-injection defenses apply.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [48 · AI Golden Path Generator](../../48-ai-golden-path-generator/README.md)
- [47 · AI Internal Developer Platform Assistant](../../47-ai-internal-developer-platform-assistant/README.md)
- [38 · AI Kubernetes Security Analyzer](../../38-ai-kubernetes-security-analyzer/README.md)
- [23 · AI IaC Security Analyzer](../../23-ai-iac-security-analyzer/README.md)
