---
description: Read docs/replace-enov8.md, inspect the headers and reconcile counts. Test first, then import on the operator instruction.
---
# import

Read docs/replace-enov8.md, inspect the headers and reconcile counts. Test first, then import on the operator instruction.

Run from this repo:

```sh
npm run environments -- import enov8 --file="<instances.csv>" --dry-run --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.

The test run changes no records. After reviewing its count, repeat without --dry-run to import. Never overwrite a previous import.


