# 2. Pass MDX plugins to Next as strings

Status: accepted

## Context

Next builds with Turbopack. Turbopack passes loader options across a process boundary, so they must be serializable. An imported remark or rehype plugin is a function and breaks the build.

## Decision

`web/next.config.ts` names MDX plugins by package name, for example `remarkPlugins: ['remark-gfm']`, and never imports the plugin functions.

## Consequences

A plugin that needs options is passed as a `[name, options]` tuple of serializable values. Do not "fix" the strings into imports.
