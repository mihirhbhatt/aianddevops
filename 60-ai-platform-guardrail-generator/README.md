# 60 · AI Platform Guardrail Generator

> Turn your golden paths and past violations into policy-as-code: guardrails that explain themselves and propose the compliant alternative when they block you.

![Area](https://img.shields.io/badge/Area-Platform%20Engineering-blueviolet) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Supervised_automation-informational)

| | |
| --- | --- |
| **Focus area** | 🏢 Platform Engineering |
| **Complexity to prototype** | Medium |
| **Automation level** | Supervised automation |
| **Primary integrations** | Kyverno / OPA Gatekeeper · Sentinel / Checkov / Conftest / CEL · Backstage / IDP · GitHub / GitLab |

---

## 📌 Problem

Platform teams write policies as wiki pages and Slack messages; enforcement happens (or doesn't) at review time, one human at a time.

* Golden paths (idea 48) document the right way; nothing stops the 200th service from skipping them.
* Policies live in reviewers' memories, so enforcement is inconsistent and slow.
* When a policy blocks a PR, it rarely says what to do instead — devs treat the platform as an obstacle.
* Writing OPA/Kyverno/Sentinel rules for every convention is specialist work that never gets done.

**Why it matters:** Guardrails encoded as policy convert platform guidance from documentation into defaults — the safe path becomes the path of least resistance.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Convention mining | reads golden paths, past review comments, and incident causes to find what rules actually matter |
| Policy synthesis | generates Kyverno/OPA Gatekeeper/Sentinel/Checkov/CEL rules with tests for each convention |
| Compliant-alternative suggestions | on rejection, proposes the exact change that passes — or a mutation that fixes it |
| Violation analytics | tracks which rules fire, on whom, and why; retires rules that never matter |
| Exception workflow | waivers with owners and expiries instead of ad-hoc 'just this once' approvals |

## 💡 Proposed Solution

A guardrail pipeline for the internal platform: it mines the platform's conventions (golden-path templates, review history, incident root causes), drafts policy-as-code with tests, and ships it through the platform's own GitOps flow. Enforcement surfaces in CI and admission control with human-readable messages and concrete alternatives — 'blocked' always comes with 'here's the diff that passes'. Waivers are first-class: owned, expiring, and visible in the catalog (idea 49).

### Workflow

1. **Mine** — collect conventions: golden paths, review comments, incident root causes, existing lint rules
2. **Synthesize** — draft policy-as-code + tests per convention, ranked by past incident cost
3. **Ship** — PR through the platform repo; staged rollout as audit → warn → enforce
4. **Assist** — on violation, explain and propose the compliant diff (or mutation)
5. **Tune** — violation analytics: retire noise, tighten what matters, expire waivers

**Human-in-the-loop:** Policies ship as reviewed PRs with staged rollout (audit-mode first); every enforcement action explains itself; waivers need a named owner and expiry.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Kyverno / OPA Gatekeeper | admission-control policies |
| Sentinel / Checkov / Conftest / CEL | pipeline policy engines |
| Backstage / IDP | golden-path templates and waiver visibility |
| GitHub / GitLab | policy PRs and CI enforcement |
| Slack | violation assist and waiver approvals |

## 📥 Context & Data Sources

* `golden-path templates and docs`
* `PR review comments and rejections`
* `incident root causes`
* `existing policies and their hit rates`
* `service ownership from catalog`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read tier: repos, reviews, incidents, catalog
* Write tier: policy PRs and waiver records only — enforcement lives in the platform's own engines

## ✅ Expected Benefits

* Golden paths become defaults instead of documentation.
* Every block includes the fix: developers experience the platform as helpful, not hostile.
* Policy coverage grows with incident learning, not platform-team free time.
* Waivers stop being permanent: owned, expiring, visible.

## 🔒 Safety & Guardrails

* Policies are security controls: their generation, tests, and rollout are audited; the composer cannot weaken existing policies.
* Admission-control changes require platform-owner approval and staged rollout with instant rollback.
* Mined text (review comments, incident notes) is untrusted input: prompt-injection defenses apply.

## 🚀 Future Implementation

* Mutation-first policies: auto-fix instead of block where mutation is safe.
* Admission policies generated from live cluster state to stop recurring drift.
* Compliance mapping: tie each guardrail to SOC 2/ISO controls for audit evidence.

## 🔗 Related Ideas

- [48 · AI Golden Path Generator](../48-ai-golden-path-generator/README.md)
- [47 · AI Internal Developer Platform Assistant](../47-ai-internal-developer-platform-assistant/README.md)
- [38 · AI Kubernetes Security Analyzer](../38-ai-kubernetes-security-analyzer/README.md)
- [23 · AI IaC Security Analyzer](../23-ai-iac-security-analyzer/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
