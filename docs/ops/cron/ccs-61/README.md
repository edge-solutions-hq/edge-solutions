# CCS-61 Cron hardening evidence

Date: 2026-02-10

## Scope applied

Updated 5 active jobs to normalize payload command paths from:

`node workspace/automation/shared/run-domain.mjs ...`

to:

`node automation/shared/run-domain.mjs ...`

For the 4 announce jobs in that set, also switched to strict delivery (`delivery.bestEffort=false`).

## Updated jobs

- 75f4ea2b-e798-4928-8c72-f4baaa08c8df — Job scout (micro, 20m)
- 15a25c3b-96cd-4e38-920f-738ffb6b93ef — Edge-solutions improvement (report + dev loop)
- 47ba5e0a-4b3a-4fcf-90a2-7cbe0fd7eb42 — OpenClaw trends (20m)
- 408c208a-980d-48dd-a4d5-af9f83df75c8 — Self-improvement digest (YouTube + Reddit)
- d1ab7250-6978-4a70-a62c-8dc2bb8607b6 — LinkedIn AI adventures draft (20m)

## Artifacts

- `cron-jobs-before.json`
- `cron-jobs-after.json`
- `cron-jobs-latest.json`
- `targets.json`
- `patches/*.update.json` (prevalidated request shape)
- `patches/*.rollback.json`
- `rollback-commands.sh`

## Verification checkpoints

- Precheck validator passed for all update requests.
- No active cron jobs still reference `workspace/automation/shared/run-domain.mjs`.
- Updated announce jobs now have `delivery.bestEffort=false`.
- Manual smoke runs were triggered for updated jobs; final statuses are tracked in Jira evidence comment.
