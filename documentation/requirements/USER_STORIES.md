# Agile User Stories & Acceptance Criteria
## BioSprint Engine: An Agile Orchestration and Data Provenance Platform
**Document Identifier:** DOC-REQ-US-001  
**Methodology:** Agile Scrum / Behavior-Driven Development (BDD)  

---

## Sprint 1: Foundation & Authentication

### US-101: System Initialization with Zero State
- **As a** researcher logging into a new lab deployment,  
- **I want** the application to open with genuine empty states,  
- **So that** I know no fabricated data is mixed with our real scientific research records.
- **Acceptance Criteria (Gherkin):**
  - **Given** an unseeded production database,
  - **When** the researcher navigates to any page (Projects, Experiments, Samples, Datasets),
  - **Then** the page displays a clean empty state with a call-to-action button (e.g. "Create your first research project"),
  - **And** all dashboard metric counters read zero.

### US-102: User Authentication & Role Selection
- **As a** laboratory team member,  
- **I want** to log in securely with my credentials and role,  
- **So that** my scientific actions are attributed to my identity and permissions are enforced.
- **Acceptance Criteria:**
  - **Given** valid user credentials (email and password),
  - **When** the user submits the login form,
  - **Then** the server returns an HTTP 200 with a signed JWT token,
  - **And** the UI displays the user's name, initials, and role badge.

---

## Sprint 2: Research Projects & Experiments

### US-201: Project Creation & Parameterization
- **As a** Principal Investigator,  
- **I want** to register a new research project with code, milestones, and budget,  
- **So that** our laboratory assays can be organized under defined programs.
- **Acceptance Criteria:**
  - **Given** a PI user on the Projects page,
  - **When** the PI fills in the title, code, and lead investigator and clicks "Create Project",
  - **Then** a new record is created via `POST /api/projects`,
  - **And** an audit activity event is logged.

### US-202: Experiment Parameterization & Live Observation Logging
- **As a** Research Scientist,  
- **I want** to record key-value parameters and append timestamped notes while running an assay,  
- **So that** exact bench conditions are permanently preserved for reproducibility.
- **Acceptance Criteria:**
  - **Given** an active experiment detail view,
  - **When** the scientist enters a bench note and clicks "Log Note",
  - **Then** the note is appended with the current ISO timestamp and user identity,
  - **And** the note appears immediately in the audit trail stream.

---

## Sprint 3: Protocols & Biological Samples

### US-301: Version-Controlled SOP Management
- **As a** Senior Scientist,  
- **I want** to publish an SOP with reagents and ordered steps,  
- **So that** technicians follow standardized protocols.
- **Acceptance Criteria:**
  - **Given** an existing protocol `PROT-101` at `v3.2`,
  - **When** a scientist updates procedure steps,
  - **Then** the system prompts for revision notes and increments the version,
  - **And** previous versions remain locked and linked to historical experiments.

### US-302: Cryogenic Sample Storage Coordinates
- **As a** Laboratory Technician,  
- **I want** to log specimens with specific freezer, shelf, rack, box, and slot coordinates,  
- **So that** any researcher can locate the exact vial without thawing the inventory.
- **Acceptance Criteria:**
  - **Given** the Sample Registration form,
  - **When** the technician enters coordinate "-80°C Alpha, Shelf 2, Box 14, Slot D3",
  - **Then** the coordinate is validated and saved with temperature and aliquot counts.

---

## Sprint 4: Real Research Data & SHA-256 Checksums

### US-401: Real File Ingestion & Cryptographic Checksum
- **As a** Bioinformatics Analyst,  
- **I want** to upload raw FASTQ/BAM instrument files and obtain an automatic SHA-256 hash,  
- **So that** file integrity can be mathematically verified at any time in the future.
- **Acceptance Criteria:**
  - **Given** a real file selected in the Research Data page,
  - **When** the analyst uploads the file,
  - **Then** the server streams the file to disk, computes the SHA-256 hash,
  - **And** saves the record with genuine byte size and hash.

### US-402: Secure Dataset Download
- **As an** authorized researcher,  
- **I want** to download stored datasets from the dataset registry,  
- **So that** I can process them locally.
- **Acceptance Criteria:**
  - **Given** an existing dataset record,
  - **When** the user clicks "Download",
  - **Then** the server streams the stored file with appropriate `Content-Disposition`.

---

## Sprint 5: Analysis & Data Provenance DAG

### US-501: Interactive End-to-End Provenance Lineage
- **As a** Compliance Auditor or Principal Investigator,  
- **I want** an interactive visual graph linking Project ➔ Experiment ➔ Protocol ➔ Sample ➔ Parameters ➔ Dataset ➔ Analysis ➔ Result,  
- **So that** I can inspect every step that contributed to a scientific claim.
- **Acceptance Criteria:**
  - **Given** any experiment with associated records,
  - **When** the user navigates to the Data Provenance page,
  - **Then** the system renders an interactive 8-stage DAG,
  - **And** clicking any node reveals its deep immutable metadata in the Provenance Inspector.

### US-502: Export Provenance Compliance Manifest
- **As a** Compliance Auditor,  
- **I want** to export a signed JSON/CSV provenance manifest,  
- **So that** it can be submitted to regulatory agencies (FDA / EMA) or journal editors.
- **Acceptance Criteria:**
  - **Given** a selected experiment in Data Provenance,
  - **When** the user clicks "Export Provenance Manifest",
  - **Then** the browser downloads a structured JSON bundle containing all node hashes, timestamps, and parameters.

---

## Sprint 6: Reporting & Audits

### US-601: One-Click CSV Audit Reports
- **As a** Lab Administrator,  
- **I want** to export CSV logs of all experiments, samples, datasets, and audit trails,  
- **So that** we maintain external offline backup records.
- **Acceptance Criteria:**
  - **Given** the Reports page,
  - **When** the user clicks "Export Experiments Master Log",
  - **Then** a clean CSV file formatted according to GLP standards is generated and downloaded.
