# 55 · AI Drift Detective

> Explain infrastructure drift: what changed, who changed it, whether it matters, and the safest path back to declared state — as a reviewed PR.

![Area](https://img.shields.io/badge/Area-IaC-purple) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Supervised_automation-informational)

| | |
| --- | --- |
| **Focus area** | 🏗️ IaC |
| **Complexity to prototype** | Medium |
| **Automation level** | Supervised automation |
| **Primary integrations** | Terraform / OpenTofu · Argo CD / Flux · CloudTrail / Azure Activity / GCP Audit · GitHub / GitLab |

---

## 📌 Problem

Drift is the quiet gap between what Terraform/GitOps declares and what actually runs — created by console clicks, hotfixes, and half-finished changes, and usually discovered during the next apply.

* A `terraform plan` shows drift as a diff; it never explains who made the change, when, or whether it was deliberate.
* Blind reconciliation is dangerous: reverting a deliberate hotfix reintroduces the incident it fixed.
* Drift accumulates silently across hundreds of resources; nobody knows which drift is load-bearing.
* GitOps users see 'OutOfSync' constantly and click refresh without investigating why.

**Why it matters:** Unexamined drift makes every future apply a gamble — the next `terraform apply` or `argocd sync` executes decisions nobody made consciously.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Drift explanation | reads the live-vs-declared diff and explains each change in resource terms |
| Attribution | correlates with cloud audit logs, deploy history, and tickets to find who and why |
| Intent classification | labels drift: deliberate hotfix, manual experiment, automation artifact, or accident |
| Safe reconciliation | proposes the path back — absorb into IaC (PR), revert via pipeline, or documented waiver; never raw console edits |
| Drift analytics | trends per team and platform: which resources drift, which controls fail |

## 💡 Proposed Solution

A scheduled and webhook-triggered detector that runs plan/diff across your IaC and GitOps apps, triages every difference with attribution from cloud audit logs and CI history, and files a classified report — each item resolved by a reviewed PR: absorb (update code to match reality), revert (pipeline-applied), or waive (documented exception with expiry). It works as the investigation layer under existing drift alerts, not a replacement for them.

### Workflow

1. **Detect** — scheduled terraform plan / argocd diff across managed scopes
2. **Attribute** — correlate each change with audit logs, deploys, and tickets
3. **Classify** — LLM explains and labels intent per change, with evidence
4. **Propose** — absorb PR / revert PR / waiver, with the reasoning attached
5. **Track** — waivers expire; drift trends feed platform reviews

**Human-in-the-loop:** Every reconciliation path is a reviewed PR or pipeline run — the detective investigates and drafts, humans decide absorb vs. revert vs. waive.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

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

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| MCP servers (Model Context Protocol) | GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty | standardized, permission-scoped, auditable tool access to DevOps systems |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Terraform / OpenTofu | plan JSON as the drift source |
| Argo CD / Flux | OutOfSync diffs and sync history |
| CloudTrail / Azure Activity / GCP Audit | attribution of live changes |
| GitHub / GitLab | reconciliation PRs |
| Slack | drift digest per platform team |

## 📥 Context & Data Sources

* `declared state (IaC + GitOps)`
* `live resource state and diffs`
* `cloud audit logs`
* `deploy and sync history`
* `past drift decisions and waivers`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read tier: plan/diff generation, audit-log queries, deploy history
* Write tier: PR creation only — reconciliation executes through normal pipelines

## ✅ Expected Benefits

* Every diff comes with a who, why, and recommendation — applies become boring again.
* Deliberate hotfixes get absorbed instead of clobbered by the next apply.
* Drift stops accumulating: waivers expire, trends get fixed at the root.
* Works with existing GitOps tooling instead of replacing it.

## 🔒 Safety & Guardrails

* Audit-log queries and diffs are read-only; the write path is exactly the PR pipeline everyone already reviews.
* Diffs can embed tags, AMIs, and network detail: route raw state through self-hosted models if your boundary requires it.
* Attribution data is access-controlled: the detective sees audit logs, so its own access is logged too.

## 🚀 Future Implementation

* Auto-absorb for trusted categories (tags, autoscaling artifacts) with owner notification.
* Drift prevention: config rules that make the common console-click impossible.
* Multi-cloud drift correlation for shared platform resources.

## 🔗 Related Ideas

- [40 · AI Cloud Misconfiguration Analyzer](../40-ai-cloud-misconfiguration-analyzer/README.md)
- [03 · AI Terraform Reviewer](../03-ai-terraform-reviewer/README.md)
- [21 · AI Terraform Plan Explainer](../21-ai-terraform-plan-explainer/README.md)
- [19 · AI Cluster Operations Agent](../19-ai-cluster-operations-agent/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
