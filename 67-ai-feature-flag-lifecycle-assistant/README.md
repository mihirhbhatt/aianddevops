# 67 · AI Feature Flag Lifecycle Assistant

> Manage flag debt automatically: find stale flags, verify kill-switch readiness, and clean up through reviewed PRs — so flags stay a tool, not a tar pit.

![Area](https://img.shields.io/badge/Area-Platform%20Engineering-blueviolet) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🏢 Platform Engineering |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | LaunchDarkly / Flagsmith / OpenFeature / Unleash · GitHub / GitLab · Kubernetes / config stores · Backstage / IDP |

---

## 📌 Problem

Feature flags are created in minutes and forgotten for years: hundreds of dead toggles wrapping code paths nobody remembers how to reach.

* Flags accumulate without an expiry culture; the codebase carries years of dead branches.
* Kill switches that would save an incident were never tested — flipping them is a leap of faith.
* Flag state and code drift: removals half-done leave orphaned checks and config keys.
* Combinatorial states (who sees what, in which env) are invisible; testing coverage of flag permutations is luck.

**Why it matters:** Flag debt taxes every deploy, hides untested code paths in production, and turns the emergency lever into a gamble exactly when it's needed most.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Inventory & staleness | correlates flag definitions, code references, and evaluation telemetry to find dead and zombie flags |
| Kill-switch testing | proposes safe simulations proving each flag's off-state works (staging, canary, or shadow evaluation) |
| Cleanup drafting | removal PRs that delete the flag and both code paths correctly, env config included |
| Expiry governance | flags get born with owners and expiry dates; renewals are explicit |
| Exposure mapping | which users and segments each flag affects — useful for launches and incidents |

## 💡 Proposed Solution

A flag governance layer over your flag system (LaunchDarkly, Flagsmith, Unleash, OpenFeature, homegrown): it merges the flag registry with the code index and evaluation telemetry, classifies lifecycle state (active, dormant, dead), proposes kill-switch drills, and drafts cleanup PRs. Expiry metadata becomes policy: new flags declare an owner and review date at creation, enforced by the guardrail generator (idea 60).

### Workflow

1. **Inventory** — merge flag registry, code references, and evaluation telemetry
2. **Classify** — active / dormant / dead per flag, with last-evaluation evidence
3. **Drill** — propose kill-switch tests for flags that would matter in incidents
4. **Clean** — draft removal PRs for dead flags; orphaned config included
5. **Govern** — expiry metadata and renewal prompts at creation and review

**Human-in-the-loop:** Removals and drills are owner-approved; the assistant never flips flags in production — drills run in staging or as shadow evaluations.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Registry + code + telemetry merge                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Lifecycle classification per flag                  │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Kill-switch drill proposals                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← staging only
┌────────────────────────────────────────────────────┐
│ Cleanup PRs (code + config)                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Expiry governance + renewal prompts                │
└────────────────────────────────────────────────────┘
```

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| LaunchDarkly / Flagsmith / OpenFeature / Unleash | flag registries and evaluation data |
| GitHub / GitLab | cleanup PRs and expiry checks |
| Kubernetes / config stores | orphaned config detection |
| Backstage / IDP | flag health per service in the catalog |
| Slack | renewal nudges to flag owners |

## 📥 Context & Data Sources

* `flag registry and targeting rules`
* `evaluation telemetry (who saw what)`
* `code references from the index`
* `environment configuration`
* `ownership metadata`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: flag APIs, code index, evaluation events
* Write tier: PR creation and owner notifications; no production flag writes

## ✅ Expected Benefits

* Flag count and code-path complexity trend down, not up.
* Kill switches proven before the incident that needs them.
* Cleaner production: dormant code paths and orphaned config removed.
* New flags born with owners and expiry dates, enforced automatically.

## 🔒 Safety & Guardrails

* Evaluation telemetry can be user-level: aggregate before analysis; segment data stays in the flag system.
* Cleanup PRs touching auth or billing flags get extra review gates.
* The assistant holds read-only flag credentials — flag flipping stays human.

## 🚀 Future Implementation

* Progressive-delivery integration: tie flag rollout state to SLO burn (ideas 57 and 08).
* Permutation test generation: cover the flag combinations that matter.
* Flag-cost accounting: which flags carry operational burden per team.

## 🔗 Related Ideas

- [60 · AI Platform Guardrail Generator](../60-ai-platform-guardrail-generator/README.md)
- [48 · AI Golden Path Generator](../48-ai-golden-path-generator/README.md)
- [45 · AI Pull Request Infrastructure Reviewer](../45-ai-pull-request-infrastructure-reviewer/README.md)
- [12 · AI Deployment Troubleshooting Agent](../12-ai-deployment-troubleshooting-agent/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
