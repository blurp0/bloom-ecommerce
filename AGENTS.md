<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `context/project-overview.md` — product definition,
   goals, features, and scope
2. `context/site-structure.md` — site map, page flows,
   and order status lifecycle diagrams
3. `context/ui-ux-context.md` — theme, colors, typography,
   and component conventions
4. `context/code-standards.md` — implementation rules
   and conventions
5. `context/ai-workflow-rules.md` — development workflow,
   scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase,
   completed work, open questions, and next steps

After reading context files, check `context/current-issue.md`
— if it has content, fix that bug before doing anything else.

Feature specs live in `context/feature-specs/` and follow the
format defined in `context/feature-specs/specs-format.md`.
Create a spec there before implementing any new feature.

When planning implementation order or picking up a new phase,
consult `context/bloom-and-bind-implementation-plan.md` — the
master phase-by-phase build plan with slice-level acceptance
criteria and dependency ordering.

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes the site structure, scope, or
standards documented in the context files, update the
relevant file before continuing.
