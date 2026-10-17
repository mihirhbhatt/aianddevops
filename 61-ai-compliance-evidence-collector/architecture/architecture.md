# AI Compliance Evidence Collector — Architecture

> Continuously collect and map audit evidence from the systems themselves: SOC 2 / ISO 27001 / PCI controls proven by live configuration, not screenshots.

*Focus: 🔐 DevSecOps · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

An evidence pipeline that ingests your control framework, decomposes each control into technical checks across cloud, identity, CI/CD, and code systems, collects proof on schedule via read-only APIs, and maps results to a live compliance posture. Gaps file issues; passing evidence is packaged with provenance for auditors. Works alongside GRC tools rather than replacing them.

## 2. High-Level Architecture

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

## 3. Components

| Component | Responsibility |
| --- | --- |
| Control library | framework-to-check mappings, versioned and reviewable |
| Evidence collectors | read-only API integrations per system with provenance capture |
| Evaluation engine | code checks + LLM reasoning for controls that need interpretation |
| Evidence vault | timestamped artifacts, immutable, access-controlled |

## 4. Data Flow

1. Compliance loads the framework and maps controls to systems with the collector.
2. Scheduled runs gather live evidence instead of end-of-year screenshots.
3. Each control gets a verdict with the proving artifacts and a collection date.
4. Gaps become owned issues; auditors receive consistent, provenance-backed exports.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "framework": "SOC 2 Trust Services Criteria",
  "control": "CC6.1 - Logical access controls",
  "status": "satisfied",
  "evidence": [
    {"type": "iam_mfa_coverage", "source": "aws:iam:credential-report", "value": "187/188 users MFA-enabled", "collected": "2026-10-12T03:00Z"},
    {"type": "access_review", "source": "jira:ACCESS-2026-Q4", "value": "quarterly review completed", "collected": "2026-10-01"}
  ],
  "gaps": [],
  "last_checked": "2026-10-12T03:00Z"
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| Frontier cloud models | OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM | deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| RAG stack | pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3 | retrieval over runbooks, docs, wikis, past incidents, and changelogs |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `control framework definitions`
* `cloud and identity configuration`
* `CI/CD and repo settings`
* `change and incident records`
* `past audit artifacts`

## 8. Human-in-the-Loop & Approval

The collector proves and packages; humans (and auditors) judge. Control interpretations are reviewed with compliance before automation is trusted.

## 9. Security Considerations

* The collector reads sensitive security configuration: least-privilege read-only roles; evidence stored access-controlled and encrypted.
* Evidence packages may contain security-sensitive detail (vulns, network layout): share exports deliberately, redact where the framework allows.
* Control interpretations are auditable decisions: record which model, prompt, and human reviewed each mapping.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Scheduled weekly evidence collection across a handful of accounts is small-token work: checks run in code, and the model is consulted only for controls needing interpretation or artifact narration. Mini-class models cover the bulk.

## 13. Related Ideas

- [40 · AI Cloud Misconfiguration Analyzer](../../40-ai-cloud-misconfiguration-analyzer/README.md)
- [27 · AI IAM Policy Reviewer](../../27-ai-iam-policy-reviewer/README.md)
- [59 · AI Vulnerability Triage Assistant](../../59-ai-vulnerability-triage-assistant/README.md)
- [60 · AI Platform Guardrail Generator](../../60-ai-platform-guardrail-generator/README.md)
