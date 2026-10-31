# Bring the Enov8 instance register across

Checked 31 October 2026 against the [vendor environment guide](https://docs.enov8.com/docs/enov8-platform/environment-modules/environment-management/). Its Configure Environments grid offers Excel, CSV and PDF downloads. The importer supports CSV.

1. In Enov8, open Environment > Management > Configure Environments and list Environment Instances. Clear personal, assigned and business-unit filters as appropriate to your authorised scope.
2. Show System ID, Resource Name, System, Environment Group and Assigned To. Download CSV. Confirm the exported count against the displayed count. If your account uses different column names, map them with your administrator before import.
3. Keep the original download private. Test in a fresh local database, not the synthetic demo.

```sh
npm run migrate
npm run environments -- import enov8 --file="imports/instances.csv" --dry-run --actor="Your name"
npm run environments -- import enov8 --file="imports/instances.csv" --actor="Your name"
npm run environments -- instances
```

## Exact mapping

| Export column | Destination |
|---|---|
| System ID | Unique source_id |
| Resource Name | Instance name |
| System | System name |
| Environment Group | Group name |
| Assigned To | Owner label, or Unassigned if blank |
| Every column, including Status and Version | Preserved verbatim in source_row |
| Entire CSV including its original headers | Original import evidence |

Headers match without case sensitivity. The first four columns must contain values. BOM, Windows line endings, quoted commas, quotes and multiline values are supported. Empty rows are ignored. Duplicate IDs or names, malformed CSV, missing required fields and conflicting existing records fail before any data is written. An identical file is a repeatable no-op. A changed file that reuses existing source IDs is rejected for explicit reconciliation.

Exported status and version are historical facts, not a new local readiness approval. Record a check from current evidence before confirming bookings. Exported group labels are not converted into access permissions.

## Reconcile before switching

Compare source and imported counts, source IDs, group labels, owners and a sample of extra fields. Run compliance and readiness. Retain the original export until the migration is accepted. fixtures/enov8-instances.csv is a synthetic format example based on the documented fields, not an export obtained from a licensed account. Account-specific columns still need verification.

This first importer covers the environment-instance register. It does not claim to import booking history, dependencies, infrastructure components, access policies, attached files or automation scripts. Have those mapped separately and check their counts before retiring the old system. No credentials or personal test records belong in this metadata import.

The [documented read API](https://docs.enov8.com/docs/enov8-platform/rest-api/) is another extraction route for an authorised account administrator. This program does not fetch from it or ask for an API key. No live vendor access is needed to operate the imported desk.

Use export --out=exports/snapshot.json to preserve every local record and original import. Native database backups cover full restoration. Do not delete or cancel the old service until your own reconciliation and operational checks are complete.
