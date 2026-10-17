# 62 · AI Change Impact Analyzer

> Answer 'what does this change touch?' before merge: blast radius across code, services, infrastructure, and teams — with evidence.

![Area](https://img.shields.io/badge/Area-Developer%20Experience-yellow) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🧑‍💻 Developer Experience |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | GitHub / GitLab · Service catalog (Backstage etc.) · OpenTelemetry / tracing · Terraform / Kubernetes manifests |

---

## 📌 Problem

Every change is local in the diff and global in effect: the 'small' config tweak that takes down a checkout flow, the library bump that breaks three services nobody remembered.

* Ownership and dependency knowledge is scattered: CODEOWNERS, service catalogs, dashboards, and tribal memory disagree.
* Reviewers evaluate the diff, not the blast radius — downstream consumers are invisible in a PR.
* Infrastructure changes look isolated but share blast zones (same cluster, same database, same queue).
* Impact analysis happens after the incident, in the postmortem, where it's called root cause.

**Why it matters:** Unchecked blast radius is how routine changes become outages — and why 'it worked in staging' is a running joke.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Dependency traversal | walks code imports, service calls, shared infra, and data flows to find what a change reaches |
| Cross-stack impact | connects app-level changes to infra-level consequences (schema, config, queues, envs) |
| Ownership resolution | names the teams and services affected, using the catalog and CODEOWNERS |
| Risk summary | ranks impact by criticality and past-incident similarity; suggests extra review or staging |
| Reviewer routing | proposes the right reviewers and checks for the true blast radius |

## 💡 Proposed Solution

A PR-time analyzer that builds a change's blast radius from the union of code dependency graphs, service topology (idea 63), infrastructure relationships, and data schemas — then translates it into a human summary: what's affected, who owns it, what to test, and what to watch after deploy. Posted as a PR comment and a release-checklist section, feeding the deploy risk score (idea 08).

### Workflow

1. **Diff** — parse the PR: code, config, IaC, schemas, dependencies
2. **Traverse** — expand impact through code graph, service topology, and shared infrastructure
3. **Resolve** — map affected surfaces to owners, criticality, and environments
4. **Summarize** — blast-radius report: affected services, teams, tests, and watch items
5. **Route** — suggest reviewers and checks; feed the deploy risk score (idea 08)

**Human-in-the-loop:** Advisory by design: the analyzer informs reviewers and release captains; it never blocks or reroutes by itself.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ PR diff parsing (code · IaC · schema)              │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Dependency + topology traversal                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Owner + criticality resolution                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Blast-radius summary in PR                         │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Reviewer routing + risk feed                       │
└────────────────────────────────────────────────────┘
```

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| GitHub / GitLab | PR comments and reviewer suggestions |
| Service catalog (Backstage etc.) | ownership and criticality |
| OpenTelemetry / tracing | runtime call edges to complement static analysis |
| Terraform / Kubernetes manifests | infrastructure relationships |
| Schema registries | data-contract impact |

## 📥 Context & Data Sources

* `the PR diff across artifact types`
* `code dependency graph`
* `service topology and call edges`
* `infrastructure relationships`
* `ownership and criticality metadata`
* `past incidents by component`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: repo graphs, catalog, trace APIs, IaC state
* Write tier: PR comments and check annotations

## ✅ Expected Benefits

* Reviewers see consequences, not just diffs.
* The right reviewers get pulled in before merge, not after the incident.
* Test plans target the real blast radius instead of the changed files.
* Deploy risk scores get honest inputs.

## 🔒 Safety & Guardrails

* Dependency graphs can reveal architecture detail: keep analysis inside your boundary; summaries shared externally are redacted.
* Trace-derived edges can carry PII in spans: use aggregated, name-level data only.

## 🚀 Future Implementation

* Simulated impact: replay last week's traffic against a what-if model of the change.
* Change-freeze enforcement driven by blast radius (risky changes need a window).
* Cross-repo orchestration: one PR, many affected repos, coordinated review.

## 🔗 Related Ideas

- [45 · AI Pull Request Infrastructure Reviewer](../45-ai-pull-request-infrastructure-reviewer/README.md)
- [44 · AI Repository Infrastructure Analyzer](../44-ai-repository-infrastructure-analyzer/README.md)
- [63 · AI Service Topology Mapper](../63-ai-service-topology-mapper/README.md)
- [49 · AI Service Catalog Assistant](../49-ai-service-catalog-assistant/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
