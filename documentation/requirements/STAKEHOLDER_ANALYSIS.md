# Stakeholder Analysis
## BioSprint Engine: An Agile Orchestration and Data Provenance Platform
**Document Identifier:** DOC-REQ-STK-001  
**Target Audience:** Engineering Leads, Lab Managers, Product Team  

---

## 1. Overview
Biological research laboratories operate in multidisciplinary environments comprising wet-lab scientists, technicians, computational biologists, grant directors, and regulatory compliance officers. BioSprint Engine is designed to align with the workflows and responsibilities of these six core stakeholders.

---

## 2. Stakeholder Profiles & Matrix

```
+--------------------------+-----------------------+---------------------------------------+
| Stakeholder Role         | Influence / Interest  | Core Objectives                       |
+--------------------------+-----------------------+---------------------------------------+
| Principal Investigator   | High / High           | Project governance, grant milestones, |
|                          |                       | reproducibility, final result sign-off|
+--------------------------+-----------------------+---------------------------------------+
| Research Scientist       | High / High           | Protocol execution, parameter logging,|
|                          |                       | observation tracking, data linking    |
+--------------------------+-----------------------+---------------------------------------+
| Laboratory Technician    | Medium / High         | Specimen intake, cold-chain integrity,|
|                          |                       | cryogenic coordinate tracking, aliquots|
+--------------------------+-----------------------+---------------------------------------+
| Bioinformatics Analyst   | Medium / High         | Fastq/BAM uploads, SHA-256 integrity, |
|                          |                       | pipeline execution, analysis results  |
+--------------------------+-----------------------+---------------------------------------+
| Compliance Auditor       | High / Medium         | 21 CFR Part 11 logs, FAIR compliance, |
|                          |                       | data immutability, CSV audit export   |
+--------------------------+-----------------------+---------------------------------------+
| System Administrator     | High / Low            | Server health, storage quota, RBAC,   |
|                          |                       | backups, container orchestration      |
+--------------------------+-----------------------+---------------------------------------+
```

---

## 3. Detailed Stakeholder Needs Analysis

### 3.1 Principal Investigator (PI)
- **Pain Points:** Scattered experiment records across multiple lab notebooks; inability to trace who produced a figure or dataset for a published paper; difficulty preparing grant audit reports.
- **System Value:** High-level project dashboards with progress tracking, complete provenance inspection to trace any result back to raw data, and authoritative SOP review.
- **Key Interactions:** Projects page, Provenance DAG inspector, Reports overview.

### 3.2 Research Scientist
- **Pain Points:** Protocol deviations not recorded in real time; lost incubation/voltage parameters; difficult coordination between wet lab and computational teammates.
- **System Value:** Parameter key-value registry, live observation log with timestamps, instant binding of experiments to protocol versions.
- **Key Interactions:** Experiments page, Protocols SOP checklist, Observation log append.

### 3.3 Laboratory Technician
- **Pain Points:** Freezer overcrowding; lost vials; ambiguous sample labels; lack of parent-child lineage when sub-aliquoting.
- **System Value:** Exact cryogenic coordinate management (`-196°C`, `-80°C`, Shelf, Rack, Box, Slot), volume/concentration records, biosafety containment tags.
- **Key Interactions:** Samples page, Storage coordinate lookup, Aliquot tracking.

### 3.4 Bioinformatics Analyst
- **Pain Points:** Corrupted large NGS files during transfer; unknown sequencing read depths; undocumented pipeline parameters.
- **System Value:** Real multipart file uploads, automated SHA-256 cryptographic hashing upon ingestion, tool version recording, direct linkage between BAM/Fastq files and differential expression results.
- **Key Interactions:** Research Data upload, Analysis & Results registration.

### 3.5 Compliance Auditor
- **Pain Points:** Retroactively altered spreadsheets; missing timestamps; untracked deletions violating GLP or FDA 21 CFR Part 11.
- **System Value:** Read-only access to an immutable chronological audit trail, cryptographic checksum verification, exportable CSV/JSON audit manifests.
- **Key Interactions:** Data Provenance audit trail, Reports compliance export center.

### 3.6 System Administrator
- **Pain Points:** Unauthorized privilege escalation; runaway storage usage from genomic datasets; service downtime.
- **System Value:** Role-based access control, disk quota progress monitoring, Dockerized container deployment with healthchecks and Kubernetes scaling.
- **Key Interactions:** Settings configuration, Storage quota monitoring, Docker orchestration.
