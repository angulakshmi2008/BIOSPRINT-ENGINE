# Verification and Validation Test Plan
## BioSprint Engine: Automated Quality Assurance Strategy
**Document Identifier:** DOC-TEST-PLAN-001  
**Scope:** Unit Testing, Integration Testing, End-to-End Workflow Testing, Security Verification, and Performance Benchmarking  

---

## 1. Testing Objectives & Strategy

The QA strategy ensures the software functions as a certified research orchestration tool:
1. **Unit Testing:** Validate isolated business logic (e.g. SHA-256 calculation, provenance traversal algorithm, validation rules).
2. **Integration Testing:** Verify API endpoints, relational database persistence, transactions, and real file uploads.
3. **End-to-End (E2E) Testing:** Verify the complete research workflow from Project Creation to Certified Result and Provenance DAG rendering.
4. **Security Testing:** Verify JWT enforcement, RBAC permission denial for unauthorized roles, and input sanitization.
5. **Data Integrity Testing:** Confirm zero fake records in production baseline, and verify that actual files on disk match their stored SHA-256 digests.

---

## 2. Test Cases Specification

### 2.1 Authentication & RBAC Test Cases
- **TC-SEC-01 (Login Success):** Verify valid credentials return a signed JWT token and user profile.
- **TC-SEC-02 (Login Rejection):** Verify invalid password returns `401 Unauthorized`.
- **TC-SEC-03 (RBAC Enforcement):** Verify a user with `ROLE_TECH` receives `403 Forbidden` when attempting to delete a Research Project (`ROLE_PI` only).

### 2.2 Relational Entity CRUD Test Cases
- **TC-PRJ-01 (Project Creation):** Create a project via `POST /api/projects`, verify it persists in the database.
- **TC-EXP-01 (Experiment Binding):** Create an experiment linked to a project and protocol version, verify foreign key integrity.
- **TC-EXP-02 (Bench Observation Append):** Append timestamped observation note, verify it appears in chronological audit stream.
- **TC-PROT-01 (Protocol Versioning):** Update protocol steps, verify version increments and historical revision record is created.
- **TC-SMP-01 (Sample Registration):** Register specimen with coordinate `-80°C Alpha, Box 14`, verify storage coordinate persistence.

### 2.3 Real File Upload & Checksum Test Cases
- **TC-DAT-01 (Real File Ingestion):** Upload an actual file via multipart form, verify file is written to `server/uploads/`.
- **TC-DAT-02 (SHA-256 Verification):** Calculate SHA-256 of the stored file on disk, compare against stored checksum, verify exact match.
- **TC-DAT-03 (Secure File Download):** Request `GET /api/datasets/:id/download` with valid token, verify received file binary matches original upload.

### 2.4 Provenance Traversal Test Cases
- **TC-PRV-01 (DAG Traversal):** Call `GET /api/provenance/:expId`, verify returned graph contains all 8 stages (Project, Experiment, Protocol, Sample, Parameters, Dataset, Analysis, Result) with valid directional edges.
- **TC-PRV-02 (Manifest Generation):** Verify export manifest contains valid JSON with canonical cryptographic proofs.
