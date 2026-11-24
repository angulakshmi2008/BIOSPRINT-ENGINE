# RESTful API Documentation
## BioSprint Engine: Backend Interface Specification
**Document Identifier:** DOC-ARCH-API-001  
**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** `Authorization: Bearer <JWT_TOKEN>`  
**Response Format:** Standardized JSON (`{ success: boolean, data?: any, error?: string, message?: string }`)  

---

## 1. Authentication Endpoints

### 1.1 Login User
- **Method:** `POST /auth/login`
- **Permitted Roles:** Public
- **Request Body:**
  ```json
  {
    "email": "e.rostova@biosprint.org",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "USR-001",
      "email": "e.rostova@biosprint.org",
      "fullName": "Dr. Elena Rostova",
      "role": "Principal Investigator",
      "department": "Molecular Therapeutics"
    }
  }
  ```

### 1.2 Get Current Profile
- **Method:** `GET /auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. Research Projects Endpoints

### 2.1 List All Projects
- **Method:** `GET /projects`
- **Query Parameters:** `search`, `status`
- **Response `200 OK`:** Array of project objects with experiment counts.

### 2.2 Create Project
- **Method:** `POST /projects`
- **Permitted Roles:** `Principal Investigator`, `System Administrator`
- **Request Body:**
  ```json
  {
    "name": "CRISPR-Cas9 Base Editing in Stem Cells",
    "code": "CRISPR-HSC",
    "description": "Precision correction of sickle mutation...",
    "leadResearcher": "Dr. Elena Rostova",
    "department": "Molecular Therapeutics",
    "startDate": "2024-01-15",
    "targetEndDate": "2024-12-30",
    "budget": "$340,000",
    "status": "Active"
  }
  ```

### 2.3 Update & Delete Project
- **Method:** `PUT /projects/:id` | `DELETE /projects/:id`

---

## 3. Experiments Endpoints

### 3.1 List Experiments
- **Method:** `GET /experiments`
- **Query Parameters:** `projectId`, `status`, `search`

### 3.2 Create Experiment
- **Method:** `POST /experiments`
- **Request Body:**
  ```json
  {
    "name": "HBB Sickle Mutation Base Editing",
    "code": "EXP-CRISPR-01",
    "projectId": "PRJ-001",
    "protocolId": "PROT-101",
    "protocolVersion": "v3.2",
    "researcher": "Dr. Elena Rostova",
    "startDate": "2024-03-14",
    "status": "In Progress",
    "parameters": {
      "nucleofectionProgram": "CA-137",
      "cellDensity": "1.0 x 10^6 cells / 20 uL"
    }
  }
  ```

### 3.3 Append Observation Note
- **Method:** `POST /experiments/:id/observations`
- **Request Body:**
  ```json
  {
    "note": "Pre-electroporation viability measured at 96.2% on Countess II FL."
  }
  ```

---

## 4. Protocols & SOP Endpoints

### 4.1 List Protocols
- **Method:** `GET /protocols`

### 4.2 Create / Revise Protocol
- **Method:** `POST /protocols` | `PUT /protocols/:id`
- **Request Body:** Contains `name`, `code`, `version`, `category`, `steps` array, and `reagents` array.

---

## 5. Sample Management Endpoints

### 5.1 Register Sample
- **Method:** `POST /samples`
- **Request Body:** Contains `name`, `sampleType`, `organism`, `storageLocation`, `temperature`, `concentration`, `volume`, `aliquots`, `biosafetyLevel`, `associatedExperiment`.

---

## 6. Research Data & Real File Upload Endpoints

### 6.1 Upload Real Dataset File
- **Method:** `POST /datasets/upload`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: Raw binary file (`FASTQ`, `BAM`, `HDF5`, `CSV`, `mzML`)
  - `name`: Target file name
  - `format`: Format descriptor string
  - `associatedExperiment`: Linked experiment ID
  - `researcher`: Depositor name
- **Processing:** Server streams file to disk and calculates true cryptographic SHA-256 hash.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "dataset": {
      "id": "DS-2026-001",
      "name": "HBB_Target_Amplicon.fastq.gz",
      "format": "FASTQ (Compressed)",
      "sizeBytes": 2845417,
      "checksumSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "uploadDate": "2026-11-22",
      "status": "Validated"
    }
  }
  ```

### 6.2 Secure Download Dataset
- **Method:** `GET /datasets/:id/download`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** Binary file stream with `Content-Disposition: attachment; filename="..."`.

---

## 7. Data Provenance Engine Endpoints

### 7.1 Get Experiment Lineage DAG
- **Method:** `GET /provenance/:experimentId`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "experimentId": "EXP-2024-001",
    "project": { "id": "PRJ-001", "name": "..." },
    "experiment": { "id": "EXP-2024-001", "name": "..." },
    "protocol": { "id": "PROT-101", "version": "v3.2" },
    "samples": [ { "id": "SMP-2024-0101", "storageLocation": "..." } ],
    "parameters": { "pulse": "CA-137" },
    "observations": [ { "timestamp": "...", "note": "..." } ],
    "datasets": [ { "id": "DS-2024-001", "checksumSha256": "..." } ],
    "analyses": [ { "id": "ANA-2024-001", "pipelineVersion": "..." } ],
    "results": [ { "id": "RES-2024-001", "reproducibilityScore": "99.4%" } ],
    "graph": {
      "nodes": [ ... ],
      "edges": [ { "from": "project", "to": "experiment" }, ... ]
    }
  }
  ```

---

## 8. Reports & Audit Endpoints

### 8.1 Summary Analytics
- **Method:** `GET /reports/summary`

### 8.2 Export CSV
- **Method:** `GET /reports/export/:entity` (where entity is `experiments`, `samples`, `datasets`, or `audit-trail`)
- **Response:** `text/csv` stream ready for download.
