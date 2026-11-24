# Software Requirements Specification (SRS)
## BioSprint Engine: An Agile Orchestration and Data Provenance Platform for Reproducible Laboratory Workflows
**Document Identifier:** SRS-2026-BS-V1.0  
**Status:** Approved for Implementation  
**Standard Compliance:** IEEE 830-1998 / ISO/IEC/IEEE 29148:2018  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **BioSprint Engine** platform. It provides a comprehensive description of functional behavior, data provenance models, non-functional constraints, external interfaces, and security controls required to deliver a verifiable, production-grade laboratory workflow management system.

### 1.2 Scope
BioSprint Engine manages the complete lifecycle of biological laboratory research:
- Structuring multi-disciplinary research projects and budgets.
- Protocol Standard Operating Procedure (SOP) versioning and reagents tracking.
- Cryogenic and ambient biological specimen tracking with exact storage coordinates.
- Parameterized assay execution with live observation logs.
- Cryptographically sealed research dataset ingestion (FASTQ, BAM, HDF5, mzML, CSV).
- Computational pipeline analysis tracking with reproducible software versioning.
- Certified experimental results logging.
- Relational Data Provenance Graph (DAG) construction compliant with FAIR data principles and FDA 21 CFR Part 11 integrity standards.
- Regulatory audit logging and one-click compliance CSV/JSON exports.

### 1.3 Definitions, Acronyms, and Abbreviations
- **DAG:** Directed Acyclic Graph.
- **FAIR:** Findable, Accessible, Interoperable, Reusable scientific data principles.
- **GLP:** Good Laboratory Practice.
- **21 CFR Part 11:** FDA regulations for electronic records and electronic signatures.
- **SOP:** Standard Operating Procedure.
- **SHA-256:** Secure Hash Algorithm 256-bit cryptographic digest.
- **RBAC:** Role-Based Access Control.
- **PI:** Principal Investigator.

---

## 2. Overall Description

### 2.1 Product Perspective
BioSprint Engine operates as a self-contained, full-stack client-server platform. It replaces disparate spreadsheets and lab notebooks with an integrated, API-driven relational database and interactive web interface.

```
+-------------------------------------------------------------------------+
|                          BioSprint Engine Frontend                      |
| (React SPA / Tailwind CSS / Recharts / Lucide / Provenance DAG View)    |
+------------------------------------+------------------------------------+
                                     | HTTP/REST (JSON + FormData)
+------------------------------------+------------------------------------+
|                         Node.js / Express API Server                    |
|  - JWT Authentication Middleware    - RBAC Authorization Engine         |
|  - Relational Provenance Engine     - Multer File Storage & SHA-256 Hash|
|  - Immutable Audit Logger           - Reports & CSV Export Engine       |
+------------------------------------+------------------------------------+
                                     | SQL / Parameterized Queries
+------------------------------------+------------------------------------+
|                  Relational Database Storage Layer                      |
|       (SQLite for Local Windows / PostgreSQL for Docker & Cloud)        |
+-------------------------------------------------------------------------+
```

### 2.2 User Classes and Characteristics
The system defines 6 specialized laboratory user roles:
1. **Principal Investigator (PI):** Project governance, milestone approval, global provenance review.
2. **Research Scientist:** Experiment design, parameter calibration, observation recording, dataset linking.
3. **Laboratory Technician:** Sample intake, cold storage coordinate allocation, aliquot tracking.
4. **Bioinformatics Analyst:** Dataset ingestion, pipeline parameterization, output metric validation.
5. **Compliance Auditor:** Read-only inspection of immutable audit trails, SHA-256 hashes, and regulatory exports.
6. **System Administrator:** User provisioning, role assignment, policy enforcement, storage quotas.

### 2.3 Operating Environment
- **Client Platforms:** Modern evergreen web browsers (Chrome, Edge, Firefox, Safari) on Windows, macOS, Linux, and Android viewports.
- **Server Environment:** Node.js v18+ runtime on Windows or Linux container.
- **Database Engine:** SQLite 3 (zero-dependency local development) and PostgreSQL 15+ (production container/cloud).

---

## 3. Specific Functional Requirements

### 3.1 Module 1 — Dashboard & Metrics
- **FR-DSH-001:** The system shall display zero-state counters when no records exist.
- **FR-DSH-002:** The system shall compute real-time metrics dynamically from database records: Active Projects, Active Experiments, Tracked Samples, Stored Datasets, and Validated Results.
- **FR-DSH-003:** The system shall render an assay throughput bar chart and experiment status breakdown chart using Recharts.
- **FR-DSH-004:** The system shall stream the latest audit events and display upcoming experiment deadlines.

### 3.2 Module 2 — Research Project Management
- **FR-PRJ-001:** Users shall be able to register new research projects with title, code, description, lead investigator, department, timeline, and budget.
- **FR-PRJ-002:** The system shall support switching between card and table view layouts.
- **FR-PRJ-003:** The system shall provide search and filter capabilities by status and title.
- **FR-PRJ-004:** Users shall be able to edit metadata and view connected experiments.

### 3.3 Module 3 — Experiment Management
- **FR-EXP-001:** Users shall register experiments linked to a parent project and an approved protocol SOP.
- **FR-EXP-002:** The system shall enforce protocol version locking at experiment registration time.
- **FR-EXP-003:** Users shall record key-value experimental parameters (e.g. voltage, temperature, concentration).
- **FR-EXP-004:** Users shall append timestamped bench observation notes to an immutable log.
- **FR-EXP-005:** The system shall provide a direct link from an experiment to its interactive Data Provenance DAG.

### 3.4 Module 4 — Protocol & SOP Management
- **FR-PROT-001:** Users shall create version-tagged laboratory protocols (`v1.0`, `v2.0`).
- **FR-PROT-002:** Users shall define ordered procedural steps and required reagents with catalog numbers and storage conditions.
- **FR-PROT-003:** Updating an active protocol shall create an explicit revision entry in the audit history.
- **FR-PROT-004:** The system shall prevent retroactive tampering of protocols linked to completed experiments.

### 3.5 Module 5 — Biological Sample Management
- **FR-SMP-001:** Users shall register biological specimens with unique alphanumeric IDs.
- **FR-SMP-002:** The system shall record exact storage coordinates (Freezer unit, shelf, rack, box, slot) and temperature (`-196°C`, `-80°C`, `-20°C`, `4°C`).
- **FR-SMP-003:** The system shall track volume, concentration, aliquot counts, and Biosafety Level (`BSL-1`, `BSL-2`, `BSL-3`).
- **FR-SMP-004:** Samples shall be associateable with specific experiments and research projects.

### 3.6 Module 6 — Research Data & Real File Ingestion
- **FR-DAT-001:** The system shall accept real file uploads via HTTP multipart `POST` requests.
- **FR-DAT-002:** The system shall stream the uploaded file and automatically calculate a 64-character SHA-256 cryptographic checksum.
- **FR-DAT-003:** The system shall store the file on disk or object storage and save metadata (size, format, depositor, timestamp) in the database.
- **FR-DAT-004:** The system shall allow authorized users to download the actual stored dataset files.
- **FR-DAT-005:** The system shall support validation of file formats: FASTQ, BAM, HDF5, CSV, XLSX, mzML, TAR.GZ.

### 3.7 Module 7 — Analysis & Results
- **FR-ANA-001:** Users shall log computational analysis pipeline runs with tool version and execution parameters.
- **FR-ANA-002:** Analyses shall link input datasets with their originating experiments.
- **FR-ANA-003:** Users shall log certified experimental findings with primary/secondary metrics and reproducibility scores.

### 3.8 Module 8 — Data Provenance Engine
- **FR-PRV-001:** The system shall implement a relational provenance query that dynamically builds a Directed Acyclic Graph (DAG) for any selected experiment:
  $$\text{Project} \longrightarrow \text{Experiment} \longrightarrow \text{Protocol} \longrightarrow \text{Samples} \longrightarrow \text{Parameters} \longrightarrow \text{Dataset} \longrightarrow \text{Analysis} \longrightarrow \text{Result}$$
- **FR-PRV-002:** The interface shall support both visual DAG node flow and chronological audit trail modes.
- **FR-PRV-003:** Clicking any node in the graph shall populate an interactive Provenance Inspector showing immutable metadata, hashes, and timestamps.
- **FR-PRV-004:** The system shall export a complete cryptographic JSON Provenance Manifest.

### 3.9 Module 9 — Reports & Compliance Exports
- **FR-REP-001:** The system shall generate summary statistics for projects, experiments, samples, and data volume.
- **FR-REP-002:** The system shall provide one-click CSV exports for Experiments, Samples, Datasets, and the 21 CFR Part 11 Audit Trail.

### 3.10 Module 10 — Settings & Administration
- **FR-SET-001:** Users shall manage researcher profiles (Name, Title, ORCID iD, Email).
- **FR-SET-002:** Administrators shall configure laboratory defaults (freezer temps, NGS Q30 thresholds, auto-hashing).
- **FR-SET-003:** The system shall display actual disk/database quota usage.
- **FR-SET-004:** The system shall provide a reset mechanism with confirmation dialogs.

---

## 4. Non-Functional Requirements

### 4.1 Security Requirements
- **NFR-SEC-001:** Passwords must be hashed using `bcrypt` with a minimum work factor of 10.
- **NFR-SEC-002:** Authentication tokens must be JSON Web Tokens (JWT) signed with a secure secret and expire in 24 hours.
- **NFR-SEC-003:** The API must implement role-based access control (RBAC) enforced on the server.
- **NFR-SEC-004:** Uploaded files must be validated for file size (max 500 MB) and sanitized against path traversal attacks.
- **NFR-SEC-005:** All mutation operations (create, update, delete) must be recorded in an immutable audit log table.

### 4.2 Performance Requirements
- **NFR-PRF-001:** API responses for relational queries must return within 200 ms under normal load.
- **NFR-PRF-002:** Provenance graph traversal must complete in under 150 ms for an 8-stage lineage.
- **NFR-PRF-003:** Frontend client bundle size must remain under 1 MB compressed.

### 4.3 Reliability & Reproducibility
- **NFR-REL-001:** Cryptographic SHA-256 checksums must allow 100% verification of raw data file integrity.
- **NFR-REL-002:** Database constraints (Foreign Keys with cascade/set null rules) must prevent orphaned records.
