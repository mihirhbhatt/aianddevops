# 52 · AI Flaky Test Detective

> Find the tests that fail for no reason — statistically, across pipeline history — explain why they flake, and propose quarantine or fixes.

![Area](https://img.shields.io/badge/Area-CI%2FCD-blue) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🔄 CI/CD |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | GitHub Actions / Jenkins / GitLab CI · Test frameworks (JUnit, pytest, go test) · CI retry policies · Slack / dashboards |

---

## 📌 Problem

Flaky tests poison trust in CI: engineers learn to hit 'retry' without reading, and real failures hide inside the noise they created.

* A flaky test fails intermittently; a single red run tells you almost nothing about whether the code or the test is at fault.
* Retries mask flakiness: green builds hide the fact that half the suite is a coin flip.
* Hunting flakiness manually means grepping pipeline history across weeks and correlating with timing, order, and runner noise.
* Quarantine policies are ad hoc: nobody remembers which tests are 'known flaky' or re-triages them.

**Why it matters:** Flaky tests waste retry-minutes at scale, train engineers to ignore red, and let genuine regressions slip through a suite nobody trusts.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Statistical detection | retry-aware failure-rate analysis across pipeline history separates flaky from broken |
| Failure clustering | groups the failing runs of one test and compares error signatures across failures |
| Cause hypothesis | correlates flakes with parallelism, timeouts, ordering, shared state, network, and runner pressure |
| Quarantine & fix drafting | opens a quarantine PR with evidence, or drafts the fix (explicit waits, isolation, seeds, timeouts) |
| Re-triage loop | tracks quarantined tests with expiries and retires or promotes them on evidence |

## 💡 Proposed Solution

A CI-side analyzer that ingests pipeline and test history (JUnit results, GitHub Actions/Jenkins/GitLab APIs), computes per-test flakiness scores, and — for the worst offenders — pulls failing runs' logs and diffs their error signatures to hypothesize the mechanism (shared state, race, timeout, environment). It proposes a path per test: quarantine with an expiry, a concrete fix PR, or an infra-level remedy (more runners, better isolation).

### Workflow

1. **Collect** — test results and logs across pipeline history, including retries
2. **Score** — per-test flakiness: failure rate, pass-after-retry rate, correlation with time/runner/branch
3. **Cluster** — group failing runs per test; compare error signatures across failures
4. **Diagnose** — hypothesize mechanism from signature diffs, timing, and resource data
5. **Act** — quarantine PR with evidence + expiry, fix PR draft, or infra recommendation; track to resolution

**Human-in-the-loop:** The detective never merges: quarantine and fix PRs are reviewed by test owners; re-triage reports keep quarantines honest and temporary.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Test history ingestion (with retries)              │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Flakiness scoring across runs                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Failure clustering + signature diff                │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Mechanism hypothesis (race · state · time)         │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Quarantine / fix PR + re-triage                    │
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
| GitHub Actions / Jenkins / GitLab CI | pipeline and test-result APIs |
| Test frameworks (JUnit, pytest, go test) | structured results, retries, timing |
| CI retry policies | retry semantics awareness in scoring |
| Slack / dashboards | weekly flakiness report per team |

## 📥 Context & Data Sources

* `per-test pass/fail history with retries`
* `failing-run logs and error signatures`
* `pipeline parallelism and runner metadata`
* `timing and resource metrics`
* `test ownership from CODEOWNERS`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: CI APIs, artifact stores, log storage
* Write tier: PR creation (quarantine/fix), issue filing

## ✅ Expected Benefits

* A ranked, costed list of what flakiness actually costs, per team.
* Quarantines with expiries instead of permanent skips.
* Real fixes for the top mechanisms: state leakage, races, timeouts.
* CI red becomes meaningful again.

## 🔒 Safety & Guardrails

* Test logs can embed secrets or customer data from fixtures: redact before model calls; prefer self-hosted models for raw logs.
* Quarantine is audited: skipping tests is a security-relevant action; every skip names an owner and an expiry.

## 🚀 Future Implementation

* Pre-merge flakiness check: flag PRs touching files with high-flakiness tests.
* Order-shuffle and repetition testing generated automatically for suspected state leaks.
* Org-wide flakiness budget per team with trend tracking.

## 🔗 Related Ideas

- [10 · AI Test Failure Analyzer](../10-ai-test-failure-analyzer/README.md)
- [01 · AI Pipeline Failure Analyzer](../01-ai-pipeline-failure-analyzer/README.md)
- [11 · AI Build Optimization Assistant](../11-ai-build-optimization-assistant/README.md)
- [07 · AI GitHub Actions Debugger](../07-ai-github-actions-debugger/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
