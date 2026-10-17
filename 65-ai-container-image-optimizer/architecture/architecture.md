# AI Container Image Optimizer — Architecture

> Shrink, harden, and speed up container images automatically: layer analysis, base-image upgrades, and rebuild PRs — with size, CVE, and cache wins reported per build.

*Focus: 🔄 CI/CD · Status: 📐 Architecture documented · Part of the [DevOps AI Implementation Ideas](../../README.md) catalog.*

## 1. Overview

An image analyzer wired into CI: on each build it inspects the produced image (layers, packages, history), compares against available bases and prior builds, and where wins are found opens a refactor PR — multi-stage split, base upgrade, cache reordering — with measured before/after evidence. Works per-repo with org-wide reporting on the biggest aggregate offenders.

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────┐
│ Image inspection (layers · packages)               │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Base + layer comparison                            │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Refactor PR with evidence                          │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← before/after
┌────────────────────────────────────────────────────┐
│ CI validation + smoke tests                        │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Org-wide savings report                            │
└────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Responsibility |
| --- | --- |
| Image inspector | layer/file/package analysis plus registry metadata |
| Refactor planner | Dockerfile transformations validated by re-build |
| PR drafter | evidence-attached refactor PRs |
| Reporting | aggregate savings and offender leaderboard |

## 4. Data Flow

1. CI publishes the image; the inspector breaks it into layers and packages.
2. The planner matches the runtime against slimmer bases and missing optimizations.
3. A refactor PR lands with measured before/after: size, CVEs, build time.
4. Smoke tests guard runtime compatibility; the dashboard tracks org-wide savings.

## 5. Example Structured Output Schema

The model responds with a validated JSON payload conforming to a strict schema:

```json
{
  "image": "registry/orders-service:1.42.0",
  "current": {"size_mb": 1840, "layers": 22, "critical_cves": 6},
  "findings": [
    {"issue": "build toolchain in runtime layer", "bytes": 720000000, "fix": "multi-stage split"},
    {"issue": "base debian:11 -> distroless/base-nossl candidate", "delta": "-610 MB, -6 CVEs", "risk": "low (static go binary)"}
  ],
  "proposal": {"pr": "PR-183", "projected_size_mb": 512, "projected_cves": 0, "smoke": "required"}
}
```

## 6. AI Platform Mapping

The design is provider-agnostic; any layer can be swapped without touching the others.

| Category | Options | Role |
| --- | --- | --- |
| Cost-efficient model tiers | GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small | high-volume events (every failure, every alert) at a fraction of frontier cost |
| AI coding agents (human-invoked) | Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands | author the suggested fix as a reviewed pull request |
| AI observability & evaluation | Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo | tracing of every model and tool call, cost/latency tracking, prompt regression evals |
| Model routing & AI gateways | LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway | provider-agnostic routing with fallbacks, budgets, caching, and audit logs |

## 7. Context Building Strategy

The context builder assembles only what the model needs — fresh, relevant, and redacted — rather than dumping raw system output. Sources:

* `image layers, packages, and history`
* `Dockerfile and build context`
* `available base images and their CVE posture`
* `CI cache behavior`
* `runtime requirements from manifests`

## 8. Human-in-the-Loop & Approval

Refactors ship as PRs with CI evidence; runtime-compatibility smoke tests must pass before merge — the optimizer never force-pushes images.

## 9. Security Considerations

* Proposed bases are evaluated for provenance and maintenance health — shrinking an image must not mean trusting a random one.
* Analysis metadata stays internal: image inventories reveal stack details.
* PRs pass the same CI gates as human changes; no direct registry writes.

## 10. AI Observability

Every prompt, completion, and tool call is traced with OpenTelemetry GenAI conventions into Langfuse or Arize Phoenix: latency, token cost, retrieval hits, tool errors, and human accept/reject outcomes become the eval dataset that gates prompt and model changes (promptfoo regression suites run in CI before any prompt ships).

## 11. Deployment & Scaling

Start as a stateless service (or even a CLI) invoked by webhooks, schedules, or chat commands. Containerize it, give it read-only credentials scoped to one system, and only graduate to a long-running agent with an approval queue once precision is trusted.

## 12. Cost Considerations

Events are batch-shaped and bursts follow working hours, so spend is spiky but low. Mini/flash-class models typically handle triage at a fraction of a cent per event; a frontier model is reserved for the deep-analysis step, and an open-weight model via Ollama or vLLM can bring marginal cost to zero at the price of self-hosting.

## 13. Related Ideas

- [37 · AI Container Vulnerability Explainer](../../37-ai-container-vulnerability-explainer/README.md)
- [11 · AI Build Optimization Assistant](../../11-ai-build-optimization-assistant/README.md)
- [01 · AI Pipeline Failure Analyzer](../../01-ai-pipeline-failure-analyzer/README.md)
- [38 · AI Kubernetes Security Analyzer](../../38-ai-kubernetes-security-analyzer/README.md)
