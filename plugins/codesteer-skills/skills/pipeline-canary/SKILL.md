---
name: pipeline-canary
description: Use when verifying the skills catalog pipeline is healthy. Do NOT use for production agent workflows or feature implementation.
license: Apache-2.0
compatibility: "Minimum agent tier: 1. Requires terminal: no. Network access: no. Script execution: no."
metadata:
  version: 0.0.1
  author: "@codesteer"
  category: testing
  min-agent-tier: "1"
  requires-terminal: "false"
  sandbox-network: "false"
  sandbox-allow-exec: "false"
---

# Pipeline canary

Confirms that the catalog authoring pipeline accepts a canonical skill.
