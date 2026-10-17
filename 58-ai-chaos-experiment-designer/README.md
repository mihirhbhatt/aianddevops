# 58 · AI Chaos Experiment Designer

> Design safe chaos experiments from your real topology and SLOs: blast-radius prediction, steady-state hypotheses, abort conditions, and honest readouts.

![Area](https://img.shields.io/badge/Area-Observability%20%26%20SRE-green) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-High-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Supervised_automation-informational)

| | |
| --- | --- |
| **Focus area** | 📊 Observability & SRE |
| **Complexity to prototype** | High |
| **Automation level** | Supervised automation |
| **Primary integrations** | Chaos Mesh / LitmusChaos / Gremlin / AWS FIS · Service catalog & topology · Prometheus / Grafana · SLO definitions (idea 57) |

---

## 📌 Problem

Chaos engineering works when experiments are carefully designed and fails loudly when they're not — the hard part is knowing what is safe to break, where, and what to watch.

* Designing an experiment requires topology knowledge, dependency understanding, and steady-state metrics — usually all in one person's head.
* Blast radius is guessed: the network partition aimed at staging takes out the shared auth service.
* Abort conditions are vague ('if it looks bad'), so experiments overshoot into real incidents.
* Results are anecdotes: without a hypothesis and measurement plan, chaos theater teaches nothing.

**Why it matters:** Well-designed experiments find real weaknesses before users do; poorly designed ones create the incidents they were meant to prevent.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Topology-aware design | uses service topology and dependency data (idea 49) to pick targets where failure is survivable |
| Steady-state hypothesis | derives measurable assumptions from the service's SLOs (idea 57) rather than vibes |
| Blast-radius prediction | estimates what shares the blast zone: same node, AZ, dependency, queue |
| Guarded execution plans | generates platform manifests (Chaos Mesh/Litmus/Gremlin) with explicit abort conditions and auto-rollback |
| Result readout | compares observed vs. hypothesis, files findings as issues, drafts the fix |

## 💡 Proposed Solution

A designer that composes experiments from your live topology, SLO definitions, and past incidents: for a target service it proposes experiment types (latency injection, pod kill, AZ loss, dependency failure), predicts blast radius from scheduling and dependency data, writes the hypothesis and abort criteria as code, and executes only through your chaos platform with human approval. Post-experiment, it produces an honest readout: what broke, what didn't, what to fix.

### Workflow

1. **Select** — rank candidate targets by SLO criticality × incident history × never-tested
2. **Design** — experiment type, magnitude, duration; steady-state hypothesis from SLOs
3. **Predict** — blast radius from topology and scheduling; derive abort conditions
4. **Approve** — human review of the manifest; staged execution via the chaos platform
5. **Read out** — observed vs. hypothesis; findings become issues and runbook updates

**Human-in-the-loop:** Every experiment requires explicit approval with the blast-radius prediction attached; execution is platform-mediated with automatic aborts — the AI never fires experiments on its own.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Agent frameworks | LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI | orchestration: tool calling, retries, structured outputs, human-approval interrupts |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Chaos Mesh / LitmusChaos / Gremlin / AWS FIS | execution platforms |
| Service catalog & topology | target selection and dependency maps |
| Prometheus / Grafana | steady-state metrics and abort signals |
| SLO definitions (idea 57) | hypothesis and success criteria |
| GitHub | experiment manifests as reviewed code |

## 📥 Context & Data Sources

* `service topology and dependencies`
* `SLOs and steady-state metrics`
* `past incidents and postmortems`
* `past experiments and outcomes`
* `scheduling, AZ, and node distribution`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read tier: topology, metrics, incident history
* Write tier: chaos platform API gated behind explicit per-experiment approval with abort armed

## ✅ Expected Benefits

* Experiments grounded in topology and SLOs instead of curiosity.
* Blast-radius predictions and hard aborts make game days boring.
* A portfolio view: which failure modes were tested, when, with what result.
* Findings flow into issues and runbooks, not Slack threads that evaporate.

## 🔒 Safety & Guardrails

* Chaos platform credentials are scoped and the designer cannot widen them; production experiments need named-approver sign-off.
* Freeze windows (peak season, ongoing incidents) are hard gates in the pipeline, not prompt suggestions.
* Experiment manifests are treated like production changes: versioned, reviewed, auditable.

## 🚀 Future Implementation

* Continuous verification: auto-rerun experiments after major topology changes.
* Game-day copilot: facilitate live exercises with real-time hypothesis tracking.
* Failure-mode fuzzing: mutate experiment parameters within approved bounds.

## 🔗 Related Ideas

- [57 · AI SLO & Error Budget Assistant](../57-ai-slo-error-budget-assistant/README.md)
- [35 · AI Anomaly Investigation Agent](../35-ai-anomaly-investigation-agent/README.md)
- [32 · AI Root Cause Analysis Assistant](../32-ai-root-cause-analysis-assistant/README.md)
- [19 · AI Cluster Operations Agent](../19-ai-cluster-operations-agent/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
