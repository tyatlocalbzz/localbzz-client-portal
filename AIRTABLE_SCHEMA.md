# Airtable Base Schema

**Base ID:** appovPmfaZS6JKOCr
**Last Updated:** 6/14/2025, 1:04:12 PM
**Tables Count:** 7

## Clients

**Table ID:** `tblSKxOOB2SrEPI1V`
**Fields:** 34

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Client Name | singleLineText | `fldkIDpIJxMq9siG6` | - |
| Status | singleSelect | `fld7Imr4GrrWENSDe` | - |
| Primary Contact Name | singleLineText | `fldClpvmf5ViSKLx2` | - |
| Primary Contact Email | email | `fldtcUkMFiA2WcTX5` | - |
| Primary Contact Phone | phoneNumber | `fldSlGCJhdB62nNly` | - |
| Default Shoot Location | singleLineText | `fldPFwcmq9aoOxiFI` | - |
| Services | multipleSelects | `fldBJqDIOgMI4lTuo` | - |
| Shoot Frequency | singleSelect | `fld8JlsvKGnnJxX5V` | Bi-Monthly |
| _FrequencyInDays | formula | `fldZRCA13LQVH5aXe` | - |
| Default Reel Count | number | `fldJor0zoFJvMGFWQ` | - |
| Default Photo Count | number | `fldOr3P8Z1EgIYQiU` | - |
| Default Carousel Count | number | `fldBRhzQKLjuzPgyu` | - |
| ClientFolderCreationStatus | singleSelect | `fldZnCcTaWTTFWbDf` | - |
| MainClientDriveFolderID | singleLineText | `fldrCODxXgPCVDKzl` | - |
| ContentFolderID | singleLineText | `fldMooIx65lBaEFCV` | - |
| AdminFolderID | singleLineText | `fldoz2b2WgXe7H7RP` | - |
| StrategyFolderID | singleLineText | `fldkRBAEwza8kFLcB` | - |
| Ready-To-PostFolderID | singleLineText | `flddHz3hESlXAREhz` | - |
| Notes | multilineText | `fldvRCs56iiq1iWi1` | - |
| Contract | multipleAttachments | `fldFlAUXMq2Thcekn` | - |
| ContractUploadStatus | singleSelect | `fld0okmbj2iqC2jtH` | - |
| Contract Link | url | `fld4zNzSOxAAFa98G` | - |
| Thumbnail Logo | multipleAttachments | `fldXThtgcndaRfDg8` | - |
| Shoots | multipleRecordLinks | `fldJTkK6rIwUlSAcl` | - |
| _LastShootDate | rollup | `fldE1UpzLDJWwcZvE` | - |
| _NextTheoreticalShootDate | formula | `fldDWvKStWsLmWrAh` | - |
| _SchedulingWindowStart | formula | `fldyDWN98OVtqHwVa` | - |
| _UpcomingShootsCount | rollup | `fldvvznCJrpCdWFw4` | - |
| ActionNeeded: Schedule Shoot? | formula | `fldhDIu9QTUq6EL9z` | - |
| Deliverables | multipleRecordLinks | `fld91L2YLfJBHrBTa` | - |
| Tasks | multipleRecordLinks | `fld1RGrQf4pesliui` | - |
| Client Portal Subdomain | singleLineText | `fldntpXLNlbgHBUIs` | - |
| ClientID_Airtable | formula | `fldaoQjJPJsEC3wpI` | - |
| Client Portal | multipleRecordLinks | `fldKNkI8C8USAVKfP` | - |

## Team Members

**Table ID:** `tblk433XjuVlgp1Kq`
**Fields:** 10

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Name | singleLineText | `fld1ElkHzuCg7hjFZ` | - |
| TeamMemberID | formula | `fldYeMkb2kqZCB9C6` | - |
| Email | email | `fldy5nbAbdj7etkIA` | - |
| Roles | multipleSelects | `fldToOU6L3lNsTPdE` | - |
| Phone | phoneNumber | `fldfSeIGYAiIgwzIo` | - |
| Deliverables | multipleRecordLinks | `fldZxZfeEKCmrzWGp` | - |
| Shoots | multipleRecordLinks | `fldbGQMSkjwKsqJdK` | - |
| Shoots 2 | multipleRecordLinks | `fldwGDwolnGSRlMSV` | - |
| Deliverables 2 | multipleRecordLinks | `fldSpILeydlZOgcMn` | - |
| Tasks | multipleRecordLinks | `fldok347WYttVWGof` | - |

## Shoots

**Table ID:** `tblIcLzkF1zhPU4gk`
**Fields:** 31

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Shoot Title | formula | `fldKbw9Cu7sts80xg` | - |
| Client Link | multipleRecordLinks | `fldXHls1LvlgAdWGu` | - |
| Shoot Start | dateTime | `fldGCiisBSflyXjHE` | - |
| Duration | duration | `fldL2F0xph5jqbPIC` | - |
| Shoot End | formula | `fldpYBPQZnweMnqBB` | - |
| Location | formula | `fldsFvHFR6AwMif7Q` | - |
| Status | singleSelect | `fldk6GrcMpJs5HIoN` | - |
| Primary Creator | multipleRecordLinks | `fldeO3Oz1ViLHnrOT` | - |
| _PrimaryCreatorEmailLookup | multipleLookupValues | `fld25XKVCCi3iBnsC` | - |
| Other Team Members | multipleRecordLinks | `fldMZyqLAwfhkWUgl` | - |
| _OtherTeamMemberEmailsLookup | multipleLookupValues | `fldi3nyeHbwqCL3k4` | - |
| _AllShootMemberEmailsRollup | formula | `fldA2TWd2NU2FrLm7` | A formula field that rolls up the email addresses of the primary creator and other team members associated with the shoot |
| Notes | multilineText | `fldIl8cRaSjf8P0Cr` | - |
| Calendar Event Link | url | `fld3ejB8jPSqChW0O` | - |
| Drive Folder Link | url | `fldA9Qas1AtOTdTKN` | - |
| GoogleCalendarEventID | singleLineText | `fldFtWSIv90JaNDc3` | - |
| Deliverables | multipleRecordLinks | `fldgmhUXULMhSZtvc` | - |
| Create Default Deliverables? | checkbox | `fldS1LU7zmzqArx4I` | - |
| Use Default Location | checkbox | `fld1R7dYRcJu7fwRj` | - |
| Master Calendar | singleLineText | `fldWJvppkZypPps6H` | - |
| ShootID_Airtable | formula | `fldcrNpTj444Xgvfc` | - |
| Client Portal Subdomain (from Client Link) | multipleLookupValues | `fldUJSpJvAPUW6Ega` | - |
| Primary Contact Email (from Client Link) | multipleLookupValues | `fldG8dqfA0NE9TGXk` | - |
| Primary Contact Phone (from Client Link) | multipleLookupValues | `fldyocPmdxY7Qv5Ny` | - |
| _ClientDefaultLocationLookup | multipleLookupValues | `fldYlFEIKpKhDQmjE` | - |
| ShootDriveFolderID | singleLineText | `fldVIyfV2Brd4JLqN` | - |
| _ContentShootsFolderLookup | multipleLookupValues | `fldTn35pBgOcNRblX` | - |
| _ClientFolderID | multipleLookupValues | `fldWPaFVU0lfipsNQ` | - |
| _ClientNameLookup | multipleLookupValues | `fldZGoswsIqpILQuJ` | - |
| Shoot Specific Location | singleLineText | `fld6gDeqZKxHIy9eG` | - |
| Tasks | multipleRecordLinks | `fldYsvTqmjWNISoSD` | - |

## Deliverables

**Table ID:** `tblACm9VZZbgUFz36`
**Fields:** 28

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Deliverable Title | formula | `fldNXkUDZ0JQJhfBA` | Generates a title for the deliverable by combining the client name and the deliverable type, or using a default 'Untitled Deliverable' if either is missing. |
| Shoot | multipleRecordLinks | `fldm4BztxFZbRYVE5` | - |
| Drive Folder ID (from Shoot) | multipleLookupValues | `fldiR56gu9TzDDnNA` | - |
| Notes | multilineText | `fld5qUPktanG5GqrU` | - |
| Client | multipleRecordLinks | `fldZx1matIx2U8p8g` | - |
| Services (from Client) | multipleLookupValues | `fldnn3NkBfbKb9jx0` | - |
| Main Drive Folder ID (from Client) | multipleLookupValues | `fldd2Q7W3kFmRONKu` | - |
| Content Shoots Folder ID (from Client) | multipleLookupValues | `fldqsfWHmGp5PvLv0` | - |
| Deliverable Type | singleSelect | `fld3vKeXqu5ysSxku` | - |
| Status | singleSelect | `fldLOeWN58vCq9lk5` | - |
| Assigned To | multipleRecordLinks | `fldEGPvK4Y1In25LI` | - |
| Email (from Assigned To) 2 | multipleLookupValues | `fldRguusWR4rtxRpi` | - |
| Due Date | dateTime | `fldAnEKOq4kPgwRsY` | - |
| File Link | url | `fldHdJrCQfTdnTrqB` | - |
| Initial Assignee (Creator) | multipleRecordLinks | `fldX9ToUHBiBFkl6C` | - |
| Created | createdTime | `fld6GdNNCgSg6EvWa` | - |
| Last Modified | lastModifiedTime | `fldd9EPXwZxxKkiZp` | - |
| Last Modified Time of Assigned To | lastModifiedTime | `fldRhdJ9fmc46zMg4` | - |
| DeliveryFolderCreationStatus | singleSelect | `fld19mNVJAXj2IpcF` | - |
| Caption | multilineText | `fld9HFxhVxKWH0tFv` | - |
| Posting Instructions | multilineText | `fldP40xqzdrXBs5HV` | - |
| Shared with Client Date | dateTime | `fldPvLdsPclI86g9I` | - |
| Tasks | multipleRecordLinks | `fldPyistqtnqU7K8Z` | - |
| Master Calendar | singleLineText | `fldkm4rHdxFeq8z4J` | - |
| DeliverableID_Airtable | formula | `fld7EbJZmAPJpPeKM` | - |
| Email (from Assigned To) | multipleLookupValues | `fldlnJc4tT4O0gEtF` | - |
| _ShootTitleFromLink | multipleLookupValues | `fldXDjUZ35FdtrTCQ` | - |
| _ClientNameFromLink | multipleLookupValues | `fld9MZktmMXJttOQ4` | - |

## Form Submissions

**Table ID:** `tblxfY787gsAKnx0d`
**Fields:** 12

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Email | email | `fldJakEvOKmYe2fGu` | - |
| Request ID | autoNumber | `fldHKibKtiF4OBr30` | - |
| Name | singleLineText | `fldI4JnzBLy8UOsru` | - |
| Form Name | singleLineText | `fldNUKhd6wInbBn1D` | - |
| Business Name | singleLineText | `fldbbgvPtv9JR8EnI` | - |
| Business URL | url | `fldnpK6OxrPsmkw0I` | - |
| Marketing Goals | multilineText | `fldiTpuTRNcrQEZEA` | - |
| How did you hear about us? | singleLineText | `fldOwvLG2BtF2UoE2` | - |
| Assignee | singleCollaborator | `fldDqU5KILiSEeqfj` | - |
| Approval Status | singleSelect | `fldvKcvc8CEJhgt3N` | - |
| Created | createdTime | `fldTPkFrpEE4wm2bD` | - |
| Booking Link | url | `fldfAKI7cCEdSGzpZ` | - |

## Tasks

**Table ID:** `tblrh5aJSZwYhajpp`
**Fields:** 23

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| Task Name | singleLineText | `fldprQk15xhPMYR6T` | - |
| Assigned To | multipleRecordLinks | `fldQeNZbY6wOiGqyO` | - |
| Due Date | date | `fldhmptodjnX7na6c` | - |
| Status | singleSelect | `fld6LN2JscsOCf3pG` | - |
| Time Started In Progress | dateTime | `fldO6IbDj71Yt9H2U` | - |
| Time Completed | dateTime | `fldjjOuygGswy3VIZ` | - |
| Time Spent (minutes) | formula | `fld6mJbN6JMx7D8eo` | - |
| Time Spent (Formatted) | formula | `fldaICkmqBCAYjsUK` | - |
| Work Started By | singleCollaborator | `fldAyYpqRcISIUYBD` | - |
| Work Completed By | singleCollaborator | `fldAhhTxffWEFyLK8` | - |
| Task Assigned By | singleCollaborator | `fldfScHaQztv1I7Zk` | - |
| Priority | singleSelect | `fldvD2sB79G0VZNvl` | - |
| Description/Notes | multilineText | `fldXiUylJXdSMlyvb` | - |
| Related Client | multipleRecordLinks | `fld9UIAR9qAGkLhR0` | - |
| Related Shoot | multipleRecordLinks | `fldiILfocPHmQOcZA` | - |
| Related Deliverable | multipleRecordLinks | `fldyrya9vfYhElQ0x` | - |
| Created Date | createdTime | `fldEnLVBkTC11FcYI` | - |
| Completed Date | date | `fldQTsYUZzX1J7fwR` | - |
| _AssignedToEmailLookup | multipleLookupValues | `fldDUKGhm7Mcgcagk` | - |
| Attachments | multipleAttachments | `fldSfRsxsLPd8ionx` | - |
| Last Modified | lastModifiedTime | `fldUNodLh2suAUoJ7` | - |
| Last Modified By | lastModifiedBy | `fldFNcJnru5exGLn2` | - |
| Master Calendar | singleLineText | `fldIHXqur0BkbWV2k` | - |

## Client Portal

**Table ID:** `tblSasZtTICsNl4GU`
**Fields:** 11

| Field Name | Type | ID | Notes |
|------------|------|-------|-------|
| ID | autoNumber | `fldOPSPDTv8d70nnI` | - |
| Client | multipleRecordLinks | `fldSVGUgPZfJq7jnv` | - |
| Content | multilineText | `fldbeiTbmw35onEKW` | - |
| Type | singleSelect | `fldrj2JUSbRaNpk1M` | - |
| Priority | singleSelect | `fldbIpq46ALFrflzL` | - |
| Topic | singleSelect | `fldhEVv3WcWSWf820` | - |
| Date | createdTime | `fldtyDO9RgeWvZGF2` | - |
| Client Portal Subdomain | singleLineText | `fldqBmNcay0D5mvv6` | - |
| Status | singleSelect | `fldi9tZxe4GYRtPQ9` | - |
| Voice Memo | multipleAttachments | `fld8jPr33LJOwNpRb` | - |
| Transcription Status | singleSelect | `fldYqev1TQSwHlI6q` | - |

