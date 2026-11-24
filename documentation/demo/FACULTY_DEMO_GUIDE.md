# BioSprint Engine — Faculty Demonstration & Evaluation Guide

**Document ID:** DEMO-GUIDE-2026-BS  
**Version:** 2.0.0  
**Classification:** Academic Faculty Evaluation & Capstone Presentation  
**Target Environment:** Isolated Faculty Demonstration Sandbox (`http://localhost:3001` / API `http://localhost:5001`)  

---

## 1. Executive Summary

**BioSprint Engine** is an agile orchestration and data provenance platform engineered for reproducible laboratory workflows. In laboratory bioscience, experimental information is frequently fragmented across disparate physical lab notebooks, disconnected spreadsheets, local instrument workstations, and unindexed network drives. BioSprint Engine unifies research projects, experiments, protocols, biological specimens, raw computational datasets, analytical pipelines, results, and certified conclusions into a **W3C PROV-O compliant provenance graph** reinforced by cryptographic SHA-256 data seals and 21 CFR Part 11 compliant audit logs.

This guide provides faculty evaluators and examiners with:
1. Complete architectural proof of **total physical and database isolation** between the production application and this demonstration environment.
2. Step-by-step instructions for launching and testing the demonstration platform locally or via Docker.
3. A 7-step presentation walkthrough demonstrating all six laboratory roles, their role-based access control (RBAC) boundaries, and the complete experimental provenance lifecycle.

---

## 2. Platform Architecture & Complete Isolation Matrix

To guarantee that faculty evaluation activities never contaminate real research records, BioSprint Engine enforces a strict dual-environment isolation architecture:

| Dimension | Production Environment (Original App) | Faculty Demonstration Environment |
| :--- | :--- | :--- |
| **Frontend URL** | [http://localhost:3000](http://localhost:3000) | [http://localhost:3001](http://localhost:3001) |
| **Backend REST API** | [http://localhost:5000/api](http://localhost:5000/api) | [http://localhost:5001/api](http://localhost:5001/api) |
| **Relational Database** | `server/data/biosprint.db` (Pristine 0-State) | `server/data/biosprint_demo.db` (Isolated Demo Store) |
| **Environment Config** | `.env` (`VITE_APP_MODE=production`) | `.env.demo` (`VITE_APP_MODE=demo`) |
| **RBAC Role Switcher** | **Disabled** (Strict Certified Identity Profile) | **Enabled** (Top-Navbar Faculty Role Switcher) |
| **Authentication Flow** | Real Google Identity Services (GIS) + Personal Access Code | 1-Click Evaluation Login + Real GIS Support |
| **Demo Indicator** | None (Clean Production Interface) | Sticky Amber Banner (`🧪 FACULTY DEMONSTRATION...`) |
| **Data Reset Capability**| N/A (Production Audit Trail) | 1-Click "Reset Demo Store" Button (`/api/demo/reset`) |
| **Docker Compose** | `docker-compose.yml` (`biosprint_db_data`) | `docker-compose.demo.yml` (`biosprint_demo_data`) |

---

## 3. Quick-Start Startup Instructions

### Option A: Local Terminal Execution (VS Code / PowerShell)

Open two terminal windows in the project root:

#### Terminal 1 — Start Isolated Demo Backend (Port 5001)
```powershell
cd server
npm run dev:demo
```
*Output confirmation:*
```
=======================================================
  🧪 BioSprint Engine — FACULTY DEMO BACKEND SERVER   
  Running on: http://localhost:5001                 
  Health Check: http://localhost:5001/health        
  Database: server/data/biosprint_demo.db (ISOLATED)   
  Client Allowed Origin: http://localhost:3001       
  Demo Reset Endpoint: POST http://localhost:5001/api/demo/reset 
=======================================================
```

#### Terminal 2 — Start Demo Frontend (Port 3001)
```powershell
npm run dev:demo
```
*Output confirmation:*
```
  VITE v6.0.3  ready in 420 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

Open your browser to `http://localhost:3001`. You will see the amber **Faculty Demonstration Environment** banner at the top of the interface.

---

### Option B: Docker Containerized Demo Execution

If you prefer running via Docker with isolated volumes:

```bash
docker compose -f docker-compose.demo.yml up --build
```

Access the demo frontend at `http://localhost:3001` and backend health check at `http://localhost:5001/health`.

---

## 4. Pre-Seeded Demonstration Personas

The demonstration database (`server/data/biosprint_demo.db`) is automatically seeded with six distinct laboratory personas:

| Persona Name | Laboratory Role | Department | Default Access Code |
| :--- | :--- | :--- | :--- |
| **Dr. Elena Rostova** | Principal Investigator (PI) | Molecular Genetics & Functional Genomics | `BioSprint2026!` |
| **Dr. Marcus Thorne** | Research Scientist | Neuro-Oncology & Functional Genomics | `BioSprint2026!` |
| **Lin Wei** | Laboratory Technician | Specimen Repository & Cold Chain | `BioSprint2026!` |
| **Dr. James Miller** | Bioinformatics Analyst | Computational Biology & NGS Core | `BioSprint2026!` |
| **Dr. Clara Sterling** | Compliance Auditor | Quality Assurance & Regulatory Affairs | `BioSprint2026!` |
| **System Administrator** | System Administrator | Research IT & DevOps Infrastructure | `BioSprint2026!` |

---

## 5. Step-by-Step Faculty Evaluation Script (Steps 1–7)

### Step 1: Platform Overview & Dual-Factor Authentication Workflow
- **Concept:** Explain the two-factor authentication architecture: initial identity verification via Google Identity Services (GIS) followed by a personal BioSprint access code for routine sessions.
- **Action:**
  1. Navigate to `http://localhost:3001`.
  2. Notice the sticky amber banner: `🧪 FACULTY DEMONSTRATION ENVIRONMENT — SYNTHETIC RESEARCH DATA ONLY`.
  3. Click on the user profile in the top-right navbar and click **Lock Session (Access Code)**.
  4. The BioSprint Lock Modal appears. Enter `BioSprint2026!` and click **Unlock Laboratory Workspace**.
  5. Click **Identity & Access Code Credentials** to view the authentication options:
     - Notice the **Faculty Demonstration 1-Click Evaluation Login** grid.
     - Observe the Real Google Identity Services (GIS) integration container and institutional email registration fallback.
     - Note the security notice explaining that new accounts cannot self-assign elevated roles (21 CFR Part 11 compliance).

---

### Step 2: Role 1 — Principal Investigator (Dr. Elena Rostova)
- **Role Permissions:** Portfolio governance, budget approval, experiment sign-off, protocol validation, institutional oversight.
- **Action:**
  1. Switch to **Principal Investigator** using the top navbar dropdown.
  2. Notice the PI Dashboard view:
     - Research Portfolio summary (active grant budgets, project milestone progress bars).
     - Experiment Status Distribution chart.
  3. Navigate to **Research Projects** (`/projects`):
     - Inspect `[DEMO] CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells` (PRJ-DEMO-001) with budget `$340,000`.
     - Review linked protocols, associated experiments, and lead scientist assignment.
  4. Navigate to **Protocols** (`/protocols`):
     - Inspect `[DEMO] High-Fidelity Cas9 RNP Electroporation in CD34+ Primary Cells` (PROT-DEMO-101, v3.2).
     - Notice the revision audit trail showing how molar ratio adjustments were approved to suppress off-target cleavage.

---

### Step 3: Role 2 — Research Scientist (Dr. Marcus Thorne)
- **Role Permissions:** Assay execution, live bench observation logging, reagent parameterization, sequencing dataset linkage, result drafting.
- **Action:**
  1. Switch to **Research Scientist** using the top navbar dropdown.
  2. Notice the dashboard transitions to the **Assay Execution & Bench Workflow Console**.
  3. Navigate to **Experiments** (`/experiments`):
     - Inspect `EXP-DEMO-001: HBB Sickle Mutation Base Editing & GUIDE-seq Off-Target Quantification`.
     - Click **View Details**: inspect the execution parameters (`nucleofectionProgram: CA-137`, `cas9MolarRatio: 1:2.5`).
     - Review the timestamped bench observations logged during cell culture and electroporation.
  4. Test adding an observation:
     - Type: `Post-thaw viability confirmed at 91.5% using trypan blue exclusion.`
     - Submit: notice the instantaneous update and immutable audit log entry created in SQLite.

---

### Step 4: Role 3 — Laboratory Technician (Lin Wei)
- **Role Permissions:** Cold-chain custody, biological specimen intake, cryogenic storage slot tracking, BSL-2 inventory management.
- **Action:**
  1. Switch to **Laboratory Technician** using the top navbar dropdown.
  2. The dashboard updates to **Cryo-Repository & Specimen Inventory Management**.
  3. Navigate to **Samples** (`/samples`):
     - Inspect `SMP-DEMO-001: CD34+ Human Hematopoietic Stem Cells (Donor #902)`.
     - Verify precise cold-chain metadata:
       - Storage Temperature: `-196°C` (Liquid Nitrogen Vapor Phase)
       - Physical Rack Location: `Liquid Nitrogen Tank Cryo-1, Rack 04, Box B, Slot 12`
       - Concentration: `1.2 x 10^7 cells/mL`
       - Biosafety Level: `BSL-2`
       - Lineage: Linked directly to experiment `EXP-DEMO-001` and project `PRJ-DEMO-001`.

---

### Step 5: Role 4 — Bioinformatics Analyst (Dr. James Miller)
- **Role Permissions:** Raw sequencing data intake, FASTQ integrity verification, computational pipeline orchestration, differential expression quantification.
- **Action:**
  1. Switch to **Bioinformatics Analyst** using the top navbar dropdown.
  2. Dashboard updates to **Computational Genomics & Pipeline Analytics Console**.
  3. Navigate to **Research Data** (`/data`):
     - Inspect dataset `DS-DEMO-001: HBB_Target_Amplicon_NovaSeq_R1_R2.fastq.gz` (2.84 GB).
     - Verify cryptographic checksum: `4a89fb3fbc23f95b77d61b3691657a82664cf12efb756e09e1cf3e63fe3fba93`.
     - Notice the SHA-256 seal badge verifying that raw read files have not suffered bit-rot or tampering.
  4. Navigate to **Analysis & Results** (`/analysis`):
     - Inspect pipeline run `ANA-DEMO-001: CRISPResso2 Allele Quantification`.
     - View the dynamic benchmark chart displaying **87.4% on-target editing efficiency** against **0.38% indel noise**.

---

### Step 6: Role 5 — Compliance Auditor (Dr. Clara Sterling)
- **Role Permissions:** Read-only oversight, cryptographic audit trail verification, end-to-end W3C PROV-O lineage graph inspection.
- **Action:**
  1. Switch to **Compliance Auditor** using the top navbar dropdown.
  2. Notice the yellow indicator: `• Strict Read-Only Audit Privilege`. Write buttons (Add Experiment, Create Project) are dynamically hidden.
  3. Navigate to **Data Provenance** (`/provenance`):
     - Inspect the interactive **W3C PROV-O Provenance Graph**.
     - Observe the end-to-end lineage path:
       $$\text{Project (PRJ-DEMO-001)} \longrightarrow \text{Protocol (PROT-DEMO-101)} \longrightarrow \text{Experiment (EXP-DEMO-001)} \longrightarrow \text{Sample (SMP-DEMO-001)} \longrightarrow \text{Dataset (DS-DEMO-001)} \longrightarrow \text{Analysis (ANA-DEMO-001)} \longrightarrow \text{Result (RES-DEMO-001)}$$
     - Click any node to open its cryptographic inspector pane, displaying timestamp, operator, parent hashes, and JSON parameters.
  4. Navigate to **Reports** (`/reports`):
     - Inspect the **FAIR Compliance Scorecard**:
       - **Findability:** 100% (Unique persistent IDs, rich metadata)
       - **Accessibility:** 100% (Open REST API, standard HTTPS/OAuth2)
       - **Interoperability:** 100% (W3C PROV-O JSON-LD ontology export)
       - **Reusability:** 100% (Detailed protocol versioning, certified parameters)

---

### Step 7: Role 6 — System Administrator
- **Role Permissions:** Platform governance, user account provisioning, role promotion, storage quota monitoring.
- **Action:**
  1. Switch to **System Administrator** using the top navbar dropdown.
  2. Dashboard displays **Platform Administration & Access Governance**.
  3. Inspect Registered User Accounts table:
     - Review all enrolled researchers, their assigned roles, and login statuses.
     - Demonstrate role modification (e.g. promoting a Scientist to Principal Investigator).
  4. Navigate to **Settings** (`/settings`):
     - Review storage quota utilization (`500 GB` allocated).
     - Inspect platform security settings, cryptographic salt configurations, and audit log retention rules.

---

## 6. Restoring Pristine Demo State (1-Click Reset)

If faculty test creating, modifying, or deleting records during the examination, you can instantly restore the demonstration database back to its pristine evaluation state:

1. Click the **Reset Demo Store** button in the sticky amber banner at the top of the page.
2. Confirm the prompt: `"Reset all demo databases and caches back to initial faculty evaluation state?"`.
3. The platform executes `POST http://localhost:5001/api/demo/reset`, flushes browser localStorage caches, re-seeds `biosprint_demo.db`, and reloads the interface within 500 ms.
4. Alternatively, execute via terminal:
   ```powershell
   cd server
   npm run seed:demo
   ```

---

## 7. Verifying Complete Production Cleanliness

To demonstrate to faculty that the production application remains completely clean, unaffected by test records:

1. Open a new browser tab to `http://localhost:3000` (Production Frontend connected to Port 5000 / `biosprint.db`).
2. Observe:
   - Zero fictional personas (`Dr. Elena Rostova`, `Dr. Marcus Thorne`, etc.) exist in the production database.
   - The Top Navbar displays your certified authenticated user profile with no arbitrary role-simulation dropdown.
   - All modules (Projects, Experiments, Protocols, Samples, Datasets) start with clean, authentic empty states ready for genuine institutional enrollment.
   - Total database isolation is maintained: `biosprint.db` (Production) has zero connection to `biosprint_demo.db` (Faculty Demo).
