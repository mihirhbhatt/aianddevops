window.IDEAS = [
  {
    "num": 1,
    "slug": "ai-pipeline-failure-analyzer",
    "name": "AI Pipeline Failure Analyzer",
    "area": "CI/CD",
    "tldr": "Turn every failed CI/CD job into an instant, context-rich diagnosis: what broke, why, and how to fix it.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "When a pipeline fails, the engineer who owns the change has to become a log archaeologist before they can even start fixing the problem.",
    "problem": [
      "Failed-job logs span many steps, and the real error is buried in thousands of lines of compiler, test, and infrastructure noise.",
      "The context needed to understand a failure (commit diff, dependency changes, recent history) lives in several systems that must be opened one by one.",
      "The same failures recur across teams because nobody has time to write up what happened last time.",
      "Reviewers and on-call engineers get pinged into failures that a glance at the right three lines would have resolved."
    ],
    "impact": "Every red pipeline blocks a merge and burns 20-60 minutes of engineer time; across an organization this is one of the largest single sources of DevOps toil.",
    "capabilities": [
      [
        "Log triage & summarization",
        "reads thousands of log lines and extracts the 5-10 lines that actually describe the failure"
      ],
      [
        "Error classification",
        "labels the failure (build, test, dependency, infra, flaky, quota, timeout) so it can be routed and counted"
      ],
      [
        "Root-cause reasoning",
        "correlates the error with the commit diff, dependency lockfile, and past failures to explain why it happened now"
      ],
      [
        "Fix recommendation",
        "proposes the specific change, command, or config edit most likely to resolve it"
      ],
      [
        "Known-failure deduplication",
        "retrieves similar past failures and their resolutions before generating a new analysis"
      ]
    ],
    "solution": "A webhook-driven analyzer listens for pipeline failure events, collects the failed job's logs plus repo context (commit diff, changed files, dependency state), and sends a compact, structured package to an LLM. The model returns a structured diagnosis — failure type, root cause, evidence, suggested fix — which is posted as a PR comment and Slack message with links back to the exact log lines.",
    "steps": [
      [
        "Detect",
        "a `check_run` / webhook event or Jenkins / GitLab CI poller notices a failed job"
      ],
      [
        "Collect",
        "fetch the failed step logs, job metadata, commit SHA, and diff"
      ],
      [
        "Build context",
        "pull the files at that commit, dependency lockfile changes, and the 3 most similar past failures from the retrieval store"
      ],
      [
        "Analyze",
        "send a redacted, size-capped context package to the model with a strict output schema"
      ],
      [
        "Classify & dedupe",
        "label the failure type and mark known/flaky patterns instead of re-analyzing"
      ],
      [
        "Report",
        "post cause + evidence + suggested fix as a PR comment and Slack thread with deep links to log lines"
      ],
      [
        "Learn",
        "store the diagnosis and whether the human accepted it, feeding future retrieval and evals"
      ]
    ],
    "hitl": "Read-only by design: the analyzer never retries pipelines or edits files. It suggests; the engineer decides whether to re-run, revert, or fix.",
    "components": [
      [
        "Webhook listener",
        "receives failure events from GitHub Actions, Jenkins, GitLab CI, or CircleCI and normalizes them"
      ],
      [
        "Log collector",
        "fetches failed-step logs and truncates around error signatures; redacts secrets before anything leaves the cluster"
      ],
      [
        "Context builder",
        "assembles commit diff, file contents at the failed commit, dependency changes, and build history"
      ],
      [
        "Retrieval store",
        "vector DB of past failures and resolutions for similarity lookup"
      ],
      [
        "LLM runtime",
        "structured-output call returning failure type, root cause, evidence, and fix suggestion"
      ],
      [
        "Reporter",
        "posts to PR checks/comments and Slack; links every claim to source log lines"
      ],
      [
        "Feedback store",
        "records whether humans accepted the diagnosis; powers evals and dedup"
      ]
    ],
    "flow": [
      "CI/CD posts a failure webhook to the analyzer service.",
      "Collector pulls logs for the failed jobs and applies secret redaction and size caps.",
      "Context builder enriches with the commit diff, changed files, lockfile, and similar past failures from the vector store.",
      "The LLM returns a schema-validated JSON diagnosis; validation failures trigger one retry with a cheaper fallback model.",
      "The reporter publishes the diagnosis to the PR and Slack, with deep links to the exact evidence lines.",
      "Human feedback (helpful / wrong / flaky) is written back to the store for evals and future retrieval."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub Actions",
        "webhooks + Checks API; PR comment via the GitHub API"
      ],
      [
        "Jenkins",
        "REST API / plugin for job logs and stage results"
      ],
      [
        "GitLab CI",
        "pipeline webhooks and job trace endpoints"
      ],
      [
        "Slack / Teams",
        "failure notifications with diagnosis cards"
      ],
      [
        "Jira / Linear",
        "optional: auto-create tickets for recurring failures"
      ]
    ],
    "context": [
      "failed job logs",
      "step timings and exit codes",
      "commit diff and message",
      "dependency lockfile changes",
      "build environment and runner metadata",
      "past similar failures",
      "flaky-test registry"
    ],
    "tools": [
      "GitHub / GitLab / Jenkins REST APIs (read commits, logs, check runs) — read-only token"
    ],
    "benefits": [
      "Minutes-to-diagnosis instead of 30-60 minutes of manual log reading per failure.",
      "Consistent failure taxonomy across teams, making chronic problems visible in dashboards.",
      "Flaky and infrastructure failures get auto-labeled and don't interrupt the author.",
      "Every diagnosis links to evidence, so engineers verify instead of trust blindly."
    ],
    "security": [
      "Redact secrets, tokens, and internal hostnames from logs before any model call; prefer a local model for the most sensitive repos.",
      "Use a read-only, least-privilege GitHub token; the analyzer can never trigger rebuilds or edit code.",
      "Allowlist which repositories enable analysis; keep an audit log of every model call with repo, SHA, and cost."
    ],
    "future": [
      "One-click 'generate fix PR' using a coding agent, still gated on human review.",
      "Automatic flaky-test quarantine and retry policies for classified-flaky failures.",
      "Cross-pipeline correlation: detect that multiple services started failing after the same shared-library release.",
      "Weekly report: top failure causes, mean-time-to-diagnosis trend, and estimated time saved."
    ],
    "related": [
      {
        "num": 10,
        "name": "AI Test Failure Analyzer",
        "slug": "ai-test-failure-analyzer"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      },
      {
        "num": 4,
        "name": "AI Log Analyzer",
        "slug": "ai-log-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ CI/CD system (Actions · Jenkins · GitLab)          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← failure webhook\n┌────────────────────────────────────────────────────┐\n│ Pipeline failure event                             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Log & metadata collector                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← redaction applied\n┌────────────────────────────────────────────────────┐\n│ Context builder (diff · deps · history)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ AI model / agent                                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← structured output schema\n┌────────────────────────────────────────────────────┐\n│ Root cause + suggested fix                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ PR comment · Slack · dashboard                     │\n└────────────────────────────────────────────────────┘",
    "cost": "Volume equals your failure rate — typically tens to a few hundred events per day organization-wide. Mini/flash-class models handle triage for well under a cent per event; reserve the frontier model for the initial deep-analysis pass or complex repos only.",
    "schema": "{\n  \"failure_type\": \"build | test | dependency | infrastructure | timeout | flaky\",\n  \"root_cause\": \"Detailed explanation of why the failure occurred in this specific run\",\n  \"evidence\": [\n    {\n      \"step\": \"build-container\",\n      \"line_number\": 412,\n      \"log_snippet\": \"error TS2322: Type 'string' is not assignable to type 'number'\"\n    }\n  ],\n  \"correlated_diff\": {\n    \"file\": \"src/types/api.ts\",\n    \"commit\": \"a1b2c3d\",\n    \"change_summary\": \"Changed paymentId field definition from number to string\"\n  },\n  \"suggested_fix\": {\n    \"action\": \"code_change\",\n    \"description\": \"Cast paymentId or update caller contract in src/services/checkout.ts line 45\",\n    \"command_or_snippet\": \"const id = Number(data.paymentId);\"\n  },\n  \"confidence_score\": 0.95\n}"
  },
  {
    "num": 2,
    "slug": "ai-kubernetes-troubleshooter",
    "name": "AI Kubernetes Troubleshooter",
    "area": "Kubernetes",
    "tldr": "Investigate unhealthy workloads automatically: collect events, logs, and pod state, then explain the failure and the fix in plain language.",
    "complexity": "Medium",
    "automation": "Supervised automation",
    "problem_intro": "Kubernetes failures arrive as cryptic exit codes, probe timeouts, and OOM kills, and debugging requires stitching together events, logs, spec changes, and cluster context under time pressure.",
    "problem": [
      "`CrashLoopBackOff`, `OOMKilled`, `ImagePullBackOff`, and probe failures each have many distinct root causes that require experience to separate.",
      "The evidence is scattered: pod events, container logs, resource requests vs. usage, recent deploys, node conditions, and Helm/Kustomize diffs.",
      "Junior engineers don't know which commands are safe to run in production; senior engineers spend their day running them for everyone.",
      "Alert tools flag the symptom (pod restarting) but never the cause (bad config released an hour ago)."
    ],
    "impact": "Kubernetes troubleshooting is the single most common on-call time sink in cloud-native teams, and the same class of misconfiguration recurs weekly.",
    "capabilities": [
      [
        "Symptom classification",
        "maps pod state, exit codes, and events to a ranked list of likely causes"
      ],
      [
        "Cluster-state reasoning",
        "correlates workload spec, resource usage, node pressure, and recent rollouts into one explanation"
      ],
      [
        "Guided investigation",
        "decides which next command (logs, describe, get events) would discriminate between hypotheses and requests it"
      ],
      [
        "Plain-language explanation",
        "produces a diagnosis a junior engineer can act on, with the evidence attached"
      ],
      [
        "Safe remediation drafting",
        "writes the kubectl patch or manifest change, always via dry-run and human approval"
      ]
    ],
    "solution": "A troubleshooting service (or in-cluster agent) watches for unhealthy workloads and alert triggers. It collects pod specs, events, container logs, and resource metrics; optionally uses proven open-source analyzers (K8sGPT, HolmesGPT) for triage; then an LLM agent reasons over the package and returns a diagnosis with a proposed fix. Interactive mode lets engineers ask follow-up questions in Slack or the terminal, with every tool call executed through a read-scoped Kubernetes RBAC identity.",
    "steps": [
      [
        "Trigger",
        "alert fires, or a workload enters an unhealthy state (CrashLoop, high restarts, probe failures)"
      ],
      [
        "Collect",
        "gather pod spec, events, last logs, owner references (Deployment/Helm), and node conditions"
      ],
      [
        "Enrich",
        "add recent rollout history, resource metrics vs. requests/limits, and related ConfigMaps/Secrets existence"
      ],
      [
        "Investigate",
        "agent loop: form hypotheses, request targeted reads (logs of the previous container, node status) via MCP tools"
      ],
      [
        "Diagnose",
        "produce ranked causes with evidence and a concrete fix (patch, limits change, rollback)"
      ],
      [
        "Propose",
        "offer the fix as a dry-run validated command or a GitOps PR — never applied directly"
      ],
      [
        "Close the loop",
        "record what was accepted; recurring patterns feed a known-issues knowledge base"
      ]
    ],
    "hitl": "Diagnosis is automatic; every change goes through approval. The agent proposes kubectl commands that are shown with `--dry-run=server` output, or a GitOps PR, and a human applies them.",
    "components": [
      [
        "Trigger listener",
        "Prometheus/Alertmanager webhooks and a workload-state watcher for CrashLoops and probe failures"
      ],
      [
        "Evidence collector",
        "kubernetes client fetching specs, events, logs, owner chains, and resource metrics"
      ],
      [
        "Analyzer plugins",
        "optional K8sGPT analyzers and HolmesGPT runbooks for well-known failure classes"
      ],
      [
        "Agent runtime",
        "LangGraph/OpenAI Agents SDK loop with MCP `kubernetes` tools, scoped to read-only verbs"
      ],
      [
        "Diagnosis engine",
        "LLM producing ranked root causes, each tied to concrete evidence objects"
      ],
      [
        "Remediation drafter",
        "emits kubectl patches, manifest diffs, or GitOps PR content; validates with server dry-run"
      ],
      [
        "Chat interface",
        "Slack bot and `kubectl ai`-style CLI for follow-up questions"
      ],
      [
        "Knowledge base",
        "confirmed diagnoses indexed for retrieval next time"
      ]
    ],
    "flow": [
      "An alert or workload watcher identifies a struggling resource and opens an investigation.",
      "The collector snapshots pod spec, events, logs, owner resources, and node state through a read-only service account.",
      "The agent forms hypotheses and makes targeted tool calls (previous-container logs, node describe, PVC status) until evidence is sufficient.",
      "The LLM produces a ranked diagnosis with evidence links and a proposed fix.",
      "The fix is validated with `--dry-run=server` and offered as a command or GitOps pull request.",
      "The engineer approves or rejects; the outcome is stored for retrieval and evaluation."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kubernetes API",
        "read-only service account (get/list/watch pods, events, deployments, nodes)"
      ],
      [
        "Prometheus / Alertmanager",
        "alert webhooks as investigation triggers"
      ],
      [
        "Grafana / Loki",
        "metrics snapshots and log context via the Grafana MCP server"
      ],
      [
        "Argo CD / Flux",
        "fix proposals become GitOps PRs against the manifests repo"
      ],
      [
        "Slack / Teams",
        "interactive investigation threads"
      ]
    ],
    "context": [
      "pod spec and status",
      "recent events",
      "container logs (current + previous)",
      "resource requests vs. usage",
      "rollout and Helm revision history",
      "node conditions",
      "related ConfigMaps/Secrets"
    ],
    "tools": [
      "kubernetes MCP tools (read-only: get, logs, describe, top)",
      "Grafana MCP (dashboards, Loki logs)",
      "GitHub MCP (open GitOps PR)"
    ],
    "benefits": [
      "First-line triage before a human is paged; many incidents die before they become tickets.",
      "Consistent expertise: every engineer gets senior-SRE-quality first analysis.",
      "Safer debugging: investigations run under read-only RBAC instead of ad-hoc kubectl from laptops.",
      "A growing, searchable knowledge base of confirmed diagnoses for your specific clusters."
    ],
    "security": [
      "Run the agent under a dedicated service account with read-only verbs; never bind cluster-admin.",
      "Scrub Secret contents and sensitive annotations from all context; log redaction at the collector boundary.",
      "Allowlist namespaces and clusters the agent may investigate; per-tenant audit trail of every API call the model made.",
      "For regulated clusters, run the model locally (Ollama/vLLM) so pod data never leaves the network."
    ],
    "future": [
      "Supervised auto-remediation for pre-approved playbooks (restart stuck rollout, bump memory limit) with an approval queue.",
      "Multi-cluster rollout of the same diagnosis capability via kagent-style agent control planes.",
      "Proactive mode: detect misconfigurations (missing requests, probe mismatches) before they cause incidents."
    ],
    "related": [
      {
        "num": 13,
        "name": "AI Pod Crash Analyzer",
        "slug": "ai-pod-crash-analyzer"
      },
      {
        "num": 17,
        "name": "AI Kubernetes Incident Investigator",
        "slug": "ai-kubernetes-incident-investigator"
      },
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Alert / unhealthy workload trigger                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Kubernetes API (events · logs · specs)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-scoped RBAC\n┌────────────────────────────────────────────────────┐\n│ Evidence collector + K8sGPT/HolmesGPT              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ AI agent (hypothesis → tool → refine)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← MCP kubernetes tools\n┌────────────────────────────────────────────────────┐\n│ Diagnosis + ranked causes                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Fix proposal (dry-run / GitOps PR)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← human approval\n┌────────────────────────────────────────────────────┐\n│ Engineer applies · knowledge base updated          │\n└────────────────────────────────────────────────────┘",
    "cost": "Investigations are event-driven (alerts, crash loops). A typical investigation is 5-15 tool calls plus one or two reasoning calls — cents with cloud models, free with self-hosted open-weight models.",
    "variations": [
      "Buy: deploy K8sGPT or HolmesGPT directly and skip custom plumbing; build custom only for org-specific context.",
      "In-cluster operator vs. external service: in-cluster has direct API access; external keeps model traffic off-cluster.",
      "CLI-first (`kubectl ai`-style) instead of chat — same evidence pipeline, developer-invoked."
    ],
    "schema": "{\n  \"workload\": {\n    \"namespace\": \"production\",\n    \"kind\": \"Deployment\",\n    \"name\": \"payment-service\"\n  },\n  \"status_summary\": \"CrashLoopBackOff (exit code 137 - OOMKilled)\",\n  \"ranked_causes\": [\n    {\n      \"rank\": 1,\n      \"hypothesis\": \"Container exceeded 512Mi memory limit during JVM heap initialization\",\n      \"confidence\": 0.94,\n      \"evidence\": \"Pod status terminated reason: OOMKilled, restart count: 8 within 15 minutes\"\n    }\n  ],\n  \"remediation\": {\n    \"type\": \"manifest_patch\",\n    \"safe_dry_run_command\": \"kubectl patch deployment payment-service -n production --patch '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"app\",\"resources\":{\"limits\":{\"memory\":\"1Gi\"}}}]}}}}' --dry-run=server\",\n    \"gitops_pull_request\": {\n      \"repo\": \"infra/k8s-manifests\",\n      \"file\": \"apps/payment-service/values.yaml\",\n      \"diff\": \"- resources.limits.memory: 512Mi\\n+ resources.limits.memory: 1Gi\"\n    }\n  }\n}"
  },
  {
    "num": 3,
    "slug": "ai-terraform-reviewer",
    "name": "AI Terraform Reviewer",
    "area": "IaC",
    "tldr": "Review every Terraform pull request like a senior platform engineer: safety, cost, conventions, and drift risk explained line by line.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Terraform changes are small diffs with enormous blast radius, and the humans reviewing them rarely have the full picture of what a plan will actually do in the cloud account.",
    "problem": [
      "PRs show `.tf` diffs, but reviewers must mentally execute `terraform plan` to know what changes in real infrastructure.",
      "Security groups, IAM changes, deletions, and replacements hide inside plan output that nobody reads carefully.",
      "Static scanners (tfsec, Checkov) produce findings that lack business context, so they get ignored or blanket-suppressed.",
      "Org conventions (naming, tagging, module usage) live in wikis and tribal memory instead of the review loop."
    ],
    "impact": "A single unnoticed Terraform mistake can expose a database, delete a volume, or double a bill; review quality is the last line of defense.",
    "capabilities": [
      [
        "Plan interpretation",
        "translates `terraform show -json` plans into human summaries: what is created, replaced, destroyed, and why"
      ],
      [
        "Risk assessment",
        "flags destructive actions, public exposure, IAM broadening, and tagged-for-deletion resources with severity"
      ],
      [
        "Convention checking",
        "compares the change against org standards (modules, naming, tagging) retrieved from a knowledge base"
      ],
      [
        "Cost reasoning",
        "combines Infracost-style estimates with the plan to explain the monthly cost impact of the change"
      ],
      [
        "Actionable comments",
        "posts inline PR comments with suggested corrected HCL"
      ]
    ],
    "solution": "On every PR touching `.tf` files, the reviewer runs a speculative plan in an ephemeral runner, parses the JSON plan, fetches scanner findings and cost estimates, and hands the package to an LLM that writes a structured review: summary, risk items, convention violations, and inline HCL suggestions. Managed alternatives (CodeRabbit, Greptile, Qodo) can cover the generic-review layer, with this custom pass adding Terraform-plan-specific depth.",
    "steps": [
      [
        "Trigger",
        "PR opened/updated with `.tf` changes"
      ],
      [
        "Plan",
        "run `terraform plan` against a sandbox workspace using short-lived cloud credentials"
      ],
      [
        "Parse",
        "extract resource actions, attribute diffs, and unknown values from the JSON plan"
      ],
      [
        "Enrich",
        "add scanner findings (Checkov/tfsec/KICS), Infracost estimate, and org conventions from RAG"
      ],
      [
        "Review",
        "LLM produces structured review with severities and suggested HCL"
      ],
      [
        "Publish",
        "post the summary as a PR comment and inline annotations; block merge on critical items"
      ],
      [
        "Track",
        "log which findings humans dismissed to tune noise over time"
      ]
    ],
    "hitl": "The reviewer only comments and (optionally) labels. Apply and merge remain human decisions guarded by CODEOWNERS; 'critical' findings are advisory blocks, not hard locks, until the team builds trust.",
    "components": [
      [
        "PR trigger",
        "GitHub/GitLab webhook filtering `.tf` paths"
      ],
      [
        "Plan runner",
        "ephemeral CI job: `init`, `plan -out`, `show -json` with scoped credentials and no apply rights"
      ],
      [
        "Plan parser",
        "converts JSON plan into per-resource action summaries and attribute-level diffs"
      ],
      [
        "Enrichment layer",
        "scanner results, Infracost estimates, policy (OPA) results, org conventions via retrieval"
      ],
      [
        "LLM reviewer",
        "produces structured review JSON: risks, conventions, cost notes, suggested HCL"
      ],
      [
        "PR publisher",
        "summary comment + line-anchored annotations via the VCS API"
      ],
      [
        "Feedback loop",
        "dismissed-finding tracking to reduce false positives"
      ]
    ],
    "flow": [
      "A PR webhook triggers an ephemeral plan job with no apply permissions.",
      "The parser turns the plan JSON into a compact per-resource change summary (create/replace/delete + attribute diffs).",
      "Scanner and cost data plus org conventions are attached as structured context.",
      "The LLM returns a severity-ranked review; every claim references a specific resource and attribute.",
      "Comments are posted inline; a risk badge (none/minor/critical) is set on the PR.",
      "Reviewer feedback is recorded and used to calibrate future noise."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Managed AI code reviewers",
        "CodeRabbit · Greptile · Qodo · Graphite · GitLab Duo",
        "buy-instead-of-build option for PR-facing analysis"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "webhooks, PR comments, check runs, branch protection"
      ],
      [
        "Terraform / OpenTofu CLI",
        "speculative plans in CI (Atlantis-style)"
      ],
      [
        "Checkov · tfsec · KICS",
        "security findings passed as context"
      ],
      [
        "Infracost",
        "cost deltas per resource"
      ],
      [
        "OPA / Sentinel",
        "policy decisions the LLM explains rather than re-implements"
      ],
      [
        "Terraform Cloud / Spacelift / env0",
        "alternative: consume their plan APIs instead of self-running"
      ]
    ],
    "context": [
      "terraform plan JSON",
      "Terraform file (.tf) diff",
      "module source and registry metadata",
      "scanner findings",
      "cost estimates",
      "org conventions (naming, tagging, module policy)"
    ],
    "tools": [
      "VCS PR API (comments, checks)",
      "Terraform plan output (read-only)",
      "Optional: cloud pricing APIs"
    ],
    "benefits": [
      "Reviewers see real infrastructure impact, not just HCL diffs.",
      "Destructive and high-risk actions are systematically flagged instead of occasionally caught.",
      "Conventions are enforced where they change behavior — in review, not in a wiki.",
      "Faster review cycles: the boring 80% is pre-analyzed before a human looks."
    ],
    "security": [
      "Plan jobs use short-lived, read-mostly cloud credentials and can never apply.",
      "State and plan data can contain secret values (sensitive attributes); keep plan processing inside your boundary and prefer self-hosted models for regulated accounts.",
      "The LLM output is advisory: never let review comments alone unlock anything; keep policy-as-code as the hard gate.",
      "Log every plan context package sent to external providers, with a size cap and redaction pass."
    ],
    "future": [
      "Auto-suggest corrected HCL as a PR patch (apply suggestion button).",
      "Drift detective: explain planned-vs-actual drift using state history.",
      "Module upgrade advisor: translate deprecated provider syntax across a fleet of repos.",
      "Tighten into a hard gate once false-positive rate is measured and acceptable."
    ],
    "related": [
      {
        "num": 21,
        "name": "AI Terraform Plan Explainer",
        "slug": "ai-terraform-plan-explainer"
      },
      {
        "num": 23,
        "name": "AI IaC Security Analyzer",
        "slug": "ai-iac-security-analyzer"
      },
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ PR touching .tf files                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Speculative terraform plan                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← sandbox creds\n┌────────────────────────────────────────────────────┐\n│ Plan JSON parser + scanners                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Conventions & cost enrichment                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← RAG\n┌────────────────────────────────────────────────────┐\n│ AI reviewer (structured output)                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Inline PR comments + risk summary                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human merge decision                               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"summary\": \"1 created, 1 replaced, 0 destroyed. Replaces primary production RDS replica.\",\n  \"blast_radius_rating\": \"high\",\n  \"destructive_actions\": [\n    {\n      \"resource\": \"aws_db_instance.replica\",\n      \"action\": \"replace\",\n      \"trigger_attribute\": \"instance_class\",\n      \"requires_downtime\": true,\n      \"warning\": \"Replacing db instance requires dropping active connections and 5-10m cutover.\"\n    }\n  ],\n  \"security_findings\": [\n    {\n      \"rule\": \"CKV_AWS_118\",\n      \"severity\": \"medium\",\n      \"resource\": \"aws_security_group_rule.ingress_postgres\",\n      \"finding\": \"CIDR block 0.0.0.0/0 allows open internet access to port 5432\"\n    }\n  ],\n  \"estimated_cost_delta\": {\n    \"monthly_increase_usd\": 74.50,\n    \"primary_driver\": \"db.m5.large -> db.m5.xlarge\"\n  },\n  \"convention_violations\": [\n    \"Missing mandatory tags: 'CostCenter', 'Environment'\"\n  ]\n}"
  },
  {
    "num": 4,
    "slug": "ai-log-analyzer",
    "name": "AI Log Analyzer",
    "area": "Observability & SRE",
    "tldr": "Ask questions of your logs in plain language and get explained, evidence-linked answers instead of query gymnastics.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Logs hold the answer to almost every operational question, but extracting it requires query-language fluency, knowledge of log structure per service, and patience for volume.",
    "problem": [
      "Each team's logs have different shapes, fields, and quality; cross-service investigation means learning several query dialects (LogQL, Lucene, SQL).",
      "During incidents, engineers drown in volume and miss the few lines that matter.",
      "Recurring error patterns are never summarized, so the same noisy log lines get re-read every week.",
      "Dashboards show counts, not causes."
    ],
    "impact": "Log investigation is the first or second step of nearly every incident and support escalation; shaving 15 minutes off each lookup compounds across the whole org.",
    "capabilities": [
      [
        "Natural-language querying",
        "translates 'why are checkout payments failing since 10am?' into LogQL/Lucene/SQL with the right time range and filters"
      ],
      [
        "Pattern clustering",
        "groups raw lines into templates (drain-style parsing) so the model reasons over patterns, not millions of lines"
      ],
      [
        "Anomaly explanation",
        "compares the query window against baseline to say what changed — new error, new volume, new field values"
      ],
      [
        "Evidence-linked summarization",
        "returns a short narrative with links to representative log entries and a reusable query"
      ],
      [
        "Cross-service correlation",
        "joins related log streams by trace ID or request ID when investigating multi-service flows"
      ]
    ],
    "solution": "A log analysis service sits between engineers (or the alert pipeline) and the log store. It first narrows scope — service, time window, template clustering — then retrieves a compact, representative sample and metadata, and lets an LLM answer the question with a generated query, a summary, and deep links. The generated query is always shown so humans can verify and rerun it themselves.",
    "steps": [
      [
        "Receive question",
        "Slack thread, Grafana panel drill-down, or alert annotation"
      ],
      [
        "Scope",
        "resolve services, time window, and index/label constraints from the question and catalog metadata"
      ],
      [
        "Reduce",
        "template-cluster the matching logs; keep representative samples and per-pattern counts"
      ],
      [
        "Query",
        "generate a store-native query (LogQL/Lucene/SQL), execute it, attach results"
      ],
      [
        "Answer",
        "LLM writes the explanation with evidence links and the query used"
      ],
      [
        "Verify",
        "human can rerun/adjust the query; thumbs-up/down feeds evals"
      ]
    ],
    "hitl": "Pure read-and-explain. Generated queries are displayed before execution in interactive mode, and the service has read-only credentials to the log stores.",
    "components": [
      [
        "Query front end",
        "Slack bot, CLI, and Grafana data-source panel integration"
      ],
      [
        "Scope resolver",
        "maps fuzzy service names to indices/labels via the service catalog"
      ],
      [
        "Reducer",
        "log template clustering (drain3-style), sampling, and count aggregation to fit context limits"
      ],
      [
        "Query executor",
        "read-only client for Loki, Elasticsearch/OpenSearch, CloudWatch Logs, or Azure Monitor"
      ],
      [
        "LLM analyzer",
        "pattern/anomaly reasoning with strict 'cite log IDs' grounding"
      ],
      [
        "Citation layer",
        "deep links to the exact log entries in Grafana/Kibana"
      ]
    ],
    "flow": [
      "A question arrives with an implicit or explicit time window.",
      "The resolver maps services to log sources and labels using catalog metadata.",
      "The reducer collapses raw volume into templates and representative samples.",
      "A generated query pulls the precise window; results are summarized with per-pattern counts and anomalies.",
      "The answer is posted with evidence links and the reusable query.",
      "Feedback and query outcomes are logged for eval sets."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Grafana Loki",
        "LogQL generation and execution"
      ],
      [
        "Elasticsearch / OpenSearch",
        "DSL queries and index scoping"
      ],
      [
        "CloudWatch Logs · Azure Monitor · Google Cloud Logging",
        "managed log backends"
      ],
      [
        "Grafana",
        "drill-down panel and Explore deep links"
      ],
      [
        "Slack / Teams",
        "ask-in-thread interface"
      ],
      [
        "OpenTelemetry Collector",
        "optional pre-processing/tagging of log records"
      ]
    ],
    "context": [
      "service catalog metadata (owners, labels, indices)",
      "representative log samples",
      "template counts per window",
      "baseline comparison window",
      "related trace IDs",
      "recent deploys"
    ],
    "tools": [
      "Log store query APIs (read-only)",
      "Service catalog lookup"
    ],
    "benefits": [
      "Operational questions answered in one sentence instead of a query-building session.",
      "Volume-safe: the model sees patterns and samples, never the firehose — cheaper and less noisy.",
      "Every answer ships with a reusable query, so the team's query literacy grows.",
      "Recurring patterns become documented knowledge instead of folklore."
    ],
    "security": [
      "Log lines may contain PII or tokens: redact at the reducer boundary, and restrict which indices the service can read.",
      "Read-only credentials with index-level scoping; deny-list sensitive services or route them to local models.",
      "Persist questions and answers only in systems with the same access policy as the logs themselves."
    ],
    "future": [
      "Auto-generated per-service 'log digest' bots (daily/weekly summaries of new error patterns).",
      "Trace-aware mode: jump from a log line to its trace and summarize the full request path.",
      "Index optimization advisor: suggest labels/fields and retention changes based on real query patterns."
    ],
    "related": [
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 33,
        "name": "AI Prometheus Query Generator",
        "slug": "ai-prometheus-query-generator"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Question (Slack · Grafana · alert)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Scope resolver (service · time · labels)           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Template clustering / sampling                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← volume reduction\n┌────────────────────────────────────────────────────┐\n│ Query generator → log store                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only creds\n┌────────────────────────────────────────────────────┐\n│ LLM analysis (patterns · anomalies)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Answer + evidence links + query                    │\n└────────────────────────────────────────────────────┘",
    "variations": [
      "Batch mode instead of chat: scheduled digest of top new log patterns per service.",
      "Alert-attached mode: every Alertmanager notification includes a pre-computed log summary.",
      "Build on existing product AI (Datadog Bits AI, New Relic AI, Elastic AI Assistant, Grafana Assistant) when already licensed; custom only for the glue and org context."
    ],
    "schema": "{\n  \"query_language\": \"LogQL\",\n  \"generated_query\": \"{app=\"checkout-service\", env=\"production\"} |= \"payment_failed\" | json | status_code >= 500\",\n  \"time_window\": \"2026-10-05T09:30:00Z to 2026-10-05T10:30:00Z\",\n  \"summary\": \"Sudden spike of 504 Gateway Timeouts connecting to third-party payment gateway upstream.\",\n  \"matched_templates\": [\n    {\n      \"pattern\": \"Failed to connect to gateway timeout=<*>ms\",\n      \"count\": 1420,\n      \"baseline_normal_count\": 2\n    }\n  ],\n  \"sample_log_ids\": [\"loki_msg_9847123\", \"loki_msg_9847155\"],\n  \"recommended_investigation\": \"Check downstream partner status page and timeout configuration in checkout service.\"\n}"
  },
  {
    "num": 5,
    "slug": "ai-incident-investigator",
    "name": "AI Incident Investigator",
    "area": "SRE",
    "tldr": "An agentic first responder: given an incident or alert, it pulls metrics, logs, traces, deploys, and tickets to build a live timeline and root-cause hypothesis.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "The first 15 minutes of an incident are lost to mechanical work: finding dashboards, correlating deploy times, checking what changed, and herding context into the incident channel.",
    "problem": [
      "Investigation requires jumping across monitoring, logs, deploys, feature flags, status pages, and ticketing — each with its own UI and access pattern.",
      "Institutional knowledge (which service breaks when X happens) is in people's heads, not available during the incident.",
      "Timelines are reconstructed after the fact from memory, losing key details.",
      "Multiple responders duplicate the same checks because no one has a shared, up-to-date picture."
    ],
    "impact": "Mean-time-to-mitigation is dominated by investigation overhead; an agent that pre-assembles 80% of the context lets responders spend their time on judgment calls.",
    "capabilities": [
      [
        "Automated evidence gathering",
        "fan-out queries across metrics, logs, traces, deploys, flags, and tickets the moment an incident opens"
      ],
      [
        "Change correlation",
        "'what changed?' analysis: deploys, config changes, flag flips, and traffic shifts aligned to the incident start"
      ],
      [
        "Timeline construction",
        "a living, timestamped timeline assembled from real events, maintained as the incident evolves"
      ],
      [
        "Hypothesis ranking",
        "candidate root causes ranked by evidence, each with a disconfirming check the responder can run"
      ],
      [
        "Tool orchestration",
        "reads (and optionally safe writes) across systems through audited MCP tools"
      ]
    ],
    "solution": "An incident-investigation agent is invoked when an incident is declared (PagerDuty/Opsgenie webhook or Slack `/investigate`). It plans an investigation, gathers evidence through MCP servers for Grafana/Prometheus, Loki, GitHub, cloud APIs, and the incident platform, correlates changes, and streams a structured situation report into the incident channel: timeline, affected services, ranked hypotheses, and suggested next actions. Responders can direct it conversationally ('check EU traffic', 'compare to last week').",
    "steps": [
      [
        "Declare",
        "incident webhook or manual invocation with the alert/incident ID"
      ],
      [
        "Plan",
        "the agent drafts an investigation plan from the alert and service topology"
      ],
      [
        "Gather",
        "parallel MCP tool calls: dashboards/metrics, logs, traces, recent deploys, flags, similar past incidents"
      ],
      [
        "Correlate",
        "align changes and signals onto a common timeline; identify blast radius from dependency graph"
      ],
      [
        "Report",
        "stream a situation report: impact, timeline, ranked hypotheses, next steps"
      ],
      [
        "Assist",
        "respond to follow-up questions; run additional checks; keep the timeline updated"
      ],
      [
        "Hand off",
        "on resolution, package evidence for the postmortem generator"
      ]
    ],
    "hitl": "The investigator is read-only by default. Any state-changing action (restart, rollback, flag flip) is only suggested as a pre-filled command or requires an explicit approval interaction; fully-supervised runbook execution is a later phase.",
    "components": [
      [
        "Incident trigger",
        "PagerDuty/Opsgenie/FireHydrant webhooks plus a Slack slash command"
      ],
      [
        "Agent orchestrator",
        "LangGraph/Microsoft Agent Framework graph with planner, gatherer, and correlator roles"
      ],
      [
        "MCP tool belt",
        "Grafana MCP, GitHub MCP, cloud MCP servers, incident platform MCP — each with scoped credentials"
      ],
      [
        "Topology store",
        "service catalog and dependency graph for blast-radius reasoning"
      ],
      [
        "Timeline builder",
        "normalizes events from all sources into one chronological stream"
      ],
      [
        "Similar-incident retrieval",
        "vector search over past incident reports and resolutions"
      ],
      [
        "Chat presenter",
        "streams updates into a dedicated incident channel thread"
      ],
      [
        "Evidence packager",
        "hands a structured bundle to the postmortem generator (idea 36)"
      ]
    ],
    "flow": [
      "Incident declaration triggers the agent with the alert payload and affected service.",
      "The planner selects checks based on service topology and the alert type.",
      "Parallel read-only tool calls collect metrics snapshots, log patterns, trace samples, deploys, and flag changes around the window.",
      "The correlator aligns everything on one timeline and proposes ranked hypotheses with confidence and disconfirming checks.",
      "A situation report streams into the incident thread; responders ask follow-ups which trigger further tool calls.",
      "At resolution the evidence bundle is archived and linked to the ticket."
    ],
    "platforms": [
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "PagerDuty / Opsgenie",
        "incident webhooks and acknowledgment status"
      ],
      [
        "Grafana / Prometheus / Loki",
        "metrics and logs via mcp-grafana"
      ],
      [
        "GitHub / GitLab",
        "recent merges, deploys, and runbook lookup via MCP"
      ],
      [
        "AWS / Azure / GCP",
        "service health, quotas, network checks via cloud MCP servers"
      ],
      [
        "Slack / Teams",
        "incident channel integration"
      ],
      [
        "Backstage / service catalog",
        "ownership and dependency graph"
      ]
    ],
    "context": [
      "alert payload and history",
      "service topology and owners",
      "metrics + logs + traces around the window",
      "recent deploys, config and flag changes",
      "similar past incidents",
      "open tickets"
    ],
    "tools": [
      "mcp-grafana (dashboards, PromQL, LogQL)",
      "GitHub MCP (deploys, runbooks)",
      "Cloud MCP servers (health, quotas)",
      "Incident platform MCP (timeline, stakeholders)"
    ],
    "benefits": [
      "Investigation overhead drops from a human-hour to seconds of agent fan-out at incident open.",
      "One shared, factual picture in the channel — less duplicated checking, faster mitigation decisions.",
      "'What changed?' answered automatically, which resolves a large share of incidents immediately.",
      "Postmortems start from a real timeline instead of reconstructed memory."
    ],
    "security": [
      "Least privilege per tool: read-only Grafana viewer, read-only GitHub, scoped cloud 'describe-only' roles.",
      "Every tool call is logged with parameters and results in the AI observability platform for audit.",
      "Prompt-injection surface is real (log lines, ticket text can contain instructions): treat all tool output as data, validate actions against allowlists, and require human confirmation for anything mutating.",
      "Incident channels are sensitive; choose the model deployment (cloud vs. self-hosted) per compliance requirement."
    ],
    "future": [
      "Supervised runbook execution: pre-approved mitigations executable from the thread after a two-person approval.",
      "Automatic stakeholder updates (exec summary every 15 min) via the incident summarizer (idea 31).",
      "Federated investigators: one agent per domain (k8s, cloud, app) coordinated by a lead agent.",
      "Confidence-calibrated hypothesis tracking: measure how often rank-1 hypothesis was the actual cause."
    ],
    "related": [
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      },
      {
        "num": 31,
        "name": "AI Incident Summarizer",
        "slug": "ai-incident-summarizer"
      },
      {
        "num": 50,
        "name": "AI On-Call Copilot",
        "slug": "ai-on-call-copilot"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident declared / alert page                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Investigation planner                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ MCP tool fan-out (metrics · logs · deploys)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only scope\n┌────────────────────────────────────────────────────┐\n│ Change correlation + blast radius                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Situation report + ranked hypotheses               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← streamed to chat\n┌────────────────────────────────────────────────────┐\n│ Responders direct · agent verifies                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Evidence package → postmortem                      │\n└────────────────────────────────────────────────────┘",
    "cost": "Incidents are rare relative to CI/CD events, so volume is low, but each investigation is deep (20-50 tool calls). Frontier models earn their cost here; hybrid routing keeps chat follow-ups on cheaper tiers. Expect single-digit dollars per major incident — trivial next to downtime cost.",
    "schema": "{\n  \"incident_id\": \"INC-2041\",\n  \"status\": \"investigating\",\n  \"impact_summary\": \"Elevated 5xx error rate (8.4%) on checkout API affecting EU region\",\n  \"timeline\": [\n    { \"timestamp\": \"14:02 UTC\", \"event\": \"Deploy checkout-v2.14.0 merged by @alice\" },\n    { \"timestamp\": \"14:07 UTC\", \"event\": \"Error rate alert fired in #incident-2041\" },\n    { \"timestamp\": \"14:08 UTC\", \"event\": \"Feature flag 'enable-v2-stripe' turned on\" }\n  ],\n  \"ranked_hypotheses\": [\n    {\n      \"rank\": 1,\n      \"hypothesis\": \"Feature flag 'enable-v2-stripe' activated invalid webhook secret causing signature failures\",\n      \"confidence\": 0.91,\n      \"disconfirming_check\": \"Inspect stripe webhook logs for signature verification failures\"\n    }\n  ],\n  \"suggested_mitigation\": {\n    \"immediate_action\": \"Toggle flag 'enable-v2-stripe' to OFF in LaunchDarkly EU environment\",\n    \"rollback_needed\": false\n  }\n}"
  },
  {
    "num": 6,
    "slug": "ai-jenkins-log-analyzer",
    "name": "AI Jenkins Log Analyzer",
    "area": "CI/CD",
    "tldr": "Decode sprawling Jenkins console logs and plugin errors into a one-paragraph diagnosis with the fix.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Jenkins console output is notoriously verbose: hundreds of plugin lines, Maven/Gradle noise, and pipeline Groovy stack traces bury the actual failure.",
    "problem": [
      "Console logs routinely exceed tens of thousands of lines; the failing line is often 90% down the page.",
      "Plugin ecosystem failures (credentials, agents, JDK tool installs) produce misleading errors far from the root cause.",
      "Freestyle vs. declarative pipeline errors, offline build agents, and workspace exhaustion issues present overlapping failure signatures.",
      "Jenkins expertise is concentrated in one or two veterans per org."
    ],
    "impact": "Jenkins remains the backbone of many enterprises; every unclear failure stalls a delivery team until a Jenkins expert becomes available.",
    "capabilities": [
      [
        "Console log triage",
        "extracts the failing stage, first error, and final error from huge logs"
      ],
      [
        "Jenkins-specific reasoning",
        "recognizes agent offline, credential, plugin, JDK/toolchain, and workspace failure signatures"
      ],
      [
        "Stage-level attribution",
        "maps the failure to the declarative pipeline stage and step"
      ],
      [
        "Fix guidance",
        "suggests Jenkinsfile, plugin, or infrastructure corrections with exact snippets"
      ]
    ],
    "solution": "A Jenkins plugin/CLI companion fetches the failed build's console log (and stage results via the Jenkins API), applies the same redaction and windowing used in idea 01, and asks the model for a Jenkins-specific diagnosis posted back as a build description/comment and Slack message. Dedicated pipeline stages can call it inline for immediate feedback.",
    "steps": [
      [
        "Hook",
        "failure listener via Jenkins webhook or pipeline `post { failure }` step"
      ],
      [
        "Fetch",
        "pull console log, stage/step results, node info, and plugin versions"
      ],
      [
        "Reduce",
        "keep error windows per stage; redact credentials output"
      ],
      [
        "Diagnose",
        "Jenkins-aware LLM analysis with org context (known agent issues, shared library quirks)"
      ],
      [
        "Report",
        "write diagnosis into the build page and Slack; suggest next action (retry agent, bump plugin, fix Jenkinsfile)"
      ]
    ],
    "hitl": "Advisory only. Retry/build decisions stay with the engineer or existing retry policies.",
    "components": [
      [
        "Failure hook",
        "webhook listener or reusable pipeline library step"
      ],
      [
        "Jenkins API client",
        "console log, stage graph, node/agent status, plugin list"
      ],
      [
        "Log reducer",
        "stage-aware windowing and secret redaction"
      ],
      [
        "Analysis engine",
        "LLM with Jenkins knowledge + org-specific notes (shared libs, agent labels)"
      ],
      [
        "Reporter",
        "build description/comment and Slack card"
      ]
    ],
    "flow": [
      "A failed build triggers the hook with the job URL and build number.",
      "The client fetches console log and stage metadata via the Jenkins API.",
      "Reduction keeps per-stage error windows and redacts secret output.",
      "The model returns failure class, root cause, and fix snippet.",
      "Results are attached to the build and posted to Slack."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Jenkins",
        "REST API, webhooks, shared library step"
      ],
      [
        "Slack / Teams",
        "build failure cards"
      ],
      [
        "GitHub / Bitbucket",
        "link back to the triggering change"
      ]
    ],
    "context": [
      "console log (windowed)",
      "stage/step graph",
      "node and agent status",
      "plugin versions",
      "build agent environment variables and executor labels",
      "Jenkinsfile (if pipeline)",
      "triggering commit"
    ],
    "tools": [
      "Jenkins REST API (read-only: logs, stage graphs, agent metrics)"
    ],
    "benefits": [
      "Jenkins expertise becomes ambient instead of scarce.",
      "Chronic infra failures (agents, disks, plugins) get counted and fixed instead of retried forever.",
      "Fast triage on legacy pipelines no one wants to touch."
    ],
    "security": [
      "Console logs frequently echo secrets despite masking: redact aggressively and cap what leaves the network; use local models for sensitive controllers.",
      "Read-only Jenkins API user; never expose credentials or apply rights to the analyzer."
    ],
    "future": [
      "Shared-library lint mode: analyze the Jenkinsfile before the build even runs.",
      "Agent-health correlation across builds to catch infrastructure decay."
    ],
    "related": [
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      },
      {
        "num": 4,
        "name": "AI Log Analyzer",
        "slug": "ai-log-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Jenkins build failure                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Jenkins API (log · stages · node)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Log reducer + redaction                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM diagnosis (Jenkins-aware)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← shared-library RAG\n┌────────────────────────────────────────────────────┐\n│ Build page comment · Slack                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"build_id\": \"job/backend-pipeline/142\",\n  \"stage\": \"Deploy to Staging\",\n  \"step\": \"sh: ansible-playbook\",\n  \"failure_category\": \"agent_offline_or_credentials\",\n  \"root_cause\": \"SSH private key credential 'staging-deployer-key' expired or failed host key verification.\",\n  \"evidence_lines\": [\n    \"Host key verification failed.\",\n    \"fatal: [stage-app-01.internal]: UNREACHABLE! => {\"msg\": \"Failed to connect to the host via ssh\"}\"\n  ],\n  \"suggested_fix\": {\n    \"description\": \"Renew staging SSH host keys in Jenkins global credentials store or update known_hosts on build worker agent 'node-linux-04'\",\n    \"jenkinsfile_patch\": null\n  }\n}"
  },
  {
    "num": 7,
    "slug": "ai-github-actions-debugger",
    "name": "AI GitHub Actions Debugger",
    "area": "CI/CD",
    "tldr": "Deep-dive GitHub Actions failures — matrix jobs, annotations, runner issues — with fixes as ready-to-apply suggestions.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "GitHub Actions failures come with annotations, matrix expansion, re-run semantics, and runner quirks; the raw logs API gives you the data but not the interpretation.",
    "problem": [
      "Matrix builds multiply logs; finding which combination failed and why is manual.",
      "Runner and environment infrastructure failures (disk exhaustion, GitHub-hosted runner network glitches, cache evictions) masquerade as application code failures.",
      "Annotations help but say what failed, never why or what to do.",
      "Workflow syntax (expressions, conditions, needs graph) has subtle bugs that only appear at runtime."
    ],
    "impact": "GitHub Actions is the default CI for most modern repos; unclear failures slow every team touching the repo.",
    "capabilities": [
      [
        "Job/matrix analysis",
        "identifies failing matrix legs, common causes, and whether it's one leg or systemic"
      ],
      [
        "Workflow syntax reasoning",
        "spots condition/expression/needs-graph bugs from the YAML plus error output"
      ],
      [
        "Environment classification",
        "separates code failures from runner, cache, quota, and network failures"
      ],
      [
        "Suggested patch",
        "produces concrete workflow YAML fixes as PR suggestions"
      ]
    ],
    "solution": "On workflow failure, a GitHub App fetches the run's jobs, steps, annotations, and logs via the API, reduces them, and runs an Actions-specialized analysis. Output: a run summary with root cause, classification, and — for workflow-file issues — a one-click 'apply suggestion' patch. Pairs naturally with the managed reviewers (CodeRabbit/Qodo) for the code-side review layer.",
    "steps": [
      [
        "Hook",
        "`check_suite`/`workflow_run` failure event via GitHub App"
      ],
      [
        "Fetch",
        "jobs, steps, annotations, logs, runner info, triggering PR"
      ],
      [
        "Reduce",
        "per-job error windows; matrix grouping; secret redaction"
      ],
      [
        "Diagnose",
        "LLM analysis with workflow YAML and repo context"
      ],
      [
        "Respond",
        "run summary + classification + YAML patch suggestion via PR review comment"
      ]
    ],
    "hitl": "Advisory comments and review suggestions only; humans click 'commit suggestion' or fix manually.",
    "components": [
      [
        "GitHub App",
        "webhooks, checks/reporting, suggestion comments"
      ],
      [
        "Actions API client",
        "jobs, steps, logs, annotations, runner metadata"
      ],
      [
        "Reducer",
        "log windowing per job/step, matrix leg grouping"
      ],
      [
        "Analysis engine",
        "LLM with the workflow file, run metadata, and org conventions"
      ],
      [
        "Suggestion publisher",
        "summary + inline YAML suggestions with apply buttons"
      ]
    ],
    "flow": [
      "A failed workflow run triggers the GitHub App webhook.",
      "The client pulls job/step results, logs, annotations, and the workflow YAML.",
      "Reduction groups failures across matrix legs and extracts error windows.",
      "The model classifies and explains the failure, referencing exact steps.",
      "A summary is published to the run and a patch suggestion as a PR review comment when applicable."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Managed AI code reviewers",
        "CodeRabbit · Greptile · Qodo · Graphite · GitLab Duo",
        "buy-instead-of-build option for PR-facing analysis"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub Actions",
        "webhooks, Actions API, PR review suggestions"
      ],
      [
        "GitHub Checks",
        "annotated check runs"
      ],
      [
        "Slack",
        "failure digests"
      ]
    ],
    "context": [
      "workflow YAML",
      "job/step logs",
      "annotations",
      "runner labels and metadata",
      "matrix combinations",
      "composite actions and reusable workflow definitions",
      "triggering PR diff"
    ],
    "tools": [
      "GitHub API (read logs, metadata; write PR comments)"
    ],
    "benefits": [
      "Matrix and runner failures explained instantly, ending the 're-run and hope' loop.",
      "Workflow YAML bugs fixed via one-click suggestions.",
      "Consistent classification feeds CI-health dashboards."
    ],
    "security": [
      "GitHub App with minimal permissions (actions: read, checks: write, pull_requests: write for suggestions).",
      "Redact masked-secret echoes and third-party log noise; keep private-repo analysis within approved providers."
    ],
    "future": [
      "Auto-retry policies for classified infra failures with explanatory labels.",
      "Workflow hygiene reports: unused inputs, cache misses, slowest steps with reasons."
    ],
    "related": [
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 10,
        "name": "AI Test Failure Analyzer",
        "slug": "ai-test-failure-analyzer"
      },
      {
        "num": 11,
        "name": "AI Build Optimization Assistant",
        "slug": "ai-build-optimization-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ workflow_run failure event                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ GitHub API (jobs · logs · annotations)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Reducer + matrix grouping                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM diagnosis (workflow YAML aware)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Run summary + YAML patch suggestion                │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"workflow_run_id\": 104829103,\n  \"workflow_file\": \".github/workflows/ci.yml\",\n  \"failed_jobs\": [\n    {\n      \"job_name\": \"test (node 20, ubuntu-latest)\",\n      \"step_name\": \"Run unit tests\",\n      \"failure_type\": \"runner_dependency_cache\",\n      \"exit_code\": 1\n    }\n  ],\n  \"root_cause\": \"Cache lock collision and invalid node-modules cache key checksum calculation on branch rebase.\",\n  \"pr_review_suggestion\": {\n    \"target_file\": \".github/workflows/ci.yml\",\n    \"start_line\": 28,\n    \"end_line\": 30,\n    \"suggested_patch\": \"        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}\"\n  }\n}"
  },
  {
    "num": 8,
    "slug": "ai-deployment-risk-analyzer",
    "name": "AI Deployment Risk Analyzer",
    "area": "CI/CD",
    "tldr": "Score every deployment's risk before it ships by reading the change, its history, and the system's incident past.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Not all deployments carry the same risk, yet most pipelines treat them identically: same gates, same velocity, same review depth — allowing high-risk changes to slip through while low-risk changes queue unnecessarily.",
    "problem": [
      "Risk signals (change size, past failure correlation, unfamiliarity of the author with the service) exist but aren't systematically used.",
      "Change failure rates are measured after the fact, never predicted before the deploy.",
      "Review effort is allocated by org chart and calendar, not by risk."
    ],
    "impact": "Predictive risk scoring lets teams put scrutiny where it matters — faster safe deploys, slower careful ones — cutting change-failure rates without throttling delivery.",
    "capabilities": [
      [
        "Risk scoring",
        "combines diff size/complexity, component criticality, author familiarity, and deploy timing into an explainable score"
      ],
      [
        "Historical correlation",
        "finds past incidents linked to similar changes in the same components"
      ],
      [
        "Anomaly detection",
        "flags deploys that look statistically unusual for this service (frequency, size, timing)"
      ],
      [
        "Recommendation",
        "suggests targeted mitigations: progressive canary rollout, additional domain reviewer, off-peak deployment window, or feature flag defaulting to off"
      ]
    ],
    "solution": "Before deployment, a risk service ingests the release candidate's metadata — commits, diffs, linked tickets, author history, component SLO criticality, and recent incident data — and produces an explainable risk card consumed by the CD pipeline: informational badge, auto-approved canary policy, or mandatory extra review. The LLM's job is explanation and recommendation over ML/statistical features, not magic scoring.",
    "steps": [
      [
        "Collect",
        "release diff, commits, tickets, author/deployer history, component criticality, recent incidents"
      ],
      [
        "Compute features",
        "statistical features (size, novelty, frequency, timing) computed deterministically"
      ],
      [
        "Explain",
        "LLM synthesizes a risk narrative and recommendations from the features and history"
      ],
      [
        "Publish",
        "risk card on the release/PR; optional pipeline gate by policy"
      ],
      [
        "Calibrate",
        "compare predictions to actual failures weekly; tune features and thresholds"
      ]
    ],
    "hitl": "The score informs gating policy defined by humans; authors can appeal scores, and appeals are logged to improve the model.",
    "components": [
      [
        "Metadata collector",
        "VCS, ticketing, deploy history, incident store"
      ],
      [
        "Feature extractor",
        "deterministic statistical features (kept explainable and auditable)"
      ],
      [
        "History retriever",
        "past deploys/incidents per component from the RAG store"
      ],
      [
        "Risk explainer",
        "LLM producing narrative, drivers, and mitigation recommendations"
      ],
      [
        "Policy connector",
        "publishes badges and optionally sets CD gates (canary vs. full deploy)"
      ],
      [
        "Calibration job",
        "back-tests predictions against realized change failures"
      ]
    ],
    "flow": [
      "A release candidate is assembled; the collector gathers commits, diffs, tickets, and history.",
      "Deterministic features are computed; the retriever adds correlated past incidents.",
      "The LLM writes an explainable risk narrative with concrete mitigation suggestions.",
      "The risk card gates or informs the pipeline per team policy.",
      "Outcomes (successful, rolled back, caused incident) are recorded to calibrate future scores."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "commits, diffs, PR metadata"
      ],
      [
        "Argo CD / Spinnaker / Jenkins / GitLab CD",
        "deployment metadata and gates"
      ],
      [
        "Jira / Linear",
        "linked tickets for intent and scope"
      ],
      [
        "PagerDuty / incident records",
        "correlation with past failures"
      ],
      [
        "Feature flags (LaunchDarkly, Flagsmith)",
        "flag usage in the change"
      ]
    ],
    "context": [
      "commit set and diff stats",
      "component criticality (SLO tier)",
      "author familiarity with the component",
      "recent deploy frequency",
      "incident history for touched components",
      "deploy timing (freeze windows, on-call load)"
    ],
    "tools": [
      "Read-only VCS and ticket APIs"
    ],
    "benefits": [
      "Scrutiny flows to risky changes automatically; safe changes stop queuing for extra review.",
      "Explainable cards build trust — every score shows its drivers.",
      "Calibrated over time against real outcomes, not vibes."
    ],
    "security": [
      "Keep scoring advisory until calibrated; a miscalibrated hard gate is a delivery outage.",
      "Access to incident and HR-adjacent data (author history) needs privacy review; aggregate where possible."
    ],
    "future": [
      "Live risk adaptation: raise canary analysis sensitivity for high-risk deploys automatically.",
      "Org-wide deploy-risk analytics: which components, change types, and times drive incidents."
    ],
    "related": [
      {
        "num": 12,
        "name": "AI Deployment Troubleshooting Agent",
        "slug": "ai-deployment-troubleshooting-agent"
      },
      {
        "num": 9,
        "name": "AI Release Summary Generator",
        "slug": "ai-release-summary-generator"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Release candidate (commits · diff)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Feature extractor (size · history · timing)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Incident & deploy history lookup                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← RAG\n┌────────────────────────────────────────────────────┐\n│ LLM risk narrative + recommendations               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Risk card → CD policy (badge · canary · review)    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"release_candidate\": \"v3.12.0-rc2\",\n  \"target_environment\": \"production\",\n  \"risk_score\": 78,\n  \"risk_tier\": \"HIGH\",\n  \"risk_drivers\": [\n    \"Touches core billing ledger module (SLO Tier 0)\",\n    \"PR author has zero previous contributions to billing-service\",\n    \"Change size exceeds 1,400 LOC diff with 3 database migration scripts\",\n    \"Scheduled deployment window coincides with peak European business hours\"\n  ],\n  \"recommended_mitigation\": [\n    \"Enforce mandatory review from @billing-codeowners\",\n    \"Deploy via 5% canary with 30-minute metric soak test before full rollout\",\n    \"Verify database migration roll-back script in staging environment prior to deploy\"\n  ]\n}"
  },
  {
    "num": 9,
    "slug": "ai-release-summary-generator",
    "name": "AI Release Summary Generator",
    "area": "CI/CD",
    "tldr": "Turn a release's commits and PRs into audience-tailored notes: engineering changelog, product highlights, and customer-facing summary.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Release notes are a chore, so they're skipped or useless: a wall of merge-commit titles nobody can act on.",
    "problem": [
      "Squashed and dependabot commits hide the actual changes; humans must reconstruct intent from dozens of PRs.",
      "Different audiences need different notes (engineers vs. support vs. customers) and nobody has time to write four versions.",
      "Breaking changes and migration steps get buried, causing avoidable upgrade pain."
    ],
    "impact": "Good release notes reduce support load, smooth upgrades, and make releases communicable events instead of silent version bumps.",
    "capabilities": [
      [
        "Change synthesis",
        "groups commits/PRs into themes (features, fixes, deps, breaking) using titles, bodies, and diffs"
      ],
      [
        "Audience rewriting",
        "produces parallel versions: technical changelog, product highlights, customer-facing summary"
      ],
      [
        "Breaking-change extraction",
        "detects API/config/behavior changes and drafts migration notes"
      ],
      [
        "Credit and attribution",
        "links PRs and authors; preserves conventional-commit categorization"
      ]
    ],
    "solution": "On tag/release, the generator collects PRs, commit messages, linked issues, and labels for the release range, then produces structured notes per audience for the GitHub Release, a changelog file (PR), and a Slack announcement draft — with humans editing before anything customer-facing goes out.",
    "steps": [
      [
        "Range",
        "collect PRs/issues/commits between tags (or since last deploy)"
      ],
      [
        "Enrich",
        "PR bodies, labels, linked issues, semantic-version bump type"
      ],
      [
        "Draft",
        "LLM drafts themed, audience-specific notes; flags breaking changes with migration steps"
      ],
      [
        "Publish",
        "GitHub Release body + changelog PR + Slack draft"
      ],
      [
        "Iterate",
        "humans edit; diffs between draft and final feed style evals"
      ]
    ],
    "hitl": "All outputs are drafts. Customer-facing text requires explicit human approval by default.",
    "components": [
      [
        "Release trigger",
        "tag push / release event / scheduled (internal releases)"
      ],
      [
        "Collector",
        "compare API for the range; PR and issue enrichment"
      ],
      [
        "Synthesis engine",
        "LLM producing structured notes with themes and breaking-change sections"
      ],
      [
        "Publisher",
        "GitHub Releases, changelog file PR, Slack webhook"
      ],
      [
        "Style store",
        "past approved notes as few-shot examples via retrieval"
      ]
    ],
    "flow": [
      "A tag or release event defines the change range.",
      "The collector gathers PRs, issues, labels, and commit metadata for the range.",
      "The model drafts notes in each configured audience/template, grounding every bullet in a linked PR.",
      "Drafts go to the release body, a changelog PR, and a Slack draft for editing.",
      "Human edits are captured as style feedback."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "releases, compare ranges, PR metadata"
      ],
      [
        "Slack / Teams",
        "announcement drafts"
      ],
      [
        "Confluence / Notion",
        "optional wiki changelog sync"
      ]
    ],
    "context": [
      "PR titles/bodies/labels",
      "linked issues",
      "commit messages",
      "semantic version delta",
      "semantic versioning tags & milestone metadata",
      "past release notes style",
      "CODEOWNERS for review routing"
    ],
    "tools": [
      "VCS APIs (read) + release publishing (write)"
    ],
    "benefits": [
      "Every release gets usable notes at near-zero marginal cost.",
      "Breaking changes surface with migration guidance instead of surprising users.",
      "Consistent voice and structure across teams."
    ],
    "security": [
      "Internal-only notes must not leak to public changelogs: separate templates and explicit approval for external publication.",
      "Strip internal hostnames/ticket URLs from customer-facing drafts."
    ],
    "future": [
      "Auto-translate notes for multi-language products.",
      "Release-comms assistant: draft email/blog/social variants from the same structured change data."
    ],
    "related": [
      {
        "num": 24,
        "name": "AI Infrastructure Documentation Generator",
        "slug": "ai-infrastructure-documentation-generator"
      },
      {
        "num": 43,
        "name": "AI DevOps Documentation Generator",
        "slug": "ai-devops-documentation-generator"
      },
      {
        "num": 8,
        "name": "AI Deployment Risk Analyzer",
        "slug": "ai-deployment-risk-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Tag / release event                                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ VCS change collector (PRs · issues)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM synthesis (themed · per-audience)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Release notes · changelog PR · Slack draft         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human edit → publish                               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"release_tag\": \"v2.5.0\",\n  \"compare_range\": \"v2.4.1...v2.5.0\",\n  \"total_prs\": 18,\n  \"breaking_changes\": [\n    {\n      \"component\": \"Authentication API\",\n      \"description\": \"Removed support for legacy API token query parameters; headers now required\",\n      \"migration_steps\": \"Pass 'Authorization: Bearer <token>' in HTTP headers instead of '?token=...' query params\"\n    }\n  ],\n  \"audience_summaries\": {\n    \"engineering_changelog\": \"- feat(auth): migrate to Bearer token headers (#412) by @bob\\n- fix(db): fix connection pool leak on idle timeout (#415)\",\n    \"product_highlights\": \"Enhanced API security with strict bearer token enforcement and improved database connection resilience.\",\n    \"customer_facing_notes\": \"We've upgraded our API authentication standards to ensure top-grade security for your account credentials.\"\n  }\n}"
  },
  {
    "num": 10,
    "slug": "ai-test-failure-analyzer",
    "name": "AI Test Failure Analyzer",
    "area": "CI/CD",
    "tldr": "Classify test failures as bug, flake, or environment in seconds — with evidence, retry policy, and the owning team.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "A red test suite is ambiguous: is it a real regression, a flaky test, or a broken environment? Teams burn triage time and lose trust in CI when failures are misclassified or repeatedly re-run.",
    "problem": [
      "Flaky tests erode trust; engineers reflexively re-run instead of investigating.",
      "Environment failures (timeouts, services down, resource limits) get filed as product bugs.",
      "Ownership is unclear: failing test in a shared library, who investigates?",
      "Quarantine lists go stale; flaky tests hide for years."
    ],
    "impact": "Test-failure triage is pure overhead multiplied by every commit; accurate classification directly restores trust in CI and shortens feedback loops.",
    "capabilities": [
      [
        "Failure classification",
        "bug vs. flake vs. environment vs. test-debt, with confidence and evidence from stack traces and history"
      ],
      [
        "Flake detection",
        "compares failure history, pass-rate variance, and timing to quantify flakiness"
      ],
      [
        "Root-cause hints",
        "points to the commit or code change most likely responsible via test-aware git blame and stack-frame correlation"
      ],
      [
        "Routing",
        "assigns to the owning team via code ownership and test maps"
      ]
    ],
    "solution": "The analyzer consumes JUnit/pytest/jest results from CI (or a test-reporting service), enriches each failure with its history and the triggering diff, and posts a classification card: cause, evidence, suggested action (fix, retry policy, quarantine with expiry, revert). Feeds dashboards for flake trends and per-team failure debt.",
    "steps": [
      [
        "Ingest",
        "test results (JUnit XML, TRX, JSON) from CI artifacts or reporting service"
      ],
      [
        "Enrich",
        "failure history for the test, triggering commits, run environment metadata"
      ],
      [
        "Classify",
        "LLM + heuristics produce class, confidence, evidence, and action"
      ],
      [
        "Route",
        "open/comment on issues for the owning team; attach to the PR"
      ],
      [
        "Track",
        "quarantine entries with expiry; flake dashboards; classification accuracy feedback"
      ]
    ],
    "hitl": "Classifications are advisory; auto-quarantine only after a team opts in and always with expiry and owner.",
    "components": [
      [
        "Result ingester",
        "parses test reports from CI artifacts or services like BuildPulse-style trackers"
      ],
      [
        "History store",
        "per-test pass/fail timeline and variance"
      ],
      [
        "Classifier",
        "hybrid: deterministic history stats + LLM reading of stack traces and diffs"
      ],
      [
        "Router",
        "ownership mapping (test file → team) and issue integration"
      ],
      [
        "Quarantine manager",
        "time-boxed exclusions with expiry and review reminders"
      ]
    ],
    "flow": [
      "CI publishes test results to the analyzer.",
      "Enrichment attaches each failure's history and the triggering change.",
      "The classifier labels each failure with evidence and a recommended action.",
      "PRs get a card; owners get issues; flaky candidates enter expiry-based quarantine.",
      "Accuracy is tracked against human overrides to improve prompts and thresholds."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub Actions / GitLab CI / Jenkins",
        "test artifacts and PR comments"
      ],
      [
        "Issue trackers",
        "Jira/Linear routing"
      ],
      [
        "Playwright / Cypress / pytest",
        "rich reporters with traces and screenshots"
      ],
      [
        "Dashboards",
        "flake and failure-debt trends (Grafana)"
      ]
    ],
    "context": [
      "stack traces and assertion diffs",
      "per-test failure history",
      "triggering commit/diff",
      "runner environment info",
      "test ownership map"
    ],
    "tools": [
      "VCS read APIs; issue tracker (create/comment)"
    ],
    "benefits": [
      "Trust in CI: red means investigate, with the investigation already started.",
      "Flaky debt becomes visible and shrinkable with expiry-based quarantines.",
      "Right team gets the failure first time."
    ],
    "security": [
      "Test output can embed fixtures/secrets: redact before model calls.",
      "Quarantine must not become a black hole: expiries and owner reviews are mandatory."
    ],
    "future": [
      "Auto-flaky-fix agent: propose determinism fixes (async waits, clock injection) as PRs.",
      "Cross-repo flake correlation for shared libraries.",
      "Test impact analysis (TIA) integration: run only the tests impacted by the diff while maintaining safety."
    ],
    "related": [
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      },
      {
        "num": 35,
        "name": "AI Anomaly Investigation Agent",
        "slug": "ai-anomaly-investigation-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ CI test results (JUnit · TRX · JSON)               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ History & diff enrichment                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Classifier (LLM + heuristics)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← bug · flake · env · debt\n┌────────────────────────────────────────────────────┐\n│ PR card · issue routing                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Quarantine (expiring) · dashboards                 │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"test_suite\": \"e2e-checkout-tests\",\n  \"test_name\": \"test_checkout_with_discount_coupon\",\n  \"classification\": \"FLAKY\",\n  \"confidence\": 0.89,\n  \"classification_reasons\": [\n    \"Failed 3 times in last 10 master builds without code changes to coupon module\",\n    \"Failure occurs on async element polling timeout (3000ms threshold)\"\n  ],\n  \"root_cause_analysis\": \"Race condition: Playwright test asserts coupon badge visibility before the background API response completes rendering.\",\n  \"recommended_action\": {\n    \"policy\": \"temporary_quarantine\",\n    \"quarantine_expiry_days\": 7,\n    \"suggested_fix\": \"Use await page.waitForResponse(url) before asserting coupon element visibility\",\n    \"assigned_team\": \"frontend-checkout-squad\"\n  }\n}"
  },
  {
    "num": 11,
    "slug": "ai-build-optimization-assistant",
    "name": "AI Build Optimization Assistant",
    "area": "CI/CD",
    "tldr": "Profile slow pipelines and get concrete, prioritized speedups: caching, parallelization, dependency pruning, and runner sizing.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Slow builds tax every single commit, but optimization is deferred because profiling and fixing requires expertise nobody has spare time for.",
    "problem": [
      "Builds grow slowly (dependencies accumulate, caches miss, steps serialize) and nobody notices until it's 25 minutes.",
      "Cache configurations are subtle (key design, paths, lockfiles) and frequently wrong.",
      "Runner sizing and matrix sharding are guesswork.",
      "The same slow pattern repeats across dozens of repos."
    ],
    "impact": "Cutting median pipeline time by 30% is effectively an org-wide developer productivity raise.",
    "capabilities": [
      [
        "Bottleneck analysis",
        "identifies where pipeline time is lost: cache restore, compilation, test suites, artifact publishing, or runner queue delays"
      ],
      [
        "Cache diagnosis",
        "detects cache misses and proposes better keys/paths/lockfile usage"
      ],
      [
        "Parallelization planning",
        "identifies independent stages and proposes matrix/sharding layouts"
      ],
      [
        "Dependency pruning",
        "flags unused or oversized dependencies and heavy base images"
      ],
      [
        "Org-scale patterns",
        "cross-repo recommendations: shared golden pipelines, runner pools, self-hosted sizing"
      ]
    ],
    "solution": "A scheduled analyzer pulls pipeline timing data and logs across repos, computes where time goes, and asks the model for a prioritized optimization plan per repo — each item with expected savings, effort, and a concrete config diff. Ships as a report plus optional PRs, tracked over time to verify savings.",
    "steps": [
      [
        "Collect",
        "job/step timings, queue times, cache hit rates, runner metrics across repos"
      ],
      [
        "Profile",
        "deterministic aggregation: slowest steps, biggest regressions, cache effectiveness"
      ],
      [
        "Recommend",
        "LLM drafts a prioritized plan with concrete diffs (cache keys, matrices, runner labels)"
      ],
      [
        "Deliver",
        "report per repo; optional auto-PR for safe items"
      ],
      [
        "Verify",
        "re-measure after changes; publish savings; feed outcomes back"
      ]
    ],
    "hitl": "All changes are proposed PRs; humans merge. Reports only inform.",
    "components": [
      [
        "Metrics collector",
        "CI APIs and runner telemetry for timings, queues, cache stats"
      ],
      [
        "Profiler",
        "deterministic time attribution and trend detection"
      ],
      [
        "Optimizer",
        "LLM producing ranked, concrete recommendations"
      ],
      [
        "PR bot",
        "opens config-change PRs for safe, high-confidence items"
      ],
      [
        "Tracker",
        "before/after measurements and org-wide savings dashboard"
      ]
    ],
    "flow": [
      "Scheduled collection pulls timing and cache statistics for all registered pipelines.",
      "The profiler attributes time and detects regressions vs. history.",
      "The model drafts per-repo plans with expected savings and config diffs.",
      "Reports are delivered; safe fixes go out as reviewable PRs.",
      "Post-change measurements verify and publicize savings."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub Actions / GitLab CI / Jenkins",
        "timing, logs, cache stats"
      ],
      [
        "Build tools",
        "Maven/Gradle/webpack build scans where available"
      ],
      [
        "Runner infra",
        "Kubernetes-based runners, autoscaling metrics"
      ],
      [
        "Grafana",
        "savings and trend dashboards"
      ]
    ],
    "context": [
      "step-level timings and trends",
      "cache hit/miss statistics",
      "runner and queue metrics",
      "dependency manifests",
      "org golden-pipeline patterns"
    ],
    "tools": [
      "CI/CD APIs (GitHub Actions / GitLab CI / Jenkins read)",
      "Runner Telemetry & Metrics Collector",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Objective, prioritized speedups instead of folklore.",
      "Org-wide reuse: fixing one pattern fixes many repos.",
      "Savings are measured and reported, building the case for further investment."
    ],
    "security": [
      "Build logs and dependency lists are sensitive in private repos: keep data within approved providers or local models.",
      "Auto-PRs limited to low-risk config items with clear review labels."
    ],
    "future": [
      "Continuous guardrail: alert when pipeline time regresses beyond threshold, with cause.",
      "Cache oracle: simulate cache-key changes against historical builds before proposing."
    ],
    "related": [
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      },
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ CI timing & cache data (multi-repo)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Deterministic profiler                             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM optimization planner                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← prioritized · with diffs\n┌────────────────────────────────────────────────────┐\n│ Report · optional auto-PR                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Re-measure → savings tracked                       │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"pipeline_id\": \"checkout-service-ci\",\n  \"repository\": \"org/checkout-service\",\n  \"branch\": \"main\",\n  \"current_p50_duration_sec\": 1420,\n  \"projected_duration_sec\": 780,\n  \"projected_time_savings_pct\": 45.1,\n  \"bottlenecks\": [\n    {\n      \"stage\": \"integration-tests\",\n      \"step\": \"run-e2e-suite\",\n      \"duration_sec\": 650,\n      \"pct_of_pipeline\": 45.8,\n      \"bottleneck_type\": \"SERIAL_EXECUTION\",\n      \"recommendation\": \"Shard test suite across 4 matrix runners partitioned by test duration history.\"\n    },\n    {\n      \"stage\": \"build-container\",\n      \"step\": \"docker-build\",\n      \"duration_sec\": 380,\n      \"pct_of_pipeline\": 26.8,\n      \"bottleneck_type\": \"CACHE_MISS\",\n      \"recommendation\": \"Configure buildx cache with GitHub Actions cache backend and bind mount go.mod lockfile.\"\n    }\n  ],\n  \"cache_optimization\": {\n    \"current_hit_rate_pct\": 22.4,\n    \"primary_cache_miss_cause\": \"Cache key incorporates dynamic timestamp instead of package-lock.json hash\",\n    \"suggested_cache_key\": \"${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}\",\n    \"estimated_speedup_sec\": 240\n  },\n  \"runner_rightsizing\": {\n    \"current_runner_type\": \"standard-2cpu-4gb\",\n    \"peak_cpu_utilization_pct\": 98.2,\n    \"memory_swapping_detected\": true,\n    \"recommended_runner_type\": \"compute-4cpu-8gb\",\n    \"estimated_monthly_cost_delta_usd\": 18.50\n  },\n  \"proposed_pull_request\": {\n    \"title\": \"ci: optimize e2e test sharding and npm cache key\",\n    \"target_file\": \".github/workflows/ci.yml\",\n    \"risk_level\": \"LOW\",\n    \"diff_snippet\": \"@@ -24,3 +24,5 @@\n-      run: npm test\n+      strategy:\n+        matrix:\n+          shard: [1/4, 2/4, 3/4, 4/4]\n+      run: npm test -- --shard=${{ matrix.shard }}\"\n  }\n}"
  },
  {
    "num": 12,
    "slug": "ai-deployment-troubleshooting-agent",
    "name": "AI Deployment Troubleshooting Agent",
    "area": "CI/CD",
    "tldr": "When a deploy goes sideways, an agent verifies health across the stack and recommends (or drafts) the rollback — with human-in-the-loop authorization.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Post-deploy failures are the worst time to start debugging: production is degraded, signals are scattered, and the safe default (rollback) competes with 'quick fix forward' under pressure.",
    "problem": [
      "Health signals live in CD tooling, Kubernetes, APM, and synthetics — no single view of 'is this deploy healthy?'",
      "Rollback is avoided because it feels risky (schema changes, queue compatibility) even when it's right.",
      "Fix-forward pressure produces hotfix churn and cascading risk.",
      "Deployment observability (which pod got the new version? did traffic shift?) is manual."
    ],
    "impact": "Minutes matter during bad deploys; automated verification plus a prepared rollback path cuts both MTTD and decision latency.",
    "capabilities": [
      [
        "Deploy health verification",
        "checks version rollout status, error rates, latency, saturation, and synthetic checks against pre-deploy baseline"
      ],
      [
        "Failure attribution",
        "distinguishes deploy-caused regressions from coincidental issues"
      ],
      [
        "Rollback readiness",
        "precomputes the exact rollback steps and their risks (schema, queues, flags) before they're needed"
      ],
      [
        "Decision support",
        "recommends rollback vs. fix-forward with evidence and tradeoffs, draft communications included"
      ]
    ],
    "solution": "Triggered by deploy events or SLO burn, an agent snapshots the pre-deploy baseline, verifies rollout health across CD and monitoring tools via MCP, and on regression produces a rollback plan (or executes a pre-approved one after approval). Integrates with GitOps: rollback = revert PR, keeping humans in the loop.",
    "steps": [
      [
        "Baseline",
        "at deploy start, snapshot key metrics and versions"
      ],
      [
        "Watch",
        "compare canary/full-rollout health against baseline for the burn window"
      ],
      [
        "Attribute",
        "on regression, correlate with the deploy (vs. other candidates) using change and traffic analysis"
      ],
      [
        "Plan",
        "draft rollback steps with risk notes, or targeted fix-forward options"
      ],
      [
        "Act (gated)",
        "with human approval: trigger revert PR, pause rollout, or flip flag"
      ],
      [
        "Report",
        "timeline of the decision for the postmortem"
      ]
    ],
    "hitl": "Watching and planning are automatic. Execution requires approval, except optionally pre-approved flag-flips for revert-to-safe-default. GitOps reverts keep the audit trail in Git.",
    "components": [
      [
        "Deploy listener",
        "Argo CD/Jenkins/GitLab CD events, version annotations"
      ],
      [
        "Baseline store",
        "pre-deploy metric snapshots and manifests"
      ],
      [
        "Health verifier",
        "MCP-backed checks: rollout status, error/latency deltas, synthetic results"
      ],
      [
        "Attribution engine",
        "change correlation to rule out non-deploy causes"
      ],
      [
        "Plan drafter",
        "rollback steps with risk annotations and comms drafts"
      ],
      [
        "Gated executor",
        "approval-gated actions: revert PR, rollout pause, flag flip"
      ]
    ],
    "flow": [
      "A deploy event starts the watcher, which snapshots the baseline.",
      "During rollout, health checks compare live signals to baseline.",
      "On regression, attribution separates deploy-caused vs. other causes.",
      "A rollback/fix-forward recommendation with full evidence is posted to the deploy thread.",
      "On approval, the gated executor opens the revert PR (GitOps) or pauses the rollout; everything is recorded for the postmortem."
    ],
    "platforms": [
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ]
    ],
    "integrations": [
      [
        "Argo CD / Flux",
        "rollout status, history, revert PRs"
      ],
      [
        "Prometheus / Grafana",
        "baseline and live metrics via MCP"
      ],
      [
        "Feature flags",
        "kill-switch flips (approval-gated)"
      ],
      [
        "PagerDuty",
        "escalation if human approval isn't available"
      ],
      [
        "Slack / Teams",
        "decision thread with evidence"
      ]
    ],
    "context": [
      "deploy metadata and diff vs. previous",
      "pre-deploy baseline metrics",
      "live rollout health (errors, latency, saturation)",
      "synthetic/e2e results",
      "schema and queue compatibility notes",
      "runbook for the service"
    ],
    "tools": [
      "Argo CD / Flux CD API (read; gated write)",
      "Grafana MCP (Prometheus metrics & APM)",
      "GitHub / GitLab MCP (revert PR)",
      "Feature Flags API (gated kill-switches)"
    ],
    "benefits": [
      "Bad deploys caught in the burn window, not by users.",
      "Rollback decisions arrive pre-analyzed: steps, risks, and comms ready.",
      "GitOps-native reverts keep history clean and auditable."
    ],
    "security": [
      "Executor credentials are separate, scoped, and approval-gated; every action is logged immutably.",
      "Guard against prompt injection flowing from logs/metrics: action allowlists and schema-validated plans only.",
      "Test rollback paths (incl. DB compat) in drills; an untested rollback plan is a risk, not a mitigation."
    ],
    "future": [
      "Progressive-delivery integration: auto-adjust canary weights within policy bounds on evidence.",
      "Learning from outcomes: which signals best predicted failure, refining baselines per service."
    ],
    "related": [
      {
        "num": 8,
        "name": "AI Deployment Risk Analyzer",
        "slug": "ai-deployment-risk-analyzer"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Deploy event / SLO burn trigger                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Baseline snapshot                                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Health verifier (CD · metrics · synthetics)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← MCP tools\n┌────────────────────────────────────────────────────┐\n│ Regression attribution                             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Rollback plan + risk notes                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← human approval\n┌────────────────────────────────────────────────────┐\n│ Revert PR / flag flip · report                     │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"incident_id\": \"INC-84920\",\n  \"deployment_id\": \"deploy-payment-service-v2.14.0\",\n  \"service\": \"payment-service\",\n  \"target_version\": \"v2.14.0\",\n  \"baseline_version\": \"v2.13.9\",\n  \"status\": \"UNHEALTHY\",\n  \"health_verification\": {\n    \"rollout_percentage\": 25,\n    \"http_5xx_rate_pct\": {\n      \"baseline\": 0.04,\n      \"current_canary\": 4.82,\n      \"threshold_pct\": 1.0\n    },\n    \"p99_latency_ms\": {\n      \"baseline\": 145,\n      \"current_canary\": 890,\n      \"threshold_ms\": 300\n    },\n    \"synthetic_canary_pass_rate_pct\": 72.0\n  },\n  \"failure_attribution\": {\n    \"culprit_category\": \"APPLICATION_EXCEPTION\",\n    \"confidence_score\": 0.94,\n    \"evidence\": [\n      \"Canary pods logging NullPointerException in PaymentGatewayClient.authenticate()\",\n      \"Regression appeared exactly at rollout step 2 (traffic shifted from 10% to 25%)\",\n      \"Downstream Stripe mock latency remains unchanged at 38ms\"\n    ],\n    \"environmental_factors_excluded\": [\n      \"No database lock contention detected on rds-postgres-primary\",\n      \"Network packet drop rate steady at 0.001%\"\n    ]\n  },\n  \"decision_matrix\": {\n    \"recommended_action\": \"ROLLBACK\",\n    \"reasons\": [\n      \"Error budget consumption rate is at 14x sustainable burn rate\",\n      \"Database migration 20261005_add_idempotency_key is backward-compatible with v2.13.9\"\n    ],\n    \"rollback_safety_checks\": {\n      \"database_reversible\": true,\n      \"message_queue_drain_required\": false,\n      \"feature_flag_fallback_available\": true\n    },\n    \"rollback_plan\": {\n      \"mechanism\": \"GITOPS_REVERT_PR\",\n      \"repository\": \"org/gitops-prod\",\n      \"target_file\": \"apps/payment-service/values.yaml\",\n      \"revert_pr_url\": \"https://github.com/org/gitops-prod/pull/4821\",\n      \"emergency_cli_command\": \"kubectl argo rollbacks abort payment-service -n payments\"\n    }\n  }\n}"
  },
  {
    "num": 13,
    "slug": "ai-pod-crash-analyzer",
    "name": "AI Pod Crash Analyzer",
    "area": "Kubernetes",
    "tldr": "Explain `CrashLoopBackOff`, `OOMKilled`, and probe failures instantly: exit code, last logs, config change, and the fix.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Pod crashes announce themselves loudly but explain themselves poorly: a state, an exit code, and a wall of logs.",
    "problem": [
      "The same symptom (restart loop) has wildly different causes: bad config, missing dependency, OOM, failed probe, node pressure.",
      "Engineers jump between `kubectl describe`, `logs --previous`, events, and the deploy history to reconstruct the story.",
      "The question 'what changed?' is usually answerable (a deploy 20 minutes ago) but nobody checks first."
    ],
    "impact": "Crash loops are high-frequency, high-distraction events; instant diagnosis keeps them a five-minute fix instead of an hour of context switching.",
    "capabilities": [
      [
        "Exit-code reasoning",
        "maps exit codes, termination reasons, and probe outcomes to candidate causes"
      ],
      [
        "Log interpretation",
        "reads the previous container's tail for the actual error (missing env var, failed migration, port in use)"
      ],
      [
        "Change correlation",
        "links the crash to the most recent rollout/config change touching the pod"
      ],
      [
        "Fix drafting",
        "proposes the patch: env/secret fix, resource bump, probe tuning, image tag, or rollback"
      ]
    ],
    "solution": "A focused analyzer for crash-class pod failures: on detection it collects pod spec/status, events, last logs (current and previous), owner rollout history, and resource metrics, then returns a plain-language diagnosis with evidence and a ready-to-review patch. Lightweight enough to embed in Slack alerts, `kubectl` plugins, or as the crash module of idea 02.",
    "steps": [
      [
        "Detect",
        "CrashLoopBackOff / OOMKilled / probe-failure event or alert"
      ],
      [
        "Snapshot",
        "pod spec/status, events, logs (previous container), rollout history, metrics"
      ],
      [
        "Diagnose",
        "LLM ranks causes with evidence; checks 'what changed' from revision history"
      ],
      [
        "Propose",
        "patch or rollback suggestion validated with dry-run"
      ],
      [
        "Report",
        "Slack card / CLI output with evidence links"
      ]
    ],
    "hitl": "Read-only diagnosis; patches are suggestions requiring human apply (or GitOps PR).",
    "components": [
      [
        "Crash detector",
        "workload watcher or alert webhook for crash-class states"
      ],
      [
        "Snapshot collector",
        "pod spec/status, events, previous logs, revision history, metrics"
      ],
      [
        "Diagnosis engine",
        "LLM with exit-code/probe knowledge and revision diff"
      ],
      [
        "Patch drafter",
        "manifest patch or GitOps PR with dry-run validation"
      ]
    ],
    "flow": [
      "A crash-class event or alert names the pod.",
      "The collector snapshots state, logs, and the rollout history around the last change.",
      "The model ranks likely causes, citing exit code, log lines, and the change diff.",
      "A validated patch or revert suggestion is returned with evidence links."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kubernetes API",
        "read-only snapshotting"
      ],
      [
        "Prometheus / metrics-server",
        "memory/CPU context for OOM diagnosis"
      ],
      [
        "Argo CD / Helm",
        "revision history for change correlation"
      ],
      [
        "Slack / kubectl plugin",
        "delivery surfaces"
      ]
    ],
    "context": [
      "pod status and container states",
      "exit codes and termination reasons",
      "previous container logs",
      "recent events",
      "rollout/revision diff",
      "memory/CPU vs. limits"
    ],
    "tools": [
      "Kubernetes API (read-only pods, events, logs)",
      "Prometheus / Metrics Server (OOM memory usage)",
      "GitOps & Helm Revision API (read rollout diffs)"
    ],
    "benefits": [
      "Five-minute crash-loop fixes with junior-safe guidance.",
      "Fewer reflex restarts; changes get examined first.",
      "Pattern stats reveal systemic issues (chronically under-provisioned services)."
    ],
    "security": [
      "Pod logs and environment variables can contain secrets: redact env values and filtered log lines before model calls.",
      "Read-only service account; namespace scoping for multi-tenant clusters."
    ],
    "future": [
      "Predictive mode: flag pods likely to OOM based on memory trend before they die.",
      "Auto-remediation for safe classes (e.g., bump probe timeout) via approval queue."
    ],
    "related": [
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      },
      {
        "num": 17,
        "name": "AI Kubernetes Incident Investigator",
        "slug": "ai-kubernetes-incident-investigator"
      },
      {
        "num": 15,
        "name": "AI Kubernetes Resource Optimization Advisor",
        "slug": "ai-kubernetes-resource-optimization-advisor"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Crash event (CrashLoop · OOM · probe)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ K8s API snapshot (spec · events · logs)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only\n┌────────────────────────────────────────────────────┐\n│ Rollout/change correlation                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM diagnosis + fix patch                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← dry-run validated\n┌────────────────────────────────────────────────────┐\n│ Slack / CLI report                                 │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"pod_name\": \"orders-worker-7c98b6f48f-4km2z\",\n  \"namespace\": \"production\",\n  \"workload\": {\n    \"kind\": \"Deployment\",\n    \"name\": \"orders-worker\"\n  },\n  \"crash_classification\": {\n    \"symptom\": \"CrashLoopBackOff\",\n    \"termination_reason\": \"OOMKilled\",\n    \"exit_code\": 137,\n    \"restart_count\": 6,\n    \"last_restart_timestamp\": \"2026-10-05T23:14:02Z\"\n  },\n  \"evidence\": {\n    \"last_log_tail\": [\n      \"2026-10-05T23:13:58Z [INFO] Processing batch job #94821 (14,200 records)\",\n      \"2026-10-05T23:14:01Z [WARN] JVM heap usage reached 98.4% (512MB / 512MB)\",\n      \"command terminated with exit code 137\"\n    ],\n    \"memory_metrics\": {\n      \"configured_limit_bytes\": 536870912,\n      \"peak_usage_bytes\": 536870912,\n      \"suggested_headroom_bytes\": 1073741824\n    },\n    \"recent_change\": \"Commit a1b2c3d increased batch worker chunk size from 1,000 to 15,000 items without increasing container limits.\"\n  },\n  \"root_cause\": {\n    \"summary\": \"Pod exceeded cgroup memory limit of 512Mi due to increased batch worker chunk size.\",\n    \"category\": \"INSUFFICIENT_MEMORY_LIMIT\"\n  },\n  \"remediation\": {\n    \"strategy\": \"INCREASE_MEMORY_LIMIT\",\n    \"dry_run_passed\": true,\n    \"patch_yaml\": \"spec:\n  template:\n    spec:\n      containers:\n      - name: orders-worker\n        resources:\n          limits:\n            memory: \"1Gi\"\n          requests:\n            memory: \"768Mi\"\",\n    \"alternative_action\": \"Revert chunk size configuration in ConfigMap 'orders-worker-config' to 1,000 items.\"\n  }\n}"
  },
  {
    "num": 14,
    "slug": "ai-kubectl-assistant",
    "name": "AI kubectl Assistant",
    "area": "Kubernetes",
    "tldr": "Natural-language Kubernetes operations with guardrails: the assistant writes the command, validates it with dry-run, and you execute it.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Everyone from product engineers to SREs needs to interact with Kubernetes, but the kubectl surface area (and its capacity for damage) makes that intimidating.",
    "problem": [
      "Constructing the right command — selectors, jsonpath, patch syntax — is a skill barrier for most engineers.",
      "Copy-pasting commands from LLM chat windows into production terminals is dangerous: no validation, no context, no audit.",
      "Cross-namespace/multi-resource questions ('which pods on node X are missing requests?') require scripting most people don't have."
    ],
    "impact": "A validated NL→kubectl path makes cluster operations accessible and safe, shrinking the expert bottleneck without raising risk.",
    "capabilities": [
      [
        "Intent translation",
        "converts natural language to kubectl (or Helm/Kustomize) commands with correct syntax and scope"
      ],
      [
        "Safety classification",
        "labels each generated command read-only vs. mutating vs. destructive and refuses out-of-policy requests"
      ],
      [
        "Dry-run validation",
        "executes `--dry-run=server` for mutating commands and shows the diff before the human runs anything"
      ],
      [
        "Output explanation",
        "summarizes command output in context ('this deployment has no PDB — a node drain will take it down')"
      ]
    ],
    "solution": "A terminal (or Slack) assistant wired to the cluster through the kubernetes MCP server. It generates commands, classifies their safety, validates mutating ones via server dry-run, and hands execution to the human — the assistant never applies directly. Audit log records every generated and executed command.",
    "steps": [
      [
        "Ask",
        "engineer states intent in the terminal or chat"
      ],
      [
        "Generate",
        "model drafts the command(s) with cluster context (namespaces, resource kinds)"
      ],
      [
        "Classify",
        "policy engine labels safety level; destructive requests need explicit confirmation"
      ],
      [
        "Validate",
        "server dry-run / `--debug` checks; show resulting diff or filtered output"
      ],
      [
        "Execute (human)",
        "one-keystroke approval runs the command in the user's own RBAC context"
      ],
      [
        "Explain",
        "assistant summarizes the output and suggests follow-ups"
      ]
    ],
    "hitl": "The human executes everything in their own context; the assistant is a writer/validator, never an executor.",
    "components": [
      [
        "Chat front end",
        "CLI plugin and/or Slack bot"
      ],
      [
        "Command drafter",
        "LLM with schema knowledge of kubectl/Helm/Kustomize plus live cluster metadata"
      ],
      [
        "Policy classifier",
        "allowlist-based safety labeling (read/mutate/delete) with org-specific rules"
      ],
      [
        "Dry-run validator",
        "executes validation via read-scoped service account"
      ],
      [
        "Audit log",
        "every generated command, classification, and execution outcome"
      ]
    ],
    "flow": [
      "The engineer asks in natural language.",
      "The drafter produces a candidate command using live cluster context.",
      "The classifier labels safety; policy blocks or flags as needed.",
      "Mutating commands are dry-run validated and presented with their effect.",
      "The human executes; the assistant explains output and offers next steps."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ]
    ],
    "integrations": [
      [
        "kubectl / Helm / Kustomize",
        "command generation targets"
      ],
      [
        "kubernetes MCP server",
        "cluster access for context and dry-run"
      ],
      [
        "Shell (CLI plugin)",
        "terminal-native experience"
      ],
      [
        "Slack / Teams",
        "chat mode for quick questions"
      ]
    ],
    "context": [
      "live cluster metadata (namespaces, kinds, labels)",
      "user's RBAC context",
      "resource schemas",
      "org policies",
      "recent changes to the target resource"
    ],
    "tools": [
      "Kubernetes MCP (read & server dry-run validation)",
      "Kubectl / Helm / Kustomize CLI wrappers",
      "RBAC Context & Policy Validator"
    ],
    "benefits": [
      "Lower barrier to safe cluster work for all engineers.",
      "Validation and audit close the copy-paste-from-ChatGPT risk.",
      "Faster answers to cross-cutting questions that used to need scripting."
    ],
    "security": [
      "The assistant's own credentials are strictly read-only and dry-run validated; execution happens solely in the human's authenticated RBAC context.",
      "Destructive verbs (delete, scale to zero, drain) require explicit typed confirmation and are logged.",
      "Watch for prompt injection via resource names/annotations; treat all cluster output as data.",
      "Prefer local models (Ollama/vLLM) in regulated environments so cluster metadata stays in-network."
    ],
    "future": [
      "Read-only 'explain mode' by default, with per-user unlock for mutating suggestions.",
      "Team playbooks: saved, parameterized multi-step flows the assistant can walk users through."
    ],
    "related": [
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      },
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      },
      {
        "num": 13,
        "name": "AI Pod Crash Analyzer",
        "slug": "ai-pod-crash-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Engineer intent (CLI · Slack)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Command drafter (cluster-aware)                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← MCP kubernetes\n┌────────────────────────────────────────────────────┐\n│ Safety classifier (read · mutate · delete)         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Server dry-run validation                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human executes in own RBAC                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Output explained + follow-ups                      │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"query_id\": \"nl-k8s-91823\",\n  \"natural_language_intent\": \"find pods in production that are restarting frequently and show which nodes they are running on\",\n  \"inferred_scope\": {\n    \"cluster\": \"prod-us-east-1\",\n    \"namespace\": \"production\",\n    \"target_kinds\": [\n      \"Pod\"\n    ]\n  },\n  \"proposed_command\": {\n    \"cli\": \"kubectl get pods -n production --sort-by='.status.containerStatuses[0].restartCount' -o custom-columns='NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount,NODE:.spec.nodeName,STATUS:.status.phase'\",\n    \"execution_tier\": \"READ_ONLY\",\n    \"destructive\": false,\n    \"dry_run_supported\": false\n  },\n  \"safety_assessment\": {\n    \"status\": \"APPROVED\",\n    \"requires_confirmation\": false,\n    \"policy_violations\": [],\n    \"blast_radius\": \"ZERO_READ_ONLY\"\n  },\n  \"dry_run_validation\": {\n    \"executed\": true,\n    \"exit_code\": 0,\n    \"simulated_output_sample\": \"NAME                         RESTARTS   NODE                 STATUS\norders-worker-7c98b6f48f     6          ip-10-0-4-12.ec2     Running\ncatalog-cache-6b58df8954     1          ip-10-0-4-99.ec2     Running\"\n  },\n  \"explanation\": {\n    \"command_breakdown\": \"Queries pods in 'production' namespace, extracts restart counts and node assignments via custom jsonpath columns, and sorts ascending by restart frequency.\",\n    \"suggested_next_step\": \"Run 'kubectl describe pod <name> -n production' or use the Pod Crash Analyzer on the top restarting pod.\"\n  }\n}"
  },
  {
    "num": 15,
    "slug": "ai-kubernetes-resource-optimization-advisor",
    "name": "AI Kubernetes Resource Optimization Advisor",
    "area": "Kubernetes",
    "tldr": "Right-size requests and limits continuously using real usage data — explained, safe, and reviewable as GitOps PRs.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Resource requests and limits are set once at creation and rarely revisited, so clusters pay for phantom capacity while individual pods still get OOMKilled.",
    "problem": [
      "Requests are guesses from manifests copied years ago; utilization is often 5-15%.",
      "Manual right-sizing doesn't scale across hundreds of workloads and environments.",
      "Crude autosuggestions ignore burstiness, SLO tier, and cron/batch patterns, producing flapping.",
      "Changes to requests affect scheduler behavior and can cause incidents if done naively."
    ],
    "impact": "Typical savings from proper right-sizing are 30-50% of cluster compute cost, plus reliability gains from fewer OOM kills and better scheduling.",
    "capabilities": [
      [
        "Usage analysis",
        "P95/P99 memory/CPU patterns, seasonality, and burst behavior per workload"
      ],
      [
        "Safe recommendation",
        "proposes requests/limits with headroom policy based on SLO tier and variance — never naive averages"
      ],
      [
        "Rollout planning",
        "sequences changes (canary a few workloads first) and predicts scheduling impact"
      ],
      [
        "Explanation",
        "shows the evidence: charts, percentiles, and why this number"
      ]
    ],
    "solution": "A scheduled advisor consumes Prometheus/metrics-server history per workload, computes robust statistics, and drafts right-sizing PRs against the manifests repo — annotations explain the math, changes roll out via normal GitOps review. VPA in recommendation mode and commercial ML optimizers (StormForge-style) are cited as build-vs-buy baselines.",
    "steps": [
      [
        "Profile",
        "collect 2-4 weeks of per-container usage (P50/P95/P99, spikes, periodicity)"
      ],
      [
        "Classify",
        "steady service vs. bursty vs. batch vs. cron; SLO tier per workload"
      ],
      [
        "Recommend",
        "apply headroom policy; generate requests/limits with rationale annotations"
      ],
      [
        "Deliver",
        "GitOps PR per namespace/team; batch small, defer risky ones"
      ],
      [
        "Monitor",
        "track post-change OOM/throttling; auto-revert policy if regressions appear"
      ]
    ],
    "hitl": "Every change is a PR. Teams review their own workloads; the advisor never edits live specs.",
    "components": [
      [
        "Metrics collector",
        "PromQL queries for usage windows across all workloads"
      ],
      [
        "Profiler",
        "percentile/statistical feature extraction, cron detection"
      ],
      [
        "Policy engine",
        "headroom rules by tier, variance-aware limits"
      ],
      [
        "PR generator",
        "manifest patching with annotation rationale, batched per team"
      ],
      [
        "Safety monitor",
        "post-rollout OOM/throttle detection with auto-escalation"
      ]
    ],
    "flow": [
      "A scheduled job profiles every workload from metrics history.",
      "Workloads are classified and policy computes safe requests/limits.",
      "PRs are opened with charts and rationale in descriptions.",
      "GitOps review deploys changes; the monitor watches for OOM/throttle regressions and reports back."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ]
    ],
    "integrations": [
      [
        "Prometheus / metrics-server / Thanos",
        "usage history"
      ],
      [
        "Kubernetes + VPA",
        "VPA recommendation mode as a data source"
      ],
      [
        "GitOps (Argo CD/Flux)",
        "PR-based delivery"
      ],
      [
        "Grafana",
        "before/after dashboards"
      ],
      [
        "Kubecost / OpenCost",
        "cost attribution of savings"
      ]
    ],
    "context": [
      "container usage percentiles",
      "workload type and cron patterns",
      "SLO tier",
      "OOM/throttle event history",
      "current requests/limits"
    ],
    "tools": [
      "Prometheus / Thanos PromQL API (read usage metrics)",
      "Kubernetes Metrics Server & VPA API (read)",
      "Kubecost / OpenCost API (cost attribution)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Major compute cost reduction with reviewable, explainable changes.",
      "Fewer OOM kills from blind limit guessing.",
      "Org-wide consistency: one policy, many teams."
    ],
    "security": [
      "Never downsize stateful or latency-critical tiers without owner sign-off.",
      "PRs are batched small to keep blast radius low and reviews fast."
    ],
    "future": [
      "Continuous mode: weekly PR batches with trend tracking.",
      "Schedule-aware rightsizing for dev/test namespaces (scale-to-zero off-hours proposals)."
    ],
    "related": [
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      },
      {
        "num": 18,
        "name": "AI HPA Recommendation Assistant",
        "slug": "ai-hpa-recommendation-assistant"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Prometheus usage history                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Workload profiler (P95 · spikes · periodic)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Headroom policy engine                             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← SLO-tier aware\n┌────────────────────────────────────────────────────┐\n│ GitOps PRs with rationale                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← human review\n┌────────────────────────────────────────────────────┐\n│ Post-change monitor (OOM · throttle)               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"workload\": {\n    \"cluster\": \"production-us-east\",\n    \"namespace\": \"billing\",\n    \"kind\": \"Deployment\",\n    \"name\": \"invoice-generator\",\n    \"container\": \"app\"\n  },\n  \"observation_window\": {\n    \"duration_days\": 14,\n    \"total_samples\": 40320,\n    \"slo_tier\": \"CRITICAL\"\n  },\n  \"usage_percentiles\": {\n    \"cpu_millicores\": {\n      \"p50\": 65,\n      \"p95\": 210,\n      \"p99\": 340,\n      \"max\": 480\n    },\n    \"memory_mb\": {\n      \"p50\": 320,\n      \"p95\": 480,\n      \"p99\": 580,\n      \"max\": 640\n    }\n  },\n  \"current_configuration\": {\n    \"cpu_request_millicores\": 1000,\n    \"cpu_limit_millicores\": 2000,\n    \"memory_request_mb\": 2048,\n    \"memory_limit_mb\": 4096\n  },\n  \"recommended_configuration\": {\n    \"cpu_request_millicores\": 350,\n    \"cpu_limit_millicores\": 600,\n    \"memory_request_mb\": 768,\n    \"memory_limit_mb\": 1024,\n    \"rationale\": \"Current requests are 3x higher than observed P99 CPU and 3.5x higher than P99 memory. New allocation adds 30% safety headroom over 14-day P99 peak.\"\n  },\n  \"financial_impact\": {\n    \"current_monthly_cost_usd\": 164.20,\n    \"projected_monthly_cost_usd\": 48.90,\n    \"monthly_savings_usd\": 115.30,\n    \"cluster_wide_savings_pct\": 70.2\n  },\n  \"gitops_pull_request\": {\n    \"repository\": \"org/gitops-deployments\",\n    \"file_path\": \"clusters/prod/billing/invoice-generator.yaml\",\n    \"risk_level\": \"LOW\",\n    \"unified_diff\": \"@@ -24,4 +24,4 @@\n         resources:\n           requests:\n-            cpu: 1000m\n-            memory: 2048Mi\n+            cpu: 350m\n+            memory: 768Mi\n           limits:\n-            cpu: 2000m\n-            memory: 4096Mi\n+            cpu: 600m\n+            memory: 1024Mi\"\n  }\n}"
  },
  {
    "num": 16,
    "slug": "ai-helm-chart-analyzer",
    "name": "AI Helm Chart Analyzer",
    "area": "Kubernetes",
    "tldr": "Review Helm charts for correctness, upgrade safety, and best practices — before `helm upgrade` finds out the hard way.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Helm charts encode a huge amount of implicit contract: values schemas, upgrade semantics, and Kubernetes best practices that are easy to violate invisibly.",
    "problem": [
      "Charts pass `helm lint` yet produce broken deployments (probe paths, resource units, wrong selectors).",
      "Upgrades fail at runtime: immutable field changes, CRD version skews, breaking template changes between chart versions.",
      "Forked vendor charts drift without warning until the next upgrade.",
      "Best-practice review (security context, PDBs, probes, labels) is manual and inconsistent."
    ],
    "impact": "Chart defects surface as failed upgrades and outages during exactly the moments change pressure is highest.",
    "capabilities": [
      [
        "Rendered-manifest review",
        "analyzes `helm template` output the way an SRE would: probes, resources, security contexts, PDBs, selectors"
      ],
      [
        "Upgrade diffing",
        "combines `helm diff` with Kubernetes field-mutability knowledge to predict breaking upgrades"
      ],
      [
        "Best-practice checks",
        "explains and prioritizes deviations (missing limits, runAsRoot, no PDB) with fixes"
      ],
      [
        "Values validation",
        "spots schema violations and suspicious value overrides"
      ]
    ],
    "solution": "PR-time and pre-upgrade analysis: render the chart, lint, diff against the deployed release, and hand the manifests plus findings to an LLM for a structured review — breaking-change risks, best-practice gaps, and suggested template fixes — posted to the PR or shown before running upgrade in CI.",
    "steps": [
      [
        "Render",
        "`helm template`/`helm diff upgrade` in CI on chart PRs and pre-deploy"
      ],
      [
        "Lint",
        "kubeconform/polaris-style structural checks first"
      ],
      [
        "Review",
        "LLM reviews rendered manifests + diff for correctness, mutability risks, and practices"
      ],
      [
        "Report",
        "PR comments and a go/no-go summary for the upgrade"
      ]
    ],
    "hitl": "Advisory findings on PRs; upgrade execution remains a human/CI decision.",
    "components": [
      [
        "CI integration",
        "chart PR and pre-upgrade hooks"
      ],
      [
        "Renderer",
        "helm template/diff with values for target environment"
      ],
      [
        "Linters",
        "schema and structural validation"
      ],
      [
        "Reviewer",
        "LLM with Kubernetes field-mutability and best-practice knowledge"
      ],
      [
        "Reporter",
        "PR annotations and upgrade gate summary"
      ]
    ],
    "flow": [
      "A chart change or upgrade plan triggers rendering and diffing.",
      "Structural lints run first; only surviving output goes to the model.",
      "The reviewer ranks findings: upgrade-breaking, correctness, best-practice.",
      "Findings post to the PR with suggested template fixes."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Managed AI code reviewers",
        "CodeRabbit · Greptile · Qodo · Graphite · GitLab Duo",
        "buy-instead-of-build option for PR-facing analysis"
      ]
    ],
    "integrations": [
      [
        "Helm 3",
        "template/diff/lint pipelines"
      ],
      [
        "CI (GitHub Actions/GitLab)",
        "PR triggers"
      ],
      [
        "Argo CD",
        "pre-sync hooks for upgrade checks"
      ],
      [
        "Artifact Hub",
        "chart metadata for dependency advisories"
      ]
    ],
    "context": [
      "rendered manifests",
      "helm diff output",
      "values files",
      "chart version deltas",
      "lint results",
      "deployed release state"
    ],
    "tools": [
      "Helm CLI (template, diff, lint)",
      "Kubeconform & Polaris (schema & policy validation)",
      "VCS PR Comments & Review API (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Upgrade failures caught before they hit the cluster.",
      "Consistent best-practice enforcement across all charts.",
      "Faster, less scary chart adoption for new services."
    ],
    "security": [
      "Rendered manifests may embed secret values from values files: render with redacted/placeholder secrets.",
      "Keep vendor chart analysis within approved providers or local models."
    ],
    "future": [
      "Auto-upgrade PRs for vendor chart bumps with generated migration notes.",
      "Fleet view: which deployments still run charts with known risky patterns."
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Chart PR / pre-upgrade hook                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Render + diff (helm template/diff)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Structural lint (kubeconform · polaris)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM review (mutability · practices)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ PR findings + go/no-go summary                     │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"chart_metadata\": {\n    \"name\": \"customer-portal\",\n    \"current_release_version\": \"3.4.1\",\n    \"target_release_version\": \"4.0.0\",\n    \"kubernetes_target_version\": \"1.30\"\n  },\n  \"validation_verdict\": {\n    \"status\": \"BLOCKED\",\n    \"can_safely_upgrade\": false,\n    \"breaking_changes_count\": 1,\n    \"security_warnings_count\": 2,\n    \"best_practice_recommendations_count\": 3\n  },\n  \"upgrade_blockers\": [\n    {\n      \"resource\": \"apps/v1/Deployment: customer-portal\",\n      \"issue_type\": \"IMMUTABLE_FIELD_MODIFICATION\",\n      \"severity\": \"CRITICAL\",\n      \"details\": \"Template changes spec.selector.matchLabels from 'app.kubernetes.io/name: portal' to 'app: portal'. Kubernetes forbids updating deployment selector labels on existing resources.\",\n      \"remediation\": \"Retain original spec.selector.matchLabels or configure a blue/green migration step.\"\n    }\n  ],\n  \"security_findings\": [\n    {\n      \"rule\": \"KSV-012\",\n      \"severity\": \"HIGH\",\n      \"resource\": \"customer-portal-worker\",\n      \"finding\": \"Container runs without 'securityContext.readOnlyRootFilesystem: true'\",\n      \"suggested_fix\": \"Set values.securityContext.readOnlyRootFilesystem = true and mount emptyDir on /tmp\"\n    },\n    {\n      \"rule\": \"KSV-003\",\n      \"severity\": \"MEDIUM\",\n      \"resource\": \"customer-portal-web\",\n      \"finding\": \"PodDisruptionBudget is missing while replicaCount is 3\",\n      \"suggested_fix\": \"Enable pdb.enabled=true with minAvailable=1 in values.yaml\"\n    }\n  ],\n  \"values_schema_diff\": {\n    \"deprecated_keys_used\": [\n      \"ingress.annotations.kubernetes.io/ingress.class (migrate to spec.ingressClassName)\"\n    ],\n    \"missing_required_keys\": []\n  }\n}"
  },
  {
    "num": 17,
    "slug": "ai-kubernetes-incident-investigator",
    "name": "AI Kubernetes Incident Investigator",
    "area": "Kubernetes",
    "tldr": "The Kubernetes-focused incident agent: reconstructs what happened across pods, nodes, controllers, and rollouts into a causal narrative.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Kubernetes incidents rarely live in one object: a node drain cascades through PDBs, HPA behavior, DNS, and app retries, and the story must be reassembled from dozens of API objects.",
    "problem": [
      "Causal chains span resources: node pressure → evictions → PDB deadlock → service degradation.",
      "Controller behavior (HPA, KEDA, operators) is part of the story but invisible in simple dashboards.",
      "Reconstruction after the fact is slow and error-prone; timeline details evaporate.",
      "Each responder investigates a slice; nobody assembles the whole picture in the moment."
    ],
    "impact": "Cluster incidents take longer to understand than to fix; a reconstructed causal narrative compresses both investigation and review time.",
    "capabilities": [
      [
        "Multi-object reconstruction",
        "assembles event chains across pods, nodes, controllers, and network components with timestamps"
      ],
      [
        "Controller-behavior analysis",
        "explains what HPA/KEDA/operators did and why during the window"
      ],
      [
        "Dependency tracing",
        "follows impact across services via topology and traffic data"
      ],
      [
        "Narrative generation",
        "produces the incident story: trigger, propagation, impact, recovery — with evidence links"
      ]
    ],
    "solution": "A deep-investigation agent for Kubernetes incidents: given a time window and affected service, it sweeps API events, controller logs, node conditions, network policies, and rollout history, then constructs a causal graph and narrative. Designed to complement idea 05 (cross-domain) with cluster-native depth, feeding its findings to responders and the postmortem generator.",
    "steps": [
      [
        "Scope",
        "incident ID/service + time window from the incident platform"
      ],
      [
        "Sweep",
        "collect events, controller logs, node conditions, HPA/KEDA history, network policies, rollouts"
      ],
      [
        "Correlate",
        "build a causal graph aligning all timestamps; identify trigger and propagation path"
      ],
      [
        "Narrate",
        "produce timeline + causal narrative with confidence labels"
      ],
      [
        "Support",
        "answer responder questions with additional targeted sweeps"
      ],
      [
        "Hand off",
        "structured evidence package for postmortems"
      ]
    ],
    "hitl": "Read-only investigation. Responders make all decisions; the agent's causal graph is a hypothesis to verify, not a verdict.",
    "components": [
      [
        "Scope resolver",
        "maps incident to namespaces/services/window via catalog"
      ],
      [
        "Cluster sweeper",
        "parallel collectors for events, controller state, node conditions, policy objects"
      ],
      [
        "Correlator",
        "temporal alignment and causal-graph construction"
      ],
      [
        "Narrative engine",
        "LLM composing the story with explicit uncertainty and evidence links"
      ],
      [
        "Responder chat",
        "thread-based follow-ups"
      ]
    ],
    "flow": [
      "The incident scope is resolved to concrete cluster objects and a time window.",
      "Sweepers collect API events, controller histories, node states, and rollout records.",
      "The correlator builds a timestamped causal graph.",
      "The narrative engine writes the incident story with evidence links and uncertainty markers.",
      "Responders query for specifics; final evidence is packaged for the postmortem."
    ],
    "platforms": [
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kubernetes API + events",
        "primary evidence source (read-only)"
      ],
      [
        "Prometheus / Loki / Tempo",
        "metrics, logs, traces around the window"
      ],
      [
        "Argo CD / Helm",
        "rollout and revision history"
      ],
      [
        "PagerDuty / incident platform",
        "scope and hand-off"
      ],
      [
        "Backstage catalog",
        "ownership and topology"
      ]
    ],
    "context": [
      "cluster events in window",
      "controller decisions (HPA/KEDA/operator logs)",
      "node conditions and pressure",
      "rollout timeline",
      "network policy/DNS state",
      "topology and dependencies"
    ],
    "tools": [
      "Kubernetes MCP (read-only events, pods, nodes, controllers)",
      "Grafana MCP (Prometheus metrics, Loki logs, Tempo traces)",
      "GitHub MCP (deployment and change history)"
    ],
    "benefits": [
      "Faster shared understanding during the incident, not after.",
      "Causal narratives that make postmortems materially cheaper.",
      "Controller misbehavior (HPA flapping, operator loops) becomes visible and fixable."
    ],
    "security": [
      "Large sweeps must be namespace-scoped and redacted; event and log data can embed sensitive values.",
      "Audit all API reads; cap collection to the incident window to limit data movement."
    ],
    "future": [
      "Live mode: stream the causal graph during the incident as events arrive.",
      "Cluster-history replay: identify chronic cascade patterns across past incidents."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      },
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident scope (service · window)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ K8s event & controller sweep                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only\n┌────────────────────────────────────────────────────┐\n│ Causal graph builder                               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Narrative + evidence timeline                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Responder Q&A · extra sweeps                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Evidence → postmortem (idea 36)                    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"incident_id\": \"K8S-INC-00381\",\n  \"incident_window\": {\n    \"start_time\": \"2026-10-05T21:10:00Z\",\n    \"end_time\": \"2026-10-05T21:45:00Z\",\n    \"cluster\": \"prod-eu-west-1\"\n  },\n  \"incident_summary\": \"Node evictions caused by DiskPressure cascaded through PDB constraints, deadlocking Ingress controllers and causing a 12-minute 502 Bad Gateway spike.\",\n  \"root_cause\": {\n    \"primary_trigger\": \"KubeletDiskPressure\",\n    \"culprit_node\": \"ip-10-0-12-84.eu-west-1.compute.internal\",\n    \"confidence_score\": 0.96,\n    \"mechanism\": \"Unrotated container log files filled node root disk to 92%, triggering kubelet eviction of non-critical pods.\"\n  },\n  \"causal_chain\": [\n    {\n      \"step\": 1,\n      \"timestamp\": \"2026-10-05T21:12:04Z\",\n      \"component\": \"Node/ip-10-0-12-84\",\n      \"event\": \"DiskPressure condition reached True\",\n      \"impact\": \"Kubelet marks node NotReady for scheduling and initiates eviction.\"\n    },\n    {\n      \"step\": 2,\n      \"timestamp\": \"2026-10-05T21:13:30Z\",\n      \"component\": \"Pod/ingress-nginx-controller-7f4b8\",\n      \"event\": \"Evicted due to node disk pressure\",\n      \"impact\": \"Replica count dropped below PodDisruptionBudget minAvailable of 3.\"\n    },\n    {\n      \"step\": 3,\n      \"timestamp\": \"2026-10-05T21:14:15Z\",\n      \"component\": \"HPA/ingress-nginx-controller\",\n      \"event\": \"HPA attempted scale-up to 6 replicas, but remaining nodes lacked CPU capacity\",\n      \"impact\": \"3 pending pods scheduled; traffic concentrated on single surviving controller.\"\n    },\n    {\n      \"step\": 4,\n      \"timestamp\": \"2026-10-05T21:16:00Z\",\n      \"component\": \"Service/ingress-nginx-controller\",\n      \"event\": \"P99 latency surged from 12ms to 4200ms with 18% HTTP 502 responses\",\n      \"impact\": \"Production edge customer degradation.\"\n    }\n  ],\n  \"controller_actions_evaluated\": [\n    {\n      \"controller\": \"ClusterAutoscaler\",\n      \"assessment\": \"Delayed scale-out by 4 minutes due to ASG max size limit reached on m5.2xlarge node group.\"\n    }\n  ],\n  \"mitigation_instructions\": {\n    \"immediate_action\": \"Increase node group ASG max size from 12 to 16 and prune stale container logs on node ip-10-0-12-84.\",\n    \"verification_command\": \"kubectl get nodes -l nodegroup=ingress-workers && kubectl get pods -n ingress-nginx\"\n  }\n}"
  },
  {
    "num": 18,
    "slug": "ai-hpa-recommendation-assistant",
    "name": "AI HPA Recommendation Assistant",
    "area": "Kubernetes",
    "tldr": "Design and tune autoscaling policies (HPA, KEDA, VPA) from real traffic patterns instead of YAML folklore.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Autoscaling configs are copied between services and rarely match actual load shape, producing both over-provisioning and painful cold-start gaps.",
    "problem": [
      "Wrong metrics (CPU for queue-driven workers), bad targets, and no stabilization windows cause flapping.",
      "Scale-out lag (cold starts, cache warmup) is ignored, so scaling arrives too late.",
      "Min/max bounds are arbitrary; scale-to-zero is feared rather than engineered.",
      "Event-driven workloads (queues, schedules) get HTTP-era HPA configs."
    ],
    "impact": "Correct autoscaling directly cuts cost and improves latency; wrong autoscaling does both harm simultaneously.",
    "capabilities": [
      [
        "Load pattern analysis",
        "traffic seasonality, burstiness, and growth from metrics history"
      ],
      [
        "Policy design",
        "recommends the right mechanism (HPA vs. KEDA vs. scheduled scaling), metrics, targets, and windows"
      ],
      [
        "Flapping diagnosis",
        "identifies oscillation from behavior and proposes stabilization (behavior blocks, warmup)"
      ],
      [
        "Simulation notes",
        "explains how the proposal would have behaved against last week's load"
      ]
    ],
    "solution": "An advisor that studies each workload's traffic and scaling behavior, then drafts concrete HPA/KEDA configuration PRs with rationale: metric choice, target, min/max, stabilization and scale-down windows — plus what to watch after rollout.",
    "steps": [
      [
        "Measure",
        "request rates/queue depths, current scaling actions, and resource data over 2-4 weeks"
      ],
      [
        "Diagnose",
        "detect flapping, lag, and ceiling hits in current behavior"
      ],
      [
        "Design",
        "LLM drafts the policy with mechanism choice and parameters, grounded in measured patterns"
      ],
      [
        "Deliver",
        "config PR with rationale and monitoring plan"
      ],
      [
        "Verify",
        "post-rollout review of scaling actions vs. expectations"
      ]
    ],
    "hitl": "All changes as reviewable PRs; owners approve for their services.",
    "components": [
      [
        "Traffic analyzer",
        "metric extraction and pattern classification"
      ],
      [
        "Scaling observer",
        "current HPA/KEDA behavior reconstruction"
      ],
      [
        "Policy designer",
        "LLM drafting mechanism + parameters with evidence"
      ],
      [
        "PR generator",
        "manifest edits with annotation rationale"
      ],
      [
        "Verifier",
        "post-rollout scaling-action review"
      ]
    ],
    "flow": [
      "Scheduled analysis profiles workload load and current scaling behavior.",
      "Problems are diagnosed (flapping, lag, wrong metric).",
      "A concrete policy is drafted against the measured pattern, with monitoring suggestions.",
      "The PR is reviewed and rolled out via GitOps; the verifier reports how it behaved."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Prometheus",
        "traffic, queue depth, and scaling metrics"
      ],
      [
        "HPA / KEDA / VPA",
        "policy targets"
      ],
      [
        "GitOps repos",
        "PR delivery"
      ],
      [
        "Grafana",
        "before/after dashboards"
      ]
    ],
    "context": [
      "request/queue metrics with seasonality",
      "current HPA/KEDA config and action history",
      "pod start/warmup times",
      "resource usage",
      "SLOs and latency targets"
    ],
    "tools": [
      "Prometheus / Thanos PromQL API (read usage metrics)",
      "Kubernetes Metrics Server & VPA API (read)",
      "Kubecost / OpenCost API (cost attribution)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Scaling that matches real load: cost down, latency spikes avoided.",
      "End of copy-paste autoscaling configs.",
      "Measured verification closes the loop."
    ],
    "security": [
      "Scale-to-zero proposals need owner opt-in per service.",
      "Avoid metrics endpoints that leak sensitive business data into shared dashboards without review."
    ],
    "future": [
      "Reinforcement-from-outcomes: tune targets from observed latency vs. replica curves.",
      "Cross-service capacity simulation for major events (sales, launches)."
    ],
    "related": [
      {
        "num": 15,
        "name": "AI Kubernetes Resource Optimization Advisor",
        "slug": "ai-kubernetes-resource-optimization-advisor"
      },
      {
        "num": 13,
        "name": "AI Pod Crash Analyzer",
        "slug": "ai-pod-crash-analyzer"
      },
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Traffic & scaling history (Prometheus)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Pattern analyzer (seasonality · bursts)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Policy designer (HPA · KEDA · schedule)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Config PR + rationale + watch plan                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Post-rollout verification                          │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"workload\": {\n    \"namespace\": \"streaming\",\n    \"kind\": \"Deployment\",\n    \"name\": \"video-transcoder\"\n  },\n  \"traffic_profile_assessment\": {\n    \"workload_classification\": \"QUEUE_DRIVEN_WORKER\",\n    \"primary_bottleneck_metric\": \"RabbitMQ queue message backlog depth\",\n    \"current_autoscaler\": \"Kubernetes standard HPA based on CPU utilization (80%)\",\n    \"diagnosed_problems\": [\n      \"CPU utilization metric lags queue backlog spikes by 180-240 seconds\",\n      \"Rapid scale-down occurs during brief job processing pauses, causing high restart thrashing\"\n    ]\n  },\n  \"recommended_autoscaling_policy\": {\n    \"framework\": \"KEDA\",\n    \"resource_kind\": \"ScaledObject\",\n    \"min_replicas\": 2,\n    \"max_replicas\": 30,\n    \"triggers\": [\n      {\n        \"type\": \"rabbitmq\",\n        \"metadata\": {\n          \"queueName\": \"transcode-jobs\",\n          \"targetQueueLength\": \"5\",\n          \"activationTargetQueueLength\": \"1\"\n        }\n      }\n    ],\n    \"behavior_policy\": {\n      \"scale_up\": {\n        \"stabilization_window_seconds\": 0,\n        \"step_policy\": \"MaxPods\",\n        \"value\": 8\n      },\n      \"scale_down\": {\n        \"stabilization_window_seconds\": 300,\n        \"step_policy\": \"Percent\",\n        \"value\": 15\n      }\n    }\n  },\n  \"simulation_results\": {\n    \"simulated_window\": \"7_days_historical\",\n    \"projected_peak_queue_latency_reduction_pct\": 68.4,\n    \"projected_replica_churn_reduction_pct\": 82.0,\n    \"estimated_compute_cost_impact_pct\": -8.5\n  },\n  \"generated_manifest\": \"apiVersion: keda.sh/v1alpha1\nkind: ScaledObject\nmetadata:\n  name: video-transcoder-scaler\n  namespace: streaming\nspec:\n  scaleTargetRef:\n    name: video-transcoder\n  minReplicaCount: 2\n  maxReplicaCount: 30\n  cooldownPeriod: 300\n  triggers:\n  - type: rabbitmq\n    metadata:\n      queueName: transcode-jobs\n      targetQueueLength: \"5\"\"\n}"
  },
  {
    "num": 19,
    "slug": "ai-cluster-operations-agent",
    "name": "AI Cluster Operations Agent",
    "area": "Kubernetes",
    "tldr": "A resident cluster operations agent: watches fleet health, drafts maintenance plans, and executes supervised runbooks via an audited control plane.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Cluster operations — upgrades, node maintenance, certificate rotation, namespace hygiene — are recurring, checklist-heavy work that consumes platform-team capacity.",
    "problem": [
      "Version upgrades and node maintenance require careful sequencing that is re-derived by hand every cycle.",
      "Hygiene tasks (orphaned resources, expired certs, stale namespaces) accumulate silently.",
      "Operators who could do this work safely don't, because access is concentrated in a few experts.",
      "Existing automation is brittle scripts with no reasoning about cluster state."
    ],
    "impact": "An operations agent with a controlled action surface converts the platform team's recurring toil into reviewable proposals and supervised executions.",
    "capabilities": [
      [
        "Fleet health assessment",
        "continuous sweep: versions, CVEs, certificate expiry, node pressure, quota anomalies"
      ],
      [
        "Maintenance planning",
        "drafts upgrade/drain/replacement plans respecting PDBs, topology, and orderings"
      ],
      [
        "Supervised execution",
        "runs pre-approved runbooks through a policy-checked control plane (kagent-style), each step logged"
      ],
      [
        "Hygiene automation",
        "detects and (with approval) cleans orphaned/stale resources"
      ]
    ],
    "solution": "A resident agent platform in-cluster (kagent-style control plane) with a curated tool set: read-everything, plus write actions gated by policy and approval workflows. Scheduled tasks produce maintenance proposals; humans approve; execution is step-wise audited with dry-runs and aborts. Think of it as an SRE teammate whose every action is logged.",
    "steps": [
      [
        "Observe",
        "scheduled fleet sweeps produce a health/maintenance backlog"
      ],
      [
        "Plan",
        "drafts concrete maintenance plans (upgrade order, node-by-node drain steps)"
      ],
      [
        "Approve",
        "humans review plans; approval unlocks a scoped execution session"
      ],
      [
        "Execute",
        "step-wise runbook execution with dry-run, checkpoints, and abort"
      ],
      [
        "Verify & report",
        "post-action verification and a full audit trail"
      ]
    ],
    "hitl": "Nothing executes without an explicit approval per plan; pre-approved routine actions (like cert renewals) run under narrow policy with full audit.",
    "components": [
      [
        "Agent control plane",
        "kagent-style in-cluster runtime defining agents, tools, and policies"
      ],
      [
        "Fleet sweeper",
        "scheduled checks: versions, CVEs, certs, quotas, node health"
      ],
      [
        "Planner",
        "LLM drafting maintenance plans from cluster state and org rules"
      ],
      [
        "Policy gate",
        "OPA/Kyverno-style rules over proposed actions; approval workflow integration"
      ],
      [
        "Executor",
        "tool runtime with scoped credentials, dry-run defaults, step audit log"
      ],
      [
        "Reporting",
        "backlog dashboards and execution reports"
      ]
    ],
    "flow": [
      "Scheduled sweeps maintain a live maintenance backlog.",
      "The planner drafts a plan for the next item (e.g., control-plane upgrade) with step detail.",
      "Approvers review; approval opens a scoped, time-boxed execution session.",
      "The executor runs steps with dry-run and checkpoints; any anomaly aborts.",
      "Verification and the audit trail are published."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "kagent / HolmesGPT",
        "agent runtime and runbook foundations"
      ],
      [
        "Kubernetes API",
        "via policy-gated MCP tools"
      ],
      [
        "OPA / Kyverno",
        "policy gate for actions"
      ],
      [
        "PagerDuty / Slack",
        "approvals and notifications"
      ],
      [
        "Argo CD",
        "GitOps-first execution where possible"
      ]
    ],
    "context": [
      "cluster versions and skew",
      "CVE feeds for deployed images",
      "certificate/credential expiry",
      "node health and pressure",
      "PDB/topology constraints",
      "org maintenance windows"
    ],
    "tools": [
      "Kubernetes MCP (read-all; write actions policy-gated)",
      "OPA / Kyverno Policy Engine",
      "Approval Workflow API (Slack / PagerDuty / Webhook)",
      "Argo CD API (GitOps operations)"
    ],
    "benefits": [
      "Recurring platform toil becomes reviewable proposals.",
      "Maintenance happens on schedule instead of under duress.",
      "Full audit trail satisfies change-management requirements."
    ],
    "security": [
      "The action surface is the design centerpiece: default-deny, allowlisted verbs, time-boxed sessions, dry-run first.",
      "Two-person approval for cluster-affecting plans; emergency path pre-defined and drilled.",
      "Agent runtime runs in a locked-down namespace; its credentials are scoped per tool, never cluster-admin.",
      "Treat all cluster output as untrusted data (prompt injection); schema-validate every plan before execution."
    ],
    "future": [
      "Fleet federation: one agent managing upgrades across many clusters with wave scheduling.",
      "Self-serve maintenance for service teams under platform-set policies.",
      "Integration with cloud provider maintenance events for coordinated node work."
    ],
    "related": [
      {
        "num": 14,
        "name": "AI kubectl Assistant",
        "slug": "ai-kubectl-assistant"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Scheduled fleet sweep                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Maintenance backlog + plans                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human approval per plan                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Step-wise execution (dry-run · checkpoints)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← policy-gated\n┌────────────────────────────────────────────────────┐\n│ Verification + audit report                        │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"maintenance_plan_id\": \"OPS-PLAN-2026-10-K8S-04\",\n  \"operation_type\": \"NODE_DRAIN_AND_UPGRADE\",\n  \"target_cluster\": \"k8s-prod-us-central1\",\n  \"summary\": \"Rolling cordon, drain, and AMI upgrade for 4 worker nodes in node pool 'apps-pool-a'.\",\n  \"risk_rating\": \"MEDIUM\",\n  \"pre_flight_checks\": {\n    \"cluster_health\": \"PASSED (all control plane nodes Ready, etcd latency < 5ms)\",\n    \"pdb_deadlock_risk\": \"PASSED (no PDB currently at 0 allowed disruptions)\",\n    \"spare_cluster_capacity_pct\": 28.5,\n    \"blocking_maintenance_window\": \"ACTIVE (Window: Tuesday 02:00 - 05:00 UTC)\"\n  },\n  \"execution_sequence\": [\n    {\n      \"step_order\": 1,\n      \"node\": \"ip-10-2-1-45.ec2.internal\",\n      \"action\": \"kubectl cordon ip-10-2-1-45.ec2.internal\",\n      \"dry_run_passed\": true,\n      \"drain_parameters\": {\n        \"ignore_daemonsets\": true,\n        \"delete_emptydir_data\": true,\n        \"timeout_seconds\": 300\n      }\n    },\n    {\n      \"step_order\": 2,\n      \"node\": \"ip-10-2-1-45.ec2.internal\",\n      \"action\": \"kubectl drain ip-10-2-1-45.ec2.internal --ignore-daemonsets --delete-emptydir-data --pod-selector='app!=critical-session-store'\",\n      \"dry_run_passed\": true,\n      \"verification_criteria\": \"kubectl get pods --field-selector spec.nodeName=ip-10-2-1-45.ec2.internal count equals 0\"\n    }\n  ],\n  \"abort_and_rollback_triggers\": [\n    \"Cluster-wide HTTP 5xx error rate exceeds 0.5% for > 60 seconds\",\n    \"Any unschedulable pod condition persists > 120 seconds\",\n    \"PDB violation prevents pod eviction past 300 second timeout\"\n  ],\n  \"governance_and_approval\": {\n    \"required_approvers\": [\n      \"@sre-oncall\",\n      \"@platform-lead\"\n    ],\n    \"approval_state\": \"PENDING_DUAL_AUTHORIZATION\",\n    \"time_window_expiration\": \"2026-10-06T05:00:00Z\"\n  }\n}"
  },
  {
    "num": 20,
    "slug": "ai-terraform-error-analyzer",
    "name": "AI Terraform Error Analyzer",
    "area": "IaC",
    "tldr": "Translate cryptic Terraform failures — state locks, provider API errors, drift conflicts — into cause and fix.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Terraform errors are legible to its authors and opaque to everyone else: state locks, serialization conflicts, provider quirks, and refresh errors each need different handling.",
    "problem": [
      "Errors reference internals (state addresses, provider internals) that don't say what to do.",
      "State-related failures scare people into dangerous workarounds (manual state edits).",
      "Provider API rate limits and auth errors look like code failures.",
      "Plan-time vs. apply-time errors have different root causes but similar-looking output."
    ],
    "impact": "Every cryptic Terraform error stalls a deployment until someone experienced decodes it — or worse, someone improvises.",
    "capabilities": [
      [
        "Error classification",
        "state lock, refresh/drift, provider auth/quota, config syntax, dependency cycle, API change"
      ],
      [
        "Safe-path guidance",
        "explains the sanctioned fix (unlock, re-plan, import, provider pin) and warns against unsafe ones"
      ],
      [
        "Context retrieval",
        "pulls the relevant state snippet, provider version, and recent changes to the resource"
      ],
      [
        "Fix drafting",
        "generates the corrected HCL, CLI command, or config change"
      ]
    ],
    "solution": "Wrap Terraform failure points (CI apply jobs, Atlantis, Terraform Cloud runs) with an analyzer that captures stderr, state metadata, and provider config, then returns a diagnosis with the safe remediation path and rationale. Delivered as a CI annotation plus Slack card.",
    "steps": [
      [
        "Capture",
        "on failed plan/apply: stderr, exit code, workspace, provider versions, state backend info"
      ],
      [
        "Enrich",
        "relevant state resource snippet (redacted), recent runs, provider release notes via retrieval"
      ],
      [
        "Diagnose",
        "classify and explain; rank possible causes for ambiguous errors"
      ],
      [
        "Recommend",
        "the safe fix path with commands/HCL and explicit warnings on risky ones"
      ],
      [
        "Deliver",
        "CI annotation + Slack with links to the run"
      ]
    ],
    "hitl": "Advisory. State surgery is explicitly flagged as human-expert territory with a checklist, never automated.",
    "components": [
      [
        "Failure hook",
        "CI/TFC/Atlantis failure events"
      ],
      [
        "Context collector",
        "stderr, run metadata, provider versions, redacted state snippets"
      ],
      [
        "Knowledge retriever",
        "provider release notes and known-issues index"
      ],
      [
        "Diagnosis engine",
        "error taxonomy + LLM reasoning"
      ],
      [
        "Reporter",
        "annotations and Slack cards"
      ]
    ],
    "flow": [
      "A failed run triggers capture of the error output and run metadata.",
      "Enrichment adds provider context and similar past errors.",
      "The model classifies the error and drafts the safe remediation.",
      "The fix appears where the engineer is already looking: CI and Slack."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Terraform / OpenTofu",
        "plan/apply failure capture"
      ],
      [
        "Terraform Cloud / Spacelift / env0 / Atlantis",
        "run APIs as trigger and context"
      ],
      [
        "CI (GitHub Actions/GitLab)",
        "annotations"
      ],
      [
        "Slack",
        "team notifications"
      ]
    ],
    "context": [
      "error output",
      "run/workspace metadata",
      "provider versions",
      "redacted state snippets",
      "recent runs touching the same resources",
      "provider changelogs"
    ],
    "tools": [
      "Terraform & OpenTofu CLI parser (stderr, exit code, plan JSON)",
      "Terraform Cloud / Spacelift / Atlantis API (read run context)",
      "Provider Knowledge Base & Release Notes (RAG retrieval)",
      "CI PR Annotations (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Instant decoding of Terraform's most confusing failure classes.",
      "Fewer risky state manipulations; sanctioned paths become the default.",
      "Recurring provider issues get documented automatically."
    ],
    "security": [
      "State may contain sensitive values: redact rigorously; prefer local models for state-adjacent context.",
      "Analyzer credentials are read-only; it cannot unlock, edit state, or apply."
    ],
    "future": [
      "Pre-flight mode: predict errors from the plan before apply (quota, drift, lock risk).",
      "Provider-upgrade advisor: map deprecated syntax across the codebase with fix PRs."
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 21,
        "name": "AI Terraform Plan Explainer",
        "slug": "ai-terraform-plan-explainer"
      },
      {
        "num": 23,
        "name": "AI IaC Security Analyzer",
        "slug": "ai-iac-security-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Failed plan / apply (CI · TFC · Atlantis)          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Error capture + state/provider context             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM diagnosis (error taxonomy)                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Safe fix path + warnings                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ CI annotation · Slack card                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"diagnostic_id\": \"TF-ERR-7192\",\n  \"execution_context\": {\n    \"workspace\": \"networking-production\",\n    \"phase\": \"terraform_apply\",\n    \"terraform_version\": \"1.8.5\",\n    \"provider\": \"hashicorp/aws v5.42.0\"\n  },\n  \"error_classification\": {\n    \"error_type\": \"STATE_LOCK_HELD\",\n    \"severity\": \"CRITICAL_DEPLOYMENT_BLOCKED\",\n    \"confidence_score\": 0.99\n  },\n  \"raw_error_extract\": \"Error: Error acquiring the state lock: ConditionalCheckFailedException: The conditional request failed\nLock Info:\n  ID:        b7d34c89-21a4-8f0a-6e5a-9b8417c8d901\n  Path:      production-tf-state/networking.tfstate\n  Operation: OperationTypeApply\n  Who:       runner@gh-runner-pod-8b9f\n  Version:   1.8.5\n  Created:   2026-10-05 21:14:02.19 UTC\",\n  \"root_cause_analysis\": {\n    \"summary\": \"State file is locked by a previous GitHub Actions workflow run (ID: 984124) that timed out without running clean-up hooks.\",\n    \"is_lock_stale\": true,\n    \"lock_holder_status\": \"GitHub Actions job exited 42 minutes ago with status 'cancelled'\"\n  },\n  \"remediation\": {\n    \"sanctioned_action\": \"FORCE_UNLOCK\",\n    \"is_state_surgery\": false,\n    \"command\": \"terraform force-unlock b7d34c89-21a4-8f0a-6e5a-9b8417c8d901\",\n    \"pre_requisite_safety_checklist\": [\n      \"Verified GitHub Actions workflow run #984124 is completely stopped\",\n      \"Confirmed no other team member is actively running local terraform apply\",\n      \"Created an automated S3 state snapshot backup before unlocking\"\n    ],\n    \"unsafe_actions_to_avoid\": [\n      \"Do NOT manually delete DynamoDB lock table entries via AWS console.\",\n      \"Do NOT run with '-lock=false' as this risks concurrent state corruption.\"\n    ]\n  }\n}"
  },
  {
    "num": 21,
    "slug": "ai-terraform-plan-explainer",
    "name": "AI Terraform Plan Explainer",
    "area": "IaC",
    "tldr": "Before you approve: a plain-language, per-resource explanation of what the plan will do, why, and what could go wrong.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "`terraform plan` output is the most consequential unread document in infrastructure: hundreds of lines of +/-/~/-/+ symbols whose meaning is blast radius.",
    "problem": [
      "Reviewers approve plans they haven't fully parsed; the -/+ replacement hiding a database replacement is the classic accident.",
      "Why-did-this-change questions (drift, dependency side effects) require state archaeology.",
      "Non-Terraform-fluent stakeholders (security, app owners) can't participate in reviewing infra changes."
    ],
    "impact": "Plan misreads are a leading cause of self-inflicted infra incidents; comprehension is the cheapest control available.",
    "capabilities": [
      [
        "Plan narration",
        "translates the JSON plan into plain language per resource: what changes, why, and what it implies"
      ],
      [
        "Danger highlighting",
        "escalates replacements, deletions, and force-new attributes with clear warnings"
      ],
      [
        "Drift explanation",
        "identifies out-of-band changes being 'corrected' and whether that's expected"
      ],
      [
        "Audience adaptation",
        "technical version for engineers; summary for approvers and auditors"
      ]
    ],
    "solution": "A companion to any plan flow (CI PR check, Atlantis, TFC): parse `terraform show -json`, and produce an explainer — summary block, per-resource table, danger callouts, and a 'why' section traced to source lines or drift. Posted as the PR comment humans actually read before clicking approve.",
    "steps": [
      [
        "Parse",
        "JSON plan from the CI plan step"
      ],
      [
        "Analyze",
        "group actions; detect replacements/deletions; trace causes (diff vs. state vs. provider change)"
      ],
      [
        "Explain",
        "LLM writes the structured explainer with danger callouts"
      ],
      [
        "Publish",
        "PR comment/check summary; optional approval checklist for high-risk plans"
      ]
    ],
    "hitl": "Pure explanation. Approval remains human; the explainer makes that approval informed.",
    "components": [
      [
        "Plan source",
        "consumes plan JSON from CI artifacts or TFC/Atlantis APIs"
      ],
      [
        "Analyzer",
        "deterministic extraction of actions, reasons, and unknowns"
      ],
      [
        "Narrator",
        "LLM explainer with severity emphasis"
      ],
      [
        "Publisher",
        "PR comments/check runs"
      ]
    ],
    "flow": [
      "The plan JSON is fetched from the running pipeline.",
      "Deterministic analysis extracts every action and its reason code.",
      "The narrator writes the explainer, escalating risky actions to the top.",
      "The comment is posted where approval happens."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Terraform / OpenTofu",
        "plan JSON source of truth"
      ],
      [
        "Terraform Cloud / Spacelift / env0 / Atlantis",
        "run integration"
      ],
      [
        "GitHub / GitLab",
        "PR comments and checks"
      ]
    ],
    "context": [
      "plan JSON",
      "state diffs for drift tracing",
      "configuration diff",
      "provider version changes",
      "resource criticality tags"
    ],
    "tools": [
      "Terraform & OpenTofu CLI (plan JSON parser)",
      "VCS PR Comments & Review API (GitHub / GitLab MCP)",
      "Terraform Cloud / Spacelift Run API (read)"
    ],
    "benefits": [
      "Approvals become informed decisions with minimal extra effort.",
      "Replacements and deletions stop sneaking through.",
      "Drift gets explained instead of silently 'fixed'."
    ],
    "security": [
      "Plans can expose sensitive attributes: mask before model calls; local model option for sensitive workspaces.",
      "Keep explainer output free of secret values — it quotes structure, not contents."
    ],
    "future": [
      "Interactive mode: 'what happens to X?' drill-downs from the PR comment.",
      "Blast-radius mapping: overlay plan changes on the dependency graph."
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 20,
        "name": "AI Terraform Error Analyzer",
        "slug": "ai-terraform-error-analyzer"
      },
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Plan JSON from CI / TFC / Atlantis                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Action analyzer (replacements · deletions · drift) │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM narrator (per-resource · audience-tuned)       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ PR explainer + danger callouts                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Informed human approval                            │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"plan_id\": \"tfplan-prod-networking-9182\",\n  \"workspace\": \"networking-production\",\n  \"terraform_version\": \"1.8.5\",\n  \"blast_radius_rating\": \"HIGH\",\n  \"action_summary\": {\n    \"to_add\": 2,\n    \"to_change\": 3,\n    \"to_destroy\": 0,\n    \"to_replace\": 1\n  },\n  \"critical_danger_alerts\": [\n    {\n      \"resource_address\": \"aws_route_table.public_egress\",\n      \"action\": \"replace\",\n      \"forces_replacement_attributes\": [\n        \"vpc_id\"\n      ],\n      \"requires_downtime\": true,\n      \"plain_text_risk\": \"Destroying and recreating this route table will sever internet egress for all 16 public subnet workloads during the 3-5 minute recreation window.\"\n    }\n  ],\n  \"drift_detected\": [\n    {\n      \"resource_address\": \"aws_security_group_rule.ingress_ssh\",\n      \"attribute\": \"cidr_blocks\",\n      \"configured_value\": \"['10.0.0.0/16']\",\n      \"actual_cloud_value\": \"['0.0.0.0/0']\",\n      \"explanation\": \"Out-of-band change opened SSH to the public internet; this Terraform apply will revert port 22 access back to internal VPC only.\"\n    }\n  ],\n  \"resource_changes_narrative\": [\n    {\n      \"resource\": \"aws_subnet.private_app_c\",\n      \"action\": \"create\",\n      \"purpose\": \"Adds third availability zone subnet to satisfy multi-AZ redundancy policy.\"\n    },\n    {\n      \"resource\": \"aws_nat_gateway.public\",\n      \"action\": \"update\",\n      \"purpose\": \"Updates allocation_id to new secondary Elastic IP.\"\n    }\n  ],\n  \"approval_checklist\": [\n    \"Verify maintenance window is active before approving public_egress route table replacement\",\n    \"Confirm on-call network engineer is present in #infra-deploys channel\"\n  ]\n}"
  },
  {
    "num": 22,
    "slug": "natural-language-to-terraform",
    "name": "Natural Language → Terraform",
    "area": "IaC",
    "tldr": "Describe the infrastructure you need in plain language; get a reviewed, standards-compliant Terraform module using your golden modules.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Engineers who know what they need (a queue with a dead-letter policy behind a private endpoint) still can't produce compliant Terraform without a platform engineer's help.",
    "problem": [
      "Hand-written infra drifts from org standards (modules, tagging, security defaults).",
      "Platform teams become bottlenecks for routine requests.",
      "Generic LLM output doesn't know your naming, module registry, or guardrails.",
      "Copy-paste infra from AI chats is a governance nightmare."
    ],
    "impact": "Safe NL→IaC turns platform engineers into reviewers instead of ticket-takers, and keeps self-service inside guardrails.",
    "capabilities": [
      [
        "Intent extraction",
        "clarifying questions to pin down requirements (region, access, retention, env)"
      ],
      [
        "Golden-module composition",
        "generates code that uses YOUR registered modules, not from-scratch HCL"
      ],
      [
        "Standards enforcement",
        "naming, tagging, and security defaults applied automatically"
      ],
      [
        "Plan verification",
        "runs plan in a sandbox so the user sees real impact before anything is proposed"
      ]
    ],
    "solution": "A self-service assistant (web/CLI/Backstage plugin) that interviews the user briefly, composes Terraform from the org's module registry (retrieved via RAG), runs a speculative plan with cost estimate, and opens a PR with explanations. From-scratch HCL is a last resort behind policy checks.",
    "steps": [
      [
        "Request",
        "user describes need; assistant asks clarifying questions"
      ],
      [
        "Compose",
        "retrieves matching golden modules; generates root module + tfvars per standards"
      ],
      [
        "Verify",
        "sandbox `init`/`validate`/`plan` with cost estimate; iterate on errors"
      ],
      [
        "Propose",
        "PR with rationale, plan summary, and cost; routed to platform review"
      ],
      [
        "Learn",
        "accepted patterns feed back into the module library and prompts"
      ]
    ],
    "hitl": "Platform review on every PR (CODEOWNERS). The assistant never applies; it proposes.",
    "components": [
      [
        "Conversation front end",
        "Backstage plugin/CLI/web with structured request flow"
      ],
      [
        "Module registry + retriever",
        "indexed golden modules with usage examples"
      ],
      [
        "Generator",
        "LLM composing standards-compliant root modules"
      ],
      [
        "Sandbox planner",
        "isolated plan runs with cost estimation"
      ],
      [
        "PR publisher",
        "repo PR with explanation and review routing"
      ]
    ],
    "flow": [
      "The user describes the need; clarifications resolve ambiguities.",
      "The generator composes Terraform from retrieved golden modules.",
      "A sandbox plan validates the result and attaches cost.",
      "A PR is opened for platform review; outcomes improve the library."
    ],
    "platforms": [
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Module registry (private registry / Git)",
        "golden modules source"
      ],
      [
        "Backstage",
        "self-service UX via scaffolder/plugin"
      ],
      [
        "GitHub / GitLab",
        "PR flow"
      ],
      [
        "Infracost",
        "cost estimates"
      ],
      [
        "Policy (OPA/Sentinel)",
        "hard guardrails on generated code"
      ]
    ],
    "context": [
      "golden module docs and examples",
      "org standards (naming, tagging)",
      "similar past requests",
      "environment constraints",
      "plan output"
    ],
    "tools": [
      "Private Module Registry API (read modules & examples)",
      "Terraform CLI Sandbox (init/validate/plan)",
      "Infracost CLI (cost estimation)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Self-service without standards erosion.",
      "Platform team time shifts from writing to reviewing.",
      "Every request produces reusable, indexed patterns."
    ],
    "security": [
      "Policy-as-code remains the hard gate regardless of how good the LLM output looks.",
      "Sandbox plans use scoped, expiring credentials; generated code is scanned (secrets/IaC misconfig) before PR.",
      "Prevent prompt-driven scope creep: the assistant can't request elevated permissions, only standard catalog items."
    ],
    "future": [
      "One-click import of existing console-created resources into generated modules.",
      "Drift-aware suggestions: 'you have an unmanaged S3 bucket matching this need — import instead?'"
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 24,
        "name": "AI Infrastructure Documentation Generator",
        "slug": "ai-infrastructure-documentation-generator"
      },
      {
        "num": 48,
        "name": "AI Golden Path Generator",
        "slug": "ai-golden-path-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ User intent (Backstage · CLI · web)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Clarifying questions                               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Golden-module composition                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← RAG over registry\n┌────────────────────────────────────────────────────┐\n│ Sandbox plan + cost estimate                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ PR → platform review                               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"request_id\": \"nl-tf-4091\",\n  \"user_intent\": \"Provision a secure SQS queue for processing order events with a dead-letter queue, 14-day retention, and server-side KMS encryption.\",\n  \"clarified_parameters\": {\n    \"service_owner\": \"orders-team\",\n    \"environment\": \"production\",\n    \"region\": \"us-east-1\",\n    \"retention_days\": 14,\n    \"max_receive_count\": 5\n  },\n  \"retrieved_golden_modules\": [\n    {\n      \"module_name\": \"terraform-aws-sqs-secure\",\n      \"source\": \"app.terraform.io/my-org/sqs-secure/aws\",\n      \"version\": \"~> 3.2.0\",\n      \"compliance_tags_enforced\": [\n        \"Environment\",\n        \"Owner\",\n        \"DataClassification\"\n      ]\n    }\n  ],\n  \"generated_terraform_code\": {\n    \"target_file\": \"modules/order_queue/main.tf\",\n    \"hcl_content\": \"module \"order_events_queue\" {\n  source  = \"app.terraform.io/my-org/sqs-secure/aws\"\n  version = \"~> 3.2.0\"\n\n  name                       = \"orders-processing-events-prod\"\n  message_retention_seconds  = 1209600\n  kms_master_key_id          = \"alias/aws/sqs\"\n  enable_dead_letter_queue   = true\n  max_receive_count          = 5\n\n  tags = {\n    Environment        = \"production\"\n    Owner              = \"orders-team\"\n    DataClassification = \"confidential\"\n  }\n}\",\n    \"policy_as_code_status\": \"PASSED (OPA Sentinel rules 4/4 compliant)\"\n  },\n  \"sandbox_plan_validation\": {\n    \"plan_exit_code\": 0,\n    \"resources_to_create\": 2,\n    \"estimated_monthly_cost_usd\": 4.80,\n    \"validation_summary\": \"Successfully planned: 1 primary SQS queue, 1 DLQ, and 1 redrive policy.\"\n  },\n  \"pull_request\": {\n    \"title\": \"feat(infra): provision orders-processing-events SQS queue via golden module\",\n    \"branch\": \"feat/orders-sqs-queue\",\n    \"target_repo\": \"org/infrastructure-live\",\n    \"assigned_reviewers\": [\n      \"@platform-engineers\"\n    ]\n  }\n}"
  },
  {
    "num": 23,
    "slug": "ai-iac-security-analyzer",
    "name": "AI IaC Security Analyzer",
    "area": "IaC",
    "tldr": "Triage IaC security findings with context: which of these 40 scanner alerts actually matter, and what's the fix?",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "IaC scanners generate floods of findings with generic severities; real risk depends on context (exposure, data sensitivity, compensating controls) that scanners don't model.",
    "problem": [
      "High-volume findings cause alert fatigue; genuinely dangerous ones get lost in the queue.",
      "Severity is static (a public S3 bucket is 'critical' even when encrypted, versioned, and access-logged).",
      "Fixes require understanding intent of the resource, not just flipping an attribute.",
      "Suppression culture: broad ignores accumulate and hide real risk."
    ],
    "impact": "IaC is where security fixes are cheapest — if teams can find the 2 findings that matter among the 40.",
    "capabilities": [
      [
        "Contextual triage",
        "combines scanner findings with resource context (exposure, data class, controls) to re-rank by real risk"
      ],
      [
        "Exploitability reasoning",
        "explains the actual attack path a misconfiguration enables"
      ],
      [
        "Fix generation",
        "produces corrected HCL preserving resource intent"
      ],
      [
        "Suppression review",
        "audits existing ignores for staleness and blanket abuse"
      ]
    ],
    "solution": "On PRs and scheduled scans, run tfsec/Checkov/KICS as usual, then let an LLM triage: merge duplicates, re-rank with resource context, explain attack paths in plain language, and suggest precise fixes. Findings become a small, honest list instead of a wall.",
    "steps": [
      [
        "Scan",
        "run scanners on PR and schedule (nightly full-repo)"
      ],
      [
        "Contextualize",
        "attach resource purpose, exposure, environment, and data classification from catalog/tags"
      ],
      [
        "Triage",
        "LLM re-ranks, dedupes, and explains top findings with attack-path narratives"
      ],
      [
        "Fix",
        "inline HCL suggestions on the PR; verified by re-scan"
      ],
      [
        "Audit",
        "monthly suppression review with auto-flagged stale ignores"
      ]
    ],
    "hitl": "Security engineers set triage policy; PR findings are advisory until teams opt into gates on the top severity class.",
    "components": [
      [
        "Scan orchestrator",
        "multi-scanner execution and result normalization"
      ],
      [
        "Context service",
        "resource metadata from catalog, tags, and network posture"
      ],
      [
        "Triage engine",
        "LLM re-ranking with documented rationale per finding"
      ],
      [
        "Fix generator",
        "HCL suggestions validated by re-scan"
      ],
      [
        "Suppression auditor",
        "ongoing review of ignore directives"
      ]
    ],
    "flow": [
      "Scanners produce normalized findings on PRs and schedules.",
      "Context enrichment attaches exposure and data-sensitivity data.",
      "The triage engine produces a short, ranked, explained list.",
      "Fixes appear inline; suppression hygiene is reviewed periodically."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "tfsec / Checkov / KICS / Semgrep",
        "finding sources"
      ],
      [
        "PR flow (GitHub/GitLab)",
        "comments and gates"
      ],
      [
        "Cloud APIs",
        "exposure/context enrichment"
      ],
      [
        "Security Hub / Defender for Cloud",
        "aggregate findings sync"
      ],
      [
        "Data catalog / tags",
        "data sensitivity context"
      ]
    ],
    "context": [
      "scanner findings",
      "resource configuration",
      "network exposure",
      "environment and data classification",
      "existing suppressions",
      "past incident history for the service"
    ],
    "tools": [
      "Static IaC Scanners (tfsec / Checkov / KICS / Semgrep)",
      "VCS PR Comments & Review API (GitHub / GitLab MCP)",
      "Cloud Context & Asset Inventory API (read-only)"
    ],
    "benefits": [
      "Security signal rises above noise: short lists, real explanations.",
      "Fixes are precise and intent-preserving.",
      "Suppression debt becomes visible and managed."
    ],
    "security": [
      "The LLM's re-ranking must never auto-dismiss findings silently — dismissals are recorded with rationale and reviewable.",
      "Policy-as-code stays the enforcement layer; this system advises humans who then set policy."
    ],
    "future": [
      "Auto-fix PRs for mechanical findings (encryption flags, public-access blocks).",
      "Risk trending: real-risk score per service over time for security leadership."
    ],
    "related": [
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Scanners (tfsec · Checkov · KICS)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Resource context enrichment                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← catalog · tags\n┌────────────────────────────────────────────────────┐\n│ LLM triage (dedupe · re-rank · explain)            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Inline fixes on PR                                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Suppression audit (monthly)                        │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"scan_id\": \"iac-sec-scan-8120\",\n  \"repository\": \"org/ecommerce-core-infra\",\n  \"commit_sha\": \"7b8a9f0e1c2d\",\n  \"raw_scanner_findings_count\": 42,\n  \"contextual_triaged_findings_count\": 2,\n  \"noise_reduction_percentage\": 95.2,\n  \"critical_actionable_findings\": [\n    {\n      \"finding_id\": \"CKV_AWS_144\",\n      \"rule_description\": \"Ensure S3 bucket has cross-region replication enabled\",\n      \"raw_scanner_severity\": \"HIGH\",\n      \"contextual_risk_rating\": \"CRITICAL\",\n      \"resource_address\": \"aws_s3_bucket.customer_invoices\",\n      \"risk_justification\": \"Bucket stores PCI-regulated invoice archives with no cross-region replication, violating org disaster recovery RPO standard of 15 minutes.\",\n      \"attack_or_failure_path\": \"Primary us-east-1 outage causes total invoice ingestion failure and irreversible transaction document loss.\",\n      \"suggested_hcl_fix\": \"resource \"aws_s3_bucket_replication_configuration\" \"invoices\" {\n  role   = aws_iam_role.replication.arn\n  bucket = aws_s3_bucket.customer_invoices.id\n  rule {\n    status = \"Enabled\"\n    destination {\n      bucket = aws_s3_bucket.customer_invoices_backup.arn\n    }\n  }\n}\",\n      \"rescan_verification\": \"VERIFIED_RESOLVED\"\n    }\n  ],\n  \"deprioritized_noise_summary\": [\n    {\n      \"rule_id\": \"CKV_AWS_20\",\n      \"reason_deprioritized\": \"S3 bucket customer_assets allows public read, but resource is intentionally tagged 'asset-type: public-cdn-origin' with dedicated CloudFront distribution.\"\n    }\n  ],\n  \"stale_suppressions_audit\": [\n    {\n      \"file\": \"modules/vpc/security_groups.tf\",\n      \"line\": 48,\n      \"rule_suppressed\": \"CKV_AWS_260\",\n      \"suppression_reason\": \"# checkov:skip=CKV_AWS_260: Temporary bypass for dev testing\",\n      \"age_days\": 184,\n      \"recommendation\": \"REVOKE_SUPPRESSION: Temporary bypass has exceeded 30-day policy limit.\"\n    }\n  ]\n}"
  },
  {
    "num": 24,
    "slug": "ai-infrastructure-documentation-generator",
    "name": "AI Infrastructure Documentation Generator",
    "area": "IaC",
    "tldr": "Keep infrastructure docs alive: auto-generate and refresh module docs, diagrams, and examples from the code itself.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Infrastructure documentation is written once and rots immediately; the code changes, the docs don't, and new engineers inherit folklore.",
    "problem": [
      "Modules lack current docs: inputs, outputs, examples, and caveats live in reviewers' heads.",
      "Architecture diagrams drift from reality within months.",
      "Onboarding questions repeat because knowledge isn't written down where people look.",
      "Manual docs are a chore that everyone defers."
    ],
    "impact": "Accurate docs compound: faster onboarding, safer changes, fewer repeat questions — and generation makes accuracy nearly free.",
    "capabilities": [
      [
        "Doc generation",
        "README per module: inputs/outputs, resources, examples, caveats — derived from code and schema"
      ],
      [
        "Diagram synthesis",
        "Mermaid architecture/sequence diagrams from resource definitions and dependencies"
      ],
      [
        "Drift detection",
        "flags docs vs. code divergence and opens refresh PRs"
      ],
      [
        "Narrative enrichment",
        "writes the 'why' sections from commit history, RFCs, and ADRs via retrieval"
      ]
    ],
    "solution": "A scheduled/push-based generator walks IaC repos, extracts structure (via terraform-docs-style parsing plus LLM enrichment), and maintains docs as PRs — never direct writes. Diagrams regenerate on structural change; narrative sections update only with human review to preserve voice.",
    "steps": [
      [
        "Extract",
        "parse modules/variables/outputs/resources; collect examples and tests"
      ],
      [
        "Generate",
        "produce/update README, Mermaid diagrams, and usage examples"
      ],
      [
        "Compare",
        "diff against existing docs; detect drift"
      ],
      [
        "Propose",
        "doc-refresh PRs with clear scope; auto-merge for mechanical sections (optional)"
      ],
      [
        "Enrich",
        "retrieval adds 'why' context from ADRs/commits where missing"
      ]
    ],
    "hitl": "Doc PRs reviewed like code; mechanical regeneration can auto-merge under label policy.",
    "components": [
      [
        "Repo walker",
        "detects modules, workspaces, and doc targets"
      ],
      [
        "Extractor",
        "schema-level parsing of IaC code"
      ],
      [
        "Generator",
        "LLM + deterministic templates for docs and diagrams"
      ],
      [
        "Drift detector",
        "docs-vs-code comparison"
      ],
      [
        "PR publisher",
        "refresh PRs with labels"
      ]
    ],
    "flow": [
      "A push or schedule triggers repo scanning.",
      "Structure is extracted; docs and diagrams are regenerated.",
      "Diffs become refresh PRs; drift summary is reported.",
      "Reviews keep narrative quality; mechanical updates can auto-merge."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Terraform / OpenTofu / Helm / Kustomize repos",
        "targets"
      ],
      [
        "terraform-docs",
        "deterministic sections to build on"
      ],
      [
        "GitHub / GitLab",
        "PR publishing"
      ],
      [
        "Backstage / TechDocs",
        "docs portal sync"
      ],
      [
        "Mermaid / diagrams.net",
        "diagram formats"
      ]
    ],
    "context": [
      "module code and schemas",
      "examples and tests",
      "commit history and ADRs",
      "existing docs",
      "module registry metadata"
    ],
    "tools": [
      "Terraform-docs & HCL Schema Parser",
      "Mermaid Diagram Engine",
      "VCS PR Creation & Review API (GitHub / GitLab MCP)",
      "Backstage / TechDocs Publishing API"
    ],
    "benefits": [
      "Docs that are actually current — because they're generated.",
      "Onboarding gets real answers instead of archaeology.",
      "Diagrams regenerate with the architecture."
    ],
    "security": [
      "Never render secret values in docs; schema-only extraction with redaction tests in CI.",
      "Public-repo publishing needs an explicit allowlist per module."
    ],
    "future": [
      "Queryable docs: chat over your infra repos ('which modules create KMS keys?').",
      "Runbook hooks: link each module to its operational runbooks automatically."
    ],
    "related": [
      {
        "num": 43,
        "name": "AI DevOps Documentation Generator",
        "slug": "ai-devops-documentation-generator"
      },
      {
        "num": 22,
        "name": "Natural Language → Terraform",
        "slug": "natural-language-to-terraform"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ IaC repo scan (scheduled · push)                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Structure extraction (modules · vars · outputs)    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Generator (docs · Mermaid · examples)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Drift diff → refresh PRs                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human review · auto-merge label                    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"module_name\": \"terraform-aws-vpc-peering\",\n  \"module_path\": \"modules/networking/vpc-peering\",\n  \"version\": \"2.4.0\",\n  \"drift_status\": \"DOCUMENTATION_OUTDATED\",\n  \"detected_changes\": [\n    \"Added new input variable 'auto_accept_peering'\",\n    \"Added output 'peering_connection_status'\",\n    \"Removed deprecated resource 'aws_vpc_peering_connection_options'\"\n  ],\n  \"generated_artifacts\": {\n    \"readme_file\": \"modules/networking/vpc-peering/README.md\",\n    \"inputs_documented\": 7,\n    \"outputs_documented\": 3,\n    \"caveats_and_prerequisites\": [\n      \"Cross-account peering requires the acceptor role ARN to have sts:AssumeRole permissions.\",\n      \"Routes must be explicitly defined in both requester and acceptor route tables.\"\n    ],\n    \"mermaid_architecture_diagram\": \"graph LR\n  subgraph Requester_VPC [Requester VPC 10.0.0.0/16]\n    RT1[Route Table]\n  end\n  subgraph Acceptor_VPC [Acceptor VPC 172.16.0.0/16]\n    RT2[Route Table]\n  end\n  PCX[VPC Peering Connection pcx-09a8b]\n  RT1 -->|172.16.0.0/16| PCX\n  RT2 -->|10.0.0.0/16| PCX\"\n  },\n  \"adr_context_linked\": {\n    \"source_file\": \"docs/adr/0014-cross-account-peering.md\",\n    \"title\": \"ADR 0014: Standardizing Cross-Account Mesh Topology\"\n  },\n  \"pull_request\": {\n    \"branch\": \"docs/refresh-vpc-peering-v2.4.0\",\n    \"title\": \"docs(vpc-peering): auto-refresh module documentation and topology diagram\",\n    \"auto_merge_eligible\": true\n  }\n}"
  },
  {
    "num": 25,
    "slug": "ai-cloud-troubleshooting-assistant",
    "name": "AI Cloud Troubleshooting Assistant",
    "area": "Cloud",
    "tldr": "Investigate AWS/Azure/GCP issues conversationally: the assistant queries cloud APIs read-only, reads the evidence, and explains what's wrong.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Cloud troubleshooting means navigating three console UIs, half-remembered service quirks, and API docs — while the out-of-memory instance is still on fire.",
    "problem": [
      "Each cloud has hundreds of services with different diagnostics patterns (VPC flow logs, SG rules, IAM policies, quotas, service health).",
      "Engineers know what to check but not the exact API/CLI incantation, or lack console access.",
      "Cross-service causality (security group + NACL + route table) requires joining several reads mentally.",
      "Late-night incidents amplify all of the above."
    ],
    "impact": "Faster cloud triage reduces MTTR and — more importantly — reduces the temptation to 'just restart it' without understanding.",
    "capabilities": [
      [
        "Guided cloud investigation",
        "asks the right diagnostic questions per service (is the SG attached? is the subnet routable? is the quota hit?)"
      ],
      [
        "Read-only tool use",
        "runs describe/get/list calls via cloud MCP servers and reads the results for you"
      ],
      [
        "Cross-service correlation",
        "assembles multi-resource explanations (instance + SG + NACL + route) into one narrative"
      ],
      [
        "Runbook retrieval",
        "finds and follows the org's existing runbook for the symptom class"
      ]
    ],
    "solution": "A chat-first assistant (Slack/CLI/web) wired to cloud APIs through scoped, read-only MCP servers. The engineer describes the problem; the assistant plans diagnostic reads, executes them, and explains findings with resource links. It never mutates; it drafts the fix as steps or a pull request against IaC.",
    "steps": [
      [
        "Describe",
        "engineer states the problem and the resource"
      ],
      [
        "Plan",
        "assistant drafts a diagnostic checklist for the service class"
      ],
      [
        "Investigate",
        "read-only API calls via MCP (describe, get, list) with every call shown in the thread"
      ],
      [
        "Correlate",
        "joins multi-resource evidence into an explanation with console deep links"
      ],
      [
        "Recommend",
        "fix steps or IaC PR draft; human executes"
      ]
    ],
    "hitl": "Strictly read-only tool access; the assistant narrates every API call it makes so nothing happens invisibly.",
    "components": [
      [
        "Chat interface",
        "Slack bot with thread context and audit visibility"
      ],
      [
        "Agent runtime",
        "plan-investigate-correlate loop (LangGraph/Agents SDK)"
      ],
      [
        "Cloud MCP servers",
        "AWS/Azure/GCP read-only tool sets"
      ],
      [
        "Runbook retriever",
        "org runbooks and known-issues index"
      ],
      [
        "Audit log",
        "every API call with parameters and result summary"
      ]
    ],
    "flow": [
      "The engineer describes the problem in chat.",
      "The agent plans diagnostics and executes read-only calls, narrating each.",
      "Evidence is correlated into an explanation with deep links to the console/CLI equivalents.",
      "Fix steps or an IaC PR draft are proposed for human execution."
    ],
    "platforms": [
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "AWS / Azure / GCP",
        "via official cloud MCP servers and read-only IAM roles"
      ],
      [
        "Slack / Teams",
        "primary interface"
      ],
      [
        "Terraform repos",
        "fix-as-code drafts"
      ],
      [
        "Confluence / wikis",
        "runbook retrieval"
      ]
    ],
    "context": [
      "resource state via API",
      "cloud service health",
      "org runbooks",
      "service quotas and limits",
      "recent change records"
    ],
    "tools": [
      "Cloud Provider MCP Servers (AWS / Azure / GCP read-only APIs)",
      "Runbook & Incident Wiki Retriever (RAG)",
      "Slack / Teams Interactive Bot",
      "Terraform / IaC Repo Reader"
    ],
    "benefits": [
      "Expert-level cloud diagnostics for every engineer, at any hour.",
      "All investigations auditable: every API call is in the thread.",
      "Fixes flow back as reviewed IaC instead of console clicks."
    ],
    "security": [
      "Read-only roles only (ViewReader/Reader equivalents); no write verbs anywhere in the tool set.",
      "Account/subscription allowlists; sensitive accounts routed to local models.",
      "Prompt injection via resource tags/names is possible: treat API output as data; no action execution from text.",
      "Log every call for security review; cap result sizes."
    ],
    "future": [
      "Supervised write mode with per-service approval gates after trust is earned.",
      "Proactive checks: nightly exposure/health sweep with explained findings."
    ],
    "related": [
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 27,
        "name": "AI IAM Policy Reviewer",
        "slug": "ai-iam-policy-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Engineer describes issue (Slack · CLI)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Diagnostic plan per service class                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Read-only cloud API fan-out                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← cloud MCP servers\n┌────────────────────────────────────────────────────┐\n│ Cross-resource correlation                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Explanation + fix steps / IaC PR                   │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"session_id\": \"cloud-triage-aws-7749\",\n  \"target_cloud\": \"AWS\",\n  \"target_resource\": \"i-098234abcf1248e\",\n  \"symptom\": \"Microservice payment-processor running on EC2 instance cannot establish connection to RDS Aurora cluster.\",\n  \"diagnostic_steps_executed\": [\n    {\n      \"step\": 1,\n      \"mcp_tool\": \"aws_describe_instances\",\n      \"parameters\": {\n        \"instance_ids\": [\n          \"i-098234abcf1248e\"\n        ]\n      },\n      \"result_status\": \"HEALTHY\",\n      \"finding\": \"Instance running in subnet-038af (VPC vpc-0129a, AZ us-east-1a).\"\n    },\n    {\n      \"step\": 2,\n      \"mcp_tool\": \"aws_describe_security_groups\",\n      \"parameters\": {\n        \"group_ids\": [\n          \"sg-081249b\"\n        ]\n      },\n      \"result_status\": \"MISCONFIGURED\",\n      \"finding\": \"Security group sg-081249b has no egress rule for TCP port 5432 to Aurora security group sg-aurora-prod.\"\n    },\n    {\n      \"step\": 3,\n      \"mcp_tool\": \"aws_describe_network_acls\",\n      \"parameters\": {\n        \"subnet_id\": \"subnet-038af\"\n      },\n      \"result_status\": \"PERMITTED\",\n      \"finding\": \"Subnet NACL permits all ephemeral ports and TCP 5432.\"\n    }\n  ],\n  \"root_cause_analysis\": {\n    \"summary\": \"Missing security group egress rule on EC2 instance security group sg-081249b.\",\n    \"culprit_layer\": \"SECURITY_GROUP\",\n    \"confidence_score\": 0.98\n  },\n  \"remediation\": {\n    \"recommended_iac_change\": \"resource \"aws_security_group_rule\" \"ec2_to_aurora\" {\n  type                     = \"egress\"\n  from_port                = 5432\n  to_port                  = 5432\n  protocol                 = \"tcp\"\n  security_group_id        = \"sg-081249b\"\n  source_security_group_id = \"sg-aurora-prod\"\n}\",\n    \"emergency_cli_command\": \"aws ec2 authorize-security-group-egress --group-id sg-081249b --protocol tcp --port 5432 --source-group sg-aurora-prod\",\n    \"verification_command\": \"aws ec2 describe-security-group-rules --filter Name=group-id,Values=sg-081249b\"\n  }\n}"
  },
  {
    "num": 26,
    "slug": "ai-cloud-cost-analysis-assistant",
    "name": "AI Cloud Cost Analysis Assistant",
    "area": "Cloud",
    "tldr": "Explain your cloud bill: what changed, why it changed, who owns it, and what to do about it — in plain language.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Cloud cost reports tell you what was spent, not why. Anomalies arrive as '$12k up in us-east-1' with no story attached.",
    "problem": [
      "Billing data (CUR/exports) is opaque: cost by service/region/tag, but not by cause.",
      "Anomalies (a forgotten load test, a log shipment mistake, an auto-scaling loop) are found weeks later.",
      "Savings recommendations (rightsizing, savings plans, storage tiers) exist but aren't prioritized against engineering effort.",
      "Cost ownership by team is fuzzy without tagging discipline."
    ],
    "impact": "Proactive cost explanation turns FinOps from a monthly surprise into a daily conversation with clear actions.",
    "capabilities": [
      [
        "Anomaly explanation",
        "drills from cost spike → service → resource → cause (deploy, config, usage pattern)"
      ],
      [
        "Forecast reasoning",
        "explains trajectory vs. budget with the drivers called out"
      ],
      [
        "Recommendation prioritization",
        "ranks savings actions by value/effort, with the exact IaC or config change"
      ],
      [
        "Owner attribution",
        "maps spend to teams/services via tags, catalog, and usage metadata"
      ]
    ],
    "solution": "A cost-analysis service on top of billing exports plus usage metrics: scheduled anomaly detection flags changes, the LLM investigates likely causes (correlating deploys, config changes, usage patterns), and posts an explained digest per team with prioritized actions. Chat mode answers 'why did our bill go up?' interactively.",
    "steps": [
      [
        "Ingest",
        "daily CUR/billing export + usage metrics into the warehouse"
      ],
      [
        "Detect",
        "statistical anomaly detection per service/team/region"
      ],
      [
        "Investigate",
        "LLM correlates anomalies with deploys, config changes, and usage shifts"
      ],
      [
        "Explain",
        "per-team digest: what changed, why, owner, recommended action with effort estimate"
      ],
      [
        "Answer",
        "chat follow-ups drilling into any line item"
      ]
    ],
    "hitl": "Read-only analysis; recommendations are actions for engineering teams, not automated changes.",
    "components": [
      [
        "Billing pipeline",
        "CUR/export ingestion into warehouse (Athena/BigQuery/Synapse)"
      ],
      [
        "Anomaly detector",
        "statistical baselines per dimension"
      ],
      [
        "Cause correlator",
        "joins cost anomalies with deploy/config/usage events"
      ],
      [
        "Digest publisher",
        "Slack/email per team with explained findings"
      ],
      [
        "Chat analyst",
        "interactive drill-down over the warehouse"
      ]
    ],
    "flow": [
      "Daily billing and usage data lands in the warehouse.",
      "Anomalies are detected across dimensions.",
      "Each anomaly is correlated with operational events to draft a cause hypothesis.",
      "Explained digests reach owning teams; chat answers follow-up questions from the same data."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "AWS CUR · Azure Cost Management · GCP Billing export",
        "data sources"
      ],
      [
        "Warehouse (Athena / BigQuery / Snowflake)",
        "query layer"
      ],
      [
        "OpenCost / Kubecost",
        "Kubernetes cost attribution"
      ],
      [
        "Deploy records / Git",
        "cause correlation"
      ],
      [
        "Slack",
        "digests and chat"
      ]
    ],
    "context": [
      "billing line items",
      "usage metrics",
      "deploy and config-change timeline",
      "tagging/catalog ownership",
      "savings-plan/RI coverage"
    ],
    "tools": [
      "Cloud Billing Data Warehouse (Athena / BigQuery / Snowflake PromQL / SQL read)",
      "Kubecost / OpenCost API (container spend)",
      "VCS Deployment & Commit History API",
      "Slack / Email Digest Publisher"
    ],
    "benefits": [
      "Cost anomalies explained in days, not month-end.",
      "Savings actions arrive prioritized with concrete change suggestions.",
      "Team-level cost literacy via explained digests."
    ],
    "security": [
      "Billing data is sensitive: warehouse-level access control; model calls receive aggregates, not raw account detail.",
      "Avoid tagging PII into cost metadata."
    ],
    "future": [
      "Policy integration: proposed savings become reviewable IaC PRs automatically.",
      "Unit economics: cost per request/customer for product teams."
    ],
    "related": [
      {
        "num": 15,
        "name": "AI Kubernetes Resource Optimization Advisor",
        "slug": "ai-kubernetes-resource-optimization-advisor"
      },
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      },
      {
        "num": 8,
        "name": "AI Deployment Risk Analyzer",
        "slug": "ai-deployment-risk-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Billing export + usage metrics                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Anomaly detection (service · team · region)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Cause correlation (deploys · config · usage)       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Explained digest per team                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Chat drill-down ('why the increase?')              │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"report_id\": \"finops-anomaly-2026-10-W1\",\n  \"billing_period\": \"2026-10-01 to 2026-10-05\",\n  \"total_month_to_date_spend_usd\": 48290.00,\n  \"projected_eom_spend_usd\": 312000.00,\n  \"budget_forecast_variance_pct\": 24.5,\n  \"cost_anomalies_detected\": [\n    {\n      \"service\": \"AWS NAT Gateway\",\n      \"region\": \"us-east-1\",\n      \"daily_spend_baseline_usd\": 18.50,\n      \"daily_spend_current_usd\": 492.30,\n      \"increase_factor\": \"26.6x\",\n      \"root_cause_attribution\": \"EKS node group in private subnet pulling large 8GB ML container images directly from public Docker Hub via NAT Gateway instead of local ECR pull-through cache.\",\n      \"correlated_deployment\": \"Commit c4d3e2f (deploy customer-churn-ml-worker) at 2026-10-02 14:22 UTC\"\n    }\n  ],\n  \"prioritized_savings_actions\": [\n    {\n      \"priority\": 1,\n      \"action_title\": \"Configure ECR pull-through cache and VPC Gateway Endpoint for S3\",\n      \"service\": \"NAT Gateway / S3\",\n      \"monthly_savings_usd\": 14200.00,\n      \"implementation_effort\": \"LOW (2 hours)\",\n      \"target_file\": \"modules/networking/vpc_endpoints.tf\",\n      \"patch_snippet\": \"resource \"aws_vpc_endpoint\" \"s3\" {\n  vpc_id          = module.vpc.vpc_id\n  service_name    = \"com.amazonaws.us-east-1.s3\"\n  route_table_ids = module.vpc.private_route_table_ids\n}\"\n    }\n  ]\n}"
  },
  {
    "num": 27,
    "slug": "ai-iam-policy-reviewer",
    "name": "AI IAM Policy Reviewer",
    "area": "Cloud",
    "tldr": "Review IAM policies and roles for least privilege: over-grants explained, unused permissions identified, tighter policies drafted.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "IAM is the highest-stakes, least-understood surface in cloud security: policies accrete wildcard grants that nobody remembers adding and nobody dares remove.",
    "problem": [
      "`Action: '*'` spreads because crafting precise policies is genuinely hard.",
      "Access analyzers flag over-grants but not what the principal actually uses or needs.",
      "Reviewing a role's permissions against its real usage is laborious and rarely done.",
      "Tightening policies risks breaking production, so risky grants stay forever."
    ],
    "impact": "Over-broad IAM is the root enabler of most cloud breaches; least-privilege review is the control that never happens because it's too expensive to do manually.",
    "capabilities": [
      [
        "Over-grant analysis",
        "combines Access-Analyzer-style external-access findings with actual usage (CloudTrail/activity logs) to separate 'granted' from 'needed'"
      ],
      [
        "Least-privilege drafting",
        "generates tightened policies from observed usage with explicit 'added because' annotations"
      ],
      [
        "Blast-radius explanation",
        "explains in plain language what a role can actually do (exfiltrate bucket X, escalate via iam:PassRole)"
      ],
      [
        "Safe rollout planning",
        "sequences changes with monitoring for AccessDenied spikes and easy rollback"
      ]
    ],
    "solution": "A policy review service that ingests policies, trust relationships, access-analyzer findings, and usage logs; produces a per-role report (over-grants, unused, escalations, external exposure); and drafts tightened policies as PRs against the IaC repo, with a canary-and-rollback plan attached.",
    "steps": [
      [
        "Collect",
        "policies, roles, trust relationships, analyzer findings, usage logs (90 days)"
      ],
      [
        "Analyze",
        "deterministic pass: granted vs. used; escalation paths; external access"
      ],
      [
        "Explain",
        "LLM narrates findings per role in plain language with risk framing"
      ],
      [
        "Draft",
        "tightened policies as PRs with annotations and rollout/rollback notes"
      ],
      [
        "Monitor",
        "post-merge AccessDenied monitoring with auto-revert proposal"
      ]
    ],
    "hitl": "All tightening via PR review; security and service owners co-approve. Analyzer never edits IAM directly.",
    "components": [
      [
        "IAM collector",
        "policies, roles, analyzers, usage events from cloud APIs"
      ],
      [
        "Usage analyzer",
        "deterministic granted-vs-used comparison"
      ],
      [
        "Risk narrator",
        "LLM explanations and escalation-path analysis"
      ],
      [
        "Policy drafter",
        "generated least-privilege policies with rationale"
      ],
      [
        "Rollout monitor",
        "post-change denial tracking"
      ]
    ],
    "flow": [
      "Scheduled collection snapshots IAM state and usage.",
      "Deterministic analysis separates granted from used permissions.",
      "The model explains each role's real risk and drafts tighter policies.",
      "PRs are reviewed and merged; monitoring catches over-tightening with a rollback path."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "AWS IAM Access Analyzer · Azure · GCP IAM analyzers",
        "finding sources"
      ],
      [
        "CloudTrail / activity logs",
        "usage evidence"
      ],
      [
        "Terraform IaC repos",
        "policy change delivery"
      ],
      [
        "Security ticketing",
        "findings workflow"
      ]
    ],
    "context": [
      "policies and trust relationships",
      "90-day usage logs",
      "access-analyzer findings",
      "resource sensitivity classifications",
      "org role conventions"
    ],
    "tools": [
      "Cloud IAM APIs & Access Analyzers (AWS / Azure / GCP read-only)",
      "CloudTrail & Activity Logs Query Engine (90-day usage)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Least privilege becomes maintainable instead of aspirational.",
      "Unused grants identified with evidence, not guesswork.",
      "Escalation paths (PassRole chains, privilege boundaries) surfaced in plain language."
    ],
    "security": [
      "The reviewer has read-only access; generated policies go through full human review — an automated IAM change is its own incident class.",
      "Usage logs may contain sensitive resource identifiers: redact before model calls.",
      "Beware learned over-fitting: deny recommendations must consider break-glass and seasonal patterns."
    ],
    "future": [
      "Continuous mode: drift alerts when new broad grants appear.",
      "Just-in-time access advisor: recommend shorter-lived credentials where usage is spiky."
    ],
    "related": [
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      },
      {
        "num": 41,
        "name": "AI Security Incident Assistant",
        "slug": "ai-security-incident-assistant"
      },
      {
        "num": 25,
        "name": "AI Cloud Troubleshooting Assistant",
        "slug": "ai-cloud-troubleshooting-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ IAM state + usage logs (read-only)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Granted-vs-used analyzer                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM risk narrative per role                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Tightened policy PRs                               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← annotations + rollback plan\n┌────────────────────────────────────────────────────┐\n│ AccessDenied monitor post-merge                    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"review_id\": \"iam-review-role-8491\",\n  \"role_arn\": \"arn:aws:iam::123456789012:role/DocumentProcessingWorkerRole\",\n  \"account_id\": \"123456789012\",\n  \"observation_window_days\": 90,\n  \"privilege_evaluation\": {\n    \"total_actions_granted\": 148,\n    \"actions_used_in_window\": 12,\n    \"unused_permissions_percentage\": 91.9,\n    \"wildcard_actions_flagged\": [\n      \"s3:*\",\n      \"dynamodb:*\",\n      \"sqs:*\"\n    ]\n  },\n  \"escalation_risks\": [\n    {\n      \"risk_level\": \"CRITICAL\",\n      \"permission\": \"iam:PassRole\",\n      \"resource\": \"*\",\n      \"exploit_scenario\": \"Compromised document worker pod can invoke iam:PassRole with AdministratorAccess role to spin up unauthorized EC2 instances.\"\n    }\n  ],\n  \"least_privilege_policy_draft\": {\n    \"policy_name\": \"DocumentProcessingWorker-Tightened\",\n    \"json_policy\": \"{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"AllowSpecificS3ReadWrite\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:GetObject\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": \"arn:aws:s3:::doc-intake-prod-us-east-1/*\"\n    },\n    {\n      \"Sid\": \"AllowQueuePolling\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"sqs:ReceiveMessage\",\n        \"sqs:DeleteMessage\",\n        \"sqs:GetQueueAttributes\"\n      ],\n      \"Resource\": \"arn:aws:sqs:us-east-1:123456789012:doc-processing-queue\"\n    }\n  ]\n}\"\n  },\n  \"safe_rollout_instructions\": {\n    \"strategy\": \"CANARY_SHADOW_MONITORING\",\n    \"cloudwatch_alarm\": \"DocumentProcessingWorker-AccessDenied-Spikes\",\n    \"revert_plan\": \"Re-attach original policy if AccessDenied events exceed 5 in 15 minutes.\"\n  }\n}"
  },
  {
    "num": 28,
    "slug": "ai-cloud-architecture-advisor",
    "name": "AI Cloud Architecture Advisor",
    "area": "Cloud",
    "tldr": "A Well-Architected reviewer on demand: assess designs and live architecture against best practices, with tradeoffs explained.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Architecture review depends on scarce senior engineers, and Well-Architected reviews happen rarely — usually after something breaks.",
    "problem": [
      "Designs are reviewed ad hoc, inconsistently, and late.",
      "The Well-Architected Frameworks are long documents nobody applies systematically.",
      "Live drift (what's deployed vs. what was designed) is invisible to reviewers.",
      "Tradeoff discussions (cost vs. resilience, consistency vs. latency) need a thinking partner more than a rulebook."
    ],
    "impact": "Earlier, more consistent architecture feedback prevents expensive rework and outages born in design docs.",
    "capabilities": [
      [
        "Design assessment",
        "reviews architecture docs/diagrams against Well-Architected pillars with concrete, prioritized gaps"
      ],
      [
        "Live-arch reality check",
        "compares intended design to deployed state via read-only APIs"
      ],
      [
        "Tradeoff exploration",
        "discusses options (multi-region? queue vs. sync?) with cost/complexity/risk framing"
      ],
      [
        "Improvement roadmap",
        "turns findings into a sequenced improvement plan with effort estimates"
      ]
    ],
    "solution": "An advisory assistant fed with your architecture docs, diagrams, IaC, and live cloud state (read-only). It produces structured assessments per pillar, answers design questions in chat, and drafts improvement roadmaps. Positioned as the always-available first reviewer before human architecture councils.",
    "steps": [
      [
        "Ingest",
        "architecture docs, diagrams (as code), IaC, and live resource topology"
      ],
      [
        "Assess",
        "LLM evaluation against pillar checklists with evidence from the actual setup"
      ],
      [
        "Discuss",
        "chat Q&A for design tradeoffs grounded in the ingested context"
      ],
      [
        "Recommend",
        "prioritized roadmap: finding, why it matters, suggested change, effort"
      ]
    ],
    "hitl": "Advisory only. Architecture decisions stay with humans; the advisor informs the conversation.",
    "components": [
      [
        "Context ingester",
        "docs, diagrams-as-code, IaC, and cloud topology snapshots"
      ],
      [
        "Assessment engine",
        "LLM with pillar frameworks + org-specific standards"
      ],
      [
        "Chat advisor",
        "grounded Q&A interface"
      ],
      [
        "Roadmap publisher",
        "findings → trackable items in the team's tracker"
      ]
    ],
    "flow": [
      "The advisor ingests the current architecture sources.",
      "Assessments compare design and reality against frameworks and org standards.",
      "Engineers explore tradeoffs in chat with cited evidence.",
      "A prioritized roadmap lands in the tracker for human review."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Diagrams-as-code (Mermaid, PlantUML, Structurizr)",
        "design sources"
      ],
      [
        "Cloud read APIs",
        "deployed-state reality check"
      ],
      [
        "Confluence/Notion/ADRs",
        "architecture knowledge base"
      ],
      [
        "Jira/Linear",
        "roadmap items"
      ]
    ],
    "context": [
      "architecture docs and diagrams",
      "IaC definitions",
      "live resource topology",
      "org standards",
      "past incident postmortems",
      "Well-Architected frameworks"
    ],
    "tools": [
      "Cloud Resource Inventory & Topology API (read-only)",
      "Architecture Diagram & Doc Ingestion Engine (Mermaid / Structurizr / Markdown)",
      "Well-Architected Framework Knowledge Base (RAG)",
      "Issue Tracker API (Jira / Linear)"
    ],
    "benefits": [
      "Consistent early feedback on every significant design.",
      "Design-vs-reality drift made visible.",
      "Senior-engineer patterns scaled to every team."
    ],
    "security": [
      "Architecture docs may name sensitive systems: keep assessments within approved providers or local models.",
      "Assessments are advisory; don't let scores become mindless compliance theater."
    ],
    "future": [
      "Scenario testing: 'what happens to this design if the region fails?' reasoning over the topology.",
      "Cost modeling integration for design options."
    ],
    "related": [
      {
        "num": 24,
        "name": "AI Infrastructure Documentation Generator",
        "slug": "ai-infrastructure-documentation-generator"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Docs · diagrams · IaC · live state ingest          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Pillar-by-pillar assessment                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← evidence-based\n┌────────────────────────────────────────────────────┐\n│ Chat tradeoff exploration                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Prioritized improvement roadmap                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human architecture review                          │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"assessment_id\": \"arch-review-checkout-v2\",\n  \"system_name\": \"Global Checkout Platform\",\n  \"cloud_provider\": \"AWS\",\n  \"pillar_scores\": {\n    \"security\": 92,\n    \"reliability\": 62,\n    \"performance_efficiency\": 78,\n    \"cost_optimization\": 70,\n    \"operational_excellence\": 85\n  },\n  \"critical_architectural_gaps\": [\n    {\n      \"pillar\": \"Reliability\",\n      \"finding\": \"Single-AZ RDS Database Cluster\",\n      \"severity\": \"HIGH\",\n      \"design_vs_reality_drift\": \"Architecture RFC 08 specified Multi-AZ deployment; deployed Terraform state shows Multi-AZ set to false in us-east-1a.\",\n      \"failure_mode_analysis\": \"An Availability Zone outage in us-east-1a will cause complete checkout processing failure with estimated RTO > 3 hours.\",\n      \"architectural_tradeoff\": \"Enabling Multi-AZ increases RDS database spend by $840/month but reduces failover RTO from 3 hours to 90 seconds.\"\n    }\n  ],\n  \"improvement_roadmap\": [\n    {\n      \"phase\": 1,\n      \"milestone\": \"Resilience Hardening\",\n      \"actions\": [\n        \"Enable RDS Multi-AZ failover via Terraform PR #341\",\n        \"Configure cross-zone load balancing on internal ALB\"\n      ],\n      \"target_quarter\": \"Q4-2026\"\n    }\n  ]\n}"
  },
  {
    "num": 29,
    "slug": "ai-cloud-resource-optimization-assistant",
    "name": "AI Cloud Resource Optimization Assistant",
    "area": "Cloud",
    "tldr": "Continuously find waste across your cloud: idle resources, oversized instances, storage tiering, and scheduling wins — as reviewable PRs.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Cloud waste accumulates in the gaps: unattached volumes, forgotten snapshots, oversized RDS instances, dev environments running 24/7, and log storage nobody knows is billed.",
    "problem": [
      "Waste detection tools list findings but don't verify them (is this 'idle' volume actually a failover candidate?)",
      "Engineers ignore reports because false positives erode trust.",
      "Actions require cross-team coordination that never happens.",
      "Savings opportunities span services (compute, storage, network, licensing) needing different expertise."
    ],
    "impact": "Compared to compute right-sizing alone (idea 15), whole-cloud optimization routinely finds another 15-30% of bill.",
    "capabilities": [
      [
        "Verified waste findings",
        "corroborates each candidate with usage evidence and owner context before reporting"
      ],
      [
        "Action packaging",
        "each finding ships with the exact IaC/config change and its risk notes"
      ],
      [
        "Prioritization",
        "ranks by savings vs. effort vs. risk, per team"
      ],
      [
        "Trend reporting",
        "shows waste accruing vs. eliminated to keep the program honest"
      ]
    ],
    "solution": "A scheduled optimizer that scans cloud inventory and usage (CUR, CloudWatch/monitor metrics, storage analytics), verifies candidates with LLM reasoning over evidence, and files recommendations — where possible as IaC PRs — to owning teams. Trust comes from verified, explained findings rather than raw lists.",
    "steps": [
      [
        "Inventory",
        "enumerate resources and their usage signals across services"
      ],
      [
        "Candidate detection",
        "deterministic rules: idle, oversized, unattached, unencrypted-but-billed, wrong storage class"
      ],
      [
        "Verify",
        "LLM examines evidence per candidate; rejects weak ones with reasons"
      ],
      [
        "Deliver",
        "PRs or tickets to owning teams with risk notes"
      ],
      [
        "Track",
        "savings realized vs. proposed; report per team"
      ]
    ],
    "hitl": "Recommendations only. Destructive actions (delete snapshot) require owner confirmation even in later phases.",
    "components": [
      [
        "Inventory scanner",
        "multi-service resource and usage enumeration"
      ],
      [
        "Rule engine",
        "deterministic waste heuristics"
      ],
      [
        "Verifier",
        "LLM evidence review and rejection rationale"
      ],
      [
        "Recommendation publisher",
        "PRs/tickets per owning team"
      ],
      [
        "Savings tracker",
        "proposed vs. realized reporting"
      ]
    ],
    "flow": [
      "Scheduled scans build the resource/usage inventory.",
      "Rules propose candidates; the verifier filters with evidence and explanations.",
      "Verified findings become PRs or tickets for owning teams.",
      "Realized savings are tracked and published."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ]
    ],
    "integrations": [
      [
        "AWS / Azure / GCP APIs",
        "inventory and metrics (read-only)"
      ],
      [
        "CUR / billing exports",
        "spend evidence"
      ],
      [
        "IaC repos",
        "PR-based remediation"
      ],
      [
        "OpenCost / Kubecost",
        "K8s overlap"
      ],
      [
        "Slack",
        "team digests"
      ]
    ],
    "context": [
      "resource inventory and utilization",
      "billing line items",
      "tagging/ownership",
      "environment purpose (dev/prod)",
      "backup/DR requirements"
    ],
    "tools": [
      "Cloud Provider APIs (AWS / Azure / GCP inventory & CloudWatch read)",
      "Cloud Billing & CUR Exports Query Engine",
      "Kubecost & OpenCost API",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Verified findings teams actually act on.",
      "Waste program with measured results instead of one-off cleanups.",
      "Cross-service expertise centralized in one advisor."
    ],
    "security": [
      "Never auto-delete; destructive recommendations require explicit owner sign-off with retention checks (is it a backup? compliance hold?)",
      "Inventory scans are read-only and region/allowlist scoped."
    ],
    "future": [
      "Scheduling automation for non-prod (opt-in, with override escape hatch).",
      "Commitment planning: model savings-plan/RI coverage from usage forecasts."
    ],
    "related": [
      {
        "num": 15,
        "name": "AI Kubernetes Resource Optimization Advisor",
        "slug": "ai-kubernetes-resource-optimization-advisor"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      },
      {
        "num": 28,
        "name": "AI Cloud Architecture Advisor",
        "slug": "ai-cloud-architecture-advisor"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Cloud inventory + usage scan                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Candidate detection (idle · oversized · tiering)   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM verification with evidence                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ IaC PRs / team recommendations                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Savings tracking dashboard                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"optimization_sweep_id\": \"opt-sweep-2026-10-06\",\n  \"cloud_provider\": \"AWS\",\n  \"verified_monthly_savings_usd\": 4850.00,\n  \"confidence_threshold\": 0.95,\n  \"verified_waste_findings\": [\n    {\n      \"resource_id\": \"vol-0849204821a\",\n      \"resource_type\": \"EBS Volume\",\n      \"size_gb\": 1000,\n      \"monthly_cost_usd\": 120.00,\n      \"days_unattached\": 62,\n      \"owner\": \"data-engineering\",\n      \"verification_evidence\": \"Volume has remained in 'available' unattached state with 0 IOPS for 62 days. No snapshot retention tags.\",\n      \"compliance_check\": \"PASSED (No legal hold or audit tags)\",\n      \"recommended_action\": \"CREATE_FINAL_SNAPSHOT_AND_DELETE\",\n      \"remediation_iac_pr\": \"https://github.com/org/infra/pull/948\"\n    },\n    {\n      \"resource_id\": \"eipalloc-0192482\",\n      \"resource_type\": \"Unassociated Elastic IP\",\n      \"monthly_cost_usd\": 7.30,\n      \"days_unassociated\": 94,\n      \"owner\": \"legacy-vpn\",\n      \"verification_evidence\": \"Elastic IP unassociated with any ENI since migration to AWS Client VPN 3 months ago.\",\n      \"recommended_action\": \"RELEASE_IP\"\n    }\n  ],\n  \"rejected_waste_candidates\": [\n    {\n      \"resource_id\": \"i-09f1823908\",\n      \"reason_rejected\": \"Instance exhibits 0% CPU utilization over 14 days, but is verified as an active warm-standby DR node for payment routing.\"\n    }\n  ]\n}"
  },
  {
    "num": 30,
    "slug": "ai-alert-investigation-assistant",
    "name": "AI Alert Investigation Assistant",
    "area": "Observability & SRE",
    "tldr": "Every alert arrives pre-investigated: enriched with metrics, logs, recent changes, runbooks, and a first hypothesis before a human looks.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Alerts page humans with a symptom and nothing else; the first 10 minutes of every page are mechanical enrichment that an agent could have finished before the phone buzzed.",
    "problem": [
      "Alerts lack context: what's normal, what changed, what to check first.",
      "Runbooks exist but aren't linked, or don't match the actual alert.",
      "Duplicate/related alerts fire simultaneously, multiplying noise.",
      "Alert quality decays because feedback about useless alerts has no channel."
    ],
    "impact": "Pre-investigated alerts cut time-to-engagement dramatically and filter the noise that burns out on-call engineers.",
    "capabilities": [
      [
        "Auto-enrichment",
        "attaches relevant dashboards, top queries, log patterns, deploys, and linked tickets to each alert"
      ],
      [
        "First hypothesis",
        "a ranked 'likely causes' list with suggested first checks"
      ],
      [
        "Correlation",
        "groups related alerts firing together into one incident view"
      ],
      [
        "Runbook matching",
        "retrieves the best-matching runbook and highlights the relevant section"
      ]
    ],
    "solution": "An enrichment stage between Alertmanager/PagerDuty and humans: on alert, an agent runs a bounded investigation (30-60 seconds of tool calls over metrics/logs/deploys) and appends a structured context card to the page and incident thread. Feedback buttons tune future quality.",
    "steps": [
      [
        "Trigger",
        "alert webhook from Alertmanager/PagerDuty/monitoring SaaS"
      ],
      [
        "Bound",
        "identify service, dashboard set, and check list from the alert and catalog"
      ],
      [
        "Enrich",
        "parallel reads: metric snapshots, log patterns, recent deploys, similar past alerts"
      ],
      [
        "Hypothesize",
        "ranked causes + first checks + runbook excerpt"
      ],
      [
        "Deliver",
        "context card on the page/Slack thread; dedupe/correlate siblings"
      ],
      [
        "Learn",
        "human feedback (useful/noise) tracked per alert rule"
      ]
    ],
    "hitl": "Enrichment only — the page still goes out. The agent never resolves, silences, or escalates alerts autonomously.",
    "components": [
      [
        "Alert ingester",
        "normalizes alerts from multiple sources"
      ],
      [
        "Enrichment agent",
        "budgeted tool-use loop over observability MCP tools"
      ],
      [
        "Correlator",
        "groups co-firing alerts by service/dependency"
      ],
      [
        "Runbook retriever",
        "vector search over runbooks keyed by alert signature"
      ],
      [
        "Card publisher",
        "attaches enrichment to PagerDuty/Slack"
      ],
      [
        "Feedback collector",
        "per-rule usefulness tracking"
      ]
    ],
    "flow": [
      "An alert triggers a bounded investigation.",
      "The agent runs parallel read-only checks within a strict time budget.",
      "A context card (metrics, logs, changes, hypothesis, runbook) is attached to the page.",
      "Related alerts are grouped; feedback is recorded for tuning."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Prometheus / Alertmanager",
        "alert source"
      ],
      [
        "PagerDuty / Opsgenie",
        "page enrichment"
      ],
      [
        "Grafana / Loki",
        "evidence via MCP"
      ],
      [
        "GitHub / deploy records",
        "change correlation"
      ],
      [
        "Slack",
        "incident threads"
      ]
    ],
    "context": [
      "alert payload and labels",
      "metric snapshots around the window",
      "log patterns",
      "recent deploys and config changes",
      "similar past alerts and resolutions",
      "runbook corpus"
    ],
    "tools": [
      "Alertmanager & PagerDuty Webhook API",
      "Grafana MCP (Prometheus metrics & Loki logs read)",
      "VCS & CI/CD Deployment History API",
      "Runbook Knowledge Base (Vector RAG)"
    ],
    "benefits": [
      "Responders start with a briefing, not a symptom.",
      "Noise groups up instead of stacking up.",
      "Alert-rule quality finally gets a feedback loop."
    ],
    "security": [
      "Strict time and call budget per alert to control cost and runaway loops.",
      "Enrichment is read-only; silence/resolve actions stay human.",
      "Sensitive environments can be excluded or routed to local models."
    ],
    "future": [
      "Auto-triage classes: known-safe alerts get de-prioritized summaries instead of pages (with policy).",
      "Alert-rule doctor: weekly report of noisy rules with suggested fixes."
    ],
    "related": [
      {
        "num": 4,
        "name": "AI Log Analyzer",
        "slug": "ai-log-analyzer"
      },
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 35,
        "name": "AI Anomaly Investigation Agent",
        "slug": "ai-anomaly-investigation-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Alert webhook                                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Service resolution (catalog · labels)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Bounded investigation (metrics · logs · deploys)   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← 30-60s budget\n┌────────────────────────────────────────────────────┐\n│ Context card + first hypothesis                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Page + thread (correlated)                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"alert_id\": \"alert-k8s-ingress-5xx-91823\",\n  \"alert_name\": \"High5xxErrorRateSpike\",\n  \"service\": \"customer-api-gateway\",\n  \"severity\": \"CRITICAL\",\n  \"investigation_latency_seconds\": 28,\n  \"telemetry_context\": {\n    \"error_rate_current_pct\": 14.8,\n    \"error_rate_baseline_pct\": 0.04,\n    \"p99_latency_ms\": 3200,\n    \"affected_http_status\": \"502 Bad Gateway\",\n    \"top_error_log_signature\": \"upstream connect error or disconnect/reset before headers\"\n  },\n  \"change_correlation\": {\n    \"recent_deployments\": [\n      {\n        \"service\": \"customer-api-gateway\",\n        \"version\": \"v2.18.2\",\n        \"deployed_at\": \"12 minutes ago\",\n        \"deployer\": \"github-actions-bot\",\n        \"commit_message\": \"feat: introduce connection keep-alive pool timeout\"\n      }\n    ]\n  },\n  \"top_ranked_hypotheses\": [\n    {\n      \"rank\": 1,\n      \"confidence_score\": 0.93,\n      \"hypothesis\": \"Keep-alive idle timeout mismatch between API Gateway (60s) and downstream customer-service (15s) causes gateway to send requests over closed connections.\",\n      \"supporting_evidence\": \"502 Bad Gateway surge began exactly 60 seconds after v2.18.2 canary reached 50% traffic.\"\n    }\n  ],\n  \"matched_runbook\": {\n    \"title\": \"API Gateway 502 Upstream Connection Troubleshooting\",\n    \"url\": \"https://wiki.corp.internal/sre/runbooks/api-gateway-502\",\n    \"key_step_excerpt\": \"Verify that gateway idleTimeout is strictly lower than downstream service server.keepAliveTimeout.\"\n  },\n  \"suggested_first_action\": \"Roll back deployment v2.18.2 via GitOps PR or adjust upstream keep-alive timeout to 10s.\"\n}"
  },
  {
    "num": 31,
    "slug": "ai-incident-summarizer",
    "name": "AI Incident Summarizer",
    "area": "Observability & SRE",
    "tldr": "Live incident summaries for every audience: exec updates, channel newcomers' briefings, and stakeholder comms drafted from the real timeline.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "During incidents, communication competes with mitigation for the incident commander's attention, and it loses — leaving executives, support, and newcomers in the dark.",
    "problem": [
      "Execs ask 'what's the impact and ETA?' mid-incident, interrupting the IC.",
      "Joining responders lack a briefing and waste minutes scrolling the channel.",
      "Customer-facing/support teams get inconsistent or delayed information.",
      "Post-incident, reconstructing communication history is painful."
    ],
    "impact": "Good incident communication preserves trust and prevents the 'circle back and ask what happened' tax on the whole org.",
    "capabilities": [
      [
        "Timeline synthesis",
        "reads the incident channel/timeline and produces an accurate current-state summary"
      ],
      [
        "Audience adaptation",
        "exec brief (impact, status, ETA, next update), responder briefing (what's known/tried/believed), support script"
      ],
      [
        "Periodic updates",
        "scheduled drafts every N minutes for IC approval"
      ],
      [
        "Closure recap",
        "end-of-incident summary for the record and postmortem seed"
      ]
    ],
    "solution": "A summarizer bot watching the incident channel and timeline data: it drafts audience-specific updates on demand ('/brief execs') or on schedule, always posted as drafts for IC approval before sending. Nothing goes out unreviewed.",
    "steps": [
      [
        "Observe",
        "ingest channel messages, timeline events, and status changes"
      ],
      [
        "Draft",
        "audience-specific summaries grounded in the actual timeline"
      ],
      [
        "Review",
        "IC edits/approves in a thread"
      ],
      [
        "Distribute",
        "approved updates to target channels"
      ],
      [
        "Archive",
        "communication log preserved for the postmortem"
      ]
    ],
    "hitl": "Every external update requires IC approval; the bot drafts, humans speak.",
    "components": [
      [
        "Channel listener",
        "reads incident threads (with access controls)"
      ],
      [
        "Timeline integration",
        "incident platform events"
      ],
      [
        "Summary engine",
        "audience templates + LLM drafting"
      ],
      [
        "Approval flow",
        "IC review interactions"
      ],
      [
        "Archive",
        "comms log for review and training"
      ]
    ],
    "flow": [
      "During an incident, the listener maintains a rolling view of events and messages.",
      "Drafts for each audience are generated on schedule or demand.",
      "The IC edits and approves; approved text is distributed.",
      "The full communication log is archived for the postmortem."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Slack / Teams",
        "channel listening and posting"
      ],
      [
        "PagerDuty / FireHydrant / incident.io",
        "timeline source"
      ],
      [
        "Status page",
        "optional approved publishing"
      ]
    ],
    "context": [
      "incident channel messages",
      "timeline events",
      "severity and status",
      "impacted services",
      "past incident comms style"
    ],
    "tools": [
      "Incident Management Platform API (PagerDuty / FireHydrant / incident.io read)",
      "Slack / Teams Bot API (post drafts & notifications upon approval)",
      "Statuspage API (draft customer status updates)"
    ],
    "benefits": [
      "IC time goes to mitigation, not narration.",
      "Consistent, honest updates build org trust.",
      "Newcomers get instant briefings."
    ],
    "security": [
      "Incident channels contain sensitive info: summaries respect channel boundaries; no cross-posting secrets.",
      "Drafts-only default prevents the bot from ever speaking unapproved to execs/customers."
    ],
    "future": [
      "Multilingual comms for global support teams.",
      "Sentiment check: flag when stakeholder questions are drifting unanswered."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      },
      {
        "num": 50,
        "name": "AI On-Call Copilot",
        "slug": "ai-on-call-copilot"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident channel + timeline ingest                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Summary drafter (per audience)                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ IC review thread                                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Approved distribution                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Comms archive → postmortem                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"incident_id\": \"INC-2026-10-9182\",\n  \"incident_title\": \"Elevated 504 Gateway Timeouts in Payment Checkout Service\",\n  \"severity\": \"SEV-1\",\n  \"status\": \"IDENTIFIED\",\n  \"incident_duration_minutes\": 42,\n  \"executive_briefing\": {\n    \"status_headline\": \"Identified connection pool exhaustion; failover in progress with 85% traffic recovered.\",\n    \"business_impact\": \"Approximately 480 checkout transactions failed between 23:10 and 23:40 UTC.\",\n    \"customer_exposure\": \"Desktop and mobile checkout flows experienced intermittent 504 errors.\",\n    \"estimated_full_recovery_time\": \"2026-10-06T00:15:00Z\",\n    \"next_scheduled_update\": \"2026-10-06T00:00:00Z\"\n  },\n  \"responder_handoff\": {\n    \"timeline_summary\": \"At 23:12 UTC, alert High5xxErrorRate fired. Canary v2.18.2 identified with keep-alive timeout misconfiguration. Rollback initiated at 23:36 UTC.\",\n    \"hypotheses_disproven\": [\n      \"Stripe downstream mock latency remained steady at 38ms (ruled out external gateway failure)\"\n    ],\n    \"current_workstream\": \"Verifying error rates across all regional edge Envoy clusters post-rollback.\",\n    \"incident_leadership\": {\n      \"incident_commander\": \"@alex-sre\",\n      \"technical_lead\": \"@sam-backend\"\n    }\n  },\n  \"support_team_macro\": {\n    \"customer_facing_summary\": \"We are currently addressing an issue impacting checkout processing. A fix is deployed and transactions are recovering.\",\n    \"agent_guidance\": \"Advise customers who received a failed payment notice to retry their transaction. Do not submit duplicate manual refund requests.\",\n    \"public_statuspage_url\": \"https://status.example.com/incidents/inc-9182\"\n  },\n  \"approval_state\": {\n    \"requires_ic_approval\": true,\n    \"drafted_at\": \"2026-10-05T23:48:12Z\",\n    \"ready_to_publish\": true\n  }\n}"
  },
  {
    "num": 32,
    "slug": "ai-root-cause-analysis-assistant",
    "name": "AI Root Cause Analysis Assistant",
    "area": "Observability & SRE",
    "tldr": "Guide root-cause analysis with evidence: candidate causes ranked by data, each with the check that confirms or kills it.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "RCA often converges too fast on the first plausible story ('network was flaky') because testing alternative hypotheses is expensive and unfashionable.",
    "problem": [
      "Multiple plausible causes exist; humans anchor on the first one.",
      "Evidence gathering for each hypothesis is manual and slow.",
      "Five-whys sessions drift into blame rather than mechanism.",
      "Confirmed root causes aren't connected to the actions that actually prevented recurrence."
    ],
    "impact": "Structured, evidence-based RCA produces fixes that work — and a culture where 'we don't know yet' is acceptable mid-analysis.",
    "capabilities": [
      [
        "Hypothesis generation",
        "candidate causes from the incident evidence, including unglamorous ones (quota, DNS, cache)"
      ],
      [
        "Discriminating tests",
        "for each hypothesis, the specific query/check that would confirm or refute it"
      ],
      [
        "Evidence scoring",
        "updates ranking as humans feed back results"
      ],
      [
        "Mechanism narrative",
        "explains the full causal chain once evidence converges"
      ]
    ],
    "solution": "An RCA companion for the investigation phase (post-mitigation or during): it reads the incident evidence (from idea 05's investigation or raw sources), proposes a hypothesis tree, and for each branch names the decisive check. Humans run checks and report back; the assistant re-ranks and narrates the emerging mechanism.",
    "steps": [
      [
        "Load evidence",
        "incident timeline, metrics, logs, changes, past incidents"
      ],
      [
        "Propose",
        "hypothesis tree with priors based on base rates and history"
      ],
      [
        "Guide",
        "for each hypothesis: the discriminating check (query/command)"
      ],
      [
        "Update",
        "re-rank as results come in; eliminate or escalate branches"
      ],
      [
        "Narrate",
        "final causal chain with residual-uncertainty notes"
      ]
    ],
    "hitl": "Humans run all checks; the assistant structures the process. It can be wrong — its job is to make hypotheses explicit and testable, not to declare truth.",
    "components": [
      [
        "Evidence loader",
        "pulls from investigation packages (idea 05) or raw sources"
      ],
      [
        "Hypothesis engine",
        "LLM + historical base rates from past RCAs"
      ],
      [
        "Check recommender",
        "maps hypotheses to concrete queries/commands"
      ],
      [
        "State tracker",
        "hypothesis tree status through the session"
      ],
      [
        "Narrative writer",
        "final mechanism description"
      ]
    ],
    "flow": [
      "Evidence is loaded from the incident record.",
      "A hypothesis tree is proposed with initial ranking.",
      "Each round, the assistant names the most decisive next check.",
      "Results update the tree; the final narrative explains the mechanism and what remains unknown."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Incident platform",
        "evidence source"
      ],
      [
        "Grafana / Loki / traces",
        "checks via MCP"
      ],
      [
        "Postmortem tools",
        "output hand-off"
      ]
    ],
    "context": [
      "incident timeline",
      "metrics/logs/traces",
      "change history",
      "past RCA records",
      "architecture/topology"
    ],
    "tools": [
      "Observability MCP (Prometheus metrics, Loki logs, Tempo traces read)",
      "Incident Management Platform API (read incident package)",
      "Knowledge Base / Past Postmortems RAG"
    ],
    "benefits": [
      "Faster convergence on true causes with fewer anchoring errors.",
      "Explicit uncertainty instead of confident guesses.",
      "Better postmortems: mechanism, not just chronology."
    ],
    "security": [
      "RCA narratives can name people/systems: keep them in access-controlled postmortem tools.",
      "Blameless framing enforced in templates and prompts."
    ],
    "future": [
      "Base-rate learning: which hypothesis classes actually win in your org.",
      "Interactive simulation: replay candidate mechanisms against recorded telemetry."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      },
      {
        "num": 17,
        "name": "AI Kubernetes Incident Investigator",
        "slug": "ai-kubernetes-incident-investigator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident evidence loaded                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Hypothesis tree proposed                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← priors from history\n┌────────────────────────────────────────────────────┐\n│ Discriminating checks suggested                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Humans run checks · results fed back               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Causal-chain narrative + uncertainty               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"rca_case_id\": \"RCA-2026-10-04\",\n  \"incident_ref\": \"INC-2026-10-9182\",\n  \"primary_symptom\": \"504 Gateway Timeout spike reaching 18% during payment checkout operations\",\n  \"hypothesis_tree\": [\n    {\n      \"hypothesis_id\": \"H1\",\n      \"rank\": 1,\n      \"title\": \"Keep-alive connection pool timeout mismatch between Ingress Envoy and backend payment-service\",\n      \"prior_probability\": 0.85,\n      \"discriminating_check\": {\n        \"check_type\": \"LogQL\",\n        \"command_or_query\": \"{app=\"ingress-nginx\"} |= \"upstream connect error or disconnect/reset before headers\"\",\n        \"expected_if_true\": \"High volume of premature connection resets originating immediately after 15s idle intervals.\",\n        \"expected_if_false\": \"Evenly distributed timeouts occurring across full request duration spectrum (>60s).\"\n      },\n      \"evaluation_status\": \"CONFIRMED\"\n    },\n    {\n      \"hypothesis_id\": \"H2\",\n      \"rank\": 2,\n      \"title\": \"Database connection pool exhaustion on Postgres primary replica\",\n      \"prior_probability\": 0.10,\n      \"discriminating_check\": {\n        \"check_type\": \"PromQL\",\n        \"command_or_query\": \"pg_stat_activity_count{state=\"active\"} / pg_settings_max_connections\",\n        \"expected_if_true\": \"Database connection utilization ratio exceeding 95%.\",\n        \"expected_if_false\": \"Utilization steady under 40%.\"\n      },\n      \"evaluation_status\": \"REFUTED\"\n    }\n  ],\n  \"confirmed_mechanism_narrative\": {\n    \"trigger_event\": \"Commit a1b2c3d lowered backend Node.js server.keepAliveTimeout to 15 seconds to save idle socket memory.\",\n    \"propagation_path\": \"Upstream Envoy ingress maintained a 60-second idle connection timeout. Envoy dispatched active checkout requests over sockets that Node.js had already closed, producing immediate 502/504 Bad Gateway responses.\",\n    \"safeguard_failure\": \"Integration tests lacked HTTP keep-alive socket reuse assertion under idle delay conditions.\",\n    \"residual_uncertainties\": [\n      \"Determining why Envoy did not automatically retry idempotent GET/POST requests upon initial socket reset.\"\n    ]\n  }\n}"
  },
  {
    "num": 33,
    "slug": "ai-prometheus-query-generator",
    "name": "AI Prometheus Query Generator",
    "area": "Observability & SRE",
    "tldr": "Describe the question; get correct PromQL/LogQL with your actual metric names, labels, and conventions — not hallucinated ones.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "PromQL is powerful and unforgiving: correct-looking queries return wrong numbers, and the metric/label zoo per org makes even experts guess names.",
    "problem": [
      "Metric names and label conventions vary per org; generic LLM answers hallucinate them.",
      "Subtle semantics (rate vs. irate, sum by, histogram_quantile, absent()) produce silent errors.",
      "Dashboards and alerts need the same query in several variations; humans hand-edit and drift.",
      "Newcomers can't self-serve even for simple questions."
    ],
    "impact": "Query generation is the gateway skill for observability self-service; getting it right (with real metadata) unlocks everything downstream.",
    "capabilities": [
      [
        "Metadata-grounded generation",
        "queries the metrics API/catalog first, then writes PromQL against real names and labels"
      ],
      [
        "Correctness guardrails",
        "explain semantics (rate windows, joins, quantiles) and flag common mistakes"
      ],
      [
        "Variations",
        "same question as instant query, range query, recording rule, and alert rule"
      ],
      [
        "Validation loop",
        "executes the query and iterates on empty/error results"
      ]
    ],
    "solution": "A query assistant embedded in Grafana/CLI/chat that always fetches available metrics and label values before generating. Results include the executed query, a short explanation, and the data returned — so the human verifies meaning, not just syntax.",
    "steps": [
      [
        "Discover",
        "list matching metrics/labels from the live API (no guessing)"
      ],
      [
        "Generate",
        "PromQL/LogQL tailored to the question and metadata"
      ],
      [
        "Execute",
        "run against the data source; iterate on errors/empty sets"
      ],
      [
        "Explain",
        "semantics summary and caveats"
      ],
      [
        "Package",
        "offer as panel/recording-rule/alert snippet"
      ]
    ],
    "hitl": "The assistant executes read-only queries and shows results; humans decide what becomes a dashboard or alert.",
    "components": [
      [
        "Metadata service",
        "metrics/label inventory (including custom recording rules)"
      ],
      [
        "Generator",
        "LLM constrained to discovered names"
      ],
      [
        "Executor",
        "read-only query client"
      ],
      [
        "Packager",
        "dashboard/alert rule drafts"
      ]
    ],
    "flow": [
      "The user asks a data question.",
      "The assistant discovers the real metrics and labels available.",
      "It generates, executes, and if needed iterates the query.",
      "The verified query plus explanation is returned, ready to save."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Prometheus / Thanos / Mimir",
        "query APIs and metadata"
      ],
      [
        "Loki / Elasticsearch",
        "log queries"
      ],
      [
        "Grafana",
        "panel creation and Explore links"
      ],
      [
        "Grafana Assistant / mcp-grafana",
        "build-on option"
      ]
    ],
    "context": [
      "live metric/label inventory",
      "recording-rule catalog",
      "dashboard conventions",
      "service SLOs",
      "the user's question and context"
    ],
    "tools": [
      "Prometheus / Thanos / Mimir HTTP API (metadata discovery & read-only query execution)",
      "Loki / Elasticsearch Query API",
      "Grafana Assistant & MCP Client"
    ],
    "benefits": [
      "Correct queries from day one; metadata grounding kills hallucinated metric names.",
      "Faster dashboard and alert authoring.",
      "Team-wide query literacy improvement."
    ],
    "security": [
      "Query results can expose business data: respect Grafana/datasource permissions; the assistant runs under the user's access.",
      "Cap query cost/time to protect the TSDB."
    ],
    "future": [
      "SLO copilot: draft SLO definitions and burn-rate alerts from service descriptions.",
      "Query review bot for PRs touching dashboards/alerts."
    ],
    "related": [
      {
        "num": 34,
        "name": "AI Grafana Dashboard Assistant",
        "slug": "ai-grafana-dashboard-assistant"
      },
      {
        "num": 4,
        "name": "AI Log Analyzer",
        "slug": "ai-log-analyzer"
      },
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Question in natural language                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Metric/label discovery (live API)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← no hallucination\n┌────────────────────────────────────────────────────┐\n│ Query generation + execution loop                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Explanation + caveats                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Panel · recording rule · alert snippet             │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"query_id\": \"promql-gen-7491\",\n  \"user_intent\": \"Calculate P95 HTTP request duration for checkout-service partitioned by endpoint handler, excluding client 4xx errors.\",\n  \"target_engine\": \"Prometheus / Thanos\",\n  \"discovered_metadata\": {\n    \"matched_metric\": \"http_request_duration_seconds_bucket\",\n    \"verified_labels\": [\n      \"service\",\n      \"handler\",\n      \"status_code\",\n      \"le\"\n    ],\n    \"sample_series_count\": 48\n  },\n  \"generated_promql\": \"histogram_quantile(0.95, sum by (le, handler) (rate(http_request_duration_seconds_bucket{service=\"checkout-service\", status_code!~\"4..\"}[5m])))\",\n  \"semantics_breakdown\": [\n    {\n      \"operator\": \"histogram_quantile(0.95, ...)\",\n      \"explanation\": \"Calculates the 95th percentile latency from histogram buckets.\"\n    },\n    {\n      \"operator\": \"rate(...[5m])\",\n      \"explanation\": \"Calculates per-second rate over a 5-minute window to smooth bursty traffic.\"\n    },\n    {\n      \"operator\": \"sum by (le, handler)\",\n      \"explanation\": \"Preserves 'le' bucket boundary label required by histogram_quantile while grouping by 'handler'.\"\n    },\n    {\n      \"operator\": \"status_code!~\"4..\"\",\n      \"explanation\": \"Regex exclusion of client 4xx errors (bad requests, not found).\"\n    }\n  ],\n  \"execution_validation\": {\n    \"executed\": true,\n    \"execution_time_ms\": 32,\n    \"returned_series_count\": 4,\n    \"sample_output\": [\n      {\n        \"handler\": \"/v1/checkout/pay\",\n        \"value_seconds\": 0.428\n      },\n      {\n        \"handler\": \"/v1/checkout/validate\",\n        \"value_seconds\": 0.084\n      }\n    ]\n  },\n  \"packaged_rules\": {\n    \"recording_rule_yaml\": \"record: job:checkout_http_request_duration:p95_5m\nexpr: histogram_quantile(0.95, sum by (le, handler) (rate(http_request_duration_seconds_bucket{service=\"checkout-service\", status_code!~\"4..\"}[5m])))\n\",\n    \"alert_rule_yaml\": \"alert: CheckoutLatencyP95Exceeded\nexpr: job:checkout_http_request_duration:p95_5m > 1.5\nfor: 3m\nlabels:\n  severity: critical\nannotations:\n  summary: \"P95 checkout latency above 1.5s for handler {{ $labels.handler }}\"\n\"\n  }\n}"
  },
  {
    "num": 34,
    "slug": "ai-grafana-dashboard-assistant",
    "name": "AI Grafana Dashboard Assistant",
    "area": "Observability & SRE",
    "tldr": "Generate, clean up, and standardize Grafana dashboards from a description — consistent with your org's panel conventions.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Dashboard creation is high-effort and low-standard: every engineer's dashboards look different, duplicate, and rot.",
    "problem": [
      "Building a good dashboard takes an hour of panel fiddling most people skip.",
      "No consistency: same service, five dashboards, none complete.",
      "Old dashboards accumulate with broken queries and no owner.",
      "Incident reviews reveal missing views, but nobody circles back to build them."
    ],
    "impact": "Standard, complete dashboards per service make every investigation faster and onboarding dramatically easier.",
    "capabilities": [
      [
        "Dashboard generation",
        "service-focused dashboard from a description plus metric discovery: golden signals, saturation, dependencies"
      ],
      [
        "Convention enforcement",
        "org panel templates, naming, and variables applied automatically"
      ],
      [
        "Cleanup analysis",
        "finds unused/broken/duplicate dashboards and proposes consolidation"
      ],
      [
        "Incident-driven additions",
        "after an incident, drafts the panels the responders wished existed"
      ]
    ],
    "solution": "A dashboard assistant operating via the Grafana API: generate new dashboards from natural language + metadata discovery, refactor existing ones to conventions, and report hygiene issues. All writes go through a review PR (exported JSON) or Grafana folder permissions — humans approve before dashboards land.",
    "steps": [
      [
        "Describe",
        "service and purpose; assistant discovers available metrics"
      ],
      [
        "Generate",
        "draft dashboard with golden signals and conventions"
      ],
      [
        "Review",
        "human previews; iterate in chat"
      ],
      [
        "Publish",
        "via API (with folder permissions) or dashboard-as-code PR"
      ],
      [
        "Maintain",
        "hygiene reports: broken queries, unused panels, duplicates"
      ]
    ],
    "hitl": "Generation is interactive; publishing requires explicit approval. Hygiene suggestions are reports, not deletions.",
    "components": [
      [
        "Metric discovery",
        "inventory of available metrics per service"
      ],
      [
        "Generator",
        "dashboard JSON synthesis with org templates"
      ],
      [
        "Review flow",
        "preview and iteration loop"
      ],
      [
        "Publisher",
        "Grafana API or dashboard-as-code PR"
      ],
      [
        "Hygiene scanner",
        "usage/query-health analysis across folders"
      ]
    ],
    "flow": [
      "The user describes the dashboard need.",
      "Discovery grounds the draft in real metrics.",
      "The draft iterates in chat until approved.",
      "Publication goes through the approved path; hygiene reports run on schedule."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Grafana",
        "API for folders, dashboards, permissions"
      ],
      [
        "mcp-grafana",
        "build-on tooling"
      ],
      [
        "Dashboard-as-code (Jsonnet/Terraform provider)",
        "PR-based publishing"
      ],
      [
        "Prometheus/loki datasources",
        "query grounding"
      ]
    ],
    "context": [
      "available metrics per service",
      "org dashboard conventions",
      "existing dashboards",
      "SLO definitions",
      "incident learnings"
    ],
    "tools": [
      "Grafana REST API (dashboard, folder, datasource management)",
      "Grafana MCP Server",
      "Datasource Query APIs (Prometheus / Loki read)",
      "Dashboard-as-Code Repo (Jsonnet / Terraform provider PR)"
    ],
    "benefits": [
      "Good dashboards become cheap; coverage gaps close.",
      "Consistency across teams; hygiene debt gets managed.",
      "Incident learnings convert into permanent views."
    ],
    "security": [
      "Dashboards can expose business metrics: respect Grafana permissions and folder scoping.",
      "Prevent query-heavy dashboards from hammering datasources (row limits, time bounds)."
    ],
    "future": [
      "Auto-layout from traces: propose panels from actual request paths.",
      "Dashboard diffs on PR for dashboard-as-code shops."
    ],
    "related": [
      {
        "num": 33,
        "name": "AI Prometheus Query Generator",
        "slug": "ai-prometheus-query-generator"
      },
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Service description + metric discovery             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Draft dashboard (golden signals)                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Chat iteration + preview                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Approved publish (API · PR)                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Hygiene report (unused · broken)                   │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"dashboard_id\": \"grafana-dash-gen-5520\",\n  \"title\": \"Checkout Service — Golden Signals & Saturation\",\n  \"folder_name\": \"Tier-1 Services\",\n  \"uid\": \"checkout-golden-signals\",\n  \"dashboard_spec\": {\n    \"schema_version\": 38,\n    \"time_range\": {\n      \"from\": \"now-6h\",\n      \"to\": \"now\"\n    },\n    \"refresh_rate\": \"30s\",\n    \"template_variables\": [\n      {\n        \"name\": \"environment\",\n        \"type\": \"query\",\n        \"query\": \"label_values(up, env)\"\n      },\n      {\n        \"name\": \"instance\",\n        \"type\": \"query\",\n        \"query\": \"label_values(http_requests_total{env=\"$environment\"}, instance)\"\n      }\n    ],\n    \"panel_rows\": [\n      {\n        \"title\": \"Golden Signals (Rate, Errors, Duration)\",\n        \"panels_count\": 4,\n        \"types\": [\n          \"timeseries\",\n          \"timeseries\",\n          \"stat\",\n          \"heatmap\"\n        ]\n      },\n      {\n        \"title\": \"Resource Saturation (CPU, Memory, Goroutines)\",\n        \"panels_count\": 3,\n        \"types\": [\n          \"timeseries\",\n          \"timeseries\",\n          \"gauge\"\n        ]\n      }\n    ]\n  },\n  \"hygiene_audit_summary\": {\n    \"duplicate_panels_detected\": 0,\n    \"deprecated_queries_fixed\": 1,\n    \"note\": \"Replaced deprecated 'sum(rate(container_cpu_usage_seconds_total[1m]))' with 5m window conforming to SRE dashboard standard.\"\n  },\n  \"gitops_pull_request\": {\n    \"repository\": \"org/observability-dashboards\",\n    \"file_path\": \"dashboards/tier1/checkout-service.json\",\n    \"pr_title\": \"feat(dashboards): standardize checkout-service golden signals dashboard\"\n  }\n}"
  },
  {
    "num": 35,
    "slug": "ai-anomaly-investigation-agent",
    "name": "AI Anomaly Investigation Agent",
    "area": "Observability & SRE",
    "tldr": "When something looks off but no alert fired, the agent notices first: investigates the anomaly, explains it, and files it if it matters.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Alerts catch known failure modes; the weird stuff — slow degradations, shifting distributions, silent partial failures — floats between dashboards until a human notices or a customer does.",
    "problem": [
      "Threshold alerts miss novel and slow-onset problems.",
      "Anomaly detectors produce leads, not explanations; investigating each is costly.",
      "Minor anomalies are common; humans must judge which matter, and usually have no time.",
      "Seasonality confuses both humans and naive detectors."
    ],
    "impact": "Catching degradations before alert thresholds (or customers) do is the difference between a ticket and an incident.",
    "capabilities": [
      [
        "Anomaly detection triage",
        "takes detector outputs (or runs its own) and judges significance using context, seasonality, and impact"
      ],
      [
        "Automated investigation",
        "for each significant anomaly: correlated signals, affected segments, first occurrence, related changes"
      ],
      [
        "Explanation writing",
        "anomaly report: what deviates, since when, who's affected, likely cause, recommended action"
      ],
      [
        "Feedback learning",
        "human dispositions (real/noise/known) tune future triage"
      ]
    ],
    "solution": "A continuous agent fed by anomaly detectors (Prometheus-based, Elastic/ADR-style ML) and metric scans: it investigates flagged anomalies within a bounded budget, writes a short report, and posts significant ones to the right team. The expensive part (investigation) is automated; the judgment stays with humans.",
    "steps": [
      [
        "Detect",
        "consume detector outputs and scheduled metric scans"
      ],
      [
        "Triage",
        "contextual significance: seasonality, scope, impact, novelty"
      ],
      [
        "Investigate",
        "bounded tool-use: related metrics, logs, segments, changes"
      ],
      [
        "Report",
        "explained anomaly card with recommendation; file or notify per policy"
      ],
      [
        "Learn",
        "human dispositions feed back into triage thresholds"
      ]
    ],
    "hitl": "The agent files reports; humans decide on action. Escalation to pages requires policy changes, not agent discretion.",
    "components": [
      [
        "Detector bridge",
        "interfaces with anomaly sources"
      ],
      [
        "Triage engine",
        "context-aware significance scoring"
      ],
      [
        "Investigator",
        "budgeted agent over observability MCP tools"
      ],
      [
        "Report publisher",
        "team channels and ticket filing"
      ],
      [
        "Learning store",
        "dispositions and outcomes"
      ]
    ],
    "flow": [
      "Detectors flag candidate anomalies continuously.",
      "Triage filters using context and seasonality understanding.",
      "Significant candidates get a bounded investigation and a written report.",
      "Reports reach owning teams; dispositions tune the system."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Prometheus / Grafana ML / Elastic ML",
        "detector sources"
      ],
      [
        "Loki / traces",
        "investigation evidence"
      ],
      [
        "GitHub / deploy records",
        "change correlation"
      ],
      [
        "Jira",
        "finding filing"
      ],
      [
        "Slack",
        "reports"
      ]
    ],
    "context": [
      "anomaly signal and history",
      "seasonality baselines",
      "correlated metrics/logs",
      "recent changes",
      "past anomaly dispositions"
    ],
    "tools": [
      "Grafana ML / Prometheus Anomaly Detector Bridge",
      "Grafana MCP (Prometheus / Loki / Tempo read)",
      "VCS Deploy & Commit History API",
      "Jira / GitHub Issues API (file finding)"
    ],
    "benefits": [
      "Silent failures surface before they page anyone.",
      "Detector noise gets explained instead of ignored.",
      "Investigation toil drops; humans keep judgment."
    ],
    "security": [
      "Hard budgets on investigation frequency/cost to avoid a self-inflicted observability bill.",
      "Findings routed by ownership rules; no broadcast of sensitive anomalies to broad channels."
    ],
    "future": [
      "Proactive SLO drift watch: flag slow error-budget erosion trends.",
      "Cross-service anomaly graphs: upstream cause identification."
    ],
    "related": [
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 4,
        "name": "AI Log Analyzer",
        "slug": "ai-log-analyzer"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Anomaly detectors / metric scans                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Significance triage                                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← seasonality · impact\n┌────────────────────────────────────────────────────┐\n│ Bounded investigation (correlated signals)         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Anomaly report + recommendation                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human disposition → learning loop                  │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"anomaly_id\": \"anom-2026-10-06-8819\",\n  \"service\": \"user-auth-session-manager\",\n  \"metric_name\": \"redis_connected_clients\",\n  \"detection_timestamp\": \"2026-10-06T00:02:15Z\",\n  \"triage_verdict\": {\n    \"status\": \"SIGNIFICANT_INVESTIGATION_WARRANTED\",\n    \"severity_score\": 0.87,\n    \"seasonality_explained\": false,\n    \"novelty_rating\": \"HIGH (never observed in preceding 90 days)\"\n  },\n  \"investigation_findings\": {\n    \"anomaly_duration_minutes\": 55,\n    \"baseline_expected_range\": \"1,200 - 1,600 connected clients\",\n    \"current_observed_value\": \"9,840 connected clients\",\n    \"correlated_signals\": [\n      \"Redis memory allocation rose by 34% (connection buffer accumulation)\",\n      \"Zero client connection drop rate despite idle status\"\n    ],\n    \"correlated_changes\": [\n      {\n        \"type\": \"DEPLOYMENT\",\n        \"service\": \"user-auth-session-manager\",\n        \"version\": \"v3.14.0\",\n        \"timestamp\": \"2026-10-05T23:05:00Z\",\n        \"commit\": \"8f9a1b2 (refactor session token renewal worker)\"\n      }\n    ]\n  },\n  \"root_cause_hypothesis\": \"New session renewal worker in v3.14.0 instantiates a new Redis client on every token refresh without calling connection.close() in finally block.\",\n  \"recommended_action\": {\n    \"priority\": \"HIGH (Prevent redis connection exhaustion before peak morning traffic)\",\n    \"action\": \"File ticket and ping service owners to patch connection pool leak or revert v3.14.0.\",\n    \"jira_ticket_filed\": \"AUTH-1849\"\n  }\n}"
  },
  {
    "num": 36,
    "slug": "ai-postmortem-generator",
    "name": "AI Postmortem Generator",
    "area": "Observability & SRE",
    "tldr": "Draft the postmortem from real evidence — timeline, causal chain, contributing factors, action items — so humans edit instead of excavate.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Postmortems are written days later from memory, so timelines are wrong, causes are simplified, and action items are vague — then nothing changes.",
    "problem": [
      "Evidence (channel scrolls, dashboards, deploys) is scattered and decays fast.",
      "Writing takes hours, so postmortems are late or shallow.",
      "Action items lack owners/dates and quietly die.",
      "Learning doesn't accumulate across postmortems."
    ],
    "impact": "High-quality, fast postmortems are the engine of organizational learning; automation makes them cheap enough to actually do well.",
    "capabilities": [
      [
        "Timeline assembly",
        "reconstructs the incident timeline from channel logs, alerts, deploys, and metrics (fed by ideas 05/17)"
      ],
      [
        "Draft composition",
        "summary, impact, causal chain, detection/response evaluation in blameless language"
      ],
      [
        "Contributing-factor analysis",
        "surfaces systemic factors beyond the trigger (alerting gaps, runbook holes, config debt)"
      ],
      [
        "Action-item drafting",
        "concrete, owner-ready items with priority based on recurrence data"
      ],
      [
        "Cross-incident patterns",
        "flags when this incident resembles a past one"
      ]
    ],
    "solution": "After incident resolution, the generator assembles the evidence package (from the investigator's bundle), drafts a complete postmortem in the org template, and opens it as a doc PR for human editing. It tracks action items afterward and reports on their status.",
    "steps": [
      [
        "Assemble",
        "collect timeline, comms, metrics, changes, and the investigator's evidence bundle"
      ],
      [
        "Draft",
        "full postmortem per template: summary → impact → timeline → analysis → factors → actions"
      ],
      [
        "Review",
        "doc PR with inline comments; humans correct and deepen"
      ],
      [
        "Track",
        "action items synced to the tracker with owners/dates"
      ],
      [
        "Learn",
        "pattern analysis across the postmortem corpus"
      ]
    ],
    "hitl": "Drafts only. Humans own the narrative, the judgment, and the blamelessness review before anything is published.",
    "components": [
      [
        "Evidence assembler",
        "channel logs, incident platform data, telemetry snapshots"
      ],
      [
        "Draft engine",
        "template-aware LLM composition"
      ],
      [
        "Review integration",
        "doc/PR workflow with comments"
      ],
      [
        "Action tracker",
        "item sync and status reporting"
      ],
      [
        "Corpus analyzer",
        "cross-incident pattern detection"
      ]
    ],
    "flow": [
      "On resolution, the evidence package is assembled.",
      "The draft is generated following the org template and blameless conventions.",
      "A doc PR goes to the incident commander and owners for editing.",
      "Action items are tracked; recurring patterns surface across incidents."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Incident platform (PagerDuty/FireHydrant/incident.io)",
        "timeline and roles"
      ],
      [
        "Slack export",
        "channel evidence"
      ],
      [
        "Confluence/Notion/Google Docs",
        "postmortem home"
      ],
      [
        "Jira/Linear",
        "action item tracking"
      ],
      [
        "Grafana",
        "impact charts embedded"
      ]
    ],
    "context": [
      "incident timeline and comms",
      "alert and mitigation history",
      "metrics around the window",
      "deploy/config changes",
      "past related postmortems"
    ],
    "tools": [
      "Incident Management Platform API (PagerDuty / FireHydrant / incident.io read)",
      "Slack / Teams Channel Exporter (read-only)",
      "Knowledge Base & Doc APIs (Confluence / Google Docs / Notion PR write)",
      "Jira / Linear Issue Tracker API"
    ],
    "benefits": [
      "Postmortems within a day, grounded in evidence instead of memory.",
      "Systemic factors surface, not just proximate causes.",
      "Action items survive the week after the incident."
    ],
    "security": [
      "Postmortems are sensitive: drafts stay in access-controlled systems; external sharing requires explicit sanitization.",
      "Blameless language enforced by template and prompt; personal data minimized."
    ],
    "future": [
      "Auto-verification of action items (did the alert actually get added?).",
      "Org learning reports: quarterly themes across the postmortem corpus."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 32,
        "name": "AI Root Cause Analysis Assistant",
        "slug": "ai-root-cause-analysis-assistant"
      },
      {
        "num": 31,
        "name": "AI Incident Summarizer",
        "slug": "ai-incident-summarizer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident resolved → evidence package               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Timeline + causal reconstruction                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Draft postmortem (org template)                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Doc PR · human edits                               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Action items tracked · patterns reported           │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"postmortem_id\": \"PM-2026-10-05-INC-9182\",\n  \"incident_reference\": \"INC-2026-10-9182\",\n  \"title\": \"Payment Checkout Gateway Timeout Degradation\",\n  \"date\": \"2026-10-05\",\n  \"blameless_statement\": \"This postmortem is conducted blamelessly to identify systemic improvements in our architecture and deployment verification processes.\",\n  \"incident_metrics\": {\n    \"time_to_detect_minutes\": 3,\n    \"time_to_mitigate_minutes\": 33,\n    \"total_impact_duration_minutes\": 36,\n    \"failed_checkout_requests\": 482,\n    \"estimated_revenue_delayed_usd\": 38400.00,\n    \"sla_breach\": false\n  },\n  \"reconstructed_timeline\": [\n    {\n      \"time\": \"23:05 UTC\",\n      \"event\": \"Deployment of v2.18.2 initiated by CI/CD pipeline.\"\n    },\n    {\n      \"time\": \"23:12 UTC\",\n      \"event\": \"Alert 'High5xxErrorRate' fired in #ops-alerts channel.\"\n    },\n    {\n      \"time\": \"23:15 UTC\",\n      \"event\": \"Incident commander opened bridge and mobilized triage team.\"\n    },\n    {\n      \"time\": \"23:36 UTC\",\n      \"event\": \"Rollback to v2.18.1 completed via GitOps revert PR.\"\n    },\n    {\n      \"time\": \"23:41 UTC\",\n      \"event\": \"5xx error rate normalized to baseline 0.02%.\"\n    }\n  ],\n  \"contributing_factors\": [\n    \"Envoy idle timeout (60s) differed from Node.js backend keep-alive timeout (15s).\",\n    \"Canary verification period was 3 minutes, shorter than the 5-minute statistical burn window.\"\n  ],\n  \"action_items\": [\n    {\n      \"priority\": \"P1\",\n      \"action\": \"Enforce global timeout lint rule requiring backend keepAliveTimeout > upstream idleTimeout.\",\n      \"owner\": \"@platform-networking\",\n      \"due_date\": \"2026-10-15\",\n      \"ticket_id\": \"PLAT-491\"\n    },\n    {\n      \"priority\": \"P2\",\n      \"action\": \"Extend minimum canary bake time from 3 minutes to 10 minutes in deployment pipelines.\",\n      \"owner\": \"@release-engineering\",\n      \"due_date\": \"2026-10-20\",\n      \"ticket_id\": \"REL-892\"\n    }\n  ]\n}"
  },
  {
    "num": 37,
    "slug": "ai-container-vulnerability-explainer",
    "name": "AI Container Vulnerability Explainer",
    "area": "DevSecOps",
    "tldr": "Triage container image scans: which CVEs are actually reachable and urgent, what's the fastest safe fix, and which are noise.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "A container image scan reports 200+ CVEs; almost none are exploitable in context, but finding the one that matters is manual archaeology.",
    "problem": [
      "Scanners rank by CVSS, which ignores whether the vulnerable code path is ever executed.",
      "Fix advice is generic ('upgrade to 2.3.1') without the dependency-conflict reality of the actual image.",
      "Base-image churn means the same findings reappear in every image; no learning accumulates.",
      "Engineers either ignore scans or panic-fix everything, and both responses are wrong."
    ],
    "impact": "Contextual triage turns vulnerability scanning from noise into a short, honest worklist — and shortens the window on the findings that matter.",
    "capabilities": [
      [
        "Exploitability reasoning",
        "uses package purpose, runtime context, and reachable code paths to separate real risk from library ballast"
      ],
      [
        "Fix-path planning",
        "proposes the minimal viable change: package bump, base-image update, or rebuild — with conflict warnings"
      ],
      [
        "Dedup across images",
        "clusters the same underlying finding across the fleet and deduplicates effort"
      ],
      [
        "Plain-language briefs",
        "each critical finding explained: what it is, why it matters here, what to do"
      ]
    ],
    "solution": "A triage layer on top of existing scanners (Trivy/Grype/Snyk): scan results are enriched with package usage context (import graphs, service behavior, exposure), then an LLM produces a prioritized brief per image and per fleet, with fix PRs for the urgent ones.",
    "steps": [
      [
        "Scan",
        "CI/scheduled scans produce SBOM + findings (Trivy/Grype)"
      ],
      [
        "Enrich",
        "attach service exposure, package usage, base-image lineage"
      ],
      [
        "Triage",
        "LLM ranks findings with reasoning; marks likely-unexploitable with justification"
      ],
      [
        "Plan fixes",
        "upgrade paths and PR drafts for urgent items"
      ],
      [
        "Track",
        "fleet-level view: recurring findings, aging, and MTTR"
      ]
    ],
    "hitl": "Advisory triage; 'probably not exploitable' still requires human sign-off before suppression, and every dismissal is logged with rationale.",
    "components": [
      [
        "Scan ingester",
        "normalizes scanner output and SBOMs"
      ],
      [
        "Context service",
        "package usage, exposure, base-image metadata"
      ],
      [
        "Triage engine",
        "LLM reasoning with logged rationale"
      ],
      [
        "Fix generator",
        "Dockerfile/lockfile PR drafts"
      ],
      [
        "Fleet dashboard",
        "aggregated posture over time"
      ]
    ],
    "flow": [
      "Scanner findings arrive with SBOMs from CI or the registry.",
      "Enrichment adds exposure and usage context.",
      "The triage engine produces a short ranked list with reasoning.",
      "Urgent items get fix PRs; the fleet view tracks progress."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Trivy / Grype / Snyk / Dependabot",
        "scan sources"
      ],
      [
        "Registries (ECR/ACR/Harbor)",
        "image and SBOM access"
      ],
      [
        "Kubernetes runtime",
        "what's actually deployed and exposed"
      ],
      [
        "GitHub Security",
        "alerts and fix PRs"
      ]
    ],
    "context": [
      "SBOM and CVE findings",
      "package import/usage info",
      "service exposure (ports, ingress)",
      "base-image lineage",
      "deployed-vs-built drift"
    ],
    "tools": [
      "Container Vulnerability Scanner API (Trivy / Grype / Snyk read)",
      "Container Registry & SBOM API (ECR / Harbor / OCI)",
      "Runtime eBPF Reachability Feeds (Cilium / Tetragon)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "A short honest worklist instead of a 200-item wall.",
      "Faster fixes for real risk; defensible dismissals for the rest.",
      "Fleet-level learning instead of per-image whack-a-mole."
    ],
    "security": [
      "Automated dismissal is the danger case: always log rationale, require human approval, and re-evaluate on new exploit intel.",
      "Scan data can reveal internal service topology: keep within approved providers or local models."
    ],
    "future": [
      "Runtime reachability feeds: eBPF-based signals of which libraries actually execute.",
      "Base-image advisor: which upstream base minimizes fleet-wide CVE churn."
    ],
    "related": [
      {
        "num": 42,
        "name": "AI Dependency Risk Analyzer",
        "slug": "ai-dependency-risk-analyzer"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Scanner output (Trivy · Grype · SBOM)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Usage & exposure enrichment                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM triage (exploitability · urgency)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Fix PRs for urgent findings                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Fleet view (aging · MTTR · patterns)               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"image_tag\": \"checkout-api:v4.1.2\",\n  \"image_digest\": \"sha256:4a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f\",\n  \"total_cves_reported\": 184,\n  \"actionable_critical_vulnerabilities\": 1,\n  \"suppressed_unreachable_vulnerabilities\": 183,\n  \"triage_summary\": {\n    \"risk_level\": \"CRITICAL_ACTION_REQUIRED\",\n    \"justification\": \"1 critical vulnerability in dynamically loaded OpenSSL library is reachable from public API endpoints.\"\n  },\n  \"prioritized_findings\": [\n    {\n      \"cve_id\": \"CVE-2026-2149\",\n      \"package_name\": \"openssl\",\n      \"installed_version\": \"3.0.8-1\",\n      \"fixed_version\": \"3.0.12-1\",\n      \"cvss_score\": 9.8,\n      \"reachability_verdict\": \"REACHABLE_IN_EXECUTION_PATH\",\n      \"reachability_evidence\": \"Binary '/usr/bin/checkout-server' dynamically loads libcrypto.so.3 to verify RSA client signatures.\",\n      \"exploit_scenario\": \"Remote unauthenticated attacker can send crafted handshake payload to trigger buffer overflow and remote code execution.\",\n      \"remediation_plan\": {\n        \"fastest_safe_action\": \"BUMP_BASE_IMAGE\",\n        \"recommended_base_image\": \"alpine:3.19.1\",\n        \"dockerfile_diff\": \"@@ -1 +1 @@\n-FROM alpine:3.17\n+FROM alpine:3.19.1\"\n      }\n    }\n  ],\n  \"sample_suppressed_noise\": [\n    {\n      \"cve_id\": \"CVE-2023-4911\",\n      \"package\": \"glibc ld.so\",\n      \"reason_suppressed\": \"Target container image is built on musl libc (Alpine); glibc packages are absent.\"\n    }\n  ]\n}"
  },
  {
    "num": 38,
    "slug": "ai-kubernetes-security-analyzer",
    "name": "AI Kubernetes Security Analyzer",
    "area": "DevSecOps",
    "tldr": "Explain and fix your cluster's security posture: RBAC sprawl, missing Pod Security controls, NetworkPolicy gaps — prioritized and explained.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Kubernetes security posture degrades quietly: roles accumulate verbs, workloads run privileged 'temporarily', and namespaces lack network segmentation — until an audit or incident reveals the iceberg.",
    "problem": [
      "RBAC bindings grow without review; who can do what is nobody's full-time question.",
      "Pod Security Standards adoption is stalled by 'it'll break workloads' fears that are never tested.",
      "NetworkPolicies are absent or wrong; lateral movement is trivially easy.",
      "Static posture tools report findings without workload context or remediation paths."
    ],
    "impact": "Cluster compromise blast radius is determined by exactly these controls; a explained, prioritized fix list makes hardening tractable.",
    "capabilities": [
      [
        "RBAC analysis",
        "who can escalate, read secrets, or exec where — with usage evidence from audit logs to right-size grants"
      ],
      [
        "Workload hardening review",
        "per-workload gaps (privileged, hostPath, no seccomp, root user) with fix manifests"
      ],
      [
        "Network segmentation planning",
        "proposes NetworkPolicies from observed traffic flows (via Cilium Hubble-style data or eBPF)"
      ],
      [
        "Audit-log anomaly reading",
        "explains suspicious API access patterns in plain language"
      ]
    ],
    "solution": "A posture analyzer that combines cluster state, audit logs, and traffic observations into a prioritized hardening report: each finding explained (attack path in plain language), each fix provided as reviewable manifests, rollout risks noted. Kyverno/PSS baseline policies and admission-time enforcement are the endgame; this provides the guided path there.",
    "steps": [
      [
        "Collect",
        "RBAC bindings, workload security contexts, NetworkPolicies, audit logs, traffic flows"
      ],
      [
        "Analyze",
        "deterministic passes: escalation paths, secret access, unsegmented traffic"
      ],
      [
        "Explain",
        "LLM narrates top findings with attack scenarios and business context"
      ],
      [
        "Fix",
        "hardening manifests as PRs (RBAC tightening, PSS labels, NetworkPolicies)"
      ],
      [
        "Enforce",
        "graduation path to Kyverno/PSS enforcement once violations drain"
      ]
    ],
    "hitl": "All fixes via PR with owner review; enforcement mode changes require platform-team sign-off.",
    "components": [
      [
        "State collector",
        "RBAC, workloads, policies, audit logs via read-only access"
      ],
      [
        "Flow analyzer",
        "traffic observations for policy synthesis"
      ],
      [
        "Risk narrator",
        "LLM explanations with attack-path detail"
      ],
      [
        "Fix generator",
        "manifest PRs with rollout notes"
      ],
      [
        "Policy pipeline",
        "Kyverno/PSS enforcement graduation"
      ]
    ],
    "flow": [
      "Scheduled collection snapshots the security-relevant cluster state.",
      "Deterministic analysis finds escalation paths, gaps, and exposure.",
      "The model explains findings in context and drafts fixes.",
      "Fixes roll out via PR; enforcement graduates as violations drop."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kubernetes RBAC / PSS / NetworkPolicy",
        "control surfaces"
      ],
      [
        "Audit logs / Falco",
        "runtime evidence"
      ],
      [
        "Cilium Hubble / eBPF",
        "traffic flows for policy synthesis"
      ],
      [
        "Kyverno / OPA Gatekeeper",
        "enforcement layer"
      ],
      [
        "K8sGPT security analyzers",
        "build-on option"
      ]
    ],
    "context": [
      "RBAC bindings and audit evidence",
      "workload security contexts",
      "network flows and policies",
      "image provenance",
      "secret usage patterns"
    ],
    "tools": [
      "Kubernetes API (read-only RBAC, workloads, NetworkPolicies)",
      "Kubernetes Audit Logs & Falco Security Events API",
      "Cilium Hubble / eBPF Network Flow API",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Hardening becomes a prioritized, explained roadmap instead of an audit surprise.",
      "Fixes ship as reviewed manifests, not console changes.",
      "Enforcement graduation path with fewer breakages."
    ],
    "security": [
      "The analyzer sees audit logs and RBAC detail — crown-jewel data: restrict to local/approved models.",
      "Fix PRs are security-sensitive changes: require security-team review, not just owners."
    ],
    "future": [
      "Admission-time advisor: explain rejected pods and suggest compliant alternatives interactively.",
      "Cross-cluster posture comparison to spread good patterns."
    ],
    "related": [
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      },
      {
        "num": 37,
        "name": "AI Container Vulnerability Explainer",
        "slug": "ai-container-vulnerability-explainer"
      },
      {
        "num": 2,
        "name": "AI Kubernetes Troubleshooter",
        "slug": "ai-kubernetes-troubleshooter"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Cluster state · audit logs · flows                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Deterministic posture passes                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ LLM risk narrative (attack paths)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Hardening PRs (RBAC · PSS · NetPol)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Graduate to Kyverno / PSS enforce                  │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"cluster_id\": \"k8s-prod-us-east-1\",\n  \"audit_timestamp\": \"2026-10-06T00:03:00Z\",\n  \"posture_score\": 68,\n  \"rbac_privilege_escalation_risks\": [\n    {\n      \"subject\": \"ServiceAccount/argocd-application-controller\",\n      \"namespace\": \"argocd\",\n      \"role_binding\": \"ClusterRoleBinding/argocd-application-controller\",\n      \"risk_level\": \"HIGH\",\n      \"finding\": \"Grants wildcard '*' verbs on '*' resources across entire cluster.\",\n      \"recommendation\": \"Restrict to targeted API groups and replace cluster-admin with scoped namespace role bindings.\"\n    }\n  ],\n  \"workload_security_violations\": [\n    {\n      \"workload\": \"Deployment/log-shipper\",\n      \"namespace\": \"logging\",\n      \"violations\": [\n        \"hostPath mount detected on '/var/log'\",\n        \"securityContext.privileged set to true\"\n      ],\n      \"risk\": \"Container breakout allows full host root filesystem takeover.\",\n      \"suggested_manifest_patch\": \"securityContext:\n  privileged: false\n  capabilities:\n    drop:\n    - ALL\n    add:\n    - DAC_READ_SEARCH\n\"\n    }\n  ],\n  \"network_policy_gap_analysis\": {\n    \"unsegmented_namespaces\": [\n      \"payments\",\n      \"checkout\"\n    ],\n    \"recommendation\": \"Deploy default-deny ingress NetworkPolicy and whitelist inter-service gRPC port 9090.\"\n  }\n}"
  },
  {
    "num": 39,
    "slug": "ai-secrets-detection-assistant",
    "name": "AI Secrets Detection Assistant",
    "area": "DevSecOps",
    "tldr": "Triage secrets findings fast: is this credential real, what does it access, how urgent is rotation, and has it been used?",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Secret scanners find hundreds of 'potential' secrets; each needs the same manual questions — is it real, what can it do, was it used, is it rotated? — before anyone acts.",
    "problem": [
      "High false-positive rates (test keys, examples) train teams to ignore findings.",
      "Real leaks require urgent, multi-step response (revoke, rotate, purge history, audit usage) that's easy to fumble.",
      "Git history means deletion doesn't fix anything; remediation guidance is often missing.",
      "Prioritization is blind: a Stripe key and a dummy AWS key look identical to the scanner."
    ],
    "impact": "Fast, correct secret-leak response closes your most direct compromise path; slow response is how leaks become breaches.",
    "capabilities": [
      [
        "Validity classification",
        "pattern + metadata reasoning to separate real credentials from examples/dummies (with optional live check for non-destructive validation)"
      ],
      [
        "Blast-radius assessment",
        "given the credential type and (where safe) its scopes, explain what access it grants"
      ],
      [
        "Rotation runbook",
        "step-by-step response: revoke, rotate, purge history, audit usage, notify"
      ],
      [
        "Usage audit reading",
        "interprets access logs for signs of use since the leak"
      ]
    ],
    "solution": "A triage assistant layered on Gitleaks/TruffleHog findings: each finding gets classified, prioritized, and — if real — attached to a concrete response runbook with the exact commands for that credential type. Push-protection and pre-commit stay the prevention layer; this handles the findings that slip through.",
    "steps": [
      [
        "Ingest",
        "scanner findings from CI, push protection, or scheduled repo scans"
      ],
      [
        "Classify",
        "real vs. test/example; credential type and provider"
      ],
      [
        "Assess",
        "what the credential can access; check usage logs where available"
      ],
      [
        "Instruct",
        "tailored rotation runbook with exact commands"
      ],
      [
        "Track",
        "response status per finding until closed"
      ]
    ],
    "hitl": "The assistant never touches credentials or revokes anything. Live validation (e.g., a get-caller-identity call) only runs under policy with human trigger.",
    "components": [
      [
        "Finding ingester",
        "scanner integrations"
      ],
      [
        "Classifier",
        "credential-type knowledge + provider metadata"
      ],
      [
        "Usage checker",
        "read-only audit-log interpretation where policy allows"
      ],
      [
        "Runbook generator",
        "provider-specific response steps"
      ],
      [
        "Tracker",
        "status workflow per finding"
      ]
    ],
    "flow": [
      "Findings arrive from scanning sources.",
      "Classification separates real credentials from noise with reasoning shown.",
      "Real ones get blast-radius notes, usage evidence, and a tailored runbook.",
      "Response is tracked to closure with the audit trail."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Gitleaks / TruffleHog / push protection",
        "finding sources"
      ],
      [
        "Cloud audit logs",
        "usage evidence"
      ],
      [
        "Secret managers (Vault/ASM/KeyVault)",
        "rotation targets"
      ],
      [
        "Security ticketing",
        "response workflow"
      ]
    ],
    "context": [
      "finding location and context",
      "credential type/pattern",
      "provider metadata",
      "usage/audit logs",
      "repo history state"
    ],
    "tools": [
      "Secret Scanning Ingestion API (Gitleaks / TruffleHog / GitHub Secret Scanning)",
      "Cloud Provider Audit Logs (read-only usage check)",
      "Secret Management Platform (HashiCorp Vault / AWS Secrets Manager)",
      "Security Incident Ticketing API"
    ],
    "benefits": [
      "Real leaks identified and worked immediately; noise dismissed with documented reasoning.",
      "Correct response steps for each credential type — no improvisation under stress.",
      "Response time measurable and improving."
    ],
    "security": [
      "Never send the secret value itself to the model — only type, prefix, and metadata.",
      "Live validation is destructive-adjacent: policy-gated, logged, human-triggered only.",
      "The runbook itself should avoid embedding current credential values."
    ],
    "future": [
      "Git-history purge automation (BFG/filter-repo) as drafted PRs.",
      "Proactive scanning of unmanaged surfaces (wikis, ticket comments, chat)."
    ],
    "related": [
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      },
      {
        "num": 41,
        "name": "AI Security Incident Assistant",
        "slug": "ai-security-incident-assistant"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Secrets findings (Gitleaks · TruffleHog)           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Validity classifier (real · test · stale)          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Blast-radius + usage assessment                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Tailored rotation runbook                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Response tracking to closure                       │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"leak_detection_id\": \"sec-leak-8491\",\n  \"repository\": \"org/payment-service\",\n  \"file_path\": \"src/services/stripe_client.py\",\n  \"commit_sha\": \"3a4b5c6d7e8f\",\n  \"secret_classification\": {\n    \"secret_type\": \"STRIPE_LIVE_RESTRICTED_KEY\",\n    \"redacted_token\": \"rk_live_...9f2a\",\n    \"is_real_credential\": true,\n    \"confidence\": 0.99\n  },\n  \"blast_radius_analysis\": {\n    \"affected_provider\": \"Stripe\",\n    \"granted_capabilities\": [\n      \"charges:write\",\n      \"customers:read\",\n      \"refunds:write\"\n    ],\n    \"maximum_damage_scenario\": \"Unauthorized initiation of customer refunds and exfiltration of customer cardholder metadata.\"\n  },\n  \"audit_log_verification\": {\n    \"audit_checked\": true,\n    \"log_source\": \"Stripe API Audit Logs\",\n    \"unauthorized_api_calls_detected\": 0,\n    \"time_window_evaluated\": \"Last 72 hours\"\n  },\n  \"emergency_rotation_runbook\": [\n    {\n      \"step\": 1,\n      \"action\": \"Generate new replacement restricted key in Stripe Dashboard with identical scopes.\",\n      \"urgency\": \"IMMEDIATE\"\n    },\n    {\n      \"step\": 2,\n      \"action\": \"Update AWS Secrets Manager secret 'prod/payment/stripe_key' with new value.\",\n      \"urgency\": \"IMMEDIATE\"\n    },\n    {\n      \"step\": 3,\n      \"action\": \"Revoke leaked key 'rk_live_...9f2a' in Stripe Dashboard.\",\n      \"urgency\": \"IMMEDIATE\"\n    },\n    {\n      \"step\": 4,\n      \"action\": \"Purge leaked commit 3a4b5c6d7e8f from git history using git-filter-repo.\",\n      \"urgency\": \"POST_MITIGATION\"\n    }\n  ]\n}"
  },
  {
    "num": 40,
    "slug": "ai-cloud-misconfiguration-analyzer",
    "name": "AI Cloud Misconfiguration Analyzer",
    "area": "DevSecOps",
    "tldr": "Turn CSPM findings into explained, prioritized fixes: what's exposed, why it matters, and the exact change that closes it.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "CSPM tools (Security Hub, Defender, Prowler) list thousands of misconfigurations with static severities; the queue is so large that genuinely exposed data hides in it.",
    "problem": [
      "Findings lack context: what data lives here, who owns it, what's actually reachable.",
      "Fixes require knowing the intended purpose of the resource, or you break the workload.",
      "Teams auto-suppress to cope, creating blind spots.",
      "The same misconfiguration classes recur across accounts and teams."
    ],
    "impact": "Context-explained misconfiguration triage is the difference between a compliance checkbox and actually closing exposure paths.",
    "capabilities": [
      [
        "Contextual prioritization",
        "re-ranks findings by exposure, data sensitivity, ownership, and attack path — not static severity"
      ],
      [
        "Attack-path narrative",
        "explains how a finding combines with others (public bucket + broad IAM) into real risk"
      ],
      [
        "Fix generation",
        "IaC-native remediation PRs preserving workload intent"
      ],
      [
        "Pattern elimination",
        "identifies systemic causes so whole finding classes disappear"
      ]
    ],
    "solution": "A triage and remediation layer over your CSPM: findings are enriched with catalog/ownership/data context, re-ranked with LLM reasoning, and delivered per team as explained worklists — high-confidence fixes as IaC PRs, judgment calls as decisions with options.",
    "steps": [
      [
        "Ingest",
        "CSPM findings from Security Hub/Defender/Prowler"
      ],
      [
        "Enrich",
        "ownership, data classification, network exposure, workload dependency"
      ],
      [
        "Prioritize",
        "attack-path-aware ranking with narratives"
      ],
      [
        "Remediate",
        "IaC PRs for mechanical fixes; options memo for judgment calls"
      ],
      [
        "Systematize",
        "root-cause patterns turned into guardrails (IaC modules, policy-as-code)"
      ]
    ],
    "hitl": "All remediation via review. Suppression requires documented rationale and expiry.",
    "components": [
      [
        "Finding ingester",
        "CSPM integrations"
      ],
      [
        "Context service",
        "catalog, tagging, data classification"
      ],
      [
        "Ranking engine",
        "attack-path reasoning (LLM + graph context)"
      ],
      [
        "Remediation generator",
        "IaC PR drafts"
      ],
      [
        "Guardrail publisher",
        "policy-as-code/modules for systemic patterns"
      ]
    ],
    "flow": [
      "Findings flow in from the CSPM on schedule.",
      "Enrichment attaches ownership, sensitivity, and exposure context.",
      "Ranking produces short, explained per-team worklists.",
      "Mechanical fixes become PRs; patterns become guardrails."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "AWS Security Hub / Defender for Cloud / Prowler",
        "finding sources"
      ],
      [
        "Cloud asset inventory",
        "context"
      ],
      [
        "IaC repos",
        "fix PRs"
      ],
      [
        "Data catalog",
        "sensitivity classification"
      ],
      [
        "Security ticketing",
        "workflow"
      ]
    ],
    "context": [
      "findings and severities",
      "resource purpose and owner",
      "data sensitivity",
      "network exposure",
      "workload dependencies",
      "past suppressions"
    ],
    "tools": [
      "Cloud Security Posture Management API (AWS Security Hub / Defender for Cloud / Prowler read)",
      "Cloud Asset Inventory & Tagging API",
      "IaC Repositories (Terraform / OpenTofu)",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Real exposure gets fixed first; noise stops burying signal.",
      "Remediation arrives as code, preserving intent.",
      "Finding classes shrink at the source via guardrails."
    ],
    "security": [
      "Re-ranking must stay auditable: any demotion of a finding carries rationale and reviewer sign-off.",
      "Context data (data classification) is sensitive; handle accordingly."
    ],
    "future": [
      "Continuous exposure-graph view combining IAM (idea 27), network, and data findings.",
      "Auto-verified fixes: remediation PRs validated by re-scan before review."
    ],
    "related": [
      {
        "num": 23,
        "name": "AI IaC Security Analyzer",
        "slug": "ai-iac-security-analyzer"
      },
      {
        "num": 27,
        "name": "AI IAM Policy Reviewer",
        "slug": "ai-iam-policy-reviewer"
      },
      {
        "num": 37,
        "name": "AI Container Vulnerability Explainer",
        "slug": "ai-container-vulnerability-explainer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ CSPM findings ingest                               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Context enrichment (owner · data · exposure)       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Attack-path ranking + narrative                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ IaC fix PRs · decision memos                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Guardrails for recurring patterns                  │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"scan_id\": \"cspm-triage-aws-9182\",\n  \"cspm_source\": \"AWS Security Hub / Prowler\",\n  \"total_raw_findings\": 1420,\n  \"actionable_exposure_findings\": 2,\n  \"noise_reduction_percentage\": 99.8,\n  \"critical_exposure_paths\": [\n    {\n      \"finding_id\": \"AWS-SEC-S3-001\",\n      \"resource_arn\": \"arn:aws:s3:::customer-kyc-documents-prod\",\n      \"severity\": \"CRITICAL\",\n      \"exposure_narrative\": \"S3 bucket customer-kyc-documents-prod stores unencrypted government identity scans with public read ACL enabled and missing S3 Public Access Block.\",\n      \"attack_chain\": \"Unauthenticated internet attacker enumerates bucket URL via certificate transparency logs and downloads sensitive KYC identity documents.\",\n      \"iac_remediation_pr\": {\n        \"repository\": \"org/cloud-storage-terraform\",\n        \"target_file\": \"modules/s3/kyc_bucket.tf\",\n        \"hcl_patch\": \"resource \"aws_s3_bucket_public_access_block\" \"kyc\" {\n  bucket                  = aws_s3_bucket.kyc.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}\"\n      }\n    }\n  ],\n  \"systemic_guardrail_recommendation\": {\n    \"rule_type\": \"AWS Service Control Policy (SCP)\",\n    \"target\": \"Production Organization Unit\",\n    \"policy_statement\": \"Deny s3:PutBucketPolicy or s3:PutBucketAcl when granting Principal: '*'.\"\n  }\n}"
  },
  {
    "num": 41,
    "slug": "ai-security-incident-assistant",
    "name": "AI Security Incident Assistant",
    "area": "DevSecOps",
    "tldr": "First-response support for security incidents: containment options with tradeoffs, evidence collection checklists, and comms drafts — at 3am, without panic.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Security incidents are rare enough that responders are rusty, stressful enough that mistakes multiply, and time-critical enough that mistakes are expensive.",
    "problem": [
      "Containment decisions (isolate host? revoke keys? block IP?) have side effects responders forget under pressure.",
      "Evidence preservation is an afterthought; forensics suffers.",
      "Multiple consoles and logs must be checked simultaneously by a small team.",
      "Communication (legal, leadership, customers) has requirements nobody remembers mid-incident."
    ],
    "impact": "A structured assistant reduces response errors, preserves evidence, and shortens containment time — the two things that determine incident cost.",
    "capabilities": [
      [
        "Triage structuring",
        "turns the initial report into a response plan: containment options, side effects, evidence steps"
      ],
      [
        "Evidence collection",
        "read-only gathering of relevant logs/configs with preservation hygiene (timestamps, hashes)"
      ],
      [
        "Blast-radius analysis",
        "what the attacker/compromise could reach given observed access"
      ],
      [
        "Comms drafting",
        "internal/stakeholder/legal-prescribed notifications as drafts for human review"
      ]
    ],
    "solution": "A security-incident mode for the investigation platform (idea 05) with security-specific playbooks: strictly read-only evidence tools, containment options presented with explicit tradeoffs (never executed directly), and comms/audit drafting. Integrates with the security incident process (not a replacement for the IR team).",
    "steps": [
      [
        "Declare",
        "security incident declared; assistant attached to the channel"
      ],
      [
        "Plan",
        "triage structure: containment options, evidence plan, comms requirements"
      ],
      [
        "Collect",
        "read-only evidence with preservation metadata"
      ],
      [
        "Advise",
        "containment tradeoffs; blast-radius updates as evidence arrives"
      ],
      [
        "Draft",
        "comms and audit documentation for human approval"
      ],
      [
        "Close",
        "response record assembled for review and lessons"
      ]
    ],
    "hitl": "Absolute: containment and eradication are human decisions. The assistant gathers evidence and drafts; it never blocks, revokes, isolates, or deletes.",
    "components": [
      [
        "Incident mode",
        "security-specific prompts, playbooks, and stricter guardrails"
      ],
      [
        "Evidence collector",
        "read-only, hash-and-timestamp preserving"
      ],
      [
        "Blast-radius analyzer",
        "access-path reasoning from IAM/network data"
      ],
      [
        "Comms drafter",
        "stakeholder and regulatory templates"
      ],
      [
        "Record builder",
        "complete, reviewable response log"
      ]
    ],
    "flow": [
      "Declaration attaches the assistant to the incident channel.",
      "It structures the response plan and begins evidence collection.",
      "Containment options with side effects are laid out for the humans.",
      "Comms drafts and the response record are produced for review."
    ],
    "platforms": [
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "SIEM / audit logs",
        "evidence sources"
      ],
      [
        "Cloud + Kubernetes read APIs",
        "state inspection"
      ],
      [
        "PagerDuty / incident platform",
        "process integration"
      ],
      [
        "Ticketing",
        "response tracking"
      ]
    ],
    "context": [
      "initial report",
      "IAM and network state",
      "audit/SIEM events",
      "asset criticality",
      "regulatory notification requirements",
      "IR playbooks"
    ],
    "tools": [
      "SIEM & Security Lake Query API (Splunk / Chronicle / Elastic Security read-only)",
      "Cloud & Kubernetes Forensics MCP (read-only snapshots)",
      "Incident Response Ticketing & Evidence Locker API"
    ],
    "benefits": [
      "Fewer containment mistakes; explicit tradeoffs instead of reflexes.",
      "Forensics-quality evidence preserved by default.",
      "Response documentation written as you go, not reconstructed later."
    ],
    "security": [
      "This assistant is itself a target: hardened deployment, no write credentials, immutable audit of its own actions.",
      "Evidence handling must meet forensics standards — chain of custody, no silent alteration.",
      "Prompt injection from logs/malware strings is a live threat: output-as-data discipline, schema-validated plans only.",
      "Access strictly limited to authorized responders; sensitive-model routing per legal guidance."
    ],
    "future": [
      "Tabletop-training mode: simulate incidents for response practice.",
      "Auto-correlation with threat intel feeds during investigation."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 39,
        "name": "AI Secrets Detection Assistant",
        "slug": "ai-secrets-detection-assistant"
      },
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Security incident declared                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Response plan drafted (containment · evidence)     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Read-only evidence collection                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← preservation hygiene\n┌────────────────────────────────────────────────────┐\n│ Containment options + blast radius                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Comms drafts → human approval                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Response record for review                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"security_incident_id\": \"SEC-INC-2026-10-04\",\n  \"threat_level\": \"HIGH\",\n  \"attack_vector\": \"COMPROMISED_IAM_CREDENTIALS\",\n  \"containment_status\": \"CONTAINMENT_OPTIONS_PROPOSED\",\n  \"compromised_entities\": {\n    \"iam_principal\": \"arn:aws:iam::123456789012:user/build-pipeline-service-account\",\n    \"source_ip_address\": \"198.51.100.44\",\n    \"threat_actor_infrastructure\": \"Known commercial VPN / Tor exit node\"\n  },\n  \"evaluated_containment_options\": [\n    {\n      \"option\": \"REVOKE_IAM_SESSIONS_AND_ATTACH_DENY_ALL\",\n      \"side_effects\": \"Halts active deployments across all 12 backend microservices until new credentials are provisioned in AWS Secrets Manager.\",\n      \"forensics_prerequisite\": \"Export and hash active STS session tokens and CloudTrail events for preceding 24 hours.\",\n      \"recommended_action\": \"EXECUTE_AFTER_FORENSIC_SNAPSHOT\"\n    },\n    {\n      \"option\": \"ISOLATE_BUILD_RUNNER_VPC\",\n      \"side_effects\": \"Sever build runner outbound traffic; queued release artifacts will be delayed.\",\n      \"forensics_prerequisite\": \"Capture volatile RAM snapshot and disk image of runner container host.\",\n      \"recommended_action\": \"OPTIONAL_STANDBY\"\n    }\n  ],\n  \"evidence_preservation_manifest\": [\n    {\n      \"artifact_name\": \"cloudtrail_audit_log_dump_20261005.json\",\n      \"sha256\": \"4b8e9f0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f\",\n      \"storage_location\": \"s3://forensic-evidence-secure-123456789012/sec-inc-2026-10-04/\",\n      \"chain_of_custody_verified\": true\n    }\n  ],\n  \"comms_and_compliance_requirements\": {\n    \"gdpr_72hr_notice_required\": false,\n    \"internal_stakeholder_briefing_drafted\": true\n  }\n}"
  },
  {
    "num": 42,
    "slug": "ai-dependency-risk-analyzer",
    "name": "AI Dependency Risk Analyzer",
    "area": "DevSecOps",
    "tldr": "Decide on dependency alerts fast: is this vulnerable dependency actually used, what's the upgrade path, and what breaks?",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Dependabot and friends file endless dependency alerts and PRs; teams bulk-dismiss them because evaluating each one properly takes longer than they have.",
    "problem": [
      "Vulnerability alerts lack usage context: the vulnerable function may never be called.",
      "Upgrade PRs can break builds/runtimes; verification burden falls on already-busy teams.",
      "Major-version jumps (framework upgrades) are projects, not PRs, and never get scheduled.",
      "License and maintenance-risk signals (unmaintained, hijacked packages) aren't surfaced at all."
    ],
    "impact": "Unmanaged dependency risk accumulates silently; a triaged, explained queue makes it manageable without heroics.",
    "capabilities": [
      [
        "Usage-aware triage",
        "checks whether the vulnerable code path is referenced in the repo before escalating severity"
      ],
      [
        "Upgrade-path planning",
        "for each alert: direct bump, interim step, or major-upgrade project — with breaking-change notes"
      ],
      [
        "Ecosystem-risk briefing",
        "maintainer health, license issues, and suspicious-version signals for key dependencies"
      ],
      [
        "Batch strategy",
        "groups related upgrades to minimize churn and CI cycles"
      ]
    ],
    "solution": "A triage layer over dependency alerts: each alert is evaluated against the repo's actual code usage, upgrade feasibility is assessed (changelog/diff summaries), and teams receive a short, explained queue — trivial bumps as auto-prepared PRs, risky ones as scoped proposals with migration notes.",
    "steps": [
      [
        "Ingest",
        "alerts and PRs from Dependabot/Renovate/Snyk"
      ],
      [
        "Assess usage",
        "search repo for references to vulnerable APIs/classes"
      ],
      [
        "Plan upgrade",
        "changelog/diff-informed path; breaking-change summary"
      ],
      [
        "Deliver",
        "explained queue: auto-PR (safe), guided PR (medium), project ticket (major)"
      ],
      [
        "Verify",
        "CI results feed back; flaky/broken upgrades get annotated"
      ]
    ],
    "hitl": "Humans merge everything. The system's contribution is ranked, explained, pre-worked queue items.",
    "components": [
      [
        "Alert ingester",
        "Dependabot/Renovate/Snyk integration"
      ],
      [
        "Usage analyzer",
        "code search + import graph for reachability"
      ],
      [
        "Upgrade planner",
        "changelog/diff summarization"
      ],
      [
        "Queue publisher",
        "per-team explained lists and tiered PRs"
      ],
      [
        "Feedback loop",
        "CI outcomes and merge decisions recorded"
      ]
    ],
    "flow": [
      "Alerts and dependency PRs arrive continuously.",
      "Usage analysis separates reachable risk from theoretical.",
      "Upgrade paths are pre-analyzed with breaking-change notes.",
      "Teams get a short explained queue with tiered, pre-worked PRs."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Dependabot / Renovate / Snyk",
        "alert sources"
      ],
      [
        "GitHub / GitLab",
        "alerts, PRs, code search"
      ],
      [
        "CI",
        "verification runs"
      ],
      [
        "OSV / GitHub Advisory DB",
        "vulnerability data"
      ]
    ],
    "context": [
      "alert details and CVEs",
      "repo code usage of affected APIs",
      "changelogs and diffs",
      "build/test status",
      "dependency maintenance signals"
    ],
    "tools": [
      "Dependency Graph & Vulnerability Ingestion API (Dependabot / Renovate / Snyk)",
      "VCS Code Search & AST Reachability Analyzer",
      "OSV & GitHub Advisory Database API",
      "VCS PR Creation (GitHub / GitLab MCP)"
    ],
    "benefits": [
      "Dependency risk handled in minutes per alert instead of bulk dismissal.",
      "Major upgrades become scoped projects with real migration notes.",
      "Audit-ready record of why each dependency decision was made."
    ],
    "security": [
      "Supply-chain caution: generated upgrade PRs are still code from outside — CI, signing, and review rules apply fully.",
      "Pinned versions and lockfile integrity checks remain mandatory."
    ],
    "future": [
      "Organization-wide dependency dashboard: risk concentration by ecosystem and team.",
      "Proactive advisory: warn before adopting dependencies with risk signals."
    ],
    "related": [
      {
        "num": 37,
        "name": "AI Container Vulnerability Explainer",
        "slug": "ai-container-vulnerability-explainer"
      },
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Dependency alerts ingest (Dependabot · Renovate)   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Repo usage analysis                                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Upgrade path + breaking-change summary             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Explained queue · tiered PRs                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ CI feedback loop                                   │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"dependency_name\": \"axios\",\n  \"current_version\": \"0.21.1\",\n  \"recommended_version\": \"1.7.4\",\n  \"advisory_id\": \"GHSA-cph5-m8f7-6c5x\",\n  \"cve_id\": \"CVE-2023-45857\",\n  \"reachability_evaluation\": {\n    \"is_vulnerable_code_reachable\": true,\n    \"vulnerable_function\": \"followRedirects()\",\n    \"call_site_file\": \"src/clients/payment_gateway_client.ts\",\n    \"line_number\": 92,\n    \"evidence_snippet\": \"return axios.post(url, payload, { maxRedirects: 5 });\"\n  },\n  \"upgrade_path_analysis\": {\n    \"upgrade_strategy\": \"DIRECT_MINOR_BUMP\",\n    \"breaking_changes_detected\": false,\n    \"migration_notes\": \"axios v1.7.4 maintains API parity with v0.21 for standard JSON post/get invocations while patching cross-domain cookie leakage on redirects.\"\n  },\n  \"proposed_pull_request\": {\n    \"branch\": \"security/upgrade-axios-1.7.4\",\n    \"target_file\": \"package.json\",\n    \"diff\": \"@@ -14,1 +14,1 @@\n-    \"axios\": \"0.21.1\",\n+    \"axios\": \"1.7.4\",\",\n    \"ci_test_status\": \"PASSED (all 148 unit & integration tests green)\"\n  }\n}"
  },
  {
    "num": 43,
    "slug": "ai-devops-documentation-generator",
    "name": "AI DevOps Documentation Generator",
    "area": "Developer Experience",
    "tldr": "Generate and maintain the DevOps documentation nobody has time to write: pipeline guides, environment docs, operational how-tos — from the actual repo and infra.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Every team's most-viewed internal docs are their most stale: the deploy guide, the environment variables list, the 'how to run this locally' page.",
    "problem": [
      "DevOps docs are written during onboarding urgency and never updated after.",
      "The truth (pipelines, manifests, dockerfiles, CI configs) changes weekly; docs can't keep up manually.",
      "New joiners ask the same setup questions every month.",
      "Operational knowledge (how to rollback, where logs live) lives in chat scrollback."
    ],
    "impact": "Accurate DevOps docs are a force multiplier for onboarding and operations — and generation makes them maintainable at near-zero cost.",
    "capabilities": [
      [
        "Doc synthesis",
        "pipeline/deploy/environment docs generated from CI configs, manifests, and scripts"
      ],
      [
        "Change-driven refresh",
        "docs regenerate (as PRs) when the underlying configs change"
      ],
      [
        "How-to drafting",
        "operational guides (rollback, debug, scale) drafted from pipelines, runbooks, and history"
      ],
      [
        "Q&A mode",
        "chat over the repo+docs for instant answers with citations to source files"
      ]
    ],
    "solution": "A doc service that watches infrastructure-relevant repos: on meaningful changes it regenerates affected docs and opens refresh PRs; on demand it answers questions with citations. Focus on the high-traffic pages: local setup, deploy guide, environment/variables, and operations how-tos.",
    "steps": [
      [
        "Index",
        "parse CI configs, Dockerfiles, manifests, scripts, and existing docs"
      ],
      [
        "Detect",
        "map which doc pages depend on which config files"
      ],
      [
        "Refresh",
        "on change, regenerate affected sections and open doc PRs"
      ],
      [
        "Answer",
        "chat Q&A with file-level citations"
      ],
      [
        "Improve",
        "unanswered questions become doc-gap tickets"
      ]
    ],
    "hitl": "Doc PRs are reviewed; auto-merge only for purely mechanical sections under label policy.",
    "components": [
      [
        "Repo indexer",
        "config/manifest parsing and dependency mapping"
      ],
      [
        "Generator",
        "template + LLM doc synthesis per page type"
      ],
      [
        "PR publisher",
        "refresh PRs with clear scope"
      ],
      [
        "Q&A engine",
        "RAG over repo and docs"
      ],
      [
        "Gap tracker",
        "unanswered questions → tickets"
      ]
    ],
    "flow": [
      "Repos are indexed and doc dependencies mapped.",
      "Config changes trigger regeneration of affected pages as PRs.",
      "Engineers ask questions in chat and get cited answers.",
      "Question patterns reveal and fill documentation gaps."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "webhooks, PRs, code search"
      ],
      [
        "CI configs (Actions/GitLab/Jenkins)",
        "primary sources"
      ],
      [
        "Backstage / TechDocs / wiki",
        "publishing targets"
      ],
      [
        "Slack / Teams",
        "Q&A interface"
      ]
    ],
    "context": [
      "CI pipeline definitions",
      "Dockerfiles and manifests",
      "scripts and Makefiles",
      "existing docs",
      "git history for 'why' context"
    ],
    "tools": [
      "VCS Code & Config Ingestion API (read-only)",
      "CI/CD & Dockerfile Schema Parser",
      "VCS PR Creation (GitHub / GitLab MCP)",
      "Internal Developer Portal / TechDocs Sync API"
    ],
    "benefits": [
      "High-traffic docs stay current automatically.",
      "Onboarding questions answered instantly with citations.",
      "Doc gaps become visible and fixable."
    ],
    "security": [
      "Never document secrets (even internal-only pages should reference the secret manager).",
      "Q&A respects repo access permissions; no cross-repo leakage."
    ],
    "future": [
      "Auto-generated architecture decision records from PR discussions.",
      "Onboarding path generator: personalized first-week checklist per role."
    ],
    "related": [
      {
        "num": 24,
        "name": "AI Infrastructure Documentation Generator",
        "slug": "ai-infrastructure-documentation-generator"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      },
      {
        "num": 22,
        "name": "Natural Language → Terraform",
        "slug": "natural-language-to-terraform"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Repo + CI config indexing                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Doc-dependency mapping                             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Regeneration on change → PRs                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Chat Q&A with citations                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Doc-gap tickets from questions                     │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"repository\": \"org/payment-ledger\",\n  \"documentation_suite\": \"SERVICE_OPERATIONS_AND_DEPLOYMENT_GUIDE\",\n  \"drift_detected\": true,\n  \"extracted_infrastructure_facts\": {\n    \"runtime\": \"Node.js 20.12 (Distroless)\",\n    \"package_manager\": \"pnpm\",\n    \"deployment_target\": \"Kubernetes (Argo CD GitOps)\",\n    \"exposed_ports\": [\n      3000,\n      9090\n    ],\n    \"mandatory_environment_variables\": [\n      \"DATABASE_URL\",\n      \"KAFKA_BROKERS\",\n      \"STRIPE_API_KEY\"\n    ]\n  },\n  \"generated_documentation_sections\": {\n    \"local_development\": \"# Local Setup\nRun `pnpm install` followed by `docker compose up -d postgres kafka`. Start local dev via `pnpm dev`.\",\n    \"deployment_and_rollback\": \"# Deployment & Rollback\nDeployments are managed by Argo CD. To emergency rollback, revert the image tag commit in `gitops-prod/apps/payment-ledger/values.yaml`.\"\n  },\n  \"interactive_qa_index\": [\n    {\n      \"question\": \"What port does the health check probe listen on?\",\n      \"answer\": \"Port 3000 on path /healthz as configured in `k8s/deployment.yaml:L34`.\",\n      \"confidence\": 0.99\n    }\n  ]\n}"
  },
  {
    "num": 44,
    "slug": "ai-repository-infrastructure-analyzer",
    "name": "AI Repository Infrastructure Analyzer",
    "area": "Developer Experience",
    "tldr": "Point it at a repo and get the full infrastructure story: what it runs on, how it deploys, what it depends on, and what's missing.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Understanding an unfamiliar repo's infrastructure — how it builds, deploys, runs, and what it needs — takes hours of file archaeology that an agent could compress into minutes.",
    "problem": [
      "Inherited or org-hopping engineers face undocumented, inconsistent repos.",
      "Migrations and audits need an inventory of 'what infrastructure does this repo actually use?'",
      "Missing pieces (no health checks, no resource limits, no rollback path) aren't obvious until incidents.",
      "Platform teams can't see fleet-wide patterns without per-repo analysis."
    ],
    "impact": "Fast repo comprehension accelerates onboarding, migrations, audits, and platform adoption decisions.",
    "capabilities": [
      [
        "Infrastructure inventory",
        "build system, CI/CD, containerization, orchestration, cloud resources, dependencies — extracted and explained"
      ],
      [
        "Deployment-story reconstruction",
        "from commit to production: what happens, which systems are involved"
      ],
      [
        "Gap analysis",
        "missing best practices per org standards (health checks, limits, rollback, secrets handling)"
      ],
      [
        "Fleet aggregation",
        "cross-repo views: how many apps use X, migration readiness, standard-violation clusters"
      ]
    ],
    "solution": "An analyzer that reads a repo end-to-end (CI configs, manifests, Dockerfiles, IaC, dependency files), produces a structured infrastructure profile with an explanation narrative, and — across repos — aggregates fleet views. Feeds onboarding docs (idea 43), platform dashboards, and migration planning.",
    "steps": [
      [
        "Scan",
        "enumerate infrastructure-relevant files and configs"
      ],
      [
        "Profile",
        "structured inventory: build, deploy, runtime, dependencies, cloud"
      ],
      [
        "Narrate",
        "plain-language explanation of the deployment story"
      ],
      [
        "Assess",
        "gaps vs. org standards; quick wins flagged"
      ],
      [
        "Aggregate",
        "fleet dashboards across all scanned repos"
      ]
    ],
    "hitl": "Read-only analysis and reporting.",
    "components": [
      [
        "Repo scanner",
        "file/config enumeration and parsing"
      ],
      [
        "Profile builder",
        "structured extraction with confidence labels"
      ],
      [
        "Narrator",
        "LLM explanation of the deployment story"
      ],
      [
        "Standards engine",
        "org-convention gap analysis"
      ],
      [
        "Fleet aggregator",
        "cross-repo analytics"
      ]
    ],
    "flow": [
      "A repo (or org) is scanned on demand or schedule.",
      "Profiles are extracted with structured confidence.",
      "Each repo gets a narrative and gap report.",
      "Fleet views reveal patterns, risks, and migration scope."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "repo access (read-only)"
      ],
      [
        "CI systems",
        "pipeline config sources"
      ],
      [
        "Backstage",
        "catalog enrichment"
      ],
      [
        "Dashboards",
        "fleet views"
      ]
    ],
    "context": [
      "CI configs",
      "Dockerfiles/manifests/IaC",
      "dependency manifests",
      "scripts",
      "existing docs",
      "org standards"
    ],
    "tools": [
      "VCS Tree & Manifest Ingestion API (read-only)",
      "Container & Orchestration Spec Parser",
      "Backstage Catalog Entity Generator",
      "Fleet Compliance & Standards Evaluator"
    ],
    "benefits": [
      "Hours of repo archaeology compressed to minutes.",
      "Objective fleet visibility for platform and migration planning.",
      "Gap analysis that feeds concrete improvement backlogs."
    ],
    "security": [
      "Repo contents are sensitive: restrict to approved providers/local models; respect access permissions strictly.",
      "Aggregate views must not leak one team's code details to another."
    ],
    "future": [
      "Migration planners: 'what would moving this to our standard platform involve?'",
      "Drift alerts: repos diverging from org standards over time."
    ],
    "related": [
      {
        "num": 43,
        "name": "AI DevOps Documentation Generator",
        "slug": "ai-devops-documentation-generator"
      },
      {
        "num": 47,
        "name": "AI Internal Developer Platform Assistant",
        "slug": "ai-internal-developer-platform-assistant"
      },
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Repo scan (CI · IaC · manifests)                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Structured infrastructure profile                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Deployment-story narrative                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Gap analysis vs. standards                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Fleet aggregation dashboard                        │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"repository\": \"org/customer-cart-service\",\n  \"analysis_timestamp\": \"2026-10-06T00:05:00Z\",\n  \"infrastructure_profile\": {\n    \"language\": \"Go 1.22\",\n    \"build_system\": \"Dockerfile (multi-stage Go builder -> distroless)\",\n    \"ci_cd_platform\": \"GitHub Actions\",\n    \"orchestration\": \"Kubernetes Deployment\",\n    \"cloud_dependencies\": [\n      \"AWS DynamoDB\",\n      \"AWS SQS\",\n      \"AWS ElastiCache Redis\"\n    ]\n  },\n  \"standards_gap_analysis\": [\n    {\n      \"standard\": \"POD_DISRUPTION_BUDGET\",\n      \"status\": \"MISSING\",\n      \"severity\": \"HIGH\",\n      \"details\": \"Repository defines 3 replicas in deployment.yaml but has no PodDisruptionBudget manifest.\"\n    },\n    {\n      \"standard\": \"READINESS_LIVENESS_PROBES\",\n      \"status\": \"COMPLIANT\",\n      \"details\": \"Both liveness and readiness probes defined with appropriate initialDelaySeconds.\"\n    }\n  ],\n  \"deployment_story_narrative\": \"Code pushed to main triggers GitHub Actions workflow `ci.yml` which executes `golangci-lint`, runs tests, builds a multi-arch container image pushed to ECR, and automatically creates an image-updater PR against the `gitops-deployments` repository.\"\n}"
  },
  {
    "num": 45,
    "slug": "ai-pull-request-infrastructure-reviewer",
    "name": "AI Pull Request Infrastructure Reviewer",
    "area": "Developer Experience",
    "tldr": "Infra-aware PR review: catches the deployment, config, and dependency consequences of code changes before merge.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Code review catches code problems; nobody systematically reviews PRs for their infrastructure consequences — the new env var that isn't set in prod, the dependency that changes startup behavior.",
    "problem": [
      "PRs add config keys, dependencies, and endpoints whose deployment implications are invisible in the diff.",
      "Reviewers don't have the deployment context (which envs exist, which vars are set) at review time.",
      "Infrastructure-adjacent mistakes (missing migration, incompatible config) pass review and fail in staging/prod.",
      "Generic AI reviewers don't know your deployment topology."
    ],
    "impact": "Catching deploy-breaking PRs at review time removes an entire class of staging surprises and rollbacks.",
    "capabilities": [
      [
        "Config-aware review",
        "compares new env vars/flags/ports against actual environment configs"
      ],
      [
        "Dependency consequence check",
        "flags dependency changes with runtime/size/security implications"
      ],
      [
        "Deployment-contract review",
        "checks that changes respect the deployment method (migrations needed? rolling restart safe? health endpoints present?)"
      ],
      [
        "Targeted questions",
        "asks the author the two questions a senior reviewer would"
      ]
    ],
    "solution": "A PR reviewer specialized for infrastructure awareness: it reads the diff plus deployment configs, env inventories, and org conventions, then comments on deployment consequences. Complements generic AI reviewers (CodeRabbit/Greptile/Qodo — use those for general code review) with deployment-topology knowledge they don't have.",
    "steps": [
      [
        "Diff",
        "parse the PR for config, dependency, and endpoint changes"
      ],
      [
        "Enrich",
        "environment configs, deploy manifests, service catalog context"
      ],
      [
        "Reason",
        "deployment-consequence analysis per change class"
      ],
      [
        "Comment",
        "targeted inline comments and questions"
      ],
      [
        "Learn",
        "false-positive feedback tunes rules and prompts"
      ]
    ],
    "hitl": "Comments only; merge gates stay human and policy-driven.",
    "components": [
      [
        "Diff classifier",
        "identifies infrastructure-relevant change classes"
      ],
      [
        "Context service",
        "env configs, manifests, catalog"
      ],
      [
        "Reviewer",
        "LLM with deployment knowledge + org conventions"
      ],
      [
        "Comment publisher",
        "inline annotations"
      ],
      [
        "Feedback loop",
        "reviewer-accuracy tracking"
      ]
    ],
    "flow": [
      "A PR webhook triggers diff classification.",
      "Deployment context is gathered for the affected service.",
      "Consequence analysis produces targeted comments.",
      "Outcomes calibrate future review quality."
    ],
    "platforms": [
      [
        "Managed AI code reviewers",
        "CodeRabbit · Greptile · Qodo · Graphite · GitLab Duo",
        "buy-instead-of-build option for PR-facing analysis"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "PR webhooks and comments"
      ],
      [
        "CodeRabbit / Greptile / Qodo",
        "complementary generic review layer"
      ],
      [
        "Config/secret managers",
        "env inventory (metadata only)"
      ],
      [
        "Service catalog",
        "deployment topology"
      ]
    ],
    "context": [
      "PR diff",
      "deployment manifests",
      "environment variable inventories",
      "dependency manifests",
      "service catalog entry",
      "org conventions"
    ],
    "tools": [
      "VCS PR & Diff Analysis API (GitHub / GitLab MCP)",
      "Deployment Manifest & Topology Inventory (read-only)",
      "Environment Variable & Secret Metadata Registry (names/types only)",
      "PR Inline Comment Publisher"
    ],
    "benefits": [
      "Fewer deploy-breaking surprises; review catches what CI can't.",
      "Institutional deployment knowledge applied to every PR.",
      "Layered with generic reviewers for full coverage."
    ],
    "security": [
      "Env inventories must be metadata-only (names/types, never values).",
      "Reviewer comments are public to the repo: no sensitive data in explanations."
    ],
    "future": [
      "Suggestion patches for mechanical fixes (add missing env var declaration).",
      "Cross-PR awareness: warn when two PRs together exceed a resource/deployment budget."
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 42,
        "name": "AI Dependency Risk Analyzer",
        "slug": "ai-dependency-risk-analyzer"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ PR opened / updated                                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Diff classifier (config · deps · endpoints)        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Deployment context enrichment                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← envs · manifests · catalog\n┌────────────────────────────────────────────────────┐\n│ Consequence review + inline comments               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Human review · merge                               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"pull_request_number\": 482,\n  \"repository\": \"org/checkout-service\",\n  \"author\": \"@dev-jordan\",\n  \"infrastructure_verdict\": \"ACTION_REQUIRED_BEFORE_MERGE\",\n  \"detected_consequences\": [\n    {\n      \"type\": \"UNDEFINED_ENVIRONMENT_VARIABLE\",\n      \"severity\": \"DEPLOYMENT_BLOCKER\",\n      \"file\": \"src/config/checkout.ts\",\n      \"line\": 14,\n      \"finding\": \"PR references `process.env.CHECKOUT_CIRCUIT_BREAKER_THRESHOLD`, but this variable is not declared in `helm/templates/configmap.yaml` or staging/prod Vault secret paths.\",\n      \"suggested_fix\": \"Add `CHECKOUT_CIRCUIT_BREAKER_THRESHOLD` with a default value of '5' to `helm/values.yaml`.\"\n    },\n    {\n      \"type\": \"BLOCKING_DATABASE_MIGRATION\",\n      \"severity\": \"OPERATIONAL_RISK\",\n      \"file\": \"migrations/20261005_add_orders_idx.sql\",\n      \"line\": 1,\n      \"finding\": \"Executing `CREATE INDEX idx_orders_customer_id ON orders(customer_id);` without `CONCURRENTLY` will acquire an exclusive table lock on 14 million rows in production.\",\n      \"suggested_fix\": \"Modify to `CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);`.\"\n    }\n  ],\n  \"automated_comment_posted\": true\n}"
  },
  {
    "num": 46,
    "slug": "ai-developer-environment-troubleshooter",
    "name": "AI Developer Environment Troubleshooter",
    "area": "Developer Experience",
    "tldr": "Fix 'works on my machine' fast: the assistant reads local error output, checks the environment, and walks the developer to a fix.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Local environment failures — broken containers, port conflicts, version mismatches, stale caches — cost individual developers hours and interrupt teammates who help them.",
    "problem": [
      "Errors are local and thus invisible to any centralized tooling; no telemetry, no triage.",
      "Causes are mundane but varied (Docker state, PATH, port conflicts, versions, permissions).",
      "Help-seeking interrupts senior teammates repeatedly for the same classes of problem.",
      "Environment docs (idea 43) help setup, but breakage diagnosis is different."
    ],
    "impact": "Developer-flow interruptions are among the most expensive productivity losses; fast local unblocking pays back daily.",
    "capabilities": [
      [
        "Error interpretation",
        "reads pasted errors/logs and identifies the likely local cause"
      ],
      [
        "Environment inspection",
        "with permission, checks versions, ports, containers, caches on the developer's machine"
      ],
      [
        "Fix guidance",
        "step-by-step unblock with explanation, preferring reversible commands"
      ],
      [
        "Pattern learning",
        "org-wide view of recurring environment issues → better defaults and docs"
      ]
    ],
    "solution": "A CLI/IDE-resident assistant (Claude Code / Copilot / Cline-class tools, or a custom CLI) plus a chat fallback: developers paste errors or run a diagnostic command; the assistant inspects the local environment read-only, explains the problem, and guides the fix. Anonymized issue classes aggregate into org-level fixes (better Makefiles, setup scripts, docs).",
    "steps": [
      [
        "Ask",
        "developer pastes error or runs `devdoctor`"
      ],
      [
        "Inspect",
        "read-only local checks (versions, ports, containers, disk, env vars presence)"
      ],
      [
        "Diagnose",
        "likely cause with reasoning shown"
      ],
      [
        "Guide",
        "ordered fix steps; explanations for each; nothing destructive without confirmation"
      ],
      [
        "Aggregate",
        "issue classes across the org feed setup-script and doc improvements"
      ]
    ],
    "hitl": "Runs on the developer's machine with their consent; destructive commands (docker system prune) require explicit confirmation and show alternatives.",
    "components": [
      [
        "CLI assistant",
        "local diagnostic command and chat"
      ],
      [
        "Local inspectors",
        "versions, ports, containers, caches, env"
      ],
      [
        "Diagnosis engine",
        "LLM with org-specific environment knowledge"
      ],
      [
        "Knowledge base",
        "known local issues and fixes"
      ],
      [
        "Aggregator",
        "anonymized issue-class reporting"
      ]
    ],
    "flow": [
      "The developer invokes the assistant with an error.",
      "Local checks run with consent and read-only scope.",
      "A diagnosis and ordered fix plan is presented.",
      "Outcomes (fixed/not) and issue classes feed org improvements."
    ],
    "platforms": [
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Docker / Podman",
        "container state inspection"
      ],
      [
        "IDE assistants (Copilot/Claude Code/Cline)",
        "embed point"
      ],
      [
        "Setup scripts / Makefiles",
        "org-standard fixes"
      ],
      [
        "Slack help channels",
        "fallback human path + pattern capture"
      ]
    ],
    "context": [
      "error output",
      "local versions and state",
      "org setup docs",
      "known issue database",
      "recent repo setup changes"
    ],
    "tools": [
      "Local System Diagnostic Runner (docker, port, process, file checks)",
      "Redacted Error Log Analyzer",
      "Developer Environment Knowledge Base (RAG)",
      "Shell Remediation Command Generator"
    ],
    "benefits": [
      "Developers unblocked in minutes without interrupting teammates.",
      "Recurring environment issues fixed at the source (scripts, docs).",
      "Institutional memory for local-environment quirks."
    ],
    "security": [
      "Local inspection is privacy-sensitive: explicit scope, nothing leaves the machine except redacted error context.",
      "Never exfiltrate env vars/secrets; metadata (presence, not value) only."
    ],
    "future": [
      "Pre-flight checks: `devdoctor --preflight` before first run of a repo.",
      "Nix/devcontainer suggestions to eliminate environment drift entirely."
    ],
    "related": [
      {
        "num": 43,
        "name": "AI DevOps Documentation Generator",
        "slug": "ai-devops-documentation-generator"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      },
      {
        "num": 12,
        "name": "AI Deployment Troubleshooting Agent",
        "slug": "ai-deployment-troubleshooting-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Error pasted / devdoctor run                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Read-only local inspection                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← with consent\n┌────────────────────────────────────────────────────┐\n│ Diagnosis + reasoning                              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Guided fix (reversible first)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Org-wide pattern aggregation                       │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"diagnostic_id\": \"devdoctor-local-9182\",\n  \"os\": \"macOS Sonoma (Darwin arm64)\",\n  \"workspace\": \"web-frontend-monorepo\",\n  \"reported_symptom\": \"Error: listen EADDRINUSE: address already in use :::3000\",\n  \"inspected_local_environment\": {\n    \"port_3000_status\": \"OCCUPIED\",\n    \"occupying_process\": {\n      \"command\": \"node /Users/developer/projects/web-frontend/server.js\",\n      \"pid\": 84192,\n      \"status\": \"ORPHANED_BACKGROUND_PROCESS\"\n    },\n    \"docker_daemon_status\": \"RUNNING\",\n    \"nodejs_version\": \"v20.12.2 (matches .nvmrc)\"\n  },\n  \"root_cause_explanation\": \"A previous development session left an orphaned Node.js server process running in the background holding TCP port 3000.\",\n  \"guided_remediation_steps\": [\n    {\n      \"step\": 1,\n      \"command\": \"kill -9 84192\",\n      \"description\": \"Terminate the orphaned background Node process holding port 3000.\",\n      \"destructive\": false\n    },\n    {\n      \"step\": 2,\n      \"command\": \"pnpm dev\",\n      \"description\": \"Relaunch the local development server.\",\n      \"destructive\": false\n    }\n  ]\n}"
  },
  {
    "num": 47,
    "slug": "ai-internal-developer-platform-assistant",
    "name": "AI Internal Developer Platform Assistant",
    "area": "Platform Engineering",
    "tldr": "Give your IDP a conversational front door: create services, find owners, understand scorecards, and troubleshoot platform issues by asking.",
    "complexity": "Medium",
    "automation": "Supervised automation",
    "problem_intro": "Internal developer platforms fail not on capability but on discoverability: developers don't know what exists, how to use it, or why their scorecard is red.",
    "problem": [
      "Platform capability is spread across Backstage, docs, templates, and Slack — none searchable by intent.",
      "Self-service flows (scaffold a service, add a resource) have UI friction and require platform vocabulary.",
      "Scorecards and goldengate requirements are opaque ('what does 'production readiness' even require?').",
      "Platform teams drown in repetitive questions."
    ],
    "impact": "A conversational layer measurably increases platform adoption and cuts the question load on the platform team — the two metrics IDPs live by.",
    "capabilities": [
      [
        "Intent-based self-service",
        "'create a service with a Postgres and a queue' → scaffolder flow with the right template and defaults"
      ],
      [
        "Catalog Q&A",
        "ownership, dependencies, SLOs, scorecards answered from the software catalog with citations"
      ],
      [
        "Platform troubleshooting",
        "why did my scaffold fail / why is my scorecard red — with explanations and fixes"
      ],
      [
        "Guided onboarding",
        "role-aware introduction to the platform's capabilities"
      ]
    ],
    "solution": "A platform assistant wired into Backstage (and Slack): it answers catalog questions via retrieval over the catalog and docs, drives scaffolder templates conversationally (still generating the same reviewable PRs), and explains platform policies. Tools are Backstage-API-backed MCP tools with scoped permissions.",
    "steps": [
      [
        "Ask",
        "developer asks in Backstage or Slack"
      ],
      [
        "Resolve",
        "retrieval over catalog, templates, docs, scorecards"
      ],
      [
        "Act",
        "for self-service intents, drive scaffolder/API flows (producing normal PRs)"
      ],
      [
        "Explain",
        "answers with citations and links into the IDP UI"
      ],
      [
        "Measure",
        "deflected questions and adoption analytics for the platform team"
      ]
    ],
    "hitl": "Self-service actions produce the same reviewable artifacts as the UI (PRs, catalog entries); the assistant doesn't bypass any platform governance.",
    "components": [
      [
        "Assistant front end",
        "Backstage plugin + Slack app"
      ],
      [
        "Catalog retriever",
        "software catalog, templates, docs, scorecards indexed"
      ],
      [
        "Action tools",
        "scaffolder and platform APIs via scoped MCP tools"
      ],
      [
        "Analytics",
        "question types, deflection, adoption trends"
      ]
    ],
    "flow": [
      "The developer asks a question or states an intent.",
      "Retrieval grounds the answer in catalog and docs.",
      "Self-service intents drive the standard platform flows.",
      "Analytics show the platform team what's confusing."
    ],
    "platforms": [
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Backstage",
        "catalog, scaffolder, TechDocs, scorecards"
      ],
      [
        "Slack / Teams",
        "chat surface"
      ],
      [
        "CI/CD and cloud accounts",
        "the resources scaffolder creates"
      ],
      [
        "Port / Humanitec / OpsLevel",
        "alternative IDP backends"
      ]
    ],
    "context": [
      "software catalog entities",
      "templates and docs",
      "scorecard rules",
      "platform policies",
      "org terminology"
    ],
    "tools": [
      "Backstage REST API & Scaffolder MCP (catalog read, template parameterization)",
      "Software Scorecard & Production Readiness API",
      "TechDocs Vector Search API",
      "Slack / Teams Interactive Assistant Bot"
    ],
    "benefits": [
      "Higher platform adoption; lower question load.",
      "Self-service without governance bypass.",
      "Analytics reveal what to document or simplify next."
    ],
    "security": [
      "Assistant inherits user permissions (no privilege escalation through the chat layer).",
      "Scaffold actions are the same governed flows as the UI — no side doors.",
      "Catalog metadata is org-sensitive: retrieval respects existing access controls."
    ],
    "future": [
      "Scorecard coach: guided remediation plans for failing checks.",
      "Proactive nudges: 'your service's dependency is unmaintained — here's the migration path'."
    ],
    "related": [
      {
        "num": 48,
        "name": "AI Golden Path Generator",
        "slug": "ai-golden-path-generator"
      },
      {
        "num": 49,
        "name": "AI Service Catalog Assistant",
        "slug": "ai-service-catalog-assistant"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Developer question (Backstage · Slack)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Catalog + docs retrieval                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Self-service action (scaffold · request)           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← same PRs as UI\n┌────────────────────────────────────────────────────┐\n│ Cited answers + IDP links                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Adoption + deflection analytics                    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"request_id\": \"idp-scaffold-req-3891\",\n  \"user_intent\": \"Provision a new Go backend service with PostgreSQL, Kafka consumer, and automatic scorecard compliance.\",\n  \"matched_template\": {\n    \"template_id\": \"backstage.io/v1beta3/templates/go-standard-backend\",\n    \"template_version\": \"2.4.0\",\n    \"maintainer\": \"@platform-engineering\"\n  },\n  \"resolved_scaffolder_parameters\": {\n    \"service_name\": \"payment-reconciliation-worker\",\n    \"owner_team\": \"billing-eng\",\n    \"database\": \"postgresql-v16\",\n    \"messaging\": \"kafka-event-consumer\",\n    \"tier\": \"tier-1-production\"\n  },\n  \"scorecard_preflight\": {\n    \"preflight_status\": \"PASSED (14/14 Goldengate readiness rules satisfied)\",\n    \"checks\": [\n      \"OpenTelemetry tracing SDK embedded\",\n      \"Health endpoint /healthz enabled\",\n      \"Container security context non-root enforced\"\n    ]\n  },\n  \"scaffolder_execution_output\": {\n    \"new_repository_url\": \"https://github.com/org/payment-reconciliation-worker\",\n    \"catalog_entity_url\": \"https://backstage.corp.internal/catalog/default/component/payment-reconciliation-worker\",\n    \"scaffold_pr_url\": \"https://github.com/org/payment-reconciliation-worker/pull/1\"\n  }\n}"
  },
  {
    "num": 48,
    "slug": "ai-golden-path-generator",
    "name": "AI Golden Path Generator",
    "area": "Platform Engineering",
    "tldr": "Turn your best repo into the platform's next golden path: analyze what great looks like and generate the template, docs, and guardrails.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Golden paths (opinionated templates for 'the blessed way to build a service here') are powerful but expensive: platform teams must distill patterns from real repos into templates by hand.",
    "problem": [
      "Great patterns live in exemplary repos, not in templates; codification lags reality by years.",
      "Template authoring (Cookiecutter/Backstage scaffolder) is meticulous, thankless work.",
      "Templates age as fast as the practices they encode.",
      "Teams fork templates the moment they feel restrictive, fragmenting standards."
    ],
    "impact": "More, fresher golden paths mean faster compliant service creation — the core platform-engineering promise.",
    "capabilities": [
      [
        "Pattern extraction",
        "analyzes exemplary repos to extract the de-facto standard: structure, CI, manifests, testing, ops hooks"
      ],
      [
        "Template synthesis",
        "generates scaffolder/cookiecutter templates with parameterization and sane defaults"
      ],
      [
        "Guardrail derivation",
        "proposes the policy-as-code checks that keep paths compliant"
      ],
      [
        "Maintenance diffing",
        "when exemplars evolve, proposes template updates"
      ]
    ],
    "solution": "A golden-path factory: point it at the reference repo(s) and the template framework; it analyzes, drafts the template with documentation, and proposes the guardrails. Platform engineers review and adopt; template drift is monitored by diffing exemplars against templates over time.",
    "steps": [
      [
        "Select",
        "choose exemplar repo(s) and target template framework"
      ],
      [
        "Extract",
        "identify the repeatable pattern vs. repo-specific detail"
      ],
      [
        "Generate",
        "template files, parameterization, docs, example output"
      ],
      [
        "Guardrail",
        "propose Kyverno/OPA checks enforcing the path"
      ],
      [
        "Maintain",
        "drift detection between exemplars and template over time"
      ]
    ],
    "hitl": "Platform engineers review every template as code. The factory accelerates authoring; it doesn't decide standards.",
    "components": [
      [
        "Repo analyzer",
        "deep analysis of exemplar structure and practices"
      ],
      [
        "Template generator",
        "framework-aware template synthesis"
      ],
      [
        "Guardrail proposer",
        "policy-as-code drafts"
      ],
      [
        "Drift monitor",
        "exemplar-vs-template diffing"
      ]
    ],
    "flow": [
      "Platform team selects exemplars and framework.",
      "The factory extracts the pattern and drafts the template with docs.",
      "Guardrails are proposed to keep derived services compliant.",
      "Drift monitoring keeps templates current as practices evolve."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Backstage scaffolder / Cookiecutter / Copier",
        "template targets"
      ],
      [
        "Exemplar repos",
        "pattern sources"
      ],
      [
        "OPA / Kyverno",
        "guardrail targets"
      ],
      [
        "CI",
        "template smoke tests"
      ]
    ],
    "context": [
      "exemplar repo structure and CI",
      "org standards and scorecards",
      "existing templates",
      "platform policies"
    ],
    "tools": [
      "Exemplar Repository AST & Pattern Analyzer (read-only)",
      "Cookiecutter / Backstage Scaffolder Template Synthesizer",
      "Policy-as-Code Guardrail Generator (OPA / Kyverno)",
      "CI Template Test Runner"
    ],
    "benefits": [
      "Golden paths multiply without proportional platform-team cost.",
      "Templates stay current with real practice.",
      "Guardrails and templates arrive together."
    ],
    "security": [
      "Templates must embed security defaults (no secrets, least-privilege scaffolding) — review for that specifically.",
      "Never extract org-internal identifiers/secrets into shareable templates."
    ],
    "future": [
      "Template eval suite: spin up generated services in CI to catch template rot.",
      "Cross-org template exchange with sanitization review."
    ],
    "related": [
      {
        "num": 47,
        "name": "AI Internal Developer Platform Assistant",
        "slug": "ai-internal-developer-platform-assistant"
      },
      {
        "num": 49,
        "name": "AI Service Catalog Assistant",
        "slug": "ai-service-catalog-assistant"
      },
      {
        "num": 24,
        "name": "AI Infrastructure Documentation Generator",
        "slug": "ai-infrastructure-documentation-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Exemplar repo selection                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Pattern extraction (structure · CI · ops)          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Template synthesis (scaffolder · cookiecutter)     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Guardrail proposals (OPA · Kyverno)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Drift monitoring over time                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"golden_path_id\": \"gp-gen-nodejs-microservice\",\n  \"source_exemplar_repository\": \"org/payment-gateway-reference\",\n  \"target_scaffolder_format\": \"Backstage Scaffolder Template v1beta3\",\n  \"extracted_patterns\": {\n    \"runtime\": \"Node.js 20 LTS (TypeScript)\",\n    \"package_manager\": \"pnpm\",\n    \"testing_framework\": \"Vitest + Playwright E2E\",\n    \"dockerfile_pattern\": \"Multi-stage build with gcr.io/distroless/nodejs20-debian12\",\n    \"ci_workflow\": \"GitHub Actions with automated matrix test sharding and Docker buildx caching\"\n  },\n  \"generated_artifacts\": {\n    \"template_manifest\": \"templates/nodejs-service/template.yaml\",\n    \"skeleton_files_count\": 22,\n    \"derived_policy_guardrails\": [\n      {\n        \"engine\": \"Kyverno\",\n        \"rule_name\": \"require-distroless-base-image\",\n        \"policy_yaml\": \"apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata:\n  name: require-distroless\nspec:\n  validationFailureAction: Enforce\n  rules:\n  - name: check-image\n    match:\n      resources:\n        kinds:\n        - Pod\n    validate:\n      message: \"Base image must derive from approved distroless registry.\"\n      pattern:\n        spec:\n          containers:\n          - image: \"gcr.io/distroless/*\"\"\n      }\n    ]\n  },\n  \"smoke_test_validation\": {\n    \"dry_run_scaffold_passed\": true,\n    \"test_build_exit_code\": 0\n  }\n}"
  },
  {
    "num": 49,
    "slug": "ai-service-catalog-assistant",
    "name": "AI Service Catalog Assistant",
    "area": "Platform Engineering",
    "tldr": "Keep the service catalog true: auto-enrich entities, detect ownership gaps and drift, and answer 'who owns X?' instantly.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Service catalogs (Backstage, OpsLevel, Port) decay immediately: ownership stale after reorgs, metadata missing, dependencies unrecorded — and then nobody trusts or uses the catalog.",
    "problem": [
      "Ownership goes stale after reorgs; 'who owns this?' returns folklore.",
      "Metadata (SLOs, runbooks, on-call, dependencies) is incomplete and unverified.",
      "New services appear untracked (shadow catalog in spreadsheets).",
      "Incident response depends on catalog data that's quietly wrong."
    ],
    "impact": "A trustworthy catalog underpins incidents, security, cost, and compliance — it's the platform's source of truth, or it's nothing.",
    "capabilities": [
      [
        "Enrichment",
        "infers missing metadata from repos, CI, cloud tags, and deploy data (with confidence labels)"
      ],
      [
        "Drift detection",
        "flags stale ownership (git activity vs. recorded owners), orphaned entities, and shadow services"
      ],
      [
        "Instant Q&A",
        "'who owns checkout? what's its SLO? who's on-call?' answered with citations"
      ],
      [
        "Review campaigns",
        "generates targeted confirmation requests per owner instead of org-wide spam"
      ]
    ],
    "solution": "A catalog-maintenance service: scheduled analysis compares catalog entities against reality (repos, activity, deploys, cloud), proposes enrichment PRs, and flags drift for owner confirmation. Chat Q&A makes the catalog useful in Slack where people actually ask.",
    "steps": [
      [
        "Compare",
        "catalog entities vs. repo/cloud/deploy reality"
      ],
      [
        "Propose",
        "enrichment PRs and drift flags with confidence and evidence"
      ],
      [
        "Confirm",
        "targeted review requests to actual owners"
      ],
      [
        "Answer",
        "Q&A over the verified catalog"
      ],
      [
        "Report",
        "catalog health score and trends for the platform team"
      ]
    ],
    "hitl": "Ownership and critical metadata always require owner confirmation; inferred data is labeled as inferred.",
    "components": [
      [
        "Reality checker",
        "repo activity, deploys, cloud tags, on-call data"
      ],
      [
        "Enrichment proposer",
        "metadata inference with evidence"
      ],
      [
        "Campaign manager",
        "targeted confirmation requests"
      ],
      [
        "Q&A engine",
        "chat answers grounded in the catalog"
      ],
      [
        "Health dashboard",
        "completeness/freshness metrics"
      ]
    ],
    "flow": [
      "Scheduled comparison finds gaps and drift.",
      "Enrichment proposals carry evidence and confidence labels.",
      "Owners confirm via targeted requests.",
      "The verified catalog powers Q&A and downstream tooling."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Backstage / OpsLevel / Port",
        "catalog backends"
      ],
      [
        "GitHub / GitLab activity",
        "ownership evidence"
      ],
      [
        "PagerDuty / Opsgenie",
        "on-call data"
      ],
      [
        "Cloud tags / IaC",
        "resource linkage"
      ],
      [
        "Slack",
        "Q&A surface"
      ]
    ],
    "context": [
      "catalog entities and metadata",
      "repo activity and CODEOWNERS",
      "deploy history",
      "on-call schedules",
      "cloud resource tags"
    ],
    "tools": [
      "Service Catalog REST API (Backstage / OpsLevel / Port read & propose)",
      "VCS Activity & CODEOWNERS Analyzer (GitHub / GitLab MCP)",
      "On-Call Schedule API (PagerDuty / Opsgenie)",
      "Cloud Resource Tagging Inventory API"
    ],
    "benefits": [
      "A catalog people trust because it's verified against reality.",
      "Incident, security, and cost tooling get accurate ownership.",
      "Platform team sees catalog health as a managed metric."
    ],
    "security": [
      "Inferred ownership must never auto-replace confirmed owners — confirmation flows are mandatory.",
      "Catalog Q&A respects existing access permissions."
    ],
    "future": [
      "Dependency-graph completion from runtime traffic data.",
      "Lifecycle advisor: flag likely-deprecated services for sunset review."
    ],
    "related": [
      {
        "num": 47,
        "name": "AI Internal Developer Platform Assistant",
        "slug": "ai-internal-developer-platform-assistant"
      },
      {
        "num": 48,
        "name": "AI Golden Path Generator",
        "slug": "ai-golden-path-generator"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Catalog vs. reality comparison                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Enrichment PRs + drift flags                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← confidence-labeled\n┌────────────────────────────────────────────────────┐\n│ Owner confirmation campaigns                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Chat Q&A with citations                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Catalog health reporting                           │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"catalog_audit_id\": \"cat-audit-2026-10-06\",\n  \"entity_name\": \"checkout-order-fulfillment\",\n  \"entity_kind\": \"Component\",\n  \"drift_status\": \"OWNERSHIP_DRIFT_CONFIRMED\",\n  \"ownership_investigation\": {\n    \"recorded_owner_group\": \"group:legacy-logistics-team\",\n    \"inferred_active_owner\": \"group:checkout-core-squad\",\n    \"confidence_score\": 0.98,\n    \"corroborating_evidence\": [\n      \"100% of the last 45 commits to org/checkout-order-fulfillment authored by @checkout-core-squad members.\",\n      \"Primary on-call pager escalations routed to checkout-core PagerDuty escalation policy.\"\n    ]\n  },\n  \"metadata_enrichment_proposal\": {\n    \"target_catalog_file\": \"catalog-info.yaml\",\n    \"suggested_patch\": \"spec:\n  owner: group:checkout-core-squad\n  system: ecommerce-checkout\n  tier: tier-1\n  lifecycle: production\n\",\n    \"review_assigned_to\": \"@checkout-core-lead\"\n  },\n  \"service_dependency_graph\": {\n    \"upstream_services\": [\n      \"payment-gateway\",\n      \"inventory-service\"\n    ],\n    \"downstream_datastores\": [\n      \"postgres-fulfillment-replica\"\n    ]\n  }\n}"
  },
  {
    "num": 50,
    "slug": "ai-on-call-copilot",
    "name": "AI On-Call Copilot",
    "area": "Agentic DevOps",
    "tldr": "The capstone: a copilot that rides along with the on-call engineer — investigating alerts, drafting mitigations, executing pre-approved runbooks, and keeping everyone informed.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "On-call engineers face the union of every problem in this catalog at 3am, alone, with context evaporating. The capstone idea ties the pieces into a single copilot that acts as their junior teammate.",
    "problem": [
      "Every alert requires the same scramble: dashboards, logs, deploys, runbooks, history — while the clock runs.",
      "Knowledge (what worked last time) is locked in people's heads and past postmortems.",
      "Routine mitigations are safe but must be executed manually under stress.",
      "Communication overhead (updates, escalations) competes with diagnosis."
    ],
    "impact": "An on-call copilot compounds every other idea in this catalog into one interface — this is where agentic DevOps becomes a daily reality.",
    "capabilities": [
      [
        "Alert ride-along",
        "for each page: pre-investigated context (idea 30), timeline, hypotheses, runbook suggestions"
      ],
      [
        "Conversational investigation",
        "natural-language follow-ups driving the same tool belt as ideas 02/05/25"
      ],
      [
        "Supervised mitigation",
        "pre-approved runbook steps executable after explicit confirmation, fully audited"
      ],
      [
        "Comms autopilot (drafts)",
        "stakeholder updates via the incident summarizer pattern (idea 31)"
      ],
      [
        "Shift handover",
        "structured handoff briefings from the shift's actual events"
      ]
    ],
    "solution": "A copilot service that unifies the catalog's building blocks behind one chat/CLI surface: an agent runtime with an MCP tool belt across Kubernetes, cloud, observability, GitHub, and incident tooling; a policy engine separating read (free), write (confirm), and pre-approved runbook (fast-confirm) actions; and memory linking alerts → investigations → outcomes. Built on LangGraph or a kagent-style control plane, with every model and tool call observable.",
    "steps": [
      [
        "Page received",
        "copilot attaches to the alert thread with pre-investigated context"
      ],
      [
        "Investigate together",
        "engineer directs; copilot executes read-only tool calls and reports"
      ],
      [
        "Mitigate",
        "copilot proposes actions; pre-approved runbooks confirm-fast, everything else waits for explicit approval"
      ],
      [
        "Communicate",
        "drafted updates flow to stakeholders on the summarizer pattern"
      ],
      [
        "Hand over / resolve",
        "structured handoff or resolution record feeding postmortems (idea 36)"
      ],
      [
        "Learn",
        "each engagement's outcome tunes runbooks, priors, and evals"
      ]
    ],
    "hitl": "The defining design constraint: read is free, write is confirmed, runbooks are pre-approved per-step by their owners. The copilot is a junior teammate with a fast, auditable approval loop — never an autonomous operator.",
    "components": [
      [
        "Copilot runtime",
        "agent graph (LangGraph/kagent-style) with session memory"
      ],
      [
        "MCP tool belt",
        "kubernetes, cloud, Grafana, GitHub, PagerDuty MCP servers — permission-tiered"
      ],
      [
        "Policy engine",
        "read/write/runbook tiers, per-service approval policies"
      ],
      [
        "Approval UX",
        "one-tap confirm in Slack with full context of what will run"
      ],
      [
        "Memory",
        "past engagements, service priors, runbook outcomes"
      ],
      [
        "Observability",
        "every model/tool call traced (Langfuse/Phoenix) with cost control"
      ]
    ],
    "flow": [
      "A page triggers pre-investigation and the copilot joins the thread.",
      "The engineer and copilot investigate together through read-only tools.",
      "Mitigations are proposed with clear tiers: fast-confirm runbooks vs. explicit-approval writes.",
      "Comms drafts keep stakeholders current; resolution records feed learning.",
      "Outcomes tune runbooks and evaluation sets for the next shift."
    ],
    "platforms": [
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ],
      [
        "Open-weight / self-hosted models",
        "DeepSeek V4 · Qwen 3.x · Llama 4 · Mistral Large 2 served via vLLM or Ollama",
        "keeps sensitive logs and infrastructure data in-house; zero per-token cost"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ]
    ],
    "integrations": [
      [
        "PagerDuty / Opsgenie",
        "paging and escalation"
      ],
      [
        "kubernetes + cloud MCP servers",
        "investigation and gated action"
      ],
      [
        "mcp-grafana / Loki / traces",
        "observability evidence"
      ],
      [
        "GitHub MCP",
        "revert PRs, runbook repos"
      ],
      [
        "Slack / Teams",
        "primary interaction surface"
      ],
      [
        "Vault / secret managers",
        "credential brokering for tools"
      ]
    ],
    "context": [
      "alert and incident context",
      "service topology and runbooks",
      "metrics/logs/traces",
      "past engagements and postmortems",
      "approval policies per service"
    ],
    "tools": [
      "Read tier: k8s, cloud, observability, GitHub (always available)",
      "Write tier: gated by per-action approval",
      "Runbook tier: pre-approved steps with fast confirm"
    ],
    "benefits": [
      "One interface instead of seven consoles during every page.",
      "Institutional memory available at 3am, not just in retrospect.",
      "Safe automation lane for routine mitigations with full auditability.",
      "Compounding value: each catalog idea it consumes makes it better."
    ],
    "security": [
      "Tiered permissions are the core design: no blanket credentials, per-tool scoping, deny-by-default writes.",
      "Every action (model call, tool call, approval, execution) is immutably logged — the audit trail is the product.",
      "Prompt-injection defense: treat all telemetry as data; schema-validated action plans; allowlisted runbooks only.",
      "Break-glass path documented and drilled: what happens if the copilot is down or wrong.",
      "Sensitive services can require two-person approval even for runbook tiers."
    ],
    "future": [
      "Multi-agent mode: domain investigators (k8s, cloud, app) coordinated by the copilot.",
      "Autonomy graduation: promote runbook steps to auto-execution only with measured reliability and owner consent.",
      "Shift analytics: what consumed on-call time, what the copilot saved, where runbooks are missing."
    ],
    "related": [
      {
        "num": 5,
        "name": "AI Incident Investigator",
        "slug": "ai-incident-investigator"
      },
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 31,
        "name": "AI Incident Summarizer",
        "slug": "ai-incident-summarizer"
      },
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Page → copilot attaches + pre-investigates         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Conversational investigation                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← MCP tool belt\n┌────────────────────────────────────────────────────┐\n│ Mitigation proposal (confirm · fast-confirm)       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← policy engine\n┌────────────────────────────────────────────────────┐\n│ Stakeholder update drafts                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Handover / resolution record                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Outcome → runbook + eval tuning                    │\n└────────────────────────────────────────────────────┘",
    "cost": "Pages are infrequent; each engagement is deep. Hybrid routing (cheap models for chat, frontier for investigation) plus strict tool-call budgets keep per-incident cost in single-digit dollars — versus the on-call hour it compresses.",
    "variations": [
      "Build on kagent/HolmesGPT as the runtime and add the policy/approval layer, rather than starting from scratch.",
      "CLI-first copilot for teams that live in terminals, Slack app for everyone else — same tool belt.",
      "Start as pure enrichment (idea 30) and grow into the full copilot as trust data accumulates."
    ],
    "schema": "{\n  \"copilot_session_id\": \"oncall-session-2026-10-06-0042\",\n  \"incident_reference\": \"INC-84920\",\n  \"alert_context\": {\n    \"alert_name\": \"KafkaConsumerGroupLagSurge\",\n    \"affected_service\": \"order-event-worker\",\n    \"severity\": \"SEV-1\",\n    \"current_lag_messages\": 384000\n  },\n  \"autonomous_pre_investigation\": {\n    \"duration_seconds\": 22,\n    \"telemetry_findings\": \"Worker pods CPU utilization normal (42%), but thread dump indicates 95% of worker threads blocked in WAITING state on RDS Aurora write lock.\",\n    \"root_cause_hypothesis\": \"Unindexed transaction table query in migration 0089 holding exclusive table lock on orders table.\"\n  },\n  \"conversational_actions_executed\": [\n    {\n      \"operator_prompt\": \"Check RDS active locks on db-orders-aurora\",\n      \"tool_used\": \"aws_rds_describe_db_instances\",\n      \"summary\": \"Aurora PostgreSQL instance db-orders-aurora write latency spiked to 480ms with 18 active table lock waits.\"\n    }\n  ],\n  \"supervised_mitigation_plan\": {\n    \"action_tier\": \"PRE_APPROVED_RUNBOOK\",\n    \"runbook_name\": \"Cancel Long-Running Database Lock Query\",\n    \"sanctioned_command\": \"SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE query LIKE '%ALTER TABLE orders ADD CONSTRAINT%' AND state = 'active';\",\n    \"safety_checks_passed\": true,\n    \"approval_status\": \"APPROVED_BY_OPERATOR\",\n    \"execution_audit_id\": \"AUDIT-K8S-OPS-91823\"\n  },\n  \"shift_handover_summary\": \"Mitigated Sev-1 Kafka consumer lag surge on order-event-worker by terminating blocking DDL query on RDS Aurora. Action items filed under INFRA-4891.\"\n}"
  },
  {
    "num": 51,
    "slug": "ai-runbook-generator",
    "name": "AI Runbook Generator",
    "area": "Developer Experience",
    "tldr": "Turn tribal incident knowledge into living runbooks: generated from real incidents, telemetry, and topology, and kept current instead of rotting in the wiki.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "When something breaks, the fastest path to recovery is a runbook — and the most common state of a runbook is missing, stale, or written for an architecture that no longer exists.",
    "problem": [
      "Runbooks are written under pressure (or not at all) and describe yesterday's architecture, commands, and dashboards.",
      "The person who knows the fix is the person who is on vacation; institutional knowledge leaves with them.",
      "Stale runbooks are actively dangerous: wrong commands, renamed services, dashboards that 404 mid-incident.",
      "Writing and maintaining runbooks for every service is nobody's day job, so coverage decays."
    ],
    "impact": "Every missing or stale runbook converts a five-minute fix into an hour of archaeology, and on-call quality quietly depends on who happens to remember.",
    "capabilities": [
      [
        "Runbook synthesis",
        "drafts detection → diagnosis → mitigation → escalation runbooks from incident history, telemetry, and service topology"
      ],
      [
        "Incident mining",
        "extracts what actually worked from postmortems, incident threads, and the PRs that fixed things"
      ],
      [
        "Architecture grounding",
        "binds steps to the dashboards, commands, and owners that exist today; flags references to the renamed or deleted"
      ],
      [
        "Drift detection",
        "re-validates runbooks on deploys and topology changes, proposing updates for stale steps"
      ],
      [
        "Executable steps",
        "renders steps as copy-paste commands with links to live dashboards and queries"
      ]
    ],
    "solution": "A runbook service that sits next to your observability and incident stack: it drafts runbooks per service and failure mode from real incident data (postmortems, timelines, the queries and commands that actually got used), keeps them grounded in the current architecture via the service catalog (idea 49), and re-checks them when topology or tooling changes. Output lands next to the service or in the wiki as markdown — reviewable in PRs, rendered everywhere.",
    "steps": [
      [
        "Ingest",
        "collect incident history, postmortems, alert definitions, service topology, and dashboard inventory"
      ],
      [
        "Draft",
        "per service and failure mode, generate runbook structure: detection, diagnosis, mitigation, escalation"
      ],
      [
        "Ground",
        "bind steps to real commands, dashboards, queries, and owners; validate that links and commands exist"
      ],
      [
        "Review",
        "service owner reviews and merges via PR; edits feed back as preferences"
      ],
      [
        "Maintain",
        "on deploys or topology changes, re-validate and propose updates for drifted steps"
      ]
    ],
    "hitl": "Every runbook is PR-reviewed by the service owner before publication; the AI drafts and re-validates, humans own accuracy.",
    "components": [
      [
        "Ingestion collectors",
        "postmortems, incident channels, alert definitions, service catalog, dashboards"
      ],
      [
        "Runbook composer",
        "LLM drafting with a strict runbook schema and house style"
      ],
      [
        "Grounding validator",
        "checks commands, dashboard links, alert names, and owners against live systems"
      ],
      [
        "Drift watcher",
        "re-runs validation on deploys and topology changes; files update PRs"
      ]
    ],
    "flow": [
      "A service is onboarded by pointing the tool at its catalog entry, repo, dashboards, and incident history.",
      "The composer drafts runbooks for the service's real failure modes, mined from past incidents.",
      "The grounding validator rewrites generic steps into the org's actual commands, queries, and links.",
      "Owners review via PR; the drift watcher keeps every runbook honest as the system changes."
    ],
    "platforms": [
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Postmortem & incident tools",
        "source material: what happened and what fixed it"
      ],
      [
        "Service catalog (Backstage etc.)",
        "per-service runbook binding and ownership"
      ],
      [
        "Grafana / Prometheus / Loki",
        "live dashboard and query links per step"
      ],
      [
        "GitHub / GitLab",
        "runbooks as code, PR review, drift updates"
      ],
      [
        "PagerDuty / Opsgenie",
        "link runbooks to alerts so pages arrive with the right doc"
      ]
    ],
    "context": [
      "incident and postmortem history",
      "service topology and ownership",
      "alert definitions and thresholds",
      "dashboard and query inventory",
      "existing runbooks and wiki pages"
    ],
    "tools": [
      "Read-only: incident/postmortem APIs, service catalog, dashboard inventory, alert definitions",
      "Write tier: PR creation to the runbook repository (human-reviewed)"
    ],
    "benefits": [
      "Runbook coverage for every service, without a side project dying for it.",
      "Runbooks that reference what exists today — commands, dashboards, and owners validated, not remembered.",
      "Pages arrive with the right runbook attached, cutting time-to-mitigation.",
      "Institutional knowledge survives attrition."
    ],
    "security": [
      "Incident channels and postmortems contain sensitive detail: redact secrets/PII before any model call; prefer in-VPC or open-weight models for raw transcripts.",
      "Runbook PRs are reviewed like code; generated commands pass destructive-pattern lint before anyone copies them.",
      "Read-only everywhere except the PR write path; no direct edits to wikis."
    ],
    "future": [
      "Runbook rehearsal: pair with chaos experiments (idea 58) to verify steps actually work.",
      "Interactive mode: walk the on-call through the runbook during a page and learn which steps helped.",
      "Coverage analytics: which services lack runbooks for their top failure modes."
    ],
    "related": [
      {
        "num": 36,
        "name": "AI Postmortem Generator",
        "slug": "ai-postmortem-generator"
      },
      {
        "num": 49,
        "name": "AI Service Catalog Assistant",
        "slug": "ai-service-catalog-assistant"
      },
      {
        "num": 31,
        "name": "AI Incident Summarizer",
        "slug": "ai-incident-summarizer"
      },
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Incident + topology ingestion                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only\n┌────────────────────────────────────────────────────┐\n│ Runbook drafting (per failure mode)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Grounding: real commands · dashboards              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← link-validated\n┌────────────────────────────────────────────────────┐\n│ Owner review via pull request                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Continuous re-validation on change                 │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"service\": \"payments-api\",\n  \"failure_mode\": \"consumer-lag-spike\",\n  \"runbook\": {\n    \"title\": \"payments-api: Kafka consumer lag spike\",\n    \"detection\": [{\"signal\": \"kafka_consumergroup_lag > 100000 for 5m\", \"dashboard\": \"grafana/d/payments-lag\"}],\n    \"diagnosis_steps\": [\n      {\"step\": 1, \"action\": \"kubectl -n payments logs deploy/order-worker --tail=200\", \"expect\": \"DB lock errors or rebalance storms\"}\n    ],\n    \"mitigation_steps\": [\n      {\"step\": 1, \"action\": \"scale consumer deployment to 6 replicas\", \"expect\": \"lag slope turns negative within 10m\"}\n    ],\n    \"escalation\": {\"owner\": \"@payments-oncall\", \"when\": \"lag still rising after mitigation step 2\"}\n  },\n  \"grounding_report\": {\"links_validated\": 7, \"links_broken\": 1, \"stale_steps_flagged\": 2},\n  \"last_validated\": \"2026-10-12T09:00:00Z\"\n}"
  },
  {
    "num": 52,
    "slug": "ai-flaky-test-detective",
    "name": "AI Flaky Test Detective",
    "area": "CI/CD",
    "tldr": "Find the tests that fail for no reason — statistically, across pipeline history — explain why they flake, and propose quarantine or fixes.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Flaky tests poison trust in CI: engineers learn to hit 'retry' without reading, and real failures hide inside the noise they created.",
    "problem": [
      "A flaky test fails intermittently; a single red run tells you almost nothing about whether the code or the test is at fault.",
      "Retries mask flakiness: green builds hide the fact that half the suite is a coin flip.",
      "Hunting flakiness manually means grepping pipeline history across weeks and correlating with timing, order, and runner noise.",
      "Quarantine policies are ad hoc: nobody remembers which tests are 'known flaky' or re-triages them."
    ],
    "impact": "Flaky tests waste retry-minutes at scale, train engineers to ignore red, and let genuine regressions slip through a suite nobody trusts.",
    "capabilities": [
      [
        "Statistical detection",
        "retry-aware failure-rate analysis across pipeline history separates flaky from broken"
      ],
      [
        "Failure clustering",
        "groups the failing runs of one test and compares error signatures across failures"
      ],
      [
        "Cause hypothesis",
        "correlates flakes with parallelism, timeouts, ordering, shared state, network, and runner pressure"
      ],
      [
        "Quarantine & fix drafting",
        "opens a quarantine PR with evidence, or drafts the fix (explicit waits, isolation, seeds, timeouts)"
      ],
      [
        "Re-triage loop",
        "tracks quarantined tests with expiries and retires or promotes them on evidence"
      ]
    ],
    "solution": "A CI-side analyzer that ingests pipeline and test history (JUnit results, GitHub Actions/Jenkins/GitLab APIs), computes per-test flakiness scores, and — for the worst offenders — pulls failing runs' logs and diffs their error signatures to hypothesize the mechanism (shared state, race, timeout, environment). It proposes a path per test: quarantine with an expiry, a concrete fix PR, or an infra-level remedy (more runners, better isolation).",
    "steps": [
      [
        "Collect",
        "test results and logs across pipeline history, including retries"
      ],
      [
        "Score",
        "per-test flakiness: failure rate, pass-after-retry rate, correlation with time/runner/branch"
      ],
      [
        "Cluster",
        "group failing runs per test; compare error signatures across failures"
      ],
      [
        "Diagnose",
        "hypothesize mechanism from signature diffs, timing, and resource data"
      ],
      [
        "Act",
        "quarantine PR with evidence + expiry, fix PR draft, or infra recommendation; track to resolution"
      ]
    ],
    "hitl": "The detective never merges: quarantine and fix PRs are reviewed by test owners; re-triage reports keep quarantines honest and temporary.",
    "components": [
      [
        "History collector",
        "CI APIs and JUnit/pytest result ingestion, retry-aware"
      ],
      [
        "Flakiness engine",
        "statistical scoring per test and per suite"
      ],
      [
        "Signature differ",
        "log comparison across a test's failures"
      ],
      [
        "Action drafter",
        "quarantine PRs, fix suggestions, infra recommendations, expiry tracker"
      ]
    ],
    "flow": [
      "Nightly (or on a webhook), the collector refreshes per-test statistics from the CI system.",
      "Tests above the flakiness threshold are flagged with their cost: retries wasted, minutes lost.",
      "For top offenders, failure signatures are diffed and a mechanism hypothesis is drafted.",
      "Owners get a quarantine or fix PR with evidence; expiry dates force re-triage."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "GitHub Actions / Jenkins / GitLab CI",
        "pipeline and test-result APIs"
      ],
      [
        "Test frameworks (JUnit, pytest, go test)",
        "structured results, retries, timing"
      ],
      [
        "CI retry policies",
        "retry semantics awareness in scoring"
      ],
      [
        "Slack / dashboards",
        "weekly flakiness report per team"
      ]
    ],
    "context": [
      "per-test pass/fail history with retries",
      "failing-run logs and error signatures",
      "pipeline parallelism and runner metadata",
      "timing and resource metrics",
      "test ownership from CODEOWNERS"
    ],
    "tools": [
      "Read-only: CI APIs, artifact stores, log storage",
      "Write tier: PR creation (quarantine/fix), issue filing"
    ],
    "benefits": [
      "A ranked, costed list of what flakiness actually costs, per team.",
      "Quarantines with expiries instead of permanent skips.",
      "Real fixes for the top mechanisms: state leakage, races, timeouts.",
      "CI red becomes meaningful again."
    ],
    "security": [
      "Test logs can embed secrets or customer data from fixtures: redact before model calls; prefer self-hosted models for raw logs.",
      "Quarantine is audited: skipping tests is a security-relevant action; every skip names an owner and an expiry."
    ],
    "future": [
      "Pre-merge flakiness check: flag PRs touching files with high-flakiness tests.",
      "Order-shuffle and repetition testing generated automatically for suspected state leaks.",
      "Org-wide flakiness budget per team with trend tracking."
    ],
    "related": [
      {
        "num": 10,
        "name": "AI Test Failure Analyzer",
        "slug": "ai-test-failure-analyzer"
      },
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 11,
        "name": "AI Build Optimization Assistant",
        "slug": "ai-build-optimization-assistant"
      },
      {
        "num": 7,
        "name": "AI GitHub Actions Debugger",
        "slug": "ai-github-actions-debugger"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Test history ingestion (with retries)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Flakiness scoring across runs                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Failure clustering + signature diff                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Mechanism hypothesis (race · state · time)         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Quarantine / fix PR + re-triage                    │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"test_id\": \"checkout.E2E.test_payment_retry\",\n  \"flakiness_score\": 0.34,\n  \"observations\": {\"runs_last_30d\": 412, \"failures\": 41, \"pass_after_retry\": 38, \"retry_minutes_wasted\": 96},\n  \"signature_clusters\": [\n    {\"signature\": \"TimeoutError: waiting for #checkout-btn\", \"count\": 29, \"correlated_with\": \"parallelism=8 + p95 runner cpu 0.97\"}\n  ],\n  \"hypothesis\": {\"mechanism\": \"resource-contention-timeout\", \"confidence\": \"high\", \"evidence\": [\"fails on 8-way shards\", \"passes in isolation 50/50\"]},\n  \"recommendation\": {\"action\": \"quarantine_with_fix_pr\", \"quarantine_expiry\": \"2026-11-12\", \"fix_pr\": \"PR-2841\"}\n}"
  },
  {
    "num": 53,
    "slug": "ai-database-migration-reviewer",
    "name": "AI Database Migration Reviewer",
    "area": "CI/CD",
    "tldr": "Review every schema migration before it ships: lock risk, backward compatibility, data loss, and a rehearsed backout plan.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Schema migrations are the deployments most likely to cause an outage, yet they get less review than a CSS change — locks, backfills, and ordering problems don't show up in a unit test.",
    "problem": [
      "A migration that is instant on a dev table takes an exclusive lock on a 500M-row production table.",
      "Breaking changes (dropped columns, narrowed types, renamed fields) fail at runtime in old code still being deployed.",
      "Migrations and application deploys are ordered wrong: the new code ships before its column exists.",
      "Backout plans are wishful thinking: 'down' migrations rarely survive contact with real data."
    ],
    "impact": "One bad migration can lock the primary write path for minutes, and the rollback may be worse than the deploy — this is where review leverage is highest.",
    "capabilities": [
      [
        "Lock & duration modeling",
        "estimates lock semantics (online DDL, CONCURRENTLY, pt-osc) against real table sizes to predict blocking"
      ],
      [
        "Compatibility analysis",
        "expand-contract checking: will the currently deployed code still run after this migration?"
      ],
      [
        "Data-loss detection",
        "flags destructive operations with the exact data at risk"
      ],
      [
        "Backout drafting",
        "writes a realistic backout plan — or names the point of no return — before approval"
      ],
      [
        "Deploy-order guidance",
        "sequences migrations against app deploys and feature flags"
      ]
    ],
    "solution": "A PR-facing reviewer for migration files (SQL, Alembic, Flyway, Liquibase, Prisma, Rails): it parses the migration, queries read-only metadata about production table sizes and indexes, and returns a risk report — blocking estimate, compatibility with the currently deployed version, destructiveness, and a backout sketch — as PR comments. It learns your patterns: expand-contract discipline, lock-timeout usage, batched backfills.",
    "steps": [
      [
        "Parse",
        "read the migration diff and dialect; identify DDL/DML and targets"
      ],
      [
        "Ground",
        "fetch table sizes, row counts, and index usage from prod metadata (read-only)"
      ],
      [
        "Analyze",
        "lock/duration estimate, compatibility with deployed code, data-loss scan"
      ],
      [
        "Report",
        "PR review comments with severity, evidence, and required mitigations"
      ],
      [
        "Plan",
        "attach backout plan and deploy-order recommendation to the release checklist"
      ]
    ],
    "hitl": "Advisory by default: the reviewer blocks nothing itself, but protected paths can require a named migration owner to sign off on high-risk items.",
    "components": [
      [
        "Migration parser",
        "dialect-aware parsing of the migration diff"
      ],
      [
        "Metadata probe",
        "read-only information_schema / pg_stat / cloud catalog queries"
      ],
      [
        "Risk engine",
        "lock modeling, expand-contract checks, destructiveness heuristics + LLM reasoning"
      ],
      [
        "PR reviewer",
        "inline comments, severity labels, checklist attachments"
      ]
    ],
    "flow": [
      "The CI pipeline posts the migration diff to the reviewer.",
      "The probe grounds the analysis in real table sizes and lock behavior.",
      "The engine returns inline findings: blocking risk, compat breaks, destructive steps.",
      "A backout plan and deploy ordering ride along with the release checklist."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "PR comments and checks"
      ],
      [
        "PostgreSQL / MySQL / SQL Server",
        "read-only metadata and lock semantics"
      ],
      [
        "Alembic / Flyway / Liquibase / Prisma",
        "migration frameworks"
      ],
      [
        "ORMs & schema registries",
        "code-side usage of changed columns"
      ],
      [
        "Slack",
        "release-checklist notifications"
      ]
    ],
    "context": [
      "migration diff and dialect",
      "table sizes, row counts, indexes",
      "currently deployed app version's expectations",
      "migration history and conventions",
      "replication topology"
    ],
    "tools": [
      "Read-only: information_schema, pg_stat, cloud DB catalogs, repo code (column usage)",
      "Write tier: PR comments and check results only"
    ],
    "benefits": [
      "Blocking and data-loss risks surfaced before merge, not at 2am.",
      "Expand-contract discipline enforced gently and consistently.",
      "Backout plans written while the data still exists to write about.",
      "Fewer migration-induced outages and freeze-window panics."
    ],
    "security": [
      "Metadata access is read-only and least-privileged; no table data leaves the database — only schema statistics.",
      "Schema names and comments can be sensitive: redact or use self-hosted models if required.",
      "Findings are advisory; enforcement happens through required reviews, not secret gates."
    ],
    "future": [
      "Shadow-run migrations against a sized-down clone to measure actual duration.",
      "Migration rehearsal in CI with anonymized prod-shaped data.",
      "Cross-service impact map: which other services read this table or column."
    ],
    "related": [
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 21,
        "name": "AI Terraform Plan Explainer",
        "slug": "ai-terraform-plan-explainer"
      },
      {
        "num": 12,
        "name": "AI Deployment Troubleshooting Agent",
        "slug": "ai-deployment-troubleshooting-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Migration diff from pull request                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Prod metadata grounding (read-only)                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← sizes · locks · indexes\n┌────────────────────────────────────────────────────┐\n│ Risk analysis: locks · compat · loss               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ PR review comments + severity                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Backout plan + deploy-order guidance               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"migration\": \"V042__add_orders_status_index.sql\",\n  \"dialect\": \"postgresql\",\n  \"risk_verdict\": \"HIGH\",\n  \"findings\": [\n    {\"severity\": \"high\", \"kind\": \"lock\", \"detail\": \"CREATE INDEX without CONCURRENTLY on orders (412M rows); estimated exclusive-lock hold 8-20 min\", \"mitigation\": \"use CREATE INDEX CONCURRENTLY\"},\n    {\"severity\": \"medium\", \"kind\": \"compat\", \"detail\": \"NOT NULL on status breaks deployed v1.14 writers\", \"mitigation\": \"add nullable, backfill, then constrain\"}\n  ],\n  \"backout\": {\"reversible\": true, \"plan\": \"DROP INDEX CONCURRENTLY orders_status_idx; no data loss\"},\n  \"deploy_order\": [\"migration 042\", \"app v1.15\"]\n}"
  },
  {
    "num": 54,
    "slug": "ai-kubernetes-upgrade-assistant",
    "name": "AI Kubernetes Upgrade Assistant",
    "area": "Kubernetes",
    "tldr": "Plan and rehearse cluster upgrades: deprecated API scanning, add-on compatibility, canary node pools, and a rollback story — before anything touches production.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Kubernetes upgrades are feared for good reason: version skew, removed APIs, and add-on incompatibilities turn a routine patch into a multi-day outage risk.",
    "problem": [
      "Deprecated APIs break workloads only when the new version actually runs — everything works today and fails after upgrade.",
      "Add-ons (CNI, ingress, operators, CRDs) each carry their own compatibility matrix; nobody tracks the cross product.",
      "Version-skew rules (kubelet vs control plane, max minors) constrain sequencing but are easy to violate across a fleet.",
      "Every cluster is slightly different; a playbook that worked on staging fails on the pet cluster with a 2019 CRD."
    ],
    "impact": "A botched control-plane upgrade takes down everything at once; the difference between routine and outage is almost entirely preparation quality.",
    "capabilities": [
      [
        "Deprecation scanning",
        "walks live manifests, CRDs, and helm values for APIs removed in the target version"
      ],
      [
        "Compatibility matrix",
        "checks add-on and operator versions against the target k8s version and each other"
      ],
      [
        "Fleet sequencing",
        "plans upgrade order respecting skew rules, PDBs, and environment blast radius"
      ],
      [
        "Rehearsal plan",
        "generates canary node-pool and staging-first steps with explicit verification gates"
      ],
      [
        "Rollback readiness",
        "verifies etcd backups and states what is (and is not) reversible at each step"
      ]
    ],
    "solution": "An upgrade copilot that reads the cluster's actual state (via k8s APIs, not guesses), diffs it against the target version's deprecation and compatibility data, and produces a sequenced, gated plan: pre-flight fixes as PRs (manifest/API updates validated with dry-runs), a rehearsed canary path (new node pool, drain, observe), verification queries at each gate, and a rollback decision tree. During execution it rides along with read-only checks at every gate, cluster-ops style (idea 19).",
    "steps": [
      [
        "Inventory",
        "scan the live cluster: API usage, CRDs, add-on versions, node pools, PDBs"
      ],
      [
        "Diff",
        "against the target version: removed APIs, add-on compatibility, skew constraints"
      ],
      [
        "Plan",
        "sequenced upgrade with canary stages, verification gates, and rollback points"
      ],
      [
        "Pre-flight",
        "open PRs for manifest/API fixes; validate with dry-run against the target version"
      ],
      [
        "Ride-along",
        "monitor each stage read-only; verify gate queries before the next step"
      ]
    ],
    "hitl": "The assistant plans, drafts, and verifies; humans execute or approve each stage — control-plane actions are never autonomous in this idea.",
    "components": [
      [
        "Inventory scanner",
        "API usage, CRDs, versions, topology from the live cluster (read-only)"
      ],
      [
        "Compatibility engine",
        "deprecation data + add-on matrices + skew rules, LLM-assisted for the long tail"
      ],
      [
        "Planner",
        "sequencing with canary stages and verification gates"
      ],
      [
        "PR drafter",
        "manifest/helm fixes validated with dry-run against the target version"
      ],
      [
        "Gate monitor",
        "read-only health queries between stages"
      ]
    ],
    "flow": [
      "The scan inventories what actually runs: APIs in use, CRDs, add-on versions, skew state.",
      "The diff names every removed API and incompatible add-on with the workload it affects.",
      "A sequenced plan is produced: pre-flight PRs, canary node pool, gates, rollback points.",
      "Pre-flight fixes land as reviewed PRs validated with dry-runs against the target version.",
      "During execution, the monitor verifies each gate read-only before the human proceeds."
    ],
    "platforms": [
      [
        "Kubernetes AI tooling (CNCF)",
        "K8sGPT · HolmesGPT · kagent · kubectl-ai",
        "open-source analyzers and agents to build on instead of starting from scratch"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kubernetes APIs",
        "read-only inventory, dry-run validation"
      ],
      [
        "Helm / Argo CD / Flux",
        "manifest sources and add-on versions"
      ],
      [
        "kubent / pluto / popeye",
        "existing deprecation scanners to build on"
      ],
      [
        "EKS / GKE / AKS APIs",
        "control-plane versions and node-pool operations"
      ],
      [
        "GitHub",
        "pre-flight fix PRs"
      ]
    ],
    "context": [
      "live API usage and CRDs",
      "add-on and operator versions",
      "node pools and skew state",
      "PDBs and critical workloads",
      "etcd backup status",
      "target-version deprecation data"
    ],
    "tools": [
      "Read tier: k8s APIs, helm/Argo state, cloud version APIs",
      "Write tier: PR creation; dry-run apply only with explicit approval"
    ],
    "benefits": [
      "Upgrades become planned projects with evidence, not heroic weekend work.",
      "No more removed-API surprises: every break is found and fixed pre-flight.",
      "Canary-first execution with explicit gates and an honest rollback story.",
      "Fleet consistency: the same plan template across dozens of clusters."
    ],
    "security": [
      "Inventory data can be sensitive (names, images, env): keep raw dumps inside your model boundary or redact.",
      "The assistant never mutates the cluster; dry-run apply is the ceiling without explicit, logged approval.",
      "etcd backup verification is part of the plan — an upgrade without a fresh backup does not start."
    ],
    "future": [
      "Continuous upgrade-readiness score per cluster, surfaced in the platform.",
      "Automated pre-flight PR merging via GitOps once trust accumulates.",
      "Node OS/image upgrades folded into the same gated flow."
    ],
    "related": [
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      },
      {
        "num": 16,
        "name": "AI Helm Chart Analyzer",
        "slug": "ai-helm-chart-analyzer"
      },
      {
        "num": 17,
        "name": "AI Kubernetes Incident Investigator",
        "slug": "ai-kubernetes-incident-investigator"
      },
      {
        "num": 47,
        "name": "AI Internal Developer Platform Assistant",
        "slug": "ai-internal-developer-platform-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Cluster inventory (read-only)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Target-version diff: APIs · add-ons                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Sequenced plan with gates + rollback               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Pre-flight fix PRs (dry-run validated)             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Stage ride-along + gate verification               │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"cluster\": \"prod-eu-01\",\n  \"current_version\": \"1.28.9\",\n  \"target_version\": \"1.31.2\",\n  \"removed_apis_in_use\": [\n    {\"api\": \"flowcontrol.apiserver.k8s.io/v1beta2 FlowSchema\", \"count\": 3, \"workloads\": [\"gateway-ctrl\"], \"fixed_by\": \"PR-7712\"}\n  ],\n  \"addon_compat\": [\n    {\"addon\": \"cilium\", \"installed\": \"1.13.4\", \"required_min\": \"1.14.5\", \"action\": \"upgrade first\"}\n  ],\n  \"plan_stages\": [\n    {\"stage\": 1, \"action\": \"merge PR-7712 pre-flight fixes\", \"gate\": \"dry-run apply clean\"},\n    {\"stage\": 2, \"action\": \"canary node pool on 1.31\", \"gate\": \"PDB-respecting drains healthy\"}\n  ],\n  \"rollback\": {\"etcd_backup\": \"2026-10-12T02:00Z ok\", \"irreversible_after\": \"stage 4 (kubelet min-version bump)\"}\n}"
  },
  {
    "num": 55,
    "slug": "ai-drift-detective",
    "name": "AI Drift Detective",
    "area": "IaC",
    "tldr": "Explain infrastructure drift: what changed, who changed it, whether it matters, and the safest path back to declared state — as a reviewed PR.",
    "complexity": "Medium",
    "automation": "Supervised automation",
    "problem_intro": "Drift is the quiet gap between what Terraform/GitOps declares and what actually runs — created by console clicks, hotfixes, and half-finished changes, and usually discovered during the next apply.",
    "problem": [
      "A `terraform plan` shows drift as a diff; it never explains who made the change, when, or whether it was deliberate.",
      "Blind reconciliation is dangerous: reverting a deliberate hotfix reintroduces the incident it fixed.",
      "Drift accumulates silently across hundreds of resources; nobody knows which drift is load-bearing.",
      "GitOps users see 'OutOfSync' constantly and click refresh without investigating why."
    ],
    "impact": "Unexamined drift makes every future apply a gamble — the next `terraform apply` or `argocd sync` executes decisions nobody made consciously.",
    "capabilities": [
      [
        "Drift explanation",
        "reads the live-vs-declared diff and explains each change in resource terms"
      ],
      [
        "Attribution",
        "correlates with cloud audit logs, deploy history, and tickets to find who and why"
      ],
      [
        "Intent classification",
        "labels drift: deliberate hotfix, manual experiment, automation artifact, or accident"
      ],
      [
        "Safe reconciliation",
        "proposes the path back — absorb into IaC (PR), revert via pipeline, or documented waiver; never raw console edits"
      ],
      [
        "Drift analytics",
        "trends per team and platform: which resources drift, which controls fail"
      ]
    ],
    "solution": "A scheduled and webhook-triggered detector that runs plan/diff across your IaC and GitOps apps, triages every difference with attribution from cloud audit logs and CI history, and files a classified report — each item resolved by a reviewed PR: absorb (update code to match reality), revert (pipeline-applied), or waive (documented exception with expiry). It works as the investigation layer under existing drift alerts, not a replacement for them.",
    "steps": [
      [
        "Detect",
        "scheduled terraform plan / argocd diff across managed scopes"
      ],
      [
        "Attribute",
        "correlate each change with audit logs, deploys, and tickets"
      ],
      [
        "Classify",
        "LLM explains and labels intent per change, with evidence"
      ],
      [
        "Propose",
        "absorb PR / revert PR / waiver, with the reasoning attached"
      ],
      [
        "Track",
        "waivers expire; drift trends feed platform reviews"
      ]
    ],
    "hitl": "Every reconciliation path is a reviewed PR or pipeline run — the detective investigates and drafts, humans decide absorb vs. revert vs. waive.",
    "components": [
      [
        "Diff collector",
        "terraform plan JSON, Argo CD / Flux diff APIs"
      ],
      [
        "Attribution engine",
        "CloudTrail / Azure Activity / GCP Audit Logs, CI and sync history, tickets"
      ],
      [
        "Triage engine",
        "LLM classification with strict output schema and evidence citations"
      ],
      [
        "Reconciliation drafter",
        "absorb/revert PRs via normal GitOps flow; waiver records with expiry"
      ]
    ],
    "flow": [
      "On schedule or webhook, diffs are collected across the managed estate.",
      "Each difference is attributed: audit trail, deploy, or unknown actor.",
      "The triage engine labels intent and drafts the matching reconciliation PR.",
      "Owners choose absorb, revert, or waive; waivers carry expiries that re-open the question."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Terraform / OpenTofu",
        "plan JSON as the drift source"
      ],
      [
        "Argo CD / Flux",
        "OutOfSync diffs and sync history"
      ],
      [
        "CloudTrail / Azure Activity / GCP Audit",
        "attribution of live changes"
      ],
      [
        "GitHub / GitLab",
        "reconciliation PRs"
      ],
      [
        "Slack",
        "drift digest per platform team"
      ]
    ],
    "context": [
      "declared state (IaC + GitOps)",
      "live resource state and diffs",
      "cloud audit logs",
      "deploy and sync history",
      "past drift decisions and waivers"
    ],
    "tools": [
      "Read tier: plan/diff generation, audit-log queries, deploy history",
      "Write tier: PR creation only — reconciliation executes through normal pipelines"
    ],
    "benefits": [
      "Every diff comes with a who, why, and recommendation — applies become boring again.",
      "Deliberate hotfixes get absorbed instead of clobbered by the next apply.",
      "Drift stops accumulating: waivers expire, trends get fixed at the root.",
      "Works with existing GitOps tooling instead of replacing it."
    ],
    "security": [
      "Audit-log queries and diffs are read-only; the write path is exactly the PR pipeline everyone already reviews.",
      "Diffs can embed tags, AMIs, and network detail: route raw state through self-hosted models if your boundary requires it.",
      "Attribution data is access-controlled: the detective sees audit logs, so its own access is logged too."
    ],
    "future": [
      "Auto-absorb for trusted categories (tags, autoscaling artifacts) with owner notification.",
      "Drift prevention: config rules that make the common console-click impossible.",
      "Multi-cloud drift correlation for shared platform resources."
    ],
    "related": [
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      },
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 21,
        "name": "AI Terraform Plan Explainer",
        "slug": "ai-terraform-plan-explainer"
      },
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Plan/diff across IaC + GitOps                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← scheduled\n┌────────────────────────────────────────────────────┐\n│ Attribution: audit logs · deploys                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← who & why\n┌────────────────────────────────────────────────────┐\n│ Intent classification with evidence                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Absorb PR · revert PR · waiver                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← human decision\n┌────────────────────────────────────────────────────┐\n│ Waiver expiry + drift trends                       │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"scope\": \"aws:prod-network\",\n  \"drifted_resources\": 5,\n  \"findings\": [\n    {\n      \"resource\": \"aws_security_group.sg-alpha\",\n      \"diff\": \"ingress rule 0.0.0.0/0:443 added\",\n      \"attribution\": {\"actor\": \"jane@corp\", \"source\": \"CloudTrail evt-9f21\", \"when\": \"2026-10-09T14:22Z\", \"ticket\": \"INC-8312 hotfix\"},\n      \"classification\": \"deliberate_hotfix\",\n      \"recommendation\": \"absorb\",\n      \"proposal\": \"PR-441 (adds the rule to TF with comment)\"\n    }\n  ],\n  \"trend\": {\"drift_events_30d\": 14, \"top_offender\": \"aws_security_group\", \"waivers_open\": 2}\n}"
  },
  {
    "num": 56,
    "slug": "ai-backup-dr-reviewer",
    "name": "AI Backup & DR Readiness Reviewer",
    "area": "Cloud",
    "tldr": "Audit whether you can actually recover: backup coverage vs. RTO/RPO, expired retention, untested restores, and DR drills that run on schedule.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Backups are the control everyone believes in and nobody tests: coverage gaps, silent failures, and restore procedures that have never run against real data.",
    "problem": [
      "Snapshot schedules exist; whether they cover every critical datastore (and their cross-region copies) is tribal knowledge.",
      "Retention and expiry misconfigurations surface only when a restore is needed and the snapshot is gone.",
      "RTO/RPO claims in the DR doc are never compared to what the backup config actually delivers.",
      "Restore tests happen annually (or never), so breakage in the restore path accumulates invisibly."
    ],
    "impact": "The first full restore test should not happen during an outage; readiness verified monthly is worth infinitely more than a DR binder.",
    "capabilities": [
      [
        "Coverage mapping",
        "inventories datastores vs. backup policies and names what is unprotected, cross-region gaps included"
      ],
      [
        "RTO/RPO reconciliation",
        "compares documented targets with snapshot frequency, retention, and replication reality"
      ],
      [
        "Restore verification planning",
        "generates and schedules restore tests into scratch environments with integrity checks"
      ],
      [
        "Config drift review",
        "flags retention changes, disabled policies, and expired keys in the backup chain"
      ],
      [
        "Runbook generation",
        "produces per-datastore restore runbooks consistent with idea 51's format"
      ]
    ],
    "solution": "A scheduled reviewer that reads backup configurations across cloud providers (AWS Backup, Azure Recovery Services, GCP Backup and DR, plus in-cluster options like Velero), reconciles them against a criticality register (from the service catalog), and produces a readiness report: coverage, RPO gaps, retention risks, and scheduled restore drills with generated runbooks. Findings file issues; drills run in sandboxed scratch accounts.",
    "steps": [
      [
        "Inventory",
        "enumerate datastores and their backup/replication configs across providers"
      ],
      [
        "Reconcile",
        "map against the criticality register and documented RTO/RPO"
      ],
      [
        "Report",
        "coverage gaps, retention risks, expired credentials, cross-region shortfalls"
      ],
      [
        "Drill",
        "schedule restore tests into scratch environments; verify integrity and time-to-restore"
      ],
      [
        "Close",
        "file issues per gap; refresh DR runbooks to match what was proven"
      ]
    ],
    "hitl": "Read-only auditing and report drafting; restore drills run only in scratch environments with explicit enablement per team.",
    "components": [
      [
        "Inventory collector",
        "backup policies, snapshots, replication across clouds and Velero"
      ],
      [
        "Reconciliation engine",
        "criticality register vs. actual config; RPO math"
      ],
      [
        "Drill orchestrator",
        "scratch-env restore tests with integrity and timing checks"
      ],
      [
        "Reporter",
        "readiness scorecard, issues, and runbook PRs"
      ]
    ],
    "flow": [
      "The collector inventories what is backed up, where, how often, and retained how long.",
      "The reconciler names every gap between documented recovery targets and actual configuration.",
      "Restore drills run on schedule in scratch environments, measuring real time-to-restore.",
      "Gaps become issues; proven procedures become runbooks; trends show readiness over time."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "AWS Backup / Azure Recovery Services / GCP Backup and DR",
        "policy and job APIs"
      ],
      [
        "Velero / volume snapshots",
        "in-cluster backup state"
      ],
      [
        "Service catalog / CMDB",
        "criticality register and ownership"
      ],
      [
        "RDS / Azure SQL / Cloud SQL",
        "engine-native backup configs"
      ],
      [
        "Issue tracker & wiki",
        "findings and runbook publication"
      ]
    ],
    "context": [
      "backup policies and schedules",
      "snapshot inventory and retention",
      "cross-region replication state",
      "criticality register and RTO/RPO docs",
      "past drill results"
    ],
    "tools": [
      "Read-only: cloud backup APIs, snapshot listings, catalog data",
      "Write tier: scratch-env provisioning and issue filing, per-team enablement"
    ],
    "benefits": [
      "A truthful answer to 'can we recover?', with evidence instead of confidence.",
      "Coverage and retention gaps found by schedule, not by disaster.",
      "Restore-path regressions caught monthly in scratch, not annually in crisis.",
      "DR docs converge on procedures that were actually executed."
    ],
    "security": [
      "Restore drills touch copies of production data: isolated scratch accounts, encryption at rest, teardown on completion; redact before any model sees drill output.",
      "The reviewer is read-only on production by design; it never mutates backup policies.",
      "Backup systems are exfiltration paths in the wrong hands: drill credentials are scoped and short-lived."
    ],
    "future": [
      "Failure injection into the DR path (expired keys, corrupt replicas) with the chaos designer (idea 58).",
      "Ransomware-readiness checks: immutable vault coverage and restore-from-locked-copy tests.",
      "Automated quarterly attestation reports for auditors."
    ],
    "related": [
      {
        "num": 28,
        "name": "AI Cloud Architecture Advisor",
        "slug": "ai-cloud-architecture-advisor"
      },
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      },
      {
        "num": 51,
        "name": "AI Runbook Generator",
        "slug": "ai-runbook-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Datastore & backup config inventory                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Reconcile vs. criticality + RTO/RPO                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Readiness report + filed issues                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Scheduled restore drills (scratch)                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← sandboxed\n┌────────────────────────────────────────────────────┐\n│ Proven runbooks + trend tracking                   │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"scan_date\": \"2026-10-12\",\n  \"coverage\": {\n    \"datastores\": 47,\n    \"protected\": 41,\n    \"unprotected\": [{\"store\": \"prod-eu redis-cache\", \"reason\": \"no policy attached\", \"criticality\": \"medium\"}]\n  },\n  \"rpo_gaps\": [\n    {\"store\": \"orders-db\", \"doc_rpo\": \"15m\", \"actual_rpo\": \"24h\", \"gap\": \"daily snapshots; PITR not enabled\"}\n  ],\n  \"drill\": {\"last\": \"2026-09-30\", \"store\": \"orders-db\", \"result\": \"pass\", \"time_to_restore\": \"38m vs RTO 60m\"},\n  \"score\": {\"readiness\": \"amber\", \"open_issues\": 6}\n}"
  },
  {
    "num": 57,
    "slug": "ai-slo-error-budget-assistant",
    "name": "AI SLO & Error Budget Assistant",
    "area": "Observability & SRE",
    "tldr": "Turn 'we should have SLOs' into maintained ones: drafted from real traffic, backtested against history, with burn-rate alerts that don't cry wolf.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "SLOs fail in practice for boring reasons: they're guessed instead of measured, never maintained, and their alerts fire too often or too late to be useful.",
    "problem": [
      "Teams don't know which user journeys matter, so they either SLO everything or nothing.",
      "Hand-written burn-rate alerts use bad windows and thresholds — they spam pages or never fire.",
      "SLOs drift from reality: the SLI measures the wrong endpoint after a refactor, and nobody notices.",
      "Error budgets exist on paper but don't drive decisions because the numbers are stale."
    ],
    "impact": "Without working SLOs, every incident is judged by vibes — and reliability work competes with features on unequal, anecdotal footing.",
    "capabilities": [
      [
        "SLI discovery",
        "mines traffic data to find the real user journeys and their volumes"
      ],
      [
        "SLO drafting",
        "proposes targets grounded in measured historical performance, not round numbers"
      ],
      [
        "Burn-rate implementation",
        "generates multiwindow burn-rate alerts validated against historical data to tune sensitivity"
      ],
      [
        "Backtesting",
        "replays proposed alerts over past incidents and quiet periods: would it page? how often? how early?"
      ],
      [
        "Drift maintenance",
        "watches SLI definitions vs. actual endpoints and dashboards, opening update PRs when they diverge"
      ]
    ],
    "solution": "An SLO copilot integrated with Prometheus/Grafana (or your vendor's SLO tooling): it drafts SLIs/SLOs from real traffic and history, generates sloth-compatible recording rules and multiwindow burn-rate alerts, backtests them against the last 90 days, and keeps definitions in Git with PR review. Maintenance is continuous: when endpoints and dashboards change, it opens update PRs before the SLO rots.",
    "steps": [
      [
        "Discover",
        "analyze traffic and dashboards to propose SLIs for real user journeys"
      ],
      [
        "Draft",
        "SLO targets grounded in measured history; write definitions to a Git repo"
      ],
      [
        "Backtest",
        "simulate burn-rate alerts over past incidents and quiet periods"
      ],
      [
        "Ship",
        "PR with recording rules, alerts, and dashboard panels; owner review"
      ],
      [
        "Maintain",
        "watch SLI health and drift; weekly budget reports with decision guidance"
      ]
    ],
    "hitl": "Targets and paging implications are always owner-approved via PR; the copilot backtests and drafts, humans decide what wakes people up.",
    "components": [
      [
        "Traffic analyzer",
        "metric/label and endpoint discovery from Prometheus or vendor APIs"
      ],
      [
        "SLO composer",
        "definitions, recording rules, sloth-style alerts"
      ],
      [
        "Backtester",
        "replays rules against history; reports page counts and detection lag"
      ],
      [
        "Drift watcher",
        "SLI validity checks on deploys; update PRs"
      ]
    ],
    "flow": [
      "Discovery proposes SLIs from what users actually hit, with volumes as evidence.",
      "Drafts set targets from measured performance (p50/p95/p99 history), not aspiration.",
      "Backtesting shows exactly when each alert would have fired across past incidents.",
      "Everything ships as reviewed Git definitions; drift watching keeps them true."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Prometheus / Thanos / Mimir",
        "SLI queries and history"
      ],
      [
        "Grafana",
        "SLO dashboards and annotations"
      ],
      [
        "Sloth / Pyrra",
        "rule generation to build on"
      ],
      [
        "PagerDuty / Opsgenie",
        "burn-rate routing"
      ],
      [
        "GitHub",
        "SLOs as reviewed code"
      ]
    ],
    "context": [
      "traffic volumes and golden signals",
      "historical latency/error data",
      "service topology and dependencies",
      "existing dashboards and alert rules",
      "past incident timelines"
    ],
    "tools": [
      "Read-only: Prometheus queries, dashboard metadata, incident history",
      "Write tier: PR creation for SLO definitions, rules, and dashboards"
    ],
    "benefits": [
      "SLOs grounded in measured reality, covering the journeys that matter.",
      "Burn-rate alerts tuned by backtesting — pages that fire when needed, not twice a week.",
      "SLOs maintained like code: drift-prone definitions get update PRs.",
      "Error budgets that actually arbitrate release decisions."
    ],
    "security": [
      "SLI data is aggregated, but endpoint paths can leak route and feature names: apply the same export rules as other telemetry.",
      "Paging changes are sensitive: alert-routing PRs require explicit owner sign-off."
    ],
    "future": [
      "SLO-to-chaos integration: prioritize experiments where budget-burn risk is highest.",
      "Cross-service SLO composition for journeys spanning multiple teams.",
      "Release-gate integration: budget state warns or blocks in the deploy pipeline."
    ],
    "related": [
      {
        "num": 33,
        "name": "AI Prometheus Query Generator",
        "slug": "ai-prometheus-query-generator"
      },
      {
        "num": 34,
        "name": "AI Grafana Dashboard Assistant",
        "slug": "ai-grafana-dashboard-assistant"
      },
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 35,
        "name": "AI Anomaly Investigation Agent",
        "slug": "ai-anomaly-investigation-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Traffic + dashboard discovery                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ SLI/SLO drafting (Git, PR review)                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Burn-rate backtest over 90 days                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← tune before paging\n┌────────────────────────────────────────────────────┐\n│ Recording rules + alerts + panels                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Drift watch + weekly budget report                 │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"service\": \"checkout-api\",\n  \"proposed_slos\": [\n    {\"sli\": \"availability\", \"definition\": \"success_rate(checkout, code<500) >= 99.9 in 5m windows\", \"target\": 99.9, \"basis\": \"measured 30d\"},\n    {\"sli\": \"latency\", \"definition\": \"90% of requests < 800ms (histogram_quantile)\", \"target\": 90, \"basis\": \"p90=612ms over 90d\"}\n  ],\n  \"backtest\": {\"window_days\": 90, \"alerts_would_have_fired\": 3, \"matching_incidents\": 3, \"false_pages\": 0, \"median_detection_min\": 7},\n  \"budget_report\": {\"window\": \"28d\", \"consumed\": \"62%\", \"guidance\": \"freeze risky releases until burn < 1x\"}\n}"
  },
  {
    "num": 58,
    "slug": "ai-chaos-experiment-designer",
    "name": "AI Chaos Experiment Designer",
    "area": "Observability & SRE",
    "tldr": "Design safe chaos experiments from your real topology and SLOs: blast-radius prediction, steady-state hypotheses, abort conditions, and honest readouts.",
    "complexity": "High",
    "automation": "Supervised automation",
    "problem_intro": "Chaos engineering works when experiments are carefully designed and fails loudly when they're not — the hard part is knowing what is safe to break, where, and what to watch.",
    "problem": [
      "Designing an experiment requires topology knowledge, dependency understanding, and steady-state metrics — usually all in one person's head.",
      "Blast radius is guessed: the network partition aimed at staging takes out the shared auth service.",
      "Abort conditions are vague ('if it looks bad'), so experiments overshoot into real incidents.",
      "Results are anecdotes: without a hypothesis and measurement plan, chaos theater teaches nothing."
    ],
    "impact": "Well-designed experiments find real weaknesses before users do; poorly designed ones create the incidents they were meant to prevent.",
    "capabilities": [
      [
        "Topology-aware design",
        "uses service topology and dependency data (idea 49) to pick targets where failure is survivable"
      ],
      [
        "Steady-state hypothesis",
        "derives measurable assumptions from the service's SLOs (idea 57) rather than vibes"
      ],
      [
        "Blast-radius prediction",
        "estimates what shares the blast zone: same node, AZ, dependency, queue"
      ],
      [
        "Guarded execution plans",
        "generates platform manifests (Chaos Mesh/Litmus/Gremlin) with explicit abort conditions and auto-rollback"
      ],
      [
        "Result readout",
        "compares observed vs. hypothesis, files findings as issues, drafts the fix"
      ]
    ],
    "solution": "A designer that composes experiments from your live topology, SLO definitions, and past incidents: for a target service it proposes experiment types (latency injection, pod kill, AZ loss, dependency failure), predicts blast radius from scheduling and dependency data, writes the hypothesis and abort criteria as code, and executes only through your chaos platform with human approval. Post-experiment, it produces an honest readout: what broke, what didn't, what to fix.",
    "steps": [
      [
        "Select",
        "rank candidate targets by SLO criticality × incident history × never-tested"
      ],
      [
        "Design",
        "experiment type, magnitude, duration; steady-state hypothesis from SLOs"
      ],
      [
        "Predict",
        "blast radius from topology and scheduling; derive abort conditions"
      ],
      [
        "Approve",
        "human review of the manifest; staged execution via the chaos platform"
      ],
      [
        "Read out",
        "observed vs. hypothesis; findings become issues and runbook updates"
      ]
    ],
    "hitl": "Every experiment requires explicit approval with the blast-radius prediction attached; execution is platform-mediated with automatic aborts — the AI never fires experiments on its own.",
    "components": [
      [
        "Target ranker",
        "candidates from catalog criticality, incident history, and test coverage"
      ],
      [
        "Experiment composer",
        "platform-specific manifests (Chaos Mesh, Litmus, Gremlin)"
      ],
      [
        "Blast-radius estimator",
        "topology and scheduling analysis, dependency walk"
      ],
      [
        "Readout analyzer",
        "metrics comparison, findings drafting, issue filing"
      ]
    ],
    "flow": [
      "The ranker proposes where an experiment teaches the most and risks the least.",
      "The composer writes the experiment with a measurable hypothesis and abort criteria.",
      "The estimator attaches a blast-radius prediction and required approvals.",
      "The platform executes with auto-abort armed; the readout turns results into fixes."
    ],
    "platforms": [
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "Agent frameworks",
        "LangGraph · OpenAI Agents SDK · Microsoft Agent Framework · Google ADK · PydanticAI · CrewAI",
        "orchestration: tool calling, retries, structured outputs, human-approval interrupts"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Chaos Mesh / LitmusChaos / Gremlin / AWS FIS",
        "execution platforms"
      ],
      [
        "Service catalog & topology",
        "target selection and dependency maps"
      ],
      [
        "Prometheus / Grafana",
        "steady-state metrics and abort signals"
      ],
      [
        "SLO definitions (idea 57)",
        "hypothesis and success criteria"
      ],
      [
        "GitHub",
        "experiment manifests as reviewed code"
      ]
    ],
    "context": [
      "service topology and dependencies",
      "SLOs and steady-state metrics",
      "past incidents and postmortems",
      "past experiments and outcomes",
      "scheduling, AZ, and node distribution"
    ],
    "tools": [
      "Read tier: topology, metrics, incident history",
      "Write tier: chaos platform API gated behind explicit per-experiment approval with abort armed"
    ],
    "benefits": [
      "Experiments grounded in topology and SLOs instead of curiosity.",
      "Blast-radius predictions and hard aborts make game days boring.",
      "A portfolio view: which failure modes were tested, when, with what result.",
      "Findings flow into issues and runbooks, not Slack threads that evaporate."
    ],
    "security": [
      "Chaos platform credentials are scoped and the designer cannot widen them; production experiments need named-approver sign-off.",
      "Freeze windows (peak season, ongoing incidents) are hard gates in the pipeline, not prompt suggestions.",
      "Experiment manifests are treated like production changes: versioned, reviewed, auditable."
    ],
    "future": [
      "Continuous verification: auto-rerun experiments after major topology changes.",
      "Game-day copilot: facilitate live exercises with real-time hypothesis tracking.",
      "Failure-mode fuzzing: mutate experiment parameters within approved bounds."
    ],
    "related": [
      {
        "num": 57,
        "name": "AI SLO & Error Budget Assistant",
        "slug": "ai-slo-error-budget-assistant"
      },
      {
        "num": 35,
        "name": "AI Anomaly Investigation Agent",
        "slug": "ai-anomaly-investigation-agent"
      },
      {
        "num": 32,
        "name": "AI Root Cause Analysis Assistant",
        "slug": "ai-root-cause-analysis-assistant"
      },
      {
        "num": 19,
        "name": "AI Cluster Operations Agent",
        "slug": "ai-cluster-operations-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Topology + SLO + incident mining                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Experiment design + hypothesis                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Blast-radius prediction + aborts                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← hard limits\n┌────────────────────────────────────────────────────┐\n│ Human approval → platform execution                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← auto-abort armed\n┌────────────────────────────────────────────────────┐\n│ Honest readout → findings + fixes                  │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"experiment_id\": \"chaos-2026-10-14-checkout-az\",\n  \"target\": {\"service\": \"checkout-api\", \"method\": \"zone-loss\", \"magnitude\": \"lose AZ eu-west-1c for 5m\"},\n  \"hypothesis\": {\"steady_state\": \"checkout availability stays above SLO during the loss\", \"derived_from\": \"SLOs (idea 57) + topology\"},\n  \"blast_radius\": {\"direct\": [\"checkout-api (12 pods in AZ c)\"], \"shared\": [\"session-store is replicated\"], \"risk\": \"low\"},\n  \"aborts\": [{\"condition\": \"availability < 99.0 for 2m\", \"action\": \"auto-rollback\"}],\n  \"approval\": {\"required\": \"@sre-oncall + service owner\", \"status\": \"pending\"},\n  \"readout\": null\n}"
  },
  {
    "num": 59,
    "slug": "ai-vulnerability-triage-assistant",
    "name": "AI Vulnerability Triage Assistant",
    "area": "DevSecOps",
    "tldr": "Turn a 4,000-finding backlog into a work queue: dedupe across scanners, check reachability, and prioritize by real exploitability — not CVSS alone.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Security scanners are cheap to run and expensive to read: thousands of findings, overlapping tools, false positives, and a CVSS score that ignores whether the vulnerable code path is even reachable.",
    "problem": [
      "Three scanners produce three overlapping lists with different IDs for the same CVE.",
      "CVSS severity says nothing about reachability: a vulnerable library no code path touches is noise that still pages someone.",
      "Backlogs are triaged by age or spreadsheet, so real risks wait behind paper cuts.",
      "Engineers don't trust the queue, so they bulk-dismiss — including the findings that matter."
    ],
    "impact": "Untriaged backlogs hide the one exploitable finding among thousands; meanwhile teams waste sprints patching unreachable libraries to satisfy a dashboard.",
    "capabilities": [
      [
        "Cross-scanner dedupe",
        "normalizes findings from Trivy/Snyk/Grype/etc. into one canonical list"
      ],
      [
        "Reachability analysis",
        "checks whether the vulnerable symbol or path is actually used (call graphs, SCA evidence)"
      ],
      [
        "Contextual prioritization",
        "combines exploit intelligence (KEV/EPSS), exposure, and criticality with technical severity"
      ],
      [
        "Remediation drafting",
        "maps each finding to the smallest safe fix — version bump, patch, or mitigating control — with a PR where possible"
      ],
      [
        "Dismissal quality control",
        "reviews bulk dismissals and flags risky patterns; requires evidence per dismissal"
      ]
    ],
    "solution": "A triage layer between your scanners and your issue tracker: it ingests raw findings from every scanner in CI, dedupes to canonical vulnerabilities, enriches with reachability (via code indexing) and threat intelligence (CISA KEV, EPSS), and outputs a ranked queue with per-finding rationale and a drafted remediation PR. Dismissals require structured evidence; the assistant audits them continuously.",
    "steps": [
      [
        "Ingest",
        "findings from all scanners in the pipeline, normalized to one schema"
      ],
      [
        "Dedupe",
        "canonicalize across tools: same CVE/package/path = one finding"
      ],
      [
        "Enrich",
        "reachability from the code index; KEV/EPSS/exploit intel; exposure context"
      ],
      [
        "Rank",
        "priority queue with transparent rationale per finding"
      ],
      [
        "Act",
        "remediation PRs for fixes; structured dismissals with evidence, audited"
      ]
    ],
    "hitl": "Every dismissal requires human evidence entry and is re-audited; patch PRs are reviewed like any other code. The assistant ranks and drafts — security owns the decisions.",
    "components": [
      [
        "Finding ingester",
        "scanner report parsers (SARIF, SPDX, CycloneDX, native formats)"
      ],
      [
        "Deduplication engine",
        "CVE/package/path canonicalization"
      ],
      [
        "Reachability indexer",
        "call-graph and import analysis per repository"
      ],
      [
        "Prioritization engine",
        "KEV/EPSS/exposure/criticality scoring with LLM-written rationales"
      ],
      [
        "Remediation drafter",
        "version-bump/patch PRs with compatibility notes"
      ]
    ],
    "flow": [
      "Each CI run posts scanner output to the triage service.",
      "Findings collapse into canonical vulnerabilities with full provenance.",
      "Enrichment answers: reachable? exploited in the wild? internet-facing? business-critical?",
      "The ranked queue drives work; fixes ship as PRs, dismissals leave evidence."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Trivy / Grype / Snyk / Dependabot / Semgrep",
        "scanner ingestion"
      ],
      [
        "GitHub Security Advisories / OSV",
        "vulnerability intelligence"
      ],
      [
        "CISA KEV / EPSS",
        "exploitation signals"
      ],
      [
        "GitHub / GitLab",
        "PRs and security tabs"
      ],
      [
        "Jira / Linear",
        "work-queue sync"
      ]
    ],
    "context": [
      "normalized scanner findings",
      "code index for reachability",
      "package/SBOM data",
      "exploit intelligence feeds",
      "service exposure and criticality"
    ],
    "tools": [
      "Read tier: scanner reports, OSV/KEV/EPSS APIs, code index",
      "Write tier: PR creation, issue filing, dismissal records (audit-logged)"
    ],
    "benefits": [
      "One queue instead of three dashboards; the same CVE counted once.",
      "Patching effort aimed at exploitable, exposed, critical findings first.",
      "Dismissals with evidence survive audits — and the assistant catches lazy ones.",
      "Measurable backlog trend: mean-time-to-triage and time-to-fix."
    ],
    "security": [
      "The triage service holds security-sensitive data (vulns + code maps): keep it inside your boundary; open-weight models for raw analysis.",
      "Dismissal records are immutable and auditable — the assistant's recommendations are logged alongside human decisions.",
      "Scanner metadata and reports are untrusted input: prompt-injection defenses apply."
    ],
    "future": [
      "Auto-merge trusted patch PRs (patch-level bumps in non-critical services) once trust metrics allow.",
      "Attack-path modeling: combine findings into multi-step exploit chains.",
      "Regression gate: block new KEV-listed, reachable findings at merge time."
    ],
    "related": [
      {
        "num": 37,
        "name": "AI Container Vulnerability Explainer",
        "slug": "ai-container-vulnerability-explainer"
      },
      {
        "num": 42,
        "name": "AI Dependency Risk Analyzer",
        "slug": "ai-dependency-risk-analyzer"
      },
      {
        "num": 41,
        "name": "AI Security Incident Assistant",
        "slug": "ai-security-incident-assistant"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Scanner ingestion (all tools)                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Canonical dedupe across scanners                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Reachability + threat-intel enrichment             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Ranked queue with rationale                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Fix PRs · evidence-gated dismissals                │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"finding_id\": \"VULN-2026-1048\",\n  \"canonical\": {\"cve\": \"CVE-2025-1949\", \"package\": \"io.netty:netty-handler@4.1.108\", \"scanners\": [\"trivy\", \"snyk\", \"grype\"]},\n  \"reachability\": {\"reachable\": true, \"evidence\": \"SslContextBuilder called in tls/ClientTls.java:88\", \"confidence\": \"high\"},\n  \"threat_intel\": {\"kev\": true, \"epss\": 0.91, \"exploit_maturity\": \"weaponized\"},\n  \"exposure\": {\"internet_facing\": true, \"service_criticality\": \"tier-1\"},\n  \"priority\": {\"rank\": 3, \"severity\": \"critical\", \"rationale\": \"KEV-listed, reachable, internet-facing tier-1\"},\n  \"remediation\": {\"fix\": \"bump to 4.1.118\", \"pr\": \"PR-9102\", \"compat_risk\": \"low\"}\n}"
  },
  {
    "num": 60,
    "slug": "ai-platform-guardrail-generator",
    "name": "AI Platform Guardrail Generator",
    "area": "Platform Engineering",
    "tldr": "Turn your golden paths and past violations into policy-as-code: guardrails that explain themselves and propose the compliant alternative when they block you.",
    "complexity": "Medium",
    "automation": "Supervised automation",
    "problem_intro": "Platform teams write policies as wiki pages and Slack messages; enforcement happens (or doesn't) at review time, one human at a time.",
    "problem": [
      "Golden paths (idea 48) document the right way; nothing stops the 200th service from skipping them.",
      "Policies live in reviewers' memories, so enforcement is inconsistent and slow.",
      "When a policy blocks a PR, it rarely says what to do instead — devs treat the platform as an obstacle.",
      "Writing OPA/Kyverno/Sentinel rules for every convention is specialist work that never gets done."
    ],
    "impact": "Guardrails encoded as policy convert platform guidance from documentation into defaults — the safe path becomes the path of least resistance.",
    "capabilities": [
      [
        "Convention mining",
        "reads golden paths, past review comments, and incident causes to find what rules actually matter"
      ],
      [
        "Policy synthesis",
        "generates Kyverno/OPA Gatekeeper/Sentinel/Checkov/CEL rules with tests for each convention"
      ],
      [
        "Compliant-alternative suggestions",
        "on rejection, proposes the exact change that passes — or a mutation that fixes it"
      ],
      [
        "Violation analytics",
        "tracks which rules fire, on whom, and why; retires rules that never matter"
      ],
      [
        "Exception workflow",
        "waivers with owners and expiries instead of ad-hoc 'just this once' approvals"
      ]
    ],
    "solution": "A guardrail pipeline for the internal platform: it mines the platform's conventions (golden-path templates, review history, incident root causes), drafts policy-as-code with tests, and ships it through the platform's own GitOps flow. Enforcement surfaces in CI and admission control with human-readable messages and concrete alternatives — 'blocked' always comes with 'here's the diff that passes'. Waivers are first-class: owned, expiring, and visible in the catalog (idea 49).",
    "steps": [
      [
        "Mine",
        "collect conventions: golden paths, review comments, incident root causes, existing lint rules"
      ],
      [
        "Synthesize",
        "draft policy-as-code + tests per convention, ranked by past incident cost"
      ],
      [
        "Ship",
        "PR through the platform repo; staged rollout as audit → warn → enforce"
      ],
      [
        "Assist",
        "on violation, explain and propose the compliant diff (or mutation)"
      ],
      [
        "Tune",
        "violation analytics: retire noise, tighten what matters, expire waivers"
      ]
    ],
    "hitl": "Policies ship as reviewed PRs with staged rollout (audit-mode first); every enforcement action explains itself; waivers need a named owner and expiry.",
    "components": [
      [
        "Convention miner",
        "golden-path templates, review history, incident RCA mining"
      ],
      [
        "Policy composer",
        "policy-as-code generation with unit tests per rule"
      ],
      [
        "Violation assistant",
        "inline explanations and compliant-diff suggestions in CI"
      ],
      [
        "Rollout & analytics",
        "audit-mode metrics, waiver registry, rule effectiveness"
      ]
    ],
    "flow": [
      "Mining turns implicit platform knowledge into a ranked list of encodable rules.",
      "Each rule ships as tested policy-as-code, starting in audit mode.",
      "Violations arrive with an explanation and a diff that passes — rarely a second violation.",
      "Analytics retire rules that never fire usefully; waivers expire on schedule."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Kyverno / OPA Gatekeeper",
        "admission-control policies"
      ],
      [
        "Sentinel / Checkov / Conftest / CEL",
        "pipeline policy engines"
      ],
      [
        "Backstage / IDP",
        "golden-path templates and waiver visibility"
      ],
      [
        "GitHub / GitLab",
        "policy PRs and CI enforcement"
      ],
      [
        "Slack",
        "violation assist and waiver approvals"
      ]
    ],
    "context": [
      "golden-path templates and docs",
      "PR review comments and rejections",
      "incident root causes",
      "existing policies and their hit rates",
      "service ownership from catalog"
    ],
    "tools": [
      "Read tier: repos, reviews, incidents, catalog",
      "Write tier: policy PRs and waiver records only — enforcement lives in the platform's own engines"
    ],
    "benefits": [
      "Golden paths become defaults instead of documentation.",
      "Every block includes the fix: developers experience the platform as helpful, not hostile.",
      "Policy coverage grows with incident learning, not platform-team free time.",
      "Waivers stop being permanent: owned, expiring, visible."
    ],
    "security": [
      "Policies are security controls: their generation, tests, and rollout are audited; the composer cannot weaken existing policies.",
      "Admission-control changes require platform-owner approval and staged rollout with instant rollback.",
      "Mined text (review comments, incident notes) is untrusted input: prompt-injection defenses apply."
    ],
    "future": [
      "Mutation-first policies: auto-fix instead of block where mutation is safe.",
      "Admission policies generated from live cluster state to stop recurring drift.",
      "Compliance mapping: tie each guardrail to SOC 2/ISO controls for audit evidence."
    ],
    "related": [
      {
        "num": 48,
        "name": "AI Golden Path Generator",
        "slug": "ai-golden-path-generator"
      },
      {
        "num": 47,
        "name": "AI Internal Developer Platform Assistant",
        "slug": "ai-internal-developer-platform-assistant"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      },
      {
        "num": 23,
        "name": "AI IaC Security Analyzer",
        "slug": "ai-iac-security-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Convention mining (paths · reviews · incidents)    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Policy-as-code synthesis + tests                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← Kyverno · OPA · Sentinel\n┌────────────────────────────────────────────────────┐\n│ Staged rollout: audit → warn → enforce             │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Violation assist: explain + fix diff               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Analytics · waiver expiry · rule retirement        │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"rule_id\": \"GR-014\",\n  \"convention\": \"all public services require resource limits + PDB\",\n  \"source\": \"mined from incident INC-8093 (OOM cascade) + golden path v3\",\n  \"policy\": {\"engine\": \"kyverno\", \"file\": \"policies/require-limits-pdb.yaml\", \"tests\": 4},\n  \"rollout\": {\"stage\": \"warn\", \"since\": \"2026-10-01\", \"violations_30d\": 9},\n  \"violation_assist\": {\"example\": \"missing PDB on recommendations-svc\", \"suggested_diff\": \"+ PDB minAvailable 1\", \"mutation\": false},\n  \"waivers\": [{\"service\": \"legacy-search\", \"owner\": \"@search\", \"expires\": \"2026-11-30\"}]\n}"
  },
  {
    "num": 61,
    "slug": "ai-compliance-evidence-collector",
    "name": "AI Compliance Evidence Collector",
    "area": "DevSecOps",
    "tldr": "Continuously collect and map audit evidence from the systems themselves: SOC 2 / ISO 27001 / PCI controls proven by live configuration, not screenshots.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Audit season turns engineers into archaeologists: hunting screenshots, exporting configs, and reconstructing proof of controls that should be demonstrable in minutes.",
    "problem": [
      "Control evidence (access reviews, encryption settings, change management) lives scattered across consoles and spreadsheets.",
      "Evidence is collected annually by hand, so drift between audits goes unnoticed — controls exist on paper, not in practice.",
      "Mapping technical reality to control frameworks requires a translator nobody enjoys being.",
      "Auditors ask for the same artifacts every year and get inconsistent answers from different people."
    ],
    "impact": "Audit prep consumes engineer-weeks per framework per year, and the gap between documented and actual controls is where real risk hides.",
    "capabilities": [
      [
        "Control mapping",
        "translates framework controls (SOC 2, ISO 27001, PCI, CIS) into checkable technical assertions"
      ],
      [
        "Evidence automation",
        "pulls live proof — IAM policies, TLS configs, logging enablement, change records — with timestamps"
      ],
      [
        "Gap detection",
        "finds where the implemented state doesn't satisfy a control, long before the auditor does"
      ],
      [
        "Evidence packaging",
        "produces auditor-ready artifacts per control with provenance and collection date"
      ],
      [
        "Continuous posture",
        "re-checks on schedule so compliance reflects today, not last quarter"
      ]
    ],
    "solution": "An evidence pipeline that ingests your control framework, decomposes each control into technical checks across cloud, identity, CI/CD, and code systems, collects proof on schedule via read-only APIs, and maps results to a live compliance posture. Gaps file issues; passing evidence is packaged with provenance for auditors. Works alongside GRC tools rather than replacing them.",
    "steps": [
      [
        "Map",
        "decompose framework controls into concrete technical checks per system"
      ],
      [
        "Collect",
        "scheduled read-only evidence gathering across cloud, IAM, CI/CD, and repos"
      ],
      [
        "Evaluate",
        "score each control: satisfied, partially satisfied, or failing, with evidence attached"
      ],
      [
        "Report",
        "auditor-ready artifacts with provenance; gap issues routed to owners"
      ],
      [
        "Monitor",
        "continuous re-checks; posture changes alert the compliance owner"
      ]
    ],
    "hitl": "The collector proves and packages; humans (and auditors) judge. Control interpretations are reviewed with compliance before automation is trusted.",
    "components": [
      [
        "Control library",
        "framework-to-check mappings, versioned and reviewable"
      ],
      [
        "Evidence collectors",
        "read-only API integrations per system with provenance capture"
      ],
      [
        "Evaluation engine",
        "code checks + LLM reasoning for controls that need interpretation"
      ],
      [
        "Evidence vault",
        "timestamped artifacts, immutable, access-controlled"
      ]
    ],
    "flow": [
      "Compliance loads the framework and maps controls to systems with the collector.",
      "Scheduled runs gather live evidence instead of end-of-year screenshots.",
      "Each control gets a verdict with the proving artifacts and a collection date.",
      "Gaps become owned issues; auditors receive consistent, provenance-backed exports."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ]
    ],
    "integrations": [
      [
        "AWS / Azure / GCP",
        "config, IAM, and encryption evidence"
      ],
      [
        "GitHub / GitLab",
        "branch protection, review evidence, CODEOWNERS"
      ],
      [
        "Vanta / Drata / LogicGate",
        "GRC platforms to feed, not replace"
      ],
      [
        "Jira / Linear",
        "change-management and gap tracking"
      ],
      [
        "Slack / email",
        "posture digests for compliance owners"
      ]
    ],
    "context": [
      "control framework definitions",
      "cloud and identity configuration",
      "CI/CD and repo settings",
      "change and incident records",
      "past audit artifacts"
    ],
    "tools": [
      "Read-only: cloud config APIs, identity stores, repo settings, ticketing",
      "Write tier: issue filing and evidence-package export only"
    ],
    "benefits": [
      "Audit prep drops from engineer-weeks to a review of already-collected evidence.",
      "Controls verified continuously, not reconstructed annually.",
      "Consistent artifacts every audit cycle, with provenance auditors accept.",
      "The gap between paper compliance and reality becomes visible and fixable."
    ],
    "security": [
      "The collector reads sensitive security configuration: least-privilege read-only roles; evidence stored access-controlled and encrypted.",
      "Evidence packages may contain security-sensitive detail (vulns, network layout): share exports deliberately, redact where the framework allows.",
      "Control interpretations are auditable decisions: record which model, prompt, and human reviewed each mapping."
    ],
    "future": [
      "Auto-remediation of common control gaps via PR (with the guardrail generator, idea 60).",
      "Question-answer copilot for auditor requests during fieldwork.",
      "Cross-framework dedup: one check satisfying PCI and SOC 2 at once."
    ],
    "related": [
      {
        "num": 40,
        "name": "AI Cloud Misconfiguration Analyzer",
        "slug": "ai-cloud-misconfiguration-analyzer"
      },
      {
        "num": 27,
        "name": "AI IAM Policy Reviewer",
        "slug": "ai-iam-policy-reviewer"
      },
      {
        "num": 59,
        "name": "AI Vulnerability Triage Assistant",
        "slug": "ai-vulnerability-triage-assistant"
      },
      {
        "num": 60,
        "name": "AI Platform Guardrail Generator",
        "slug": "ai-platform-guardrail-generator"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Control framework ingestion                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← SOC 2 · ISO · PCI\n┌────────────────────────────────────────────────────┐\n│ Decomposition into technical checks                │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Scheduled evidence collection                      │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← read-only APIs\n┌────────────────────────────────────────────────────┐\n│ Control evaluation + gap issues                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Auditor-ready artifacts + posture                  │\n└────────────────────────────────────────────────────┘",
    "cost": "Scheduled weekly evidence collection across a handful of accounts is small-token work: checks run in code, and the model is consulted only for controls needing interpretation or artifact narration. Mini-class models cover the bulk.",
    "schema": "{\n  \"framework\": \"SOC 2 Trust Services Criteria\",\n  \"control\": \"CC6.1 - Logical access controls\",\n  \"status\": \"satisfied\",\n  \"evidence\": [\n    {\"type\": \"iam_mfa_coverage\", \"source\": \"aws:iam:credential-report\", \"value\": \"187/188 users MFA-enabled\", \"collected\": \"2026-10-12T03:00Z\"},\n    {\"type\": \"access_review\", \"source\": \"jira:ACCESS-2026-Q4\", \"value\": \"quarterly review completed\", \"collected\": \"2026-10-01\"}\n  ],\n  \"gaps\": [],\n  \"last_checked\": \"2026-10-12T03:00Z\"\n}"
  },
  {
    "num": 62,
    "slug": "ai-change-impact-analyzer",
    "name": "AI Change Impact Analyzer",
    "area": "Developer Experience",
    "tldr": "Answer 'what does this change touch?' before merge: blast radius across code, services, infrastructure, and teams — with evidence.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Every change is local in the diff and global in effect: the 'small' config tweak that takes down a checkout flow, the library bump that breaks three services nobody remembered.",
    "problem": [
      "Ownership and dependency knowledge is scattered: CODEOWNERS, service catalogs, dashboards, and tribal memory disagree.",
      "Reviewers evaluate the diff, not the blast radius — downstream consumers are invisible in a PR.",
      "Infrastructure changes look isolated but share blast zones (same cluster, same database, same queue).",
      "Impact analysis happens after the incident, in the postmortem, where it's called root cause."
    ],
    "impact": "Unchecked blast radius is how routine changes become outages — and why 'it worked in staging' is a running joke.",
    "capabilities": [
      [
        "Dependency traversal",
        "walks code imports, service calls, shared infra, and data flows to find what a change reaches"
      ],
      [
        "Cross-stack impact",
        "connects app-level changes to infra-level consequences (schema, config, queues, envs)"
      ],
      [
        "Ownership resolution",
        "names the teams and services affected, using the catalog and CODEOWNERS"
      ],
      [
        "Risk summary",
        "ranks impact by criticality and past-incident similarity; suggests extra review or staging"
      ],
      [
        "Reviewer routing",
        "proposes the right reviewers and checks for the true blast radius"
      ]
    ],
    "solution": "A PR-time analyzer that builds a change's blast radius from the union of code dependency graphs, service topology (idea 63), infrastructure relationships, and data schemas — then translates it into a human summary: what's affected, who owns it, what to test, and what to watch after deploy. Posted as a PR comment and a release-checklist section, feeding the deploy risk score (idea 08).",
    "steps": [
      [
        "Diff",
        "parse the PR: code, config, IaC, schemas, dependencies"
      ],
      [
        "Traverse",
        "expand impact through code graph, service topology, and shared infrastructure"
      ],
      [
        "Resolve",
        "map affected surfaces to owners, criticality, and environments"
      ],
      [
        "Summarize",
        "blast-radius report: affected services, teams, tests, and watch items"
      ],
      [
        "Route",
        "suggest reviewers and checks; feed the deploy risk score (idea 08)"
      ]
    ],
    "hitl": "Advisory by design: the analyzer informs reviewers and release captains; it never blocks or reroutes by itself.",
    "components": [
      [
        "Diff parser",
        "unified handling of code, config, IaC, and schema changes"
      ],
      [
        "Graph engine",
        "code imports, service calls, infra relationships, data flows"
      ],
      [
        "Catalog bridge",
        "owners, criticality, and environments from the service catalog"
      ],
      [
        "Summarizer",
        "ranked human-readable impact report with evidence links"
      ]
    ],
    "flow": [
      "On PR open, the change is parsed across every artifact type it touches.",
      "Traversal expands the blast radius through runtime dependencies and shared infra.",
      "Affected surfaces are resolved to owning teams with criticality from the catalog.",
      "The PR carries the summary; the release pipeline carries the risk score."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ]
    ],
    "integrations": [
      [
        "GitHub / GitLab",
        "PR comments and reviewer suggestions"
      ],
      [
        "Service catalog (Backstage etc.)",
        "ownership and criticality"
      ],
      [
        "OpenTelemetry / tracing",
        "runtime call edges to complement static analysis"
      ],
      [
        "Terraform / Kubernetes manifests",
        "infrastructure relationships"
      ],
      [
        "Schema registries",
        "data-contract impact"
      ]
    ],
    "context": [
      "the PR diff across artifact types",
      "code dependency graph",
      "service topology and call edges",
      "infrastructure relationships",
      "ownership and criticality metadata",
      "past incidents by component"
    ],
    "tools": [
      "Read-only: repo graphs, catalog, trace APIs, IaC state",
      "Write tier: PR comments and check annotations"
    ],
    "benefits": [
      "Reviewers see consequences, not just diffs.",
      "The right reviewers get pulled in before merge, not after the incident.",
      "Test plans target the real blast radius instead of the changed files.",
      "Deploy risk scores get honest inputs."
    ],
    "security": [
      "Dependency graphs can reveal architecture detail: keep analysis inside your boundary; summaries shared externally are redacted.",
      "Trace-derived edges can carry PII in spans: use aggregated, name-level data only."
    ],
    "future": [
      "Simulated impact: replay last week's traffic against a what-if model of the change.",
      "Change-freeze enforcement driven by blast radius (risky changes need a window).",
      "Cross-repo orchestration: one PR, many affected repos, coordinated review."
    ],
    "related": [
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      },
      {
        "num": 44,
        "name": "AI Repository Infrastructure Analyzer",
        "slug": "ai-repository-infrastructure-analyzer"
      },
      {
        "num": 63,
        "name": "AI Service Topology Mapper",
        "slug": "ai-service-topology-mapper"
      },
      {
        "num": 49,
        "name": "AI Service Catalog Assistant",
        "slug": "ai-service-catalog-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ PR diff parsing (code · IaC · schema)              │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Dependency + topology traversal                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Owner + criticality resolution                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Blast-radius summary in PR                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Reviewer routing + risk feed                       │\n└────────────────────────────────────────────────────┘",
    "variations": [
      "Start static-only (code + IaC graphs); add trace-derived runtime edges later.",
      "Embed in the platform portal as a 'what if I change X?' query, not just PR comments."
    ],
    "schema": "{\n  \"pr\": \"orders-service#412\",\n  \"change_types\": [\"code\", \"schema\", \"config\"],\n  \"blast_radius\": {\n    \"services\": [\"orders-service\", \"order-event-worker (consumes orders.change event)\", \"reporting-etl (reads orders.status)\"],\n    \"shared_infra\": [\"pg-orders primary (new index)\", \"kafka topic orders.change\"],\n    \"teams\": [\"@payments\", \"@data-platform\"]\n  },\n  \"risk\": {\"level\": \"medium\", \"drivers\": [\"schema addition consumed by ETL\", \"event payload extended\"], \"similar_past_incidents\": [\"INC-7741\"]},\n  \"suggested_reviewers\": [\"@payments-oncall\", \"@data-platform-lead\"],\n  \"watch_after_deploy\": [\"consumer lag on orders.change\", \"etl freshness metric\"]\n}"
  },
  {
    "num": 63,
    "slug": "ai-service-topology-mapper",
    "name": "AI Service Topology Mapper",
    "area": "Platform Engineering",
    "tldr": "Discover and maintain your real service topology from telemetry: who calls whom, how often, and through what — instead of a wiki page nobody updates.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Every architecture diagram is out of date the week it's drawn; meanwhile the traces, metrics, and manifests already know the truth.",
    "problem": [
      "Dependency maps live in diagrams and wiki pages that decay the moment they're written.",
      "Incident triage starts with 'what depends on this?' — answered by pinging people.",
      "Service catalogs capture declared ownership, not actual runtime relationships.",
      "Change impact, blast radius, and SLO scoping all silently depend on topology being right."
    ],
    "impact": "Without a truthful topology, impact analysis guesses, incidents escalate to the wrong teams, and architecture reviews run on folklore.",
    "capabilities": [
      [
        "Runtime edge discovery",
        "derives call edges from traces (OpenTelemetry), service mesh data, and metrics"
      ],
      [
        "Declared-vs-actual diff",
        "compares discovered topology against catalog entries and diagrams; flags drift"
      ],
      [
        "Anomaly-aware mapping",
        "marks edges that appear only under failure (retries, fallbacks, dead-letter paths)"
      ],
      [
        "Catalog backfill",
        "proposes topology updates to the service catalog via PR (idea 49)"
      ],
      [
        "Query surface",
        "natural-language questions: 'what breaks if checkout-api slows down?'"
      ]
    ],
    "solution": "A topology service that consumes trace and mesh telemetry plus IaC manifests, continuously reconstructs the service graph, diffs it against declared topology, and proposes catalog updates. During incidents it becomes the dependency oracle: blast-radius queries, downstream SLO aggregation, and what-if answers — feeding ideas 49, 57, and 62.",
    "steps": [
      [
        "Ingest",
        "traces, mesh telemetry, DNS/queue configs, and IaC manifests"
      ],
      [
        "Reconstruct",
        "build the service graph with edge metadata: volume, latency, protocol"
      ],
      [
        "Diff",
        "compare against declared topology; flag new, missing, and drifted edges"
      ],
      [
        "Propose",
        "catalog update PRs for confirmed changes"
      ],
      [
        "Serve",
        "blast-radius and dependency queries during incidents and reviews"
      ]
    ],
    "hitl": "Topology changes are proposed, not pushed: catalog owners confirm via PR; incident answers cite their evidence.",
    "components": [
      [
        "Edge extractor",
        "spans and mesh data normalized into a call graph with volumes"
      ],
      [
        "Graph store",
        "versioned topology with history (what changed, when)"
      ],
      [
        "Reconciler",
        "declared vs. actual comparison, drift classification"
      ],
      [
        "Query interface",
        "natural-language and API access for impact questions"
      ]
    ],
    "flow": [
      "Telemetry flows in continuously; the graph updates with evidence and timestamps.",
      "The reconciler diffs reality against the catalog and drafts update PRs.",
      "Owners confirm changes; topology history keeps the audit trail.",
      "Incidents and reviews query the graph instead of paging humans for guesses."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "MCP servers (Model Context Protocol)",
        "GitHub · kubernetes-mcp-server · mcp-grafana · Terraform MCP · AWS & Azure MCP · Slack · PagerDuty",
        "standardized, permission-scoped, auditable tool access to DevOps systems"
      ]
    ],
    "integrations": [
      [
        "OpenTelemetry / tracing backends",
        "primary edge evidence"
      ],
      [
        "Istio / Linkerd / Cilium",
        "mesh-derived service graph"
      ],
      [
        "Service catalog (Backstage etc.)",
        "declared topology to reconcile"
      ],
      [
        "Kafka / queue topology",
        "async edges beyond HTTP"
      ],
      [
        "Grafana",
        "topology overlays on dashboards"
      ]
    ],
    "context": [
      "distributed traces and span relationships",
      "mesh service graphs",
      "queue and event subscriptions",
      "IaC-declared resources",
      "declared catalog topology"
    ],
    "tools": [
      "Read-only: trace APIs, mesh APIs, manifests",
      "Write tier: catalog PR creation only"
    ],
    "benefits": [
      "A living topology with evidence, instead of annual diagram archaeology.",
      "Incident blast radius answered in seconds, with sources.",
      "Catalog quality improves as a side effect: declared vs. actual stays honest.",
      "Feeds SLO scoping (57) and impact analysis (62) with truthful inputs."
    ],
    "security": [
      "Trace data may carry PII in attributes: use span names and service identifiers only; aggregate at the edge level.",
      "Topology is sensitive reconnaissance data: access follows catalog permissions."
    ],
    "future": [
      "Data-flow layer: classify edges carrying PII for compliance mapping (idea 61).",
      "Failure-graph mode: edges observed only during incidents, for resilience review.",
      "Multi-cluster and multi-cloud federation of topology views."
    ],
    "related": [
      {
        "num": 49,
        "name": "AI Service Catalog Assistant",
        "slug": "ai-service-catalog-assistant"
      },
      {
        "num": 34,
        "name": "AI Grafana Dashboard Assistant",
        "slug": "ai-grafana-dashboard-assistant"
      },
      {
        "num": 32,
        "name": "AI Root Cause Analysis Assistant",
        "slug": "ai-root-cause-analysis-assistant"
      },
      {
        "num": 62,
        "name": "AI Change Impact Analyzer",
        "slug": "ai-change-impact-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Telemetry + manifest ingestion                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Service graph reconstruction                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Declared-vs-actual diff                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Catalog update PRs                                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← owner confirmed\n┌────────────────────────────────────────────────────┐\n│ Blast-radius query surface                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"service\": \"checkout-api\",\n  \"upstream\": [\n    {\"caller\": \"web-bff\", \"protocol\": \"http\", \"rps_7d_p50\": 412, \"evidence\": \"otel spans + istio\"}\n  ],\n  \"downstream\": [\n    {\"dependency\": \"pg-orders\", \"protocol\": \"sql\", \"rps_7d_p50\": 380, \"evidence\": \"otel db spans\"},\n    {\"dependency\": \"kafka:orders.change\", \"protocol\": \"kafka-produce\", \"rps_7d_p50\": 95, \"evidence\": \"manifest + metrics\"}\n  ],\n  \"reconciliation\": {\"new_edges\": 1, \"missing_edges\": 0, \"catalog_pr\": \"backstage#2210\"},\n  \"blast_radius_hint\": {\"if_slow\": [\"web-bff latency SLO at risk\", \"checkout conversion funnel\"]}\n}"
  },
  {
    "num": 64,
    "slug": "ai-database-performance-advisor",
    "name": "AI Database Performance Advisor",
    "area": "Cloud",
    "tldr": "Explain slow queries before they become incidents: plan analysis, index recommendations, and capacity signals grounded in your real workload statistics.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Database performance degrades quietly — a query that ran in 10ms meets new data volume, a plan flips, a connection pool saturates — and the first alert is usually user-facing latency.",
    "problem": [
      "Slow query logs and workload statistics exist, but turning them into safe actions (indexes, rewrites, config) is specialist work.",
      "Index recommendations from tools ignore write cost: adding the 'obvious' index can degrade ingest-heavy tables.",
      "Plan regressions after stats or upgrade changes are invisible until someone diffs plans by hand.",
      "Connection-pool, lock, and bloat issues hide between query tuning and infrastructure monitoring."
    ],
    "impact": "Database latency is often the last mile of every user request — tuning it buys back latency and headroom across the whole stack.",
    "capabilities": [
      [
        "Plan analysis",
        "reads EXPLAIN plans and workload stats to explain why queries are slow, in plain language"
      ],
      [
        "Index engineering",
        "recommends indexes with write-cost accounting and workload-aware column ordering"
      ],
      [
        "Regression detection",
        "tracks plan changes and latency distributions per query over time; names the flip point"
      ],
      [
        "Saturation diagnosis",
        "correlates pool exhaustion, locks, and bloat with query patterns"
      ],
      [
        "Safe application",
        "drafts migrations (CONCURRENTLY, online DDL) with the migration reviewer's discipline (idea 53)"
      ]
    ],
    "solution": "A database advisor that consumes your engine's own telemetry (pg_stat_statements, slow log, performance schema, cloud performance insights), explains the top cost drivers in plain language, and proposes changes as reviewed artifacts: index DDL with write-cost estimates, query rewrites, and configuration tuning — each with expected effect and rollback. Continuous mode watches for plan flips and latency drift between deploys.",
    "steps": [
      [
        "Collect",
        "workload stats, plans, and latency distributions from engine telemetry"
      ],
      [
        "Rank",
        "top cost drivers by total DB time, not single-query worst case"
      ],
      [
        "Explain",
        "per query: why it's slow (scan, join order, spill, lock, pool)"
      ],
      [
        "Propose",
        "index/rewrite/config changes with expected effect and write-cost tradeoffs"
      ],
      [
        "Verify",
        "post-change validation against the same telemetry; regressions flagged"
      ]
    ],
    "hitl": "Advisory: every change ships as a reviewed migration or config PR; the advisor never alters the database directly.",
    "components": [
      [
        "Telemetry collector",
        "pg_stat_statements, performance schema, slow logs, cloud insights"
      ],
      [
        "Plan analyzer",
        "EXPLAIN digestion with regression tracking per query fingerprint"
      ],
      [
        "Advisor engine",
        "index and rewrite recommendations with write-cost modeling"
      ],
      [
        "Verification loop",
        "before/after comparison on the same workload slices"
      ]
    ],
    "flow": [
      "Telemetry lands on schedule; the advisor ranks what actually costs the database time.",
      "Each top query gets a diagnosis grounded in its real plans and statistics.",
      "Proposals arrive as reviewable DDL and PRs with expected effect and tradeoffs.",
      "After application, the same telemetry confirms the win or flags the regression."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "PostgreSQL / MySQL / SQL Server",
        "telemetry and EXPLAIN"
      ],
      [
        "RDS / Cloud SQL / Azure SQL",
        "performance insights APIs"
      ],
      [
        "PgBouncer / proxies",
        "pool diagnostics"
      ],
      [
        "Grafana / Prometheus",
        "latency and saturation dashboards"
      ],
      [
        "GitHub",
        "migration PRs"
      ]
    ],
    "context": [
      "workload statistics per query fingerprint",
      "execution plans",
      "table and index sizes",
      "lock and pool metrics",
      "schema and constraint definitions"
    ],
    "tools": [
      "Read-only: engine telemetry, EXPLAIN execution, catalog queries",
      "Write tier: migration PR creation only"
    ],
    "benefits": [
      "DB time spent where it matters: ranked by total workload cost.",
      "Index recommendations that respect write cost and ingest patterns.",
      "Plan regressions caught by fingerprint tracking, not by user complaints.",
      "Every change reviewed, reversible, and verified against the same telemetry."
    ],
    "security": [
      "Query texts can embed PII in literals: normalize fingerprints and redact literals before model calls.",
      "EXPLAIN ANALYZE executes queries: prefer read-replicas and statement timeouts; plain EXPLAIN where possible.",
      "Telemetry access is read-only by role design; no credentials ever reach the model."
    ],
    "future": [
      "Workload simulation: replay sampled production patterns against proposed indexes.",
      "Cost coupling: tie query efficiency to cloud spend (idea 26) for managed databases.",
      "Cross-database join hygiene: flag cross-service joins that should be API contracts."
    ],
    "related": [
      {
        "num": 53,
        "name": "AI Database Migration Reviewer",
        "slug": "ai-database-migration-reviewer"
      },
      {
        "num": 25,
        "name": "AI Cloud Troubleshooting Assistant",
        "slug": "ai-cloud-troubleshooting-assistant"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      },
      {
        "num": 32,
        "name": "AI Root Cause Analysis Assistant",
        "slug": "ai-root-cause-analysis-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Workload telemetry ingestion                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Cost-driver ranking (total time)                   │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Per-query diagnosis + plans                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Index / rewrite / config proposals                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Post-change verification loop                      │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"database\": \"pg-orders-replica\",\n  \"window\": \"7d\",\n  \"top_findings\": [\n    {\n      \"query_fingerprint\": \"SELECT ... FROM orders JOIN customers ...\",\n      \"total_db_time_share\": 0.34,\n      \"diagnosis\": \"seq scan on orders (412M rows) due to status filter without index\",\n      \"proposal\": {\"kind\": \"index\", \"ddl\": \"CREATE INDEX CONCURRENTLY idx_orders_status_created ON orders (status, created_at)\", \"expected\": \"p95 1.8s to 120ms\", \"write_cost\": \"low (status low cardinality)\"},\n      \"evidence\": {\"plan_lines\": [\"Seq Scan on orders ... rows=412000000\"], \"calls_7d\": 812000}\n    }\n  ],\n  \"regressions\": [{\"fingerprint\": \"...\", \"flipped\": \"2026-10-09\", \"cause\": \"stats refresh: hash join became nested loop\"}]\n}"
  },
  {
    "num": 65,
    "slug": "ai-container-image-optimizer",
    "name": "AI Container Image Optimizer",
    "area": "CI/CD",
    "tldr": "Shrink, harden, and speed up container images automatically: layer analysis, base-image upgrades, and rebuild PRs — with size, CVE, and cache wins reported per build.",
    "complexity": "Low",
    "automation": "Assistive",
    "problem_intro": "Images accrete: a base image from 2022, build tools left in runtime layers, a 1.8GB blob that slows every deploy, scan, and cold start.",
    "problem": [
      "Nobody owns image diet: multi-stage builds, layer ordering, and .dockerignore are crafts applied once and forgotten.",
      "Base images drift: CVEs accumulate and cache-friendly bases go stale because upgrades are chores.",
      "Slow builds and pushes tax every pipeline run; cache misses waste runner-minutes organization-wide.",
      "Distroless/minimal migrations stall on 'which binary needs what?'"
    ],
    "impact": "Image size multiplies across every pull, scan, and node; leaner images are pure wins for speed, cost, and attack surface.",
    "capabilities": [
      [
        "Layer archaeology",
        "attributes size to layers and files; names the top offenders and their origin"
      ],
      [
        "Base-image matching",
        "recommends slimmer/safer bases compatible with the runtime (distroless, alpine, chainguard)"
      ],
      [
        "Dockerfile refactoring",
        "multi-stage rewrites, dependency-layer ordering, .dockerignore authoring"
      ],
      [
        "Rebuild PRs",
        "opens PRs with before/after size, CVE delta, and build-time estimates"
      ],
      [
        "Cache strategy",
        "diagnoses cache misses in CI and proposes ordering and lockfile fixes (feeds idea 11)"
      ]
    ],
    "solution": "An image analyzer wired into CI: on each build it inspects the produced image (layers, packages, history), compares against available bases and prior builds, and where wins are found opens a refactor PR — multi-stage split, base upgrade, cache reordering — with measured before/after evidence. Works per-repo with org-wide reporting on the biggest aggregate offenders.",
    "steps": [
      [
        "Inspect",
        "analyze the built image: layers, packages, file sizes, history"
      ],
      [
        "Compare",
        "against slimmer bases, prior builds, and org conventions"
      ],
      [
        "Propose",
        "Dockerfile refactor PR with expected size/CVE/cache impact"
      ],
      [
        "Validate",
        "CI build proves the numbers; smoke tests gate the PR"
      ],
      [
        "Report",
        "org dashboard: total bytes, scan time, and pull time reclaimed"
      ]
    ],
    "hitl": "Refactors ship as PRs with CI evidence; runtime-compatibility smoke tests must pass before merge — the optimizer never force-pushes images.",
    "components": [
      [
        "Image inspector",
        "layer/file/package analysis plus registry metadata"
      ],
      [
        "Refactor planner",
        "Dockerfile transformations validated by re-build"
      ],
      [
        "PR drafter",
        "evidence-attached refactor PRs"
      ],
      [
        "Reporting",
        "aggregate savings and offender leaderboard"
      ]
    ],
    "flow": [
      "CI publishes the image; the inspector breaks it into layers and packages.",
      "The planner matches the runtime against slimmer bases and missing optimizations.",
      "A refactor PR lands with measured before/after: size, CVEs, build time.",
      "Smoke tests guard runtime compatibility; the dashboard tracks org-wide savings."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Docker / BuildKit / podman",
        "image build and inspection"
      ],
      [
        "Registries (ECR, GAR, Harbor, GHCR)",
        "image metadata and history"
      ],
      [
        "Trivy / Grype",
        "CVE delta per proposal"
      ],
      [
        "GitHub Actions / GitLab CI",
        "pipeline integration and PRs"
      ],
      [
        "Kubernetes",
        "pull-time and cold-start impact estimates"
      ]
    ],
    "context": [
      "image layers, packages, and history",
      "Dockerfile and build context",
      "available base images and their CVE posture",
      "CI cache behavior",
      "runtime requirements from manifests"
    ],
    "tools": [
      "Read-only: registry APIs, image inspection, scan reports",
      "Write tier: PR creation with refactor Dockerfiles"
    ],
    "benefits": [
      "Smaller images: faster deploys, scans, cold starts, and less egress.",
      "CVE surface shrinks as bases stay current by default.",
      "Build caches hit more often; runner-minutes drop.",
      "A leaderboard makes the biggest offenders someone's (easy) fix."
    ],
    "security": [
      "Proposed bases are evaluated for provenance and maintenance health — shrinking an image must not mean trusting a random one.",
      "Analysis metadata stays internal: image inventories reveal stack details.",
      "PRs pass the same CI gates as human changes; no direct registry writes."
    ],
    "future": [
      "SBOM diffing integrated: prove CVE reduction per refactor (with idea 42).",
      "Attestation wiring: signed, minimal images as golden-path defaults (idea 60).",
      "Auto-merge trusted base patch bumps with measured zero-delta smoke tests."
    ],
    "related": [
      {
        "num": 37,
        "name": "AI Container Vulnerability Explainer",
        "slug": "ai-container-vulnerability-explainer"
      },
      {
        "num": 11,
        "name": "AI Build Optimization Assistant",
        "slug": "ai-build-optimization-assistant"
      },
      {
        "num": 1,
        "name": "AI Pipeline Failure Analyzer",
        "slug": "ai-pipeline-failure-analyzer"
      },
      {
        "num": 38,
        "name": "AI Kubernetes Security Analyzer",
        "slug": "ai-kubernetes-security-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Image inspection (layers · packages)               │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Base + layer comparison                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Refactor PR with evidence                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← before/after\n┌────────────────────────────────────────────────────┐\n│ CI validation + smoke tests                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Org-wide savings report                            │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"image\": \"registry/orders-service:1.42.0\",\n  \"current\": {\"size_mb\": 1840, \"layers\": 22, \"critical_cves\": 6},\n  \"findings\": [\n    {\"issue\": \"build toolchain in runtime layer\", \"bytes\": 720000000, \"fix\": \"multi-stage split\"},\n    {\"issue\": \"base debian:11 -> distroless/base-nossl candidate\", \"delta\": \"-610 MB, -6 CVEs\", \"risk\": \"low (static go binary)\"}\n  ],\n  \"proposal\": {\"pr\": \"PR-183\", \"projected_size_mb\": 512, \"projected_cves\": 0, \"smoke\": \"required\"}\n}"
  },
  {
    "num": 66,
    "slug": "ai-alert-quality-engineer",
    "name": "AI Alert Quality Engineer",
    "area": "Observability & SRE",
    "tldr": "Reduce pager noise systematically: deduplicate overlapping alerts, correlate bursts into incidents, and tune thresholds from evidence — as reviewed changes, not vibes.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Alert fatigue is self-inflicted: overlapping rules, static thresholds, and no deduplication mean the pager cries wolf until engineers mute it.",
    "problem": [
      "Alert rules accrete per-incident; nobody removes the alert for the service that was renamed a year ago.",
      "Static thresholds ignore daily and weekly seasonality, generating known-noise pages.",
      "One underlying failure fans out into dozens of pages from dependent services.",
      "Alert quality is nobody's metric: pages-per-shift and noise ratio aren't measured, so they can't improve."
    ],
    "impact": "Every noisy page buys the next real alert a little less attention — fatigue is the tax that turns minor incidents into missed ones.",
    "capabilities": [
      [
        "Noise analytics",
        "pages-per-rule, acknowledgment latency, action-rate: the metrics that name the worst offenders"
      ],
      [
        "Burst correlation",
        "groups alert storms into single causes using topology and timing (idea 63)"
      ],
      [
        "Seasonality-aware tuning",
        "proposes dynamic thresholds and multi-window burns informed by history (idea 57)"
      ],
      [
        "Rule hygiene",
        "finds dead rules (renamed metrics/services), duplicates, and never-actioned alerts"
      ],
      [
        "Change via PR",
        "alert rule edits as reviewed changes with before/after page simulations"
      ]
    ],
    "solution": "A weekly alert-quality review that never forgets: it computes per-rule noise metrics from your alerting history, correlates storms to root causes via topology, and files reviewed PRs — tune, deduplicate, route differently, or retire. Simulations show exactly how many past pages each change would have removed, and which real incidents would still have paged.",
    "steps": [
      [
        "Measure",
        "per-rule noise metrics from alert and acknowledgment history"
      ],
      [
        "Correlate",
        "group alert bursts into causes using topology and timing"
      ],
      [
        "Diagnose",
        "why each noisy rule misfires: threshold, duplication, staleness, fan-out"
      ],
      [
        "Propose",
        "tune/dedup/retire/reroute changes as PRs with page simulations"
      ],
      [
        "Track",
        "noise-ratio trend after each change; revert what over-filters"
      ]
    ],
    "hitl": "Every alert change is a reviewed PR with simulation evidence; paging behavior changes require on-call owners' sign-off.",
    "components": [
      [
        "History analyzer",
        "per-rule page counts, ack times, action rates, sleep patterns"
      ],
      [
        "Correlation engine",
        "storm grouping with topology and timing evidence"
      ],
      [
        "Simulation harness",
        "replays proposed rules against recorded history"
      ],
      [
        "PR drafter",
        "alert rule changes with before/after evidence"
      ]
    ],
    "flow": [
      "Weekly, the analyzer ranks rules by noise contributed and value delivered.",
      "Storms are traced to single causes; fan-out candidates for deduplication are named.",
      "Each proposal ships as a PR with a simulation: pages removed, incidents kept.",
      "Noise-ratio trends prove improvement; over-filtering gets caught by the same loop."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "RAG stack",
        "pgvector · Qdrant · Weaviate · OpenSearch k-NN; embeddings from OpenAI, Cohere Embed, or open BGE-M3",
        "retrieval over runbooks, docs, wikis, past incidents, and changelogs"
      ]
    ],
    "integrations": [
      [
        "Prometheus / Alertmanager",
        "rules, silences, and notification history"
      ],
      [
        "PagerDuty / Opsgenie",
        "page outcomes and acknowledgment data"
      ],
      [
        "Grafana",
        "alert panel evidence"
      ],
      [
        "GitHub",
        "rule-change PRs"
      ],
      [
        "Slack",
        "weekly alert-quality digest"
      ]
    ],
    "context": [
      "alert rules and their definitions",
      "firing and acknowledgment history",
      "topology for burst correlation",
      "SLO burn data",
      "on-call feedback on page quality"
    ],
    "tools": [
      "Read-only: alert APIs, paging history, topology",
      "Write tier: rule-change PRs (owner-approved)"
    ],
    "benefits": [
      "A managed noise ratio instead of a slowly rising pager tax.",
      "Storms page once, not forty times.",
      "Dead and duplicate rules retire with evidence, not politics.",
      "Every paging change is simulated before it touches the on-call."
    ],
    "security": [
      "Alert payloads can include customer-impacting detail: aggregate before model calls.",
      "Tuning that suppresses pages is riskier than noise: simulations and owner sign-off are mandatory, and changes are revertable."
    ],
    "future": [
      "Feedback loop from the on-call copilot (idea 50): which pages actually led to action.",
      "Alert-as-code linting in CI: new rules are simulated before they exist.",
      "Cross-team noise budgets with trend targets."
    ],
    "related": [
      {
        "num": 30,
        "name": "AI Alert Investigation Assistant",
        "slug": "ai-alert-investigation-assistant"
      },
      {
        "num": 35,
        "name": "AI Anomaly Investigation Agent",
        "slug": "ai-anomaly-investigation-agent"
      },
      {
        "num": 57,
        "name": "AI SLO & Error Budget Assistant",
        "slug": "ai-slo-error-budget-assistant"
      },
      {
        "num": 31,
        "name": "AI Incident Summarizer",
        "slug": "ai-incident-summarizer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Alert history + rule inventory                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Per-rule noise analytics                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Burst correlation via topology                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Tune / dedup / retire PRs                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← simulated first\n┌────────────────────────────────────────────────────┐\n│ Noise-ratio trend tracking                         │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"period\": \"2026-W41\",\n  \"noise_metrics\": {\"pages_total\": 214, \"actioned_within_15m\": 0.31, \"top_offender\": \"cpu>80% (static, 6 services)\", \"storm_groups\": 9},\n  \"proposals\": [\n    {\"rule\": \"cpu>80%@prod-api\", \"action\": \"replace with multiwindow burn\", \"simulated\": {\"pages_removed\": 38, \"real_incidents_missed\": 0}},\n    {\"rule\": \"orders-lag@worker-*\", \"action\": \"dedupe into one alert\", \"simulated\": {\"pages_removed\": 22, \"real_incidents_missed\": 0}}\n  ],\n  \"trend\": {\"noise_ratio_4w\": [0.72, 0.68, 0.55, 0.48]}\n}"
  },
  {
    "num": 67,
    "slug": "ai-feature-flag-lifecycle-assistant",
    "name": "AI Feature Flag Lifecycle Assistant",
    "area": "Platform Engineering",
    "tldr": "Manage flag debt automatically: find stale flags, verify kill-switch readiness, and clean up through reviewed PRs — so flags stay a tool, not a tar pit.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Feature flags are created in minutes and forgotten for years: hundreds of dead toggles wrapping code paths nobody remembers how to reach.",
    "problem": [
      "Flags accumulate without an expiry culture; the codebase carries years of dead branches.",
      "Kill switches that would save an incident were never tested — flipping them is a leap of faith.",
      "Flag state and code drift: removals half-done leave orphaned checks and config keys.",
      "Combinatorial states (who sees what, in which env) are invisible; testing coverage of flag permutations is luck."
    ],
    "impact": "Flag debt taxes every deploy, hides untested code paths in production, and turns the emergency lever into a gamble exactly when it's needed most.",
    "capabilities": [
      [
        "Inventory & staleness",
        "correlates flag definitions, code references, and evaluation telemetry to find dead and zombie flags"
      ],
      [
        "Kill-switch testing",
        "proposes safe simulations proving each flag's off-state works (staging, canary, or shadow evaluation)"
      ],
      [
        "Cleanup drafting",
        "removal PRs that delete the flag and both code paths correctly, env config included"
      ],
      [
        "Expiry governance",
        "flags get born with owners and expiry dates; renewals are explicit"
      ],
      [
        "Exposure mapping",
        "which users and segments each flag affects — useful for launches and incidents"
      ]
    ],
    "solution": "A flag governance layer over your flag system (LaunchDarkly, Flagsmith, Unleash, OpenFeature, homegrown): it merges the flag registry with the code index and evaluation telemetry, classifies lifecycle state (active, dormant, dead), proposes kill-switch drills, and drafts cleanup PRs. Expiry metadata becomes policy: new flags declare an owner and review date at creation, enforced by the guardrail generator (idea 60).",
    "steps": [
      [
        "Inventory",
        "merge flag registry, code references, and evaluation telemetry"
      ],
      [
        "Classify",
        "active / dormant / dead per flag, with last-evaluation evidence"
      ],
      [
        "Drill",
        "propose kill-switch tests for flags that would matter in incidents"
      ],
      [
        "Clean",
        "draft removal PRs for dead flags; orphaned config included"
      ],
      [
        "Govern",
        "expiry metadata and renewal prompts at creation and review"
      ]
    ],
    "hitl": "Removals and drills are owner-approved; the assistant never flips flags in production — drills run in staging or as shadow evaluations.",
    "components": [
      [
        "Inventory engine",
        "registry/API sync plus code-index cross-reference"
      ],
      [
        "Lifecycle classifier",
        "telemetry-backed staleness verdicts with evidence"
      ],
      [
        "Cleanup drafter",
        "flag and code-path removal PRs across repos"
      ],
      [
        "Governance hooks",
        "creation-time metadata checks and renewal workflows"
      ]
    ],
    "flow": [
      "The inventory reconciles what the flag system, the code, and production actually do.",
      "Dead flags surface with evidence; dormant ones get an owner ping before death row.",
      "Cleanup PRs remove both branches of the toggle, config keys included.",
      "Expiry metadata keeps the inventory from refilling."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ]
    ],
    "integrations": [
      [
        "LaunchDarkly / Flagsmith / OpenFeature / Unleash",
        "flag registries and evaluation data"
      ],
      [
        "GitHub / GitLab",
        "cleanup PRs and expiry checks"
      ],
      [
        "Kubernetes / config stores",
        "orphaned config detection"
      ],
      [
        "Backstage / IDP",
        "flag health per service in the catalog"
      ],
      [
        "Slack",
        "renewal nudges to flag owners"
      ]
    ],
    "context": [
      "flag registry and targeting rules",
      "evaluation telemetry (who saw what)",
      "code references from the index",
      "environment configuration",
      "ownership metadata"
    ],
    "tools": [
      "Read-only: flag APIs, code index, evaluation events",
      "Write tier: PR creation and owner notifications; no production flag writes"
    ],
    "benefits": [
      "Flag count and code-path complexity trend down, not up.",
      "Kill switches proven before the incident that needs them.",
      "Cleaner production: dormant code paths and orphaned config removed.",
      "New flags born with owners and expiry dates, enforced automatically."
    ],
    "security": [
      "Evaluation telemetry can be user-level: aggregate before analysis; segment data stays in the flag system.",
      "Cleanup PRs touching auth or billing flags get extra review gates.",
      "The assistant holds read-only flag credentials — flag flipping stays human."
    ],
    "future": [
      "Progressive-delivery integration: tie flag rollout state to SLO burn (ideas 57 and 08).",
      "Permutation test generation: cover the flag combinations that matter.",
      "Flag-cost accounting: which flags carry operational burden per team."
    ],
    "related": [
      {
        "num": 60,
        "name": "AI Platform Guardrail Generator",
        "slug": "ai-platform-guardrail-generator"
      },
      {
        "num": 48,
        "name": "AI Golden Path Generator",
        "slug": "ai-golden-path-generator"
      },
      {
        "num": 45,
        "name": "AI Pull Request Infrastructure Reviewer",
        "slug": "ai-pull-request-infrastructure-reviewer"
      },
      {
        "num": 12,
        "name": "AI Deployment Troubleshooting Agent",
        "slug": "ai-deployment-troubleshooting-agent"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Registry + code + telemetry merge                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Lifecycle classification per flag                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Kill-switch drill proposals                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← staging only\n┌────────────────────────────────────────────────────┐\n│ Cleanup PRs (code + config)                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Expiry governance + renewal prompts                │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"flag\": \"checkout-new-pricing\",\n  \"state\": \"dormant\",\n  \"evidence\": {\"created\": \"2024-03-02\", \"last_evaluated\": \"2025-11-18\", \"code_refs\": 4, \"evaluations_90d\": 0},\n  \"exposure\": {\"segments\": [\"internal-dogfood\"], \"envs\": [\"staging\", \"prod\"]},\n  \"actions\": [\n    {\"kind\": \"kill_switch_drill\", \"status\": \"proposed\", \"where\": \"staging\"},\n    {\"kind\": \"removal_pr\", \"status\": \"drafted\", \"pr\": \"PR-889\", \"note\": \"removes default-off path + 2 env keys\"}\n  ],\n  \"owner\": \"@checkout-team\",\n  \"expires\": \"2024-06-02 (overdue 860d)\"\n}"
  },
  {
    "num": 68,
    "slug": "ai-iac-test-generator",
    "name": "AI IaC Test Generator",
    "area": "IaC",
    "tldr": "Give your Terraform modules real tests: generated Terratest/OPA cases from module semantics and past incidents, running in CI like any other code.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Infrastructure code ships with less test coverage than a weekend hobby project — modules get 'reviewed' but rarely executed, and regressions surface as plan surprises in production.",
    "problem": [
      "IaC modules are consumed by dozens of stacks; a change can pass review and break every consumer.",
      "Writing Terratest/OPA/tflint tests is unglamorous specialist work, so modules go untested.",
      "Existing tests drift from module evolution, testing yesterday's interface.",
      "Teams lack a pattern for what to test: outputs, idempotency, downgrade, tagging, encryption settings."
    ],
    "impact": "Untested IaC turns every module change into a fleet-wide experiment — the exact opposite of what infrastructure-as-code promised.",
    "capabilities": [
      [
        "Contract extraction",
        "reads module inputs/outputs/lifecycle to derive what must hold true for consumers"
      ],
      [
        "Test synthesis",
        "generates Terratest/OPA/Conftest cases: happy path, idempotency, tagging, encryption, downgrade safety"
      ],
      [
        "Incident-informed cases",
        "adds regression tests from past incidents touching the module (idea 55's drift history)"
      ],
      [
        "Fixture management",
        "generates minimal, cheap test fixtures (localstack, test accounts, short-lived resources)"
      ],
      [
        "Maintenance",
        "updates tests when module interfaces evolve; deletes tests for dead paths"
      ]
    ],
    "solution": "A test engineer for IaC: pointed at a module, it extracts the contract, drafts a test suite matched to consumer expectations and incident history, wires it into CI with cost-bounded fixtures, and keeps the suite current as the module changes. Output is ordinary test code in the module repo — no magic runtime, just tests your team owns.",
    "steps": [
      [
        "Analyze",
        "module contract: variables, outputs, resources, and consumer usage patterns"
      ],
      [
        "Design",
        "test matrix: invariants, security posture, idempotency, upgrade/downgrade"
      ],
      [
        "Generate",
        "test code + fixtures with cost and time bounds per run"
      ],
      [
        "Wire",
        "CI integration with PR gating and scheduled full runs"
      ],
      [
        "Maintain",
        "interface changes update tests; failures feed back as new cases"
      ]
    ],
    "hitl": "Generated tests are reviewed like code; the test matrix is confirmed with the module owner before CI gating is enabled.",
    "components": [
      [
        "Contract analyzer",
        "module semantics and cross-stack consumer usage"
      ],
      [
        "Test synthesizer",
        "framework-specific test code generation"
      ],
      [
        "Fixture provider",
        "cost-bounded test environments and teardown guarantees"
      ],
      [
        "CI integrator",
        "gating rules, scheduling, flake-quarantine hooks (idea 52)"
      ]
    ],
    "flow": [
      "The analyzer reads the module and how consumers actually use it.",
      "A test matrix is proposed: what must hold, what incidents taught, what's cheap to run.",
      "Generated tests and fixtures land as reviewable code with CI wiring.",
      "Module evolution updates the suite; new failure modes become new cases."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI coding agents (human-invoked)",
        "Claude Code · OpenAI Codex · GitHub Copilot coding agent · Cursor · Cline · OpenHands",
        "author the suggested fix as a reviewed pull request"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ]
    ],
    "integrations": [
      [
        "Terraform / OpenTofu / Terragrunt",
        "module parsing and plan execution"
      ],
      [
        "Terratest / OPA / Conftest / tflint",
        "test and check frameworks"
      ],
      [
        "LocalStack / test accounts",
        "cheap fixtures"
      ],
      [
        "GitHub Actions / GitLab CI",
        "gating and scheduling"
      ]
    ],
    "context": [
      "module source and history",
      "consumer stack usage",
      "past incidents and drift touching the module",
      "org conventions (tagging, encryption, naming)",
      "test-account constraints"
    ],
    "tools": [
      "Read tier: repos, module registries, incident history",
      "Write tier: PR creation for tests; test-account resources with strict teardown"
    ],
    "benefits": [
      "Module changes verified by execution before touching consumers.",
      "Every fleet-wide module gets a real safety net, not just review.",
      "Incidents stop repeating: regression tests arrive with the fix.",
      "Test costs bounded by design: fixtures are cheap and always torn down."
    ],
    "security": [
      "Generated tests must not become backdoors: they pass the same review and secret-scanning as product code.",
      "Test credentials are scoped to disposable accounts; teardown is mandatory and verified.",
      "Module analysis stays in-boundary; no proprietary module code leaves the environment."
    ],
    "future": [
      "Policy tests cross-wired with guardrails (idea 60): the same invariants checked twice.",
      "Consumer-driven contracts for infrastructure: stacks assert what they need from modules.",
      "Upgrade simulations: run the suite against provider version bumps automatically."
    ],
    "related": [
      {
        "num": 3,
        "name": "AI Terraform Reviewer",
        "slug": "ai-terraform-reviewer"
      },
      {
        "num": 23,
        "name": "AI IaC Security Analyzer",
        "slug": "ai-iac-security-analyzer"
      },
      {
        "num": 21,
        "name": "AI Terraform Plan Explainer",
        "slug": "ai-terraform-plan-explainer"
      },
      {
        "num": 55,
        "name": "AI Drift Detective",
        "slug": "ai-drift-detective"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Module contract analysis                           │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Test matrix design (with owner)                    │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Test + fixture generation                          │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ CI wiring (PR gate + schedule)                     │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Maintenance on interface change                    │\n└────────────────────────────────────────────────────┘",
    "variations": [
      "Start OPA/Conftest-only (plan-time assertions) before full Terratest execution.",
      "Golden-module program: apply generation to the highest-consumption modules first."
    ],
    "schema": "{\n  \"module\": \"terraform-aws-s3-secure-bucket\",\n  \"consumers\": 23,\n  \"test_matrix\": [\n    {\"case\": \"encryption + versioning defaults enforced\", \"framework\": \"terratest\", \"cost\": \"~$0.01/run\"},\n    {\"case\": \"idempotent re-apply (no diff)\", \"framework\": \"terratest\", \"cost\": \"~$0.02/run\"},\n    {\"case\": \"public-access block cannot be disabled\", \"framework\": \"opa/conftest\"},\n    {\"case\": \"regression: INC-8102 tag propagation\", \"framework\": \"terratest\", \"source\": \"incident history\"}\n  ],\n  \"ci\": {\"pr_gate\": \"plan + opa + terratest@short\", \"schedule\": \"nightly full\"},\n  \"generated_files\": [\"tests/module_test.go\", \"tests/fixtures/main.tf\", \"policies/opa/s3.rego\"]\n}"
  },
  {
    "num": 69,
    "slug": "ai-performance-regression-sentinel",
    "name": "AI Performance Regression Sentinel",
    "area": "CI/CD",
    "tldr": "Catch performance regressions in CI, not in production: continuous benchmark tracking, statistical gating, and automated bisection when something gets slower.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Performance regressions don't fail tests — they ship. Latency and throughput degrade a few percent per change until someone notices a quarter later.",
    "problem": [
      "Benchmarks run ad hoc; results live in spreadsheets or someone's terminal scrollback.",
      "Noise vs. regression is a statistics problem teams hand-wave: is 4% slower on one run a real regression?",
      "When a regression is detected, finding the culprit commit means manual git-bisect pain.",
      "Performance budgets exist as intentions, not gates."
    ],
    "impact": "Users experience performance as the product; regressions shipped silently are the slowest, most expensive kind of bug to find later.",
    "capabilities": [
      [
        "Benchmark management",
        "consistent, reproducible benchmark runs in CI with environment metadata"
      ],
      [
        "Statistical gating",
        "change-point detection and confidence-aware comparisons — no single-run verdicts"
      ],
      [
        "Regression bisection",
        "when a threshold trips, bisects the window and names the culprit commit with evidence"
      ],
      [
        "Budget authoring",
        "performance budgets per endpoint and scenario as code, wired into PR checks"
      ],
      [
        "Scenario generation",
        "proposes missing benchmark scenarios for hot paths found in production traces (idea 63)"
      ]
    ],
    "solution": "A performance gate for CI: benchmarks run on a schedule and on PRs touching hot paths, results land in a time-series store with statistical gating (noise-aware, confidence-scored), and regressions trigger automated bisection. Budgets live as code next to the tests; the sentinel files its findings as PR checks and issues with evidence, not vibes.",
    "steps": [
      [
        "Instrument",
        "define and collect benchmark scenarios and environments per service"
      ],
      [
        "Track",
        "store results as time series with commit, environment, and hardware metadata"
      ],
      [
        "Gate",
        "statistical comparison on PRs: regression, improvement, or noise"
      ],
      [
        "Bisect",
        "on gate failure, narrow the culprit commit automatically"
      ],
      [
        "Report",
        "trends per service; budgets as code reviewed with the team"
      ]
    ],
    "hitl": "Gates block with evidence; overriding is explicit and logged. The sentinel diagnoses — humans decide whether a tradeoff is worth it.",
    "components": [
      [
        "Benchmark runner",
        "deterministic execution with environment pinning"
      ],
      [
        "Results store",
        "time-series of scores with metadata"
      ],
      [
        "Statistics engine",
        "change-point detection, confidence scoring, noise models"
      ],
      [
        "Bisector",
        "commit-window narrowing with per-commit runs"
      ]
    ],
    "flow": [
      "Hot paths get benchmark scenarios derived from production traffic shape.",
      "PRs touching those paths get a statistical verdict, not a single-run panic.",
      "Real regressions trigger bisection that names the commit and the delta.",
      "Budgets and trends make performance a reviewed, visible property."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Benchmark tools (k6, wrk, JMH, pytest-benchmark)",
        "execution adapters"
      ],
      [
        "GitHub Actions / GitLab CI",
        "PR checks and scheduled runs"
      ],
      [
        "Prometheus / Grafana",
        "production hot-path evidence"
      ],
      [
        "GitHub",
        "checks, issues, bisection reports"
      ]
    ],
    "context": [
      "benchmark results with metadata",
      "PR diff and hot-path mapping",
      "production traffic shape",
      "hardware/runner characteristics",
      "historical regressions and fixes"
    ],
    "tools": [
      "Read tier: CI, repos, production metrics",
      "Write tier: PR checks, issues; benchmark runs in isolated environments"
    ],
    "benefits": [
      "Regressions caught at PR time with confidence levels, not vibes.",
      "Culprit commits named automatically; fixing starts at the right diff.",
      "Performance budgets become enforced code, not aspirations.",
      "Trend lines make gradual decay visible before users feel it."
    ],
    "security": [
      "Benchmarks run on synthetic data in isolated environments — no production data in CI performance runs.",
      "The results store is internal; benchmark metadata can reveal stack detail."
    ],
    "future": [
      "Load-shape realism: benchmarks driven by sampled production traffic profiles.",
      "Cost-per-request tracking alongside latency for efficiency budgets.",
      "Cross-service budgets: end-to-end latency split across hops with team ownership."
    ],
    "related": [
      {
        "num": 52,
        "name": "AI Flaky Test Detective",
        "slug": "ai-flaky-test-detective"
      },
      {
        "num": 10,
        "name": "AI Test Failure Analyzer",
        "slug": "ai-test-failure-analyzer"
      },
      {
        "num": 11,
        "name": "AI Build Optimization Assistant",
        "slug": "ai-build-optimization-assistant"
      },
      {
        "num": 8,
        "name": "AI Deployment Risk Analyzer",
        "slug": "ai-deployment-risk-analyzer"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Benchmark scenarios + environments                 │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Continuous result collection                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Statistical gate on PRs                            │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← noise-aware\n┌────────────────────────────────────────────────────┐\n│ Automated bisection on regression                  │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Budgets + trend reports                            │\n└────────────────────────────────────────────────────┘",
    "schema": "{\n  \"service\": \"checkout-api\",\n  \"scenario\": \"checkout_flow_p95\",\n  \"verdict\": \"regression\",\n  \"statistics\": {\"baseline_p95_ms\": 612, \"candidate_p95_ms\": 738, \"delta_pct\": 20.6, \"confidence\": 0.97, \"runs\": 12},\n  \"bisection\": {\"window\": [\"9f2c1e\", \"44b0aa\"], \"culprit\": \"44b0aa (orders client: sync retry added)\", \"evidence\": \"each commit benched 3x\"},\n  \"budget\": {\"file\": \"perf/budgets.yaml\", \"limit_p95_ms\": 700, \"status\": \"exceeded\"},\n  \"action\": \"PR check failed with evidence; override requires perf-owner sign-off\"\n}"
  },
  {
    "num": 70,
    "slug": "ai-capacity-forecasting-assistant",
    "name": "AI Capacity Forecasting Assistant",
    "area": "Cloud",
    "tldr": "See the capacity wall before you hit it: forecasts of compute, storage, and quota headroom from trend data, with what-if planning for growth and events.",
    "complexity": "Medium",
    "automation": "Assistive",
    "problem_intro": "Capacity planning is either over-provisioned fear or under-provisioned surprise; the trend data that predicts the wall already exists in your metrics.",
    "problem": [
      "Quotas and limits (cloud, k8s, IP space, service limits) sit invisible until a launch or scale event collides with them.",
      "Linear extrapolation is wrong: growth is seasonal, stepwise (customer onboarding), and workload-shaped.",
      "Autoscaling hides exhaustion: headroom shrinks quietly while the system 'works fine'.",
      "Procurement and reservation decisions need months of lead time; alerts fire minutes before impact."
    ],
    "impact": "The wall is always further away than panic suggests and closer than comfort assumes — forecasting turns it into a scheduled engineering task.",
    "capabilities": [
      [
        "Trend forecasting",
        "per-resource growth models from historical usage with seasonality and step functions"
      ],
      [
        "Quota inventory",
        "current limits vs. forecast demand across cloud accounts, regions, and clusters"
      ],
      [
        "What-if planning",
        "model launches, migrations, and marketing events against headroom before committing"
      ],
      [
        "Reservation guidance",
        "when to buy committed-use and savings plans based on stable baseline vs. spiky demand"
      ],
      [
        "Early warnings",
        "exhaustion-ETA alerts with lead time matched to procurement reality (weeks, not minutes)"
      ]
    ],
    "solution": "A forecasting service over metrics and cloud quota APIs: it models demand per resource (compute, storage, IP, connections, quotas), reports headroom and time-to-exhaustion with confidence bands, and simulates what-if scenarios (2x customers, new region, decommissioning). Output drives real decisions — quota increases, reservations, node-group plans — tracked as tickets with the evidence attached.",
    "steps": [
      [
        "Inventory",
        "enumerate resources, quotas, and limits across accounts and clusters"
      ],
      [
        "Model",
        "fit demand trends per resource with seasonality and growth shape"
      ],
      [
        "Forecast",
        "headroom and exhaustion ETAs with confidence bands"
      ],
      [
        "Simulate",
        "what-if scenarios: growth, events, migrations, decommissions"
      ],
      [
        "Advise",
        "quota, reservation, and node-group actions as tickets with evidence"
      ]
    ],
    "hitl": "Forecasts inform quarterly planning and procurement; humans decide purchases and architecture. The assistant owns the math, not the money.",
    "components": [
      [
        "Inventory collector",
        "usage metrics plus cloud and k8s quota/limit APIs"
      ],
      [
        "Forecast engine",
        "trend models with seasonality; explicit uncertainty"
      ],
      [
        "Scenario simulator",
        "what-if arithmetic against the modeled baseline"
      ],
      [
        "Advisor",
        "actions ranked by lead time and risk, exported to tickets"
      ]
    ],
    "flow": [
      "The collector merges usage telemetry with the true limit inventory.",
      "Models fit per resource; exhaustion dates come with confidence, not false precision.",
      "What-ifs answer planning questions before commitments are made.",
      "Recommendations land as tickets where procurement and platform work happens."
    ],
    "platforms": [
      [
        "Cost-efficient model tiers",
        "GPT-5 Mini/Nano · Claude Haiku 4.5 · Gemini Flash · DeepSeek V4 · Mistral Small",
        "high-volume events (every failure, every alert) at a fraction of frontier cost"
      ],
      [
        "Frontier cloud models",
        "OpenAI GPT-5.x · Anthropic Claude Opus/Sonnet 4.x · Google Gemini 3 Pro · xAI Grok · Z.ai GLM",
        "deep reasoning over the assembled context; strongest for root-cause analysis and fix suggestions"
      ],
      [
        "AI observability & evaluation",
        "Langfuse · Arize Phoenix · LangSmith · W&B Weave · OpenTelemetry GenAI conventions · promptfoo",
        "tracing of every model and tool call, cost/latency tracking, prompt regression evals"
      ],
      [
        "Model routing & AI gateways",
        "LiteLLM · OpenRouter · Portkey · Kong AI Gateway · Cloudflare AI Gateway",
        "provider-agnostic routing with fallbacks, budgets, caching, and audit logs"
      ]
    ],
    "integrations": [
      [
        "Cloud quota & billing APIs",
        "AWS / Azure / GCP service quotas and usage"
      ],
      [
        "Prometheus / cloud metrics",
        "demand history"
      ],
      [
        "Kubernetes metrics & node groups",
        "cluster headroom"
      ],
      [
        "Jira / Linear",
        "capacity tickets and planning review"
      ],
      [
        "Grafana",
        "headroom dashboards"
      ]
    ],
    "context": [
      "usage history per resource",
      "quota and limit inventory",
      "growth plans and events (launches, contracts)",
      "seasonality patterns",
      "past exhaustion incidents"
    ],
    "tools": [
      "Read-only: metrics, quota APIs, billing exports",
      "Write tier: ticket filing; no quota changes or purchases"
    ],
    "benefits": [
      "Exhaustion becomes an ETA on a dashboard, not a 3am surprise.",
      "What-if answers before commitments: launches sized correctly the first time.",
      "Spend shaped by data: reservations sized to stable baselines, not fear.",
      "Quota increases requested weeks ahead, on evidence."
    ],
    "security": [
      "Usage and billing data is business-sensitive: keep forecasting in-boundary; share only aggregated outputs.",
      "Advice is advisory: no automated quota changes or purchases, ever."
    ],
    "future": [
      "Coupling with cost analytics (idea 26): headroom priced in dollars per scenario.",
      "Autoscaler-aware modeling that treats HPA/Karpenter behavior as part of the system.",
      "Cross-team capacity ledger for shared platforms, using topology (idea 63) as the demand graph."
    ],
    "related": [
      {
        "num": 29,
        "name": "AI Cloud Resource Optimization Assistant",
        "slug": "ai-cloud-resource-optimization-assistant"
      },
      {
        "num": 26,
        "name": "AI Cloud Cost Analysis Assistant",
        "slug": "ai-cloud-cost-analysis-assistant"
      },
      {
        "num": 18,
        "name": "AI HPA Recommendation Assistant",
        "slug": "ai-hpa-recommendation-assistant"
      },
      {
        "num": 57,
        "name": "AI SLO & Error Budget Assistant",
        "slug": "ai-slo-error-budget-assistant"
      }
    ],
    "diagram": "┌────────────────────────────────────────────────────┐\n│ Resource + quota inventory                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Demand modeling per resource                       │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Headroom + exhaustion ETAs                         │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼  ← confidence bands\n┌────────────────────────────────────────────────────┐\n│ What-if scenario simulation                        │\n└────────────────────────────────────────────────────┘\n                          │\n                          ▼\n┌────────────────────────────────────────────────────┐\n│ Advice to tickets with evidence                    │\n└────────────────────────────────────────────────────┘",
    "variations": [
      "Start spreadsheet-simple: scheduled quota inventory + linear trend report, then add models.",
      "Vendor capacity tools (cloud-native forecasters) as data sources; AI for the planning layer."
    ],
    "schema": "{\n  \"resource\": \"aws:vpc-ips:prod-eu\",\n  \"current\": {\"limit\": 64512, \"used\": 58100, \"headroom_pct\": 9.9},\n  \"forecast\": {\"exhaustion_eta\": \"2026-12-08\", \"confidence\": 0.85, \"model\": \"linear + onboarding steps\"},\n  \"drivers\": [\"new cluster join in November (+2k IPs)\", \"EKS pod-density growth 3%/wk\"],\n  \"what_if\": [{\"scenario\": \"black-friday 2x\", \"exhaustion_eta\": \"2026-11-21\"}],\n  \"advice\": {\"action\": \"request CIDR expansion / second VPC\", \"lead_time\": \"3-4 weeks\", \"ticket\": \"INFRA-5012\"}\n}"
  }
];
