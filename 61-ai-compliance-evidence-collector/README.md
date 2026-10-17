# 61 · AI Compliance Evidence Collector

> Continuously collect and map audit evidence from the systems themselves: SOC 2 / ISO 27001 / PCI controls proven by live configuration, not screenshots.

![Area](https://img.shields.io/badge/Area-DevSecOps-red) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🔐 DevSecOps |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | AWS / Azure / GCP · GitHub / GitLab · Vanta / Drata / LogicGate · Jira / Linear |

---

## 📌 Problem

Audit season turns engineers into archaeologists: hunting screenshots, exporting configs, and reconstructing proof of controls that should be demonstrable in minutes.

* Control evidence (access reviews, encryption settings, change management) lives scattered across consoles and spreadsheets.
* Evidence is collected annually by hand, so drift between audits goes unnoticed — controls exist on paper, not in practice.
* Mapping technical reality to control frameworks requires a translator nobody enjoys being.
* Auditors ask for the same artifacts every year and get inconsistent answers from different people.

**Why it matters:** Audit prep consumes engineer-weeks per framework per year, and the gap between documented and actual controls is where real risk hides.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Control mapping | translates framework controls (SOC 2, ISO 27001, PCI, CIS) into checkable technical assertions |
| Evidence automation | pulls live proof — IAM policies, TLS configs, logging enablement, change records — with timestamps |
| Gap detection | finds where the implemented state doesn't satisfy a control, long before the auditor does |
| Evidence packaging | produces auditor-ready artifacts per control with provenance and collection date |
| Continuous posture | re-checks on schedule so compliance reflects today, not last quarter |

## 💡 Proposed Solution

An evidence pipeline that ingests your control framework, decomposes each control into technical checks across cloud, identity, CI/CD, and code systems, collects proof on schedule via read-only APIs, and maps results to a live compliance posture. Gaps file issues; passing evidence is packaged with provenance for auditors. Works alongside GRC tools rather than replacing them.

### Workflow

1. **Map** — decompose framework controls into concrete technical checks per system
2. **Collect** — scheduled read-only evidence gathering across cloud, IAM, CI/CD, and repos
3. **Evaluate** — score each control: satisfied, partially satisfied, or failing, with evidence attached
4. **Report** — auditor-ready artifacts with provenance; gap issues routed to owners
5. **Monitor** — continuous re-checks; posture changes alert the compliance owner

**Human-in-the-loop:** The collector proves and packages; humans (and auditors) judge. Control interpretations are reviewed with compliance before automation is trusted.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Control framework ingestion                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← SOC 2 · ISO · PCI
┌────────────────────────────────────────────────────┐
│ Decomposition into technical checks                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Scheduled evidence collection                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← read-only APIs
┌────────────────────────────────────────────────────┐
│ Control evaluation + gap issues                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Auditor-ready artifacts + posture                  │
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
| AWS / Azure / GCP | config, IAM, and encryption evidence |
| GitHub / GitLab | branch protection, review evidence, CODEOWNERS |
| Vanta / Drata / LogicGate | GRC platforms to feed, not replace |
| Jira / Linear | change-management and gap tracking |
| Slack / email | posture digests for compliance owners |

## 📥 Context & Data Sources

* `control framework definitions`
* `cloud and identity configuration`
* `CI/CD and repo settings`
* `change and incident records`
* `past audit artifacts`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: cloud config APIs, identity stores, repo settings, ticketing
* Write tier: issue filing and evidence-package export only

## ✅ Expected Benefits

* Audit prep drops from engineer-weeks to a review of already-collected evidence.
* Controls verified continuously, not reconstructed annually.
* Consistent artifacts every audit cycle, with provenance auditors accept.
* The gap between paper compliance and reality becomes visible and fixable.

## 🔒 Safety & Guardrails

* The collector reads sensitive security configuration: least-privilege read-only roles; evidence stored access-controlled and encrypted.
* Evidence packages may contain security-sensitive detail (vulns, network layout): share exports deliberately, redact where the framework allows.
* Control interpretations are auditable decisions: record which model, prompt, and human reviewed each mapping.

## 🚀 Future Implementation

* Auto-remediation of common control gaps via PR (with the guardrail generator, idea 60).
* Question-answer copilot for auditor requests during fieldwork.
* Cross-framework dedup: one check satisfying PCI and SOC 2 at once.

## 🔗 Related Ideas

- [40 · AI Cloud Misconfiguration Analyzer](../40-ai-cloud-misconfiguration-analyzer/README.md)
- [27 · AI IAM Policy Reviewer](../27-ai-iam-policy-reviewer/README.md)
- [59 · AI Vulnerability Triage Assistant](../59-ai-vulnerability-triage-assistant/README.md)
- [60 · AI Platform Guardrail Generator](../60-ai-platform-guardrail-generator/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
