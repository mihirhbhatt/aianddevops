# 54 · AI Kubernetes Upgrade Assistant

> Plan and rehearse cluster upgrades: deprecated API scanning, add-on compatibility, canary node pools, and a rollback story — before anything touches production.

![Area](https://img.shields.io/badge/Area-Kubernetes-326ce5) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-High-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Supervised_automation-informational)

| | |
| --- | --- |
| **Focus area** | ☸️ Kubernetes |
| **Complexity to prototype** | High |
| **Automation level** | Supervised automation |
| **Primary integrations** | Kubernetes APIs · Helm / Argo CD / Flux · kubent / pluto / popeye · EKS / GKE / AKS APIs |

---

## 📌 Problem

Kubernetes upgrades are feared for good reason: version skew, removed APIs, and add-on incompatibilities turn a routine patch into a multi-day outage risk.

* Deprecated APIs break workloads only when the new version actually runs — everything works today and fails after upgrade.
* Add-ons (CNI, ingress, operators, CRDs) each carry their own compatibility matrix; nobody tracks the cross product.
* Version-skew rules (kubelet vs control plane, max minors) constrain sequencing but are easy to violate across a fleet.
* Every cluster is slightly different; a playbook that worked on staging fails on the pet cluster with a 2019 CRD.

**Why it matters:** A botched control-plane upgrade takes down everything at once; the difference between routine and outage is almost entirely preparation quality.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Deprecation scanning | walks live manifests, CRDs, and helm values for APIs removed in the target version |
| Compatibility matrix | checks add-on and operator versions against the target k8s version and each other |
| Fleet sequencing | plans upgrade order respecting skew rules, PDBs, and environment blast radius |
| Rehearsal plan | generates canary node-pool and staging-first steps with explicit verification gates |
| Rollback readiness | verifies etcd backups and states what is (and is not) reversible at each step |

## 💡 Proposed Solution

An upgrade copilot that reads the cluster's actual state (via k8s APIs, not guesses), diffs it against the target version's deprecation and compatibility data, and produces a sequenced, gated plan: pre-flight fixes as PRs (manifest/API updates validated with dry-runs), a rehearsed canary path (new node pool, drain, observe), verification queries at each gate, and a rollback decision tree. During execution it rides along with read-only checks at every gate, cluster-ops style (idea 19).

### Workflow

1. **Inventory** — scan the live cluster: API usage, CRDs, add-on versions, node pools, PDBs
2. **Diff** — against the target version: removed APIs, add-on compatibility, skew constraints
3. **Plan** — sequenced upgrade with canary stages, verification gates, and rollback points
4. **Pre-flight** — open PRs for manifest/API fixes; validate with dry-run against the target version
5. **Ride-along** — monitor each stage read-only; verify gate queries before the next step

**Human-in-the-loop:** The assistant plans, drafts, and verifies; humans execute or approve each stage — control-plane actions are never autonomous in this idea.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Kubernetes AI tooling (CNCF) | K8sGPT · HolmesGPT · kagent · kubectl-ai | open-source analyzers and agents to build on instead of starting from scratch |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Agent frameworks | LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI | orchestration: tool calling, retries, structured outputs, human-approval interrupts |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Kubernetes APIs | read-only inventory, dry-run validation |
| Helm / Argo CD / Flux | manifest sources and add-on versions |
| kubent / pluto / popeye | existing deprecation scanners to build on |
| EKS / GKE / AKS APIs | control-plane versions and node-pool operations |
| GitHub | pre-flight fix PRs |

## 📥 Context & Data Sources

* `live API usage and CRDs`
* `add-on and operator versions`
* `node pools and skew state`
* `PDBs and critical workloads`
* `etcd backup status`
* `target-version deprecation data`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read tier: k8s APIs, helm/Argo state, cloud version APIs
* Write tier: PR creation; dry-run apply only with explicit approval

## ✅ Expected Benefits

* Upgrades become planned projects with evidence, not heroic weekend work.
* No more removed-API surprises: every break is found and fixed pre-flight.
* Canary-first execution with explicit gates and an honest rollback story.
* Fleet consistency: the same plan template across dozens of clusters.

## 🔒 Safety & Guardrails

* Inventory data can be sensitive (names, images, env): keep raw dumps inside your model boundary or redact.
* The assistant never mutates the cluster; dry-run apply is the ceiling without explicit, logged approval.
* etcd backup verification is part of the plan — an upgrade without a fresh backup does not start.

## 🚀 Future Implementation

* Continuous upgrade-readiness score per cluster, surfaced in the platform.
* Automated pre-flight PR merging via GitOps once trust accumulates.
* Node OS/image upgrades folded into the same gated flow.

## 🔗 Related Ideas

- [19 · AI Cluster Operations Agent](../19-ai-cluster-operations-agent/README.md)
- [16 · AI Helm Chart Analyzer](../16-ai-helm-chart-analyzer/README.md)
- [17 · AI Kubernetes Incident Investigator](../17-ai-kubernetes-incident-investigator/README.md)
- [47 · AI Internal Developer Platform Assistant](../47-ai-internal-developer-platform-assistant/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
