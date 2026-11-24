# Requirement Traceability Matrix (RTM)
## BioSprint Engine: End-to-End Verification & Validation
**Document Identifier:** DOC-REQ-RTM-001  

---

| User Need ID | SRS Req ID | Module / Component | Implementation File(s) | Verification Test Case | Status |
|:---:|:---:|:---:|---|---|:---:|
| **UN-01** | FR-DSH-001, FR-DSH-002 | Dashboard & Metrics | `src/pages/Dashboard.jsx`, `server/src/routes/reports.js` | `TC-DSH-01`, `TC-DSH-02` | Verified |
| **UN-02** | FR-PRJ-001, FR-PRJ-004 | Projects Management | `src/pages/Projects.jsx`, `server/src/routes/projects.js` | `TC-PRJ-01`, `TC-PRJ-02` | Verified |
| **UN-03** | FR-EXP-001, FR-EXP-004 | Experiment Orchestration | `src/pages/Experiments.jsx`, `server/src/routes/experiments.js` | `TC-EXP-01`, `TC-EXP-02` | Verified |
| **UN-04** | FR-PROT-001, FR-PROT-003 | SOP Versioning | `src/pages/Protocols.jsx`, `server/src/routes/protocols.js` | `TC-PROT-01` | Verified |
| **UN-05** | FR-SMP-001, FR-SMP-002 | Sample Coordinates | `src/pages/Samples.jsx`, `server/src/routes/samples.js` | `TC-SMP-01`, `TC-SMP-02` | Verified |
| **UN-06** | FR-DAT-001, FR-DAT-002 | Real File Upload & SHA-256 | `src/pages/ResearchData.jsx`, `server/src/routes/datasets.js` | `TC-DAT-01`, `TC-DAT-02` | Verified |
| **UN-07** | FR-ANA-001, FR-ANA-003 | Computational Analysis | `src/pages/AnalysisResults.jsx`, `server/src/routes/analyses.js` | `TC-ANA-01` | Verified |
| **UN-08** | FR-PRV-001, FR-PRV-003 | Provenance DAG Engine | `src/pages/DataProvenance.jsx`, `server/src/routes/provenance.js` | `TC-PRV-01`, `TC-PRV-02` | Verified |
| **UN-09** | FR-REP-001, FR-REP-002 | Reports & CSV Export | `src/pages/Reports.jsx`, `server/src/routes/reports.js` | `TC-REP-01` | Verified |
| **UN-10** | NFR-SEC-001, NFR-SEC-003 | Security & Server RBAC | `server/src/middleware/auth.js`, `server/src/routes/auth.js` | `TC-SEC-01`, `TC-SEC-02` | Verified |
| **UN-11** | NFR-SEC-005 | 21 CFR Part 11 Audit Trail | `server/src/routes/auditLogs.js`, `src/components/layout/TopNavbar.jsx` | `TC-AUD-01` | Verified |
| **UN-12** | NFR-REL-002 | Database Persistence & Migrations | `server/src/db/migrate.js`, `server/src/db/index.js` | `TC-DB-01` | Verified |
