---
description: Log an issue and its responsible owner. Blocking defaults to yes.
---
# log-issue

Log an issue and its responsible owner. Blocking defaults to yes.

Run from this repo:

```sh
npm run environments -- log-issue --instance="<name or id>" --name="<issue>" --owner="<owner>" --due=<YYYY-MM-DD> --blocking=yes --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




