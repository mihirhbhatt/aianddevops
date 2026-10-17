# AI IaC Test Generator — Architecture

> Give your Terraform modules real tests: generated Terratest/OPA cases from module semantics and past incidents, running in CI like any other code.

*Focus: 🏗️ IaC · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

A test engineer for IaC: pointed at a module, it extracts the contract, drafts a test suite matched to consumer expectations and incident history, wires it into CI with cost-bounded fixtures, and keeps the suite current as the module changes. Output is ordinary test code in the module repo — no magic runtime, just tests your team owns.

## 2. High-Level Architecture

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

## 3. Components

| Component | Responsibility |
| --- | --- |
| Contract analyzer | module semantics and cross-stack consumer usage |
| Test synthesizer | framework-specific test code generation |
| Fixture provider | cost-bounded test environments and teardown guarantees |
| CI integrator | gating rules, scheduling, flake-quarantine hooks (idea 52) |

## 4. Data Flow

1. The analyzer reads the module and how consumers actually use it.
2. A test matrix is proposed: what must hold, what incidents taught, what's cheap to run.
3. Generated tests and fixtures land as reviewable code with CI wiring.
4. Module evolution updates the suite; new failure modes become new cases.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "module": "terraform-aws-s3-secure-bucket",
  "consumers": 23,
  "test_matrix": [
    {"case": "encryption + versioning defaults enforced", "framework": "terratest", "cost": "~$0.01/run"},
    {"case": "idempotent re-apply (no diff)", "framework": "terratest", "cost": "~$0.02/run"},
    {"case": "public-access block cannot be disabled", "framework": "opa/conftest"},
    {"case": "regression: INC-8102 tag propagation", "framework": "terratest", "source": "incident history"}
  ],
  "ci": {"pr_gate": "plan + opa + terratest@short", "schedule": "nightly full"},
  "generated_files": ["tests/module_test.go", "tests/fixtures/main.tf", "policies/opa/s3.rego"]
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `module source and history`
* `consumer stack usage`
* `past incidents and drift touching the module`
* `org conventions (tagging, encryption, naming)`
* `test-account constraints`

## 8. Human-in-the-Loop & Approval

Generated tests are reviewed like code; the test matrix is confirmed with the module owner before CI gating is enabled.

## 9. Security Considerations

* Generated tests must not become backdoors: they pass the same review and secret-scanning as product code.
* Test credentials are scoped to disposable accounts; teardown is mandatory and verified.
* Module analysis stays in-boundary; no proprietary module code leaves the environment.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Alternative Approaches

* Start OPA/Conftest-only (plan-time assertions) before full Terratest execution.
* Golden-module program: apply generation to the highest-consumption modules first.

## 14. Related Ideas

- [03 · AI Terraform Reviewer](../../03-ai-terraform-reviewer/README.md)
- [23 · AI IaC Security Analyzer](../../23-ai-iac-security-analyzer/README.md)
- [21 · AI Terraform Plan Explainer](../../21-ai-terraform-plan-explainer/README.md)
- [55 · AI Drift Detective](../../55-ai-drift-detective/README.md)
