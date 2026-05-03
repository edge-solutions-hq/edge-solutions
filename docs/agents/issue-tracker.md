# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Repository

- GitHub repo: `Gil-1/edge-solutions`
- Inference source: `git remote -v`

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- Read an issue: `gh issue view <number> --comments`.
- List issues: `gh issue list --state open --json number,title,body,labels,comments` with appropriate filters.
- Comment on an issue: `gh issue comment <number> --body "..."`.
- Apply or remove labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- Close an issue: `gh issue close <number> --comment "..."`.

## Publishing

When a skill says to publish to the issue tracker, create a GitHub issue unless credentials or repository permissions block `gh`.
