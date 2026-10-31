---
description: Find ready instances without any requested or confirmed booking in a window.
---
# available

Find ready instances without any requested or confirmed booking in a window.

Run from this repo:

```sh
npm run environments -- available --start="<ISO timestamp with timezone>" --end="<ISO timestamp with timezone>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




