# MoSCoW Requirements Prioritization Matrix
## BioSprint Engine: Product Release Scope & Roadmap
**Document Identifier:** DOC-REQ-MOSCOW-001  
**Release Target:** Release 1.0 (Production Core)  

---

## 1. MoSCoW Methodology & Criteria

Features are evaluated against core operational viability, regulatory compliance (FAIR & GLP), engineering feasibility, and developmental runway:

- **Must Have (M):** Non-negotiable capabilities essential for the system to function as a scientific workflow engine. Failure to deliver any of these invalidates release.
- **Should Have (S):** High-priority capabilities that significantly improve the platform's utility, integrity, and user experience, but have temporary manual workarounds if delayed.
- **Could Have (C):** Desirable enhancements scheduled if time and resources permit, providing incremental productivity or visual polish.
- **Won't Have (W) [Current Release]:** Out-of-scope capabilities formally deferred to future development phases (e.g. Release 2.0).

---

## 2. MoSCoW Prioritization Matrix

| Feature / Requirement | Category | Module | Architectural Justification |
|---|:---:|---|---|
| **Persistent Relational Database & Migrations** | **Must Have** | Backend / DB | Required to store scientific records permanently across sessions and users. |
| **Clean Zero-State Initialization** | **Must Have** | System Wide | Essential to prevent synthetic records from polluting production lab data. |
| **Research Project CRUD & Linking** | **Must Have** | Projects | Core relational anchor for all downstream experiments and grants. |
| **Experiment Parameterization & Status Tracking** | **Must Have** | Experiments | Primary workflow activity of lab scientists. |
| **Protocol SOP Versioning & Step Definition** | **Must Have** | Protocols | Baseline reproducibility requirement for all executed procedures. |
| **Cryogenic Sample Storage Coordinates** | **Must Have** | Samples | Essential for laboratory physical inventory tracking. |
| **Real Multipart File Uploads & Storage** | **Must Have** | Research Data | Fundamental for research data ingestion; simulated uploads are unacceptable. |
| **Automated SHA-256 Checksum Calculation** | **Must Have** | Research Data | Mandatory for scientific data integrity and file immutability verification. |
| **Relational Data Provenance Graph (DAG)** | **Must Have** | Provenance | Core project identity: end-to-end traceability from Project to Result. |
| **Immutable 21 CFR Part 11 Audit Trail** | **Must Have** | Compliance | Regulatory requirement for non-repudiation of laboratory modifications. |
| **JWT Authentication & Server-Side RBAC** | **Must Have** | Security | Enforces access boundaries across the 6 laboratory user roles. |
| **One-Click Regulatory CSV Export** | **Must Have** | Reports | Required for external offline audits and paper supplementary information. |
|---|---|---|---|
| **Interactive Provenance Inspector Panel** | **Should Have** | Provenance | Significantly improves provenance usability by inspecting deep node metadata without leaving the graph. |
| **Live Bench Observation Notes Stream** | **Should Have** | Experiments | Enables scientists to append real-time bench notes with auto-timestamps during an assay. |
| **Secure Authenticated Dataset Downloads** | **Should Have** | Research Data | Allows researchers to retrieve stored raw files directly from the web client. |
| **Throughput Visual Analytics (Recharts)** | **Should Have** | Dashboard | Provides PIs and lab directors immediate visual insight into laboratory productivity. |
| **Multi-Facet Search & Status Filtering** | **Should Have** | System Wide | High utility for finding samples and experiments as inventory scales past 500 records. |
|---|---|---|---|
| **JSON Provenance Compliance Manifest Export** | **Could Have** | Provenance | Provides programmatic machine-readable export for external bio-repositories. |
| **Docker Compose Multi-Container Orchestration** | **Could Have** | DevOps | Simplifies deployment for institutional on-premises lab servers. |
| **Kubernetes Production Cluster Manifests** | **Could Have** | DevOps | Prepares the platform for enterprise cloud scaling across multi-tenant environments. |
| **Capacitor Mobile PWA Configuration** | **Could Have** | Mobile | Extends access to bench technicians on Android tablets and smartphones. |
|---|---|---|---|
| **Direct LIMS Instrument Hardware Drivers** | **Won't Have** | Hardware | Direct RS-232 / USB communication with thermal cyclers or mass spectrometers is out of scope for Release 1.0. |
| **Automated AI Hypothesis Generation** | **Won't Have** | AI / ML | Generative AI text synthesis for experimental findings is excluded to prevent scientific hallucinations. |
| **Full Electronic Signatures with PKI Smartcards** | **Won't Have** | Compliance | Smartcard PKCS#11 hardware integration is deferred to Release 2.0 enterprise tier. |

---

## 3. Requirement-to-Module Traceability Summary

```
+-----------------------------------------------------------------------------------+
| MoSCoW Tier  | Total Features | % of Release 1.0 Scope | Implementation Status     |
+--------------+----------------+------------------------+---------------------------+
| Must Have    | 12             | 52%                    | 100% In Progress / Target |
| Should Have  | 5              | 22%                    | 100% Target               |
| Could Have   | 4              | 17%                    | 100% Target               |
| Won't Have   | 3              | 9%                     | Deferred to Release 2.0   |
+-----------------------------------------------------------------------------------+
```
