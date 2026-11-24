# BioSprint Engine: Agile Orchestration and Data Provenance Platform

> **An Agile Orchestration and Data Provenance Platform for Reproducible Laboratory Workflows**  
> Compliant with W3C PROV-O, FAIR Guiding Principles, and FDA 21 CFR Part 11 Electronic Records.

[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018-0D9488.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/package.json)
[![Backend Engine](https://img.shields.io/badge/Backend-Node.js%2024%20%7C%20Express-0F172A.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/server/package.json)
[![Database](https://img.shields.io/badge/Database-SQLite%20(Native)%20%7C%20PostgreSQL-3B82F6.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/server/src/db/migrate.js)
[![Tests Passing](https://img.shields.io/badge/Unit%20Tests-5%2F5%20Passed-10B981.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/testing/TEST_REPORT.md)
[![Docker Ready](https://img.shields.io/badge/Containers-Docker%20Compose-2496ED.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes%20Manifests-326CE5.svg)](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/deployment/kubernetes/)

---

## 🔬 Project Overview

**BioSprint Engine** is a centralized laboratory workflow and experimental data provenance management platform designed for life sciences laboratories, biotechnology consortia, and computational biology teams. It orchestrates experimental campaigns across ten specialized research modules:

1. **Dashboard**: High-level laboratory throughput, real-time KPI metrics, active projects, upcoming milestones, and chronological audit streams.
2. **Research Projects**: Multi-investigator research programs with budget allocations, grant references, and progress timelines.
3. **Experiments**: Assay parameterization, protocol binding, real-time bench observation timestamping, and provenance linking.
4. **Protocol Management (SOPs)**: Standard Operating Procedures with strict semantic versioning (`v1.0`, `v2.0`, `v3.2`), step-by-step procedures, required reagents directory, and immutable change logs.
5. **Sample Management**: Biological specimen cold-chain tracking (`-196°C LN2`, `-80°C Ultra-Low`, `-20°C`, `4°C`), aliquot volume monitoring, and experiment assignment.
6. **Research Data**: Multipart file ingestion for genomics (`FASTQ`, `BAM`), matrices (`HDF5`), mass spectrometry (`mzML`), and spreadsheets (`CSV`), streaming cryptographic SHA-256 calculation, and authenticated downloads.
7. **Analysis & Results**: Computational bioinformatics pipeline execution (`CRISPResso2`, `CellRanger`, `Seurat`, `Biacore Insight`) with interactive allele editing charts and certified conclusions.
8. **Data Provenance (Flagship Engine)**: Interactive W3C PROV-O compliant lineage graph mapping the 8-stage sequence:
   $$\text{Project} \longrightarrow \text{Experiment} \longrightarrow \text{Protocol} \longrightarrow \text{Sample} \longrightarrow \text{Parameters} \longrightarrow \text{Dataset} \longrightarrow \text{Analysis} \longrightarrow \text{Result}$$
9. **Reports & Audit Trail**: Summary analytics, completion rate gauges, storage volume breakdowns, and one-click export to CSV/JSON compliant with FDA 21 CFR Part 11.
10. **Settings & Governance**: Researcher credentials, laboratory operational policies (temperature defaults, NGS Q30 thresholds), quota gauges, RBAC role simulation, and zero-state management.

---

## 🛡️ Strict Zero-State Policy

In accordance with strict enterprise software engineering standards:
- **Default Application State**: The production database contains **zero fabricated records** (0 fake projects, 0 fake experiments, 0 fake samples, 0 fake datasets). Clean, professional empty states guide researchers to initialize genuine workflows.
- **Isolated Development Fixtures**: Synthetic test records (CRISPR-Cas9, RNA-seq, and nanobody assays) are strictly isolated into development seed scripts (`server/src/db/seed.js`) and can be optionally loaded via `Settings > Load Development Test Fixtures` or `npm run seed` for grading and presentation demonstrations.

---

## 👥 Role-Based Access Control (RBAC)

The platform provides 6 distinct laboratory personas with server-side and client-side privilege enforcement:

| Role | Title | Scope of Authority |
|---|---|---|
| **PI** | Principal Investigator | Full administrative authority, project creation, protocol approval, and certified result sign-off. |
| **Scientist** | Research Scientist | Author protocols, parameterize assays, upload datasets, and publish research findings. |
| **Technician** | Lab Technician | Register biological samples, record real-time bench observations, and execute protocol steps. |
| **Bioinformatician** | Bioinformatics Analyst | Ingest raw instrument datasets, execute analytical pipelines, and generate metrics. |
| **Auditor** | Compliance Auditor | Read-only inspection of all research assets, cryptographic SHA-256 manifests, and immutable 21 CFR Part 11 audit trails. |
| **Admin** | System Administrator | User account provisioning, storage lake quota management, and platform configuration. |

*You can switch roles instantly in the top navigation bar or via `Settings` to test permissions in real-time.*

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend SPA** | React 18, Vite 6, Tailwind CSS 3, Lucide React, React Router DOM v6, Recharts |
| **Backend REST API** | Node.js 24, Express, Multer (multipart uploads), Helmet, CORS, Morgan, JWT, Bcrypt |
| **Database** | Persistent Relational Store: SQLite via native Node.js 24 `DatabaseSync` (zero native compile dependencies) / PostgreSQL (cloud) |
| **Security & Compliance** | Streaming SHA-256 hashing, JWT Bearer authentication, 21 CFR Part 11 append-only audit trail |
| **Containerization** | Docker, Docker Compose (multi-stage non-root containers), Kubernetes manifests |
| **Mobile Application** | Capacitor 6 (cross-platform Android wrapper) |

---

## 🚀 Quick Start Guide (Windows & VS Code)

### 1. Prerequisites
- **Node.js** v18+ (Node.js v24 recommended for zero-config native SQLite support)
- **npm** v9+

### 2. Running Locally (Concurrent Development)

#### Terminal 1 — Start Backend Server (Port 5000)
```powershell
cd "c:\Users\ANGULAKSHMI SUBBURAJ\Downloads\BIOSPRINT\server"
npm install
npm start
```
*The backend automatically initializes `server/data/biosprint.db`, executes relational schema migrations, and provisions standard role accounts.*

#### Terminal 2 — Start Frontend Application (Port 3000)
```powershell
cd "c:\Users\ANGULAKSHMI SUBBURAJ\Downloads\BIOSPRINT"
npm install
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Automated Testing

The project includes an end-to-end automated test suite covering authentication, RBAC authorization, CRUD operations, streaming cryptographic hashing, and DAG provenance resolution:

```powershell
# Run backend test suite
cd "c:\Users\ANGULAKSHMI SUBBURAJ\Downloads\BIOSPRINT\server"
npm test

# Verify production frontend build
cd "c:\Users\ANGULAKSHMI SUBBURAJ\Downloads\BIOSPRINT"
npm run build
```

---

## 🐳 Container Deployment (Docker & Kubernetes)

### Docker Compose (One-Command Launch)
To spin up the entire multi-container environment (Frontend Nginx reverse proxy + Backend Node.js API + persistent named volumes):
```bash
docker-compose up --build
```
Access the application at `http://localhost:80`.

### Kubernetes Cluster Deployment
To deploy to a production Kubernetes cluster (Minikube, EKS, GKE, AKS):
```bash
kubectl apply -f deployment/kubernetes/00-namespace.yaml
kubectl apply -f deployment/kubernetes/01-configmap.yaml
kubectl apply -f deployment/kubernetes/02-secrets-template.yaml
kubectl apply -f deployment/kubernetes/03-pvc.yaml
kubectl apply -f deployment/kubernetes/04-backend.yaml
kubectl apply -f deployment/kubernetes/05-frontend-ingress.yaml
```

---

## 📱 Mobile Application (Android Capacitor)

BioSprint Engine is mobile-optimized and configured for native Android compilation:
```bash
# Build web production bundle
npm run build

# Add Android native platform
npx cap add android

# Sync web assets to native container
npx cap sync android

# Open in Android Studio to build APK
npx cap open android
```
*For detailed compilation instructions, see [documentation/deployment/ANDROID_GUIDE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/deployment/ANDROID_GUIDE.md).*

---

## 📚 Complete Software Engineering Documentation

Comprehensive specifications, architectural blueprints, agile planning schedules, and audit guides are available under `documentation/`:

### Requirements & Analysis
- [SRS.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/SRS.md): IEEE 830-compliant System Requirements Specification (10 modules, functional & non-functional requirements)
- [STAKEHOLDER_ANALYSIS.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/STAKEHOLDER_ANALYSIS.md): Comprehensive stakeholder profile matrix for 6 research personas
- [USER_ROLES_AND_PERMISSIONS.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/USER_ROLES_AND_PERMISSIONS.md): Complete RBAC matrix across all system endpoints
- [USER_STORIES.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/USER_STORIES.md): BDD user stories with Gherkin acceptance criteria
- [KANO_ANALYSIS.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/KANO_ANALYSIS.md): Theoretical Kano feature classification and mathematical curves
- [MOSCOW_PRIORITIZATION.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/MOSCOW_PRIORITIZATION.md): Must/Should/Could/Won't Have priority roadmap
- [REQUIREMENT_TRACEABILITY_MATRIX.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/requirements/REQUIREMENT_TRACEABILITY_MATRIX.md): End-to-end RTM linking user needs to automated tests

### Architecture & Design
- [SYSTEM_ARCHITECTURE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/architecture/SYSTEM_ARCHITECTURE.md): C4 model architectural specification and data flow diagrams
- [DATABASE_SCHEMA.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/architecture/DATABASE_SCHEMA.md): Complete relational entity schema (11 tables) and indexing strategy
- [API_DOCUMENTATION.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/architecture/API_DOCUMENTATION.md): Full REST API contract with request/response payloads
- [PROVENANCE_MODEL.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/architecture/PROVENANCE_MODEL.md): W3C PROV-O ontology mapping and DAG traversal algorithms
- [SECURITY_DESIGN.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/security/SECURITY_DESIGN.md): Cryptographic hashing, authentication, and 21 CFR Part 11 compliance

### Agile Management & Testing
- [AGILE_SCRUM_PLAN.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/development/AGILE_SCRUM_PLAN.md): Scrum framework, ceremonies, DoR/DoD, and risk register
- [SPRINT_ALLOCATION.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/development/SPRINT_ALLOCATION.md): Sprints 1–6 story point allocation and delivery milestones
- [TEST_PLAN.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/testing/TEST_PLAN.md): Comprehensive QA strategy, coverage targets, and test cases
- [TEST_REPORT.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/testing/TEST_REPORT.md): Verified automated test execution logs (100% pass rate)
- [RBAC_ROLE_SWITCHING_TEST_REPORT.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/testing/RBAC_ROLE_SWITCHING_TEST_REPORT.md): Role switching audit, root-cause diagnosis, Google OAuth, and personal access-code test report

### Deployment & Operations
- [DOCKER_GUIDE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/deployment/DOCKER_GUIDE.md): Multi-container local operations guide
- [KUBERNETES_GUIDE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/deployment/KUBERNETES_GUIDE.md): Cluster manifest deployment and rolling updates
- [VERCEL_GUIDE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/deployment/VERCEL_GUIDE.md): Cloud frontend hosting and reverse proxy configuration
- [ANDROID_GUIDE.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/deployment/ANDROID_GUIDE.md): Native Capacitor Android APK compilation manual
- [PROJECT_AUDIT.md](file:///c:/Users/ANGULAKSHMI%20SUBBURAJ/Downloads/BIOSPRINT/documentation/PROJECT_AUDIT.md): Initial codebase audit, technical debt resolution, and preservation log

---

## 📄 License & Attribution

BioSprint Engine is developed as an academic and scientific research platform compliant with Open Science and FAIR Guiding Principles.
All code is structured for reproducible research and enterprise laboratory deployment.
