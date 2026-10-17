# 68 · AI IaC Test Generator

> Give your Terraform modules real tests: generated Terratest/OPA cases from module semantics and past incidents, running in CI like any other code.

![Area](https://img.shields.io/badge/Area-IaC-purple) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🏗️ IaC |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | Terraform / OpenTofu / Terragrunt · Terratest / OPA / Conftest / tflint · LocalStack / test accounts · GitHub Actions / GitLab CI |

---

## 📌 Problem

Infrastructure code ships with less test coverage than a weekend hobby project — modules get 'reviewed' but rarely executed, and regressions surface as plan surprises in production.

* IaC modules are consumed by dozens of stacks; a change can pass review and break every consumer.
* Writing Terratest/OPA/tflint tests is unglamorous specialist work, so modules go untested.
* Existing tests drift from module evolution, testing yesterday's interface.
* Teams lack a pattern for what to test: outputs, idempotency, downgrade, tagging, encryption settings.

**Why it matters:** Untested IaC turns every module change into a fleet-wide experiment — the exact opposite of what infrastructure-as-code promised.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Contract extraction | reads module inputs/outputs/lifecycle to derive what must hold true for consumers |
| Test synthesis | generates Terratest/OPA/Conftest cases: happy path, idempotency, tagging, encryption, downgrade safety |
| Incident-informed cases | adds regression tests from past incidents touching the module (idea 55's drift history) |
| Fixture management | generates minimal, cheap test fixtures (localstack, test accounts, short-lived resources) |
| Maintenance | updates tests when module interfaces evolve; deletes tests for dead paths |

## 💡 Proposed Solution

A test engineer for IaC: pointed at a module, it extracts the contract, drafts a test suite matched to consumer expectations and incident history, wires it into CI with cost-bounded fixtures, and keeps the suite current as the module changes. Output is ordinary test code in the module repo — no magic runtime, just tests your team owns.

### Workflow

1. **Analyze** — module contract: variables, outputs, resources, and consumer usage patterns
2. **Design** — test matrix: invariants, security posture, idempotency, upgrade/downgrade
3. **Generate** — test code + fixtures with cost and time bounds per run
4. **Wire** — CI integration with PR gating and scheduled full runs
5. **Maintain** — interface changes update tests; failures feed back as new cases

**Human-in-the-loop:** Generated tests are reviewed like code; the test matrix is confirmed with the module owner before CI gating is enabled.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Module contract analysis                           │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Test matrix design (with owner)                    │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Test + fixture generation                          │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ CI wiring (PR gate + schedule)                     │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Maintenance on interface change                    │
└────────────────────────────────────────────────────┘
```

## 🧠 AI Platforms

| Category | Options | Role in this idea |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 🔌 DevOps Integrations

| System / tool | Integration point |
| --- | --- |
| Terraform / OpenTofu / Terragrunt | module parsing and plan execution |
| Terratest / OPA / Conftest / tflint | test and check frameworks |
| LocalStack / test accounts | cheap fixtures |
| GitHub Actions / GitLab CI | gating and scheduling |

## 📥 Context & Data Sources

* `module source and history`
* `consumer stack usage`
* `past incidents and drift touching the module`
* `org conventions (tagging, encryption, naming)`
* `test-account constraints`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read tier: repos, module registries, incident history
* Write tier: PR creation for tests; test-account resources with strict teardown

## ✅ Expected Benefits

* Module changes verified by execution before touching consumers.
* Every fleet-wide module gets a real safety net, not just review.
* Incidents stop repeating: regression tests arrive with the fix.
* Test costs bounded by design: fixtures are cheap and always torn down.

## 🔒 Safety & Guardrails

* Generated tests must not become backdoors: they pass the same review and secret-scanning as product code.
* Test credentials are scoped to disposable accounts; teardown is mandatory and verified.
* Module analysis stays in-boundary; no proprietary module code leaves the environment.

## 🚀 Future Implementation

* Policy tests cross-wired with guardrails (idea 60): the same invariants checked twice.
* Consumer-driven contracts for infrastructure: stacks assert what they need from modules.
* Upgrade simulations: run the suite against provider version bumps automatically.

## 🔗 Related Ideas

- [03 · AI Terraform Reviewer](../03-ai-terraform-reviewer/README.md)
- [23 · AI IaC Security Analyzer](../23-ai-iac-security-analyzer/README.md)
- [21 · AI Terraform Plan Explainer](../21-ai-terraform-plan-explainer/README.md)
- [55 · AI Drift Detective](../55-ai-drift-detective/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
