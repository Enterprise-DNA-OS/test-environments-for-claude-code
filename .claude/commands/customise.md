---
description: Add a field or change a business rule with a tested migration.
---
# Customise

Read CLAUDE.md, the current migration, CLI and smoke tests. Ask for the desired business outcome only if it is missing. Export a private backup first. Write an additive numbered migration rather than editing an applied migration. Update the CLI, relevant views, documents and commands together. Test the changed rule on isolated data with npm test, then apply npm run migrate to the operator's database. Present the changed behaviour and test evidence. Never weaken booking gates without an explicit operator request. Deletions need separate approval. Never expose exports, evidence or credentials in a commit.
