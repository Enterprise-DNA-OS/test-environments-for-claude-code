---
description: Close a named issue only after the operator provides its resolution.
---
# close-issue

Close a named issue only after the operator provides its resolution.

Run from this repo:

```sh
npm run environments -- close-issue --issue="<name or id>" --resolution="<verified result>" --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




