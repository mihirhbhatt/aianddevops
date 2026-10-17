# AI Kubernetes Upgrade Assistant — Architecture

> Plan and rehearse cluster upgrades: deprecated API scanning, add-on compatibility, canary node pools, and a rollback story — before anything touches production.

*Focus: ☸️ Kubernetes · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

An upgrade copilot that reads the cluster's actual state (via k8s APIs, not guesses), diffs it against the target version's deprecation and compatibility data, and produces a sequenced, gated plan: pre-flight fixes as PRs (manifest/API updates validated with dry-runs), a rehearsed canary path (new node pool, drain, observe), verification queries at each gate, and a rollback decision tree. During execution it rides along with read-only checks at every gate, cluster-ops style (idea 19).

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Cluster inventory (read-only)                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Target-version diff: APIs · add-ons                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Sequenced plan with gates + rollback               │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Pre-flight fix PRs (dry-run validated)             │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Stage ride-along + gate verification               │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Inventory scanner | API usage, CRDs, versions, topology from the live cluster (read-only) |
| Compatibility engine | deprecation data + add-on matrices + skew rules, LLM-assisted for the long tail |
| Planner | sequencing with canary stages and verification gates |
| PR drafter | manifest/helm fixes validated with dry-run against the target version |
| Gate monitor | read-only health queries between stages |

## 4. Data Flow

1. The scan inventories what actually runs: APIs in use, CRDs, add-on versions, skew state.
2. The diff names every removed API and incompatible add-on with the workload it affects.
3. A sequenced plan is produced: pre-flight PRs, canary node pool, gates, rollback points.
4. Pre-flight fixes land as reviewed PRs validated with dry-runs against the target version.
5. During execution, the monitor verifies each gate read-only before the human proceeds.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "cluster": "prod-eu-01",
  "current_version": "1.28.9",
  "target_version": "1.31.2",
  "removed_apis_in_use": [
    {"api": "flowcontrol.apiserver.k8s.io/v1beta2 FlowSchema", "count": 3, "workloads": ["gateway-ctrl"], "fixed_by": "PR-7712"}
  ],
  "addon_compat": [
    {"addon": "cilium", "installed": "1.13.4", "required_min": "1.14.5", "action": "upgrade first"}
  ],
  "plan_stages": [
    {"stage": 1, "action": "merge PR-7712 pre-flight fixes", "gate": "dry-run apply clean"},
    {"stage": 2, "action": "canary node pool on 1.31", "gate": "PDB-respecting drains healthy"}
  ],
  "rollback": {"etcd_backup": "2026-10-12T02:00Z ok", "irreversible_after": "stage 4 (kubelet min-version bump)"}
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Kubernetes AI tooling (CNCF) | K8sGPT · HolmesGPT · kagent · kubectl-ai | open-source analyzers and agents to build on instead of starting from scratch |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Agent frameworks | LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI | orchestration: tool calling, retries, structured outputs, human-approval interrupts |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `live API usage and CRDs`
* `add-on and operator versions`
* `node pools and skew state`
* `PDBs and critical workloads`
* `etcd backup status`
* `target-version deprecation data`

## 8. Human-in-the-Loop & Approval

The assistant plans, drafts, and verifies; humans execute or approve each stage — control-plane actions are never autonomous in this idea.

## 9. Security Considerations

* Inventory data can be sensitive (names, images, env): keep raw dumps inside your model boundary or redact.
* The assistant never mutates the cluster; dry-run apply is the ceiling without explicit, logged approval.
* etcd backup verification is part of the plan — an upgrade without a fresh backup does not start.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [19 · AI Cluster Operations Agent](../../19-ai-cluster-operations-agent/README.md)
- [16 · AI Helm Chart Analyzer](../../16-ai-helm-chart-analyzer/README.md)
- [17 · AI Kubernetes Incident Investigator](../../17-ai-kubernetes-incident-investigator/README.md)
- [47 · AI Internal Developer Platform Assistant](../../47-ai-internal-developer-platform-assistant/README.md)
