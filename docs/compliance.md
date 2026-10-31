# Evidence checks and their limits

Checked 31 October 2026. This program tests recorded fields, dates and workflow conditions. It neither inspects test data nor certifies legal compliance. The business determines applicability and evidence quality.

| Rule | Implemented check | Basis |
|---|---|---|
| DATA-SAFETY | Unknown or personal test-data classification is flagged and blocks booking confirmation. Only recorded synthetic or masked data can pass. | Conservative house control supporting [NZ Privacy Principle 5](https://www.privacy.org.nz/privacy-principles/5/), which requires reasonable safeguards for personal information. The law does not itself ban all personal data in testing. |
| RETENTION | Recorded personal data without a retention-review date, or with a date at or before today, is flagged. No data is deleted. | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits keeping personal information beyond its lawful purpose. There is no statutory fixed number of days used here. |
| EVIDENCE | Missing or expired checks are flagged. Confirmation requires evidence valid through the booking end. | House operational policy. Expiry is chosen by the reviewer, not a legal deadline. |
| OWNER | Missing or Unassigned owner labels are flagged. | House accountability policy. |
| BOOKING | Version match, healthy recorded status, no blocking issue and no confirmed time clash are required. | House environment-management policy, informed by the vendor's [booking workflow](https://docs.enov8.com/docs/enov8-platform/environment-modules/booking-management/). |

A reviewer must inspect source evidence and record its reference, version, health, data classification and validity. A personal-data check can record a retention review date but cannot be used to confirm a booking. Masking is asserted by the reviewer and is never performed or verified by this software. Keep raw personal data out of this register.

A later failed check is reflected immediately in readiness, including for previously confirmed bookings. Recheck before use. The status still records the original confirmation; it is not an automatic release authorisation.

Imports, check history and activity reject ordinary updates and deletes. Database owners can bypass these controls. Actor labels are not signed identities. Row-level security prevents default PUBLIC access, not a privileged owner's access. Multi-user deployments require authenticated users, explicit roles, backups and evidence handling appropriate to the organisation.
