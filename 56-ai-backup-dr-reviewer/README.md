# 56 · AI Backup & DR Readiness Reviewer

> Audit whether you can actually recover: backup coverage vs. RTO/RPO, expired retention, untested restores, and DR drills that run on schedule.

![Area](https://img.shields.io/badge/Area-Cloud-orange) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | ☁️ Cloud |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | AWS Backup / Azure Recovery Services / GCP Backup and DR · Velero / volume snapshots · Service catalog / CMDB · RDS / Azure SQL / Cloud SQL |

---

## 📌 Problem

Backups are the control everyone believes in and nobody tests: coverage gaps, silent failures, and restore procedures that have never run against real data.

* Snapshot schedules exist; whether they cover every critical datastore (and their cross-region copies) is tribal knowledge.
* Retention and expiry misconfigurations surface only when a restore is needed and the snapshot is gone.
* RTO/RPO claims in the DR doc are never compared to what the backup config actually delivers.
* Restore tests happen annually (or never), so breakage in the restore path accumulates invisibly.

**Why it matters:** The first full restore test should not happen during an outage; readiness verified monthly is worth infinitely more than a DR binder.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Coverage mapping | inventories datastores vs. backup policies and names what is unprotected, cross-region gaps included |
| RTO/RPO reconciliation | compares documented targets with snapshot frequency, retention, and replication reality |
| Restore verification planning | generates and schedules restore tests into scratch environments with integrity checks |
| Config drift review | flags retention changes, disabled policies, and expired keys in the backup chain |
| Runbook generation | produces per-datastore restore runbooks consistent with idea 51's format |

## 💡 Proposed Solution

A scheduled reviewer that reads backup configurations across cloud providers (AWS Backup, Azure Recovery Services, GCP Backup and DR, plus in-cluster options like Velero), reconciles them against a criticality register (from the service catalog), and produces a readiness report: coverage, RPO gaps, retention risks, and scheduled restore drills with generated runbooks. Findings file issues; drills run in sandboxed scratch accounts.

### Workflow

1. **Inventory** — enumerate datastores and their backup/replication configs across providers
2. **Reconcile** — map against the criticality register and documented RTO/RPO
3. **Report** — coverage gaps, retention risks, expired credentials, cross-region shortfalls
4. **Drill** — schedule restore tests into scratch environments; verify integrity and time-to-restore
5. **Close** — file issues per gap; refresh DR runbooks to match what was proven

**Human-in-the-loop:** Read-only auditing and report drafting; restore drills run only in scratch environments with explicit enablement per team.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Datastore & backup config inventory                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Reconcile vs. criticality + RTO/RPO                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Readiness report + filed issues                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Scheduled restore drills (scratch)                 │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← sandboxed
┌────────────────────────────────────────────────────┐
│ Proven runbooks + trend tracking                   │
└────────────────────────────────────────────────────┘
```

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| Model routing & AI gateways | LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway | provider-agnostic routing with fallbacks, budgets, caching, and audit logs |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| AWS Backup / Azure Recovery Services / GCP Backup and DR | policy and job APIs |
| Velero / volume snapshots | in-cluster backup state |
| Service catalog / CMDB | criticality register and ownership |
| RDS / Azure SQL / Cloud SQL | engine-native backup configs |
| Issue tracker & wiki | findings and runbook publication |

## 📥 Context & Data Sources

* `backup policies and schedules`
* `snapshot inventory and retention`
* `cross-region replication state`
* `criticality register and RTO/RPO docs`
* `past drill results`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: cloud backup APIs, snapshot listings, catalog data
* Write tier: scratch-env provisioning and issue filing, per-team enablement

## ✅ Expected Benefits

* A truthful answer to 'can we recover?', with evidence instead of confidence.
* Coverage and retention gaps found by schedule, not by disaster.
* Restore-path regressions caught monthly in scratch, not annually in crisis.
* DR docs converge on procedures that were actually executed.

## 🔒 Safety & Guardrails

* Restore drills touch copies of production data: isolated scratch accounts, encryption at rest, teardown on completion; redact before any model sees drill output.
* The reviewer is read-only on production by design; it never mutates backup policies.
* Backup systems are exfiltration paths in the wrong hands: drill credentials are scoped and short-lived.

## 🚀 Future Implementation

* Failure injection into the DR path (expired keys, corrupt replicas) with the chaos designer (idea 58).
* Ransomware-readiness checks: immutable vault coverage and restore-from-locked-copy tests.
* Automated quarterly attestation reports for auditors.

## 🔗 Related Ideas

- [28 · AI Cloud Architecture Advisor](../28-ai-cloud-architecture-advisor/README.md)
- [29 · AI Cloud Resource Optimization Assistant](../29-ai-cloud-resource-optimization-assistant/README.md)
- [26 · AI Cloud Cost Analysis Assistant](../26-ai-cloud-cost-analysis-assistant/README.md)
- [51 · AI Runbook Generator](../51-ai-runbook-generator/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
