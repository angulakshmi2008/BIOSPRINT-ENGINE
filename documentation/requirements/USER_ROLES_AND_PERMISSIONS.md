# User Roles and Permissions (RBAC Matrix)
## BioSprint Engine: Access Control Specification
**Document Identifier:** DOC-REQ-RBAC-001  
**Enforcement Mechanism:** Server-side JWT claims & authorization middleware  

---

## 1. Role Definitions

| Role Code | Role Name | Description |
|---|---|---|
| `ROLE_PI` | **Principal Investigator (PI)** | Lab head with full research authority, project creation, milestone approvals, and data review. |
| `ROLE_SCI` | **Research Scientist** | Primary wet-lab and computational researcher managing experiments, parameters, and observations. |
| `ROLE_TECH` | **Laboratory Technician** | Sample intake specialist managing storage coordinates, aliquots, and inventory records. |
| `ROLE_BIO` | **Bioinformatics Analyst** | Computational biologist managing raw dataset uploads, checksums, and analysis pipeline records. |
| `ROLE_AUD` | **Compliance Auditor** | External or internal auditor with read-only inspection access to all logs, provenance, and data. |
| `ROLE_ADM` | **System Administrator** | DevOps and IT administrator managing users, system settings, storage quotas, and infrastructure. |

---

## 2. Granular Permissions Matrix

Legend:  
- **C:** Create  
- **R:** Read / Inspect  
- **U:** Update / Edit  
- **D:** Delete / Decommission  
- **-:** No Access  

| Module / Resource | Principal Investigator | Research Scientist | Lab Technician | Bioinformatics Analyst | Compliance Auditor | System Administrator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | R | R | R | R | R | R |
| **Projects** | CRUD | R | R | R | R | CRUD |
| **Experiments** | CRUD | CRUD | R | RU | R | CRUD |
| **Protocols (SOP)** | CRUD | CRU | R | R | R | CRUD |
| **Samples** | CRUD | RU | CRUD | R | R | CRUD |
| **Research Datasets** | CRUD | CRUD | R | CRUD | R | CRUD |
| **Analyses & Results** | CRUD | CRUD | R | CRUD | R | CRUD |
| **Data Provenance** | R (Export) | R (Export) | R | R (Export) | R (Export) | R (Export) |
| **Reports & Exports** | R (Export) | R (Export) | R (Export) | R (Export) | R (Export) | R (Export) |
| **Audit Logs** | R | - | - | - | R (Export) | R (Export) |
| **System Settings** | RU | - | - | - | - | CRUD |
| **User Management** | RU | - | - | - | - | CRUD |

---

## 3. Server-Side Enforcement Rules

1. **Protocol Immutability Rule:** Once an experiment is executed against a protocol version (e.g. `v3.2`), that specific protocol record cannot be updated or deleted by any non-admin role. Revisions must spawn a new version tag (e.g. `v3.3`).
2. **Audit Log Non-Repudiation:** Audit log entries (`audit_logs` table) are append-only. No API endpoint exists to update or delete audit log rows.
3. **Download Authorization:** Dataset file downloads require a valid bearer JWT token verifying read permissions on the associated experiment/project.
4. **Data Isolation:** Soft deletions are enforced on critical research entities to preserve provenance graph integrity; hard deletes are restricted to System Administrators.
