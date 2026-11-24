# Sprint Allocation & Engineering Roadmap
## BioSprint Engine: 6-Sprint Execution Breakdown
**Document Identifier:** DOC-DEV-SPRINT-001  
**Total Story Points:** 180 Points (Avg Velocity: 30 Points / Sprint)  

---

```
+-------------------------------------------------------------------------------------------------+
| SPRINT 1: Foundation, Architecture, Zero-State & Authentication                                 |
| Goal: Establish backend server, database migrations, JWT auth, and clean zero-state baseline.  |
| Story Points: 32                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - US-101: System Initialization with Zero State (Clean empty states on all pages)      (5 pts)  |
| - US-102: JWT Authentication, Password Hashing & 6 Role Profiles                        (8 pts)  |
| - DB-001: Relational SQLite / PostgreSQL schema, tables, indices, and foreign keys      (8 pts)  |
| - API-001: Express API framework, security headers, CORS, and centralized errors        (6 pts)  |
| - DOC-001: SRS, Stakeholder Analysis, Kano, and MoSCoW Documentation                    (5 pts)  |
+-------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------+
| SPRINT 2: Research Projects & Experiment Orchestration                                          |
| Goal: Implement full CRUD, relational linking, parameter builders, and live bench observation.  |
| Story Points: 28                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - US-201: Research Project Management (Card/Table views, search, status filters)        (8 pts)  |
| - US-202: Experiment Orchestration & Protocol Version Binding                           (8 pts)  |
| - EXP-001: Dynamic Key-Value Parameter Builder (FAIR Provenance Attributes)             (5 pts)  |
| - OBS-001: Live Bench Observation Log Stream with Automatic UTC Timestamps              (7 pts)  |
+-------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------+
| SPRINT 3: Protocols & Biological Samples Repository                                            |
| Goal: Build SOP version control, procedure checklists, reagents, and cryogenic coordinates.     |
| Story Points: 30                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - US-301: Protocol SOP Versioning (v1.0, v2.0, v3.2) & Revision History Log             (8 pts)  |
| - PROT-002: Interactive Procedure Steps Checklist & Required Reagents Directory         (6 pts)  |
| - US-302: Cryogenic Sample Repository with Exact Coordinate Mapping (-196°C to 4°C)    (8 pts)  |
| - SMP-002: Aliquot Tracking, Biosafety Containment Levels, and Experiment Binding       (8 pts)  |
+-------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------+
| SPRINT 4: Real Research Data Ingestion & Cryptographic Checksums                                |
| Goal: Replace simulated uploads with streaming multipart ingestion, SHA-256, and real download.|
| Story Points: 32                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - US-401: Real Multipart File Ingestion via Multer & Disk/Cloud Storage                 (10 pts) |
| - HASH-001: Automated Streaming Cryptographic SHA-256 Checksum Calculation              (8 pts)  |
| - US-402: Secure Authenticated File Download with Proper Content-Disposition            (6 pts)  |
| - VAL-001: Multi-Format Scientific File Validation (FASTQ, BAM, HDF5, CSV, mzML)        (8 pts)  |
+-------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------+
| SPRINT 5: Computational Analysis & Data Provenance DAG Engine                                   |
| Goal: Implement relational DAG traversal, clickable node inspector, and manifest exports.      |
| Story Points: 34                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - ANA-001: Computational Pipeline Tracker with Software Versioning & Results            (8 pts)  |
| - US-501: Relational Provenance DAG Traversal Engine (Project -> ... -> Result)         (12 pts) |
| - INSP-001: Interactive Provenance Inspector Panel & Dual DAG / Timeline Views          (8 pts)  |
| - US-502: Exportable Cryptographic JSON Provenance Manifest (21 CFR Part 11)           (6 pts)  |
+-------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------+
| SPRINT 6: Reporting, QA Testing, Docker & Kubernetes Deployment                                 |
| Goal: Build automated test suite, Docker containerization, Kubernetes manifests, and docs.      |
| Story Points: 24                                                                Status: COMPLETE|
+-------------------------------------------------------------------------------------------------+
| - REP-001: One-Click CSV Regulatory Audit Manifests Generator                           (5 pts)  |
| - TEST-001: Automated Unit & Integration Tests Suite (Backend & Traversal)               (7 pts)  |
| - DOCK-001: Production Multi-Container Dockerfile & Docker Compose with PostgreSQL      (5 pts)  |
| - KUBE-001: Production Kubernetes Manifests (Namespace, Deployments, PVC, Ingress)      (4 pts)  |
| - MOB-001: Capacitor Android Configuration & Mobile Viewport Polish                     (3 pts)  |
+-------------------------------------------------------------------------------------------------+
```
