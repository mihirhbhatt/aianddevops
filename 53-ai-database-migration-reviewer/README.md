# 53 · AI Database Migration Reviewer

> Review every schema migration before it ships: lock risk, backward compatibility, data loss, and a rehearsed backout plan.

![Area](https://img.shields.io/badge/Area-CI%2FCD-blue) ![Status](https://img.shields.io/badge/Status-Architecture%20Documented-orange) ![Complexity](https://img.shields.io/badge/Complexity-Medium-lightgrey) ![Automation](https://img.shields.io/badge/Automation-Assistive-informational)

| | |
| --- | --- |
| **Focus area** | 🔄 CI/CD |
| **Complexity to prototype** | Medium |
| **Automation level** | Assistive |
| **Primary integrations** | GitHub / GitLab · PostgreSQL / MySQL / SQL Server · Alembic / Flyway / Liquibase / Prisma · ORMs & schema registries |

---

## 📌 Problem

Schema migrations are the deployments most likely to cause an outage, yet they get less review than a CSS change — locks, backfills, and ordering problems don't show up in a unit test.

* A migration that is instant on a dev table takes an exclusive lock on a 500M-row production table.
* Breaking changes (dropped columns, narrowed types, renamed fields) fail at runtime in old code still being deployed.
* Migrations and application deploys are ordered wrong: the new code ships before its column exists.
* Backout plans are wishful thinking: 'down' migrations rarely survive contact with real data.

**Why it matters:** One bad migration can lock the primary write path for minutes, and the rollback may be worse than the deploy — this is where review leverage is highest.

## 🤖 AI Opportunity

| AI capability | How it helps here |
| --- | --- |
| Lock & duration modeling | estimates lock semantics (online DDL, CONCURRENTLY, pt-osc) against real table sizes to predict blocking |
| Compatibility analysis | expand-contract checking: will the currently deployed code still run after this migration? |
| Data-loss detection | flags destructive operations with the exact data at risk |
| Backout drafting | writes a realistic backout plan — or names the point of no return — before approval |
| Deploy-order guidance | sequences migrations against app deploys and feature flags |

## 💡 Proposed Solution

A PR-facing reviewer for migration files (SQL, Alembic, Flyway, Liquibase, Prisma, Rails): it parses the migration, queries read-only metadata about production table sizes and indexes, and returns a risk report — blocking estimate, compatibility with the currently deployed version, destructiveness, and a backout sketch — as PR comments. It learns your patterns: expand-contract discipline, lock-timeout usage, batched backfills.

### Workflow

1. **Parse** — read the migration diff and dialect; identify DDL/DML and targets
2. **Ground** — fetch table sizes, row counts, and index usage from prod metadata (read-only)
3. **Analyze** — lock/duration estimate, compatibility with deployed code, data-loss scan
4. **Report** — PR review comments with severity, evidence, and required mitigations
5. **Plan** — attach backout plan and deploy-order recommendation to the release checklist

**Human-in-the-loop:** Advisory by default: the reviewer blocks nothing itself, but protected paths can require a named migration owner to sign off on high-risk items.

## 🏗️ Architecture

Full component breakdown, data flow, and platform mapping: [`architecture/architecture.md`](architecture/architecture.md).

```text
┌────────────────────────────────────────────────────┐
│ Migration diff from pull request                   │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Prod metadata grounding (read-only)                │
└────────────────────────────────────────────────────┘
                          │
                          ▼  ← sizes · locks · indexes
┌────────────────────────────────────────────────────┐
│ Risk analysis: locks · compat · loss               │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ PR review comments + severity                      │
└────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────┐
│ Backout plan + deploy-order guidance               │
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
| GitHub / GitLab | PR comments and checks |
| PostgreSQL / MySQL / SQL Server | read-only metadata and lock semantics |
| Alembic / Flyway / Liquibase / Prisma | migration frameworks |
| ORMs & schema registries | code-side usage of changed columns |
| Slack | release-checklist notifications |

## 📥 Context & Data Sources

* `migration diff and dialect`
* `table sizes, row counts, indexes`
* `currently deployed app version's expectations`
* `migration history and conventions`
* `replication topology`

## 🛠️ Tools the AI May Call

Exposed to the model with scoped, read-first permissions:

* Read-only: information_schema, pg_stat, cloud DB catalogs, repo code (column usage)
* Write tier: PR comments and check results only

## ✅ Expected Benefits

* Blocking and data-loss risks surfaced before merge, not at 2am.
* Expand-contract discipline enforced gently and consistently.
* Backout plans written while the data still exists to write about.
* Fewer migration-induced outages and freeze-window panics.

## 🔒 Safety & Guardrails

* Metadata access is read-only and least-privileged; no table data leaves the database — only schema statistics.
* Schema names and comments can be sensitive: redact or use self-hosted models if required.
* Findings are advisory; enforcement happens through required reviews, not secret gates.

## 🚀 Future Implementation

* Shadow-run migrations against a sized-down clone to measure actual duration.
* Migration rehearsal in CI with anonymized prod-shaped data.
* Cross-service impact map: which other services read this table or column.

## 🔗 Related Ideas

- [45 · AI Pull Request Infrastructure Reviewer](../45-ai-pull-request-infrastructure-reviewer/README.md)
- [03 · AI Terraform Reviewer](../03-ai-terraform-reviewer/README.md)
- [21 · AI Terraform Plan Explainer](../21-ai-terraform-plan-explainer/README.md)
- [12 · AI Deployment Troubleshooting Agent](../12-ai-deployment-troubleshooting-agent/README.md)

---

*Status: 📐 Architecture documented — no implementation code yet. See the [idea catalog](../README.md#-idea-catalog) for all ideas.*
