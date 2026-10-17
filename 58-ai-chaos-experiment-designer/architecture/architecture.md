# AI Chaos Experiment Designer — Architecture

> Design safe chaos experiments from your real topology and SLOs: blast-radius prediction, steady-state hypotheses, abort conditions, and honest readouts.

*Focus: 📊 Observability & SRE · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A designer that composes experiments from your live topology, SLO definitions, and past incidents: for a target service it proposes experiment types (latency injection, pod kill, AZ loss, dependency failure), predicts blast radius from scheduling and dependency data, writes the hypothesis and abort criteria as code, and executes only through your chaos platform with human approval. Post-experiment, it produces an honest readout: what broke, what didn't, what to fix.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Topology + SLO + incident mining                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Experiment design + hypothesis                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Blast-radius prediction + aborts                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← hard limits
┌────────────────────────────────────────────────────┐
│ Human approval → platform execution                │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← auto-abort armed
┌────────────────────────────────────────────────────┐
│ Honest readout → findings + fixes                  │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Target ranker | candidates from catalog criticality, incident history, and test coverage |
| Experiment composer | platform-specific manifests (Chaos Mesh, Litmus, Gremlin) |
| Blast-radius estimator | topology and scheduling analysis, dependency walk |
| Readout analyzer | metrics comparison, findings drafting, issue filing |

## 4. Data Flow

1. The ranker proposes where an experiment teaches the most and risks the least.
2. The composer writes the experiment with a measurable hypothesis and abort criteria.
3. The estimator attaches a blast-radius prediction and required approvals.
4. The platform executes with auto-abort armed; the readout turns results into fixes.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "experiment_id": "chaos-2026-10-14-checkout-az",
  "target": {"service": "checkout-api", "method": "zone-loss", "magnitude": "lose AZ eu-west-1c for 5m"},
  "hypothesis": {"steady_state": "checkout availability stays above SLO during the loss", "derived_from": "SLOs (idea 57) + topology"},
  "blast_radius": {"direct": ["checkout-api (12 pods in AZ c)"], "shared": ["session-store is replicated"], "risk": "low"},
  "aborts": [{"condition": "availability < 99.0 for 2m", "action": "auto-rollback"}],
  "approval": {"required": "@sre-oncall + service owner", "status": "pending"},
  "readout": null
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Agent frameworks | LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI | orchestration: tool calling, retries, structured outputs, human-approval interrupts |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `service topology and dependencies`
* `SLOs and steady-state metrics`
* `past incidents and postmortems`
* `past experiments and outcomes`
* `scheduling, AZ, and node distribution`

## 8. Human-in-the-Loop & Approval

Every experiment requires explicit approval with the blast-radius prediction attached; execution is platform-mediated with automatic aborts — the AI never fires experiments on its own.

## 9. Security Considerations

* Chaos platform credentials are scoped and the designer cannot widen them; production experiments need named-approver sign-off.
* Freeze windows (peak season, ongoing incidents) are hard gates in the pipeline, not prompt suggestions.
* Experiment manifests are treated like production changes: versioned, reviewed, auditable.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [57 · AI SLO & Error Budget Assistant](../../57-ai-slo-error-budget-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../../35-ai-anomaly-investigation-agent/README.md)
- [32 · AI Root Cause Analysis Assistant](../../32-ai-root-cause-analysis-assistant/README.md)
- [19 · AI Cluster Operations Agent](../../19-ai-cluster-operations-agent/README.md)
