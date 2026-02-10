#!/usr/bin/env bash
set -euo pipefail

# CCS-61 rollback: restore previous bestEffort and payload.message values.

openclaw cron edit 75f4ea2b-e798-4928-8c72-f4baaa08c8df --message "node workspace/automation/shared/run-domain.mjs --domain job-scout --scheduled --jira --job-id '75f4ea2b-e798-4928-8c72-f4baaa08c8df'" --best-effort-deliver
openclaw cron edit 15a25c3b-96cd-4e38-920f-738ffb6b93ef --message "node workspace/automation/shared/run-domain.mjs --domain edge-solutions --scheduled --jira --job-id '15a25c3b-96cd-4e38-920f-738ffb6b93ef'" --best-effort-deliver
openclaw cron edit 47ba5e0a-4b3a-4fcf-90a2-7cbe0fd7eb42 --message "node workspace/automation/shared/run-domain.mjs --domain openclaw-trends --scheduled --jira --job-id '47ba5e0a-4b3a-4fcf-90a2-7cbe0fd7eb42'" --best-effort-deliver
openclaw cron edit 408c208a-980d-48dd-a4d5-af9f83df75c8 --message "node workspace/automation/shared/run-domain.mjs --domain self-improvement --scheduled --jira --job-id '408c208a-980d-48dd-a4d5-af9f83df75c8'" --best-effort-deliver
openclaw cron edit d1ab7250-6978-4a70-a62c-8dc2bb8607b6 --message "node workspace/automation/shared/run-domain.mjs --domain linkedin-drafts --scheduled --no-jira --job-id 'd1ab7250-6978-4a70-a62c-8dc2bb8607b6'"

echo "Rollback complete."
