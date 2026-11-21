# 4. Group Dependabot minor and patch updates

Status: accepted

## Context

Every dependency PR runs the full CI gate, and GitHub Actions minutes are limited.

## Decision

`.github/dependabot.yml` groups all minor and patch bumps per ecosystem into one weekly PR (`npm-minor-patch`, `actions-minor-patch`). Major updates stay as separate PRs so each breaking change is reviewed on its own.

## Consequences

One CI run per ecosystem per week for routine bumps. If a grouped PR fails, find the bump that broke it inside the group.
