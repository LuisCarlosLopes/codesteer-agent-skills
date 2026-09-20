---
name: pipeline-canary
description: Use when verifying the skills catalog pipeline is healthy. Do NOT use for production agent workflows or feature implementation.
metadata:
  version: 0.0.1
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: false
sandbox:
  network: false
  allow_exec: false
---

# Pipeline canary

Confirms that the catalog authoring pipeline accepts a canonical skill.
