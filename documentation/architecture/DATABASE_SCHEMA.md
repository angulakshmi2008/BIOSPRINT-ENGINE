# Database Schema Specification
## BioSprint Engine: Relational Data Model & Integrity Constraints
**Document Identifier:** DOC-ARCH-DB-001  
**Dialects Supported:** SQLite 3 (Zero-config local run) / PostgreSQL 15+ (Production container & cloud)  

---

## 1. Entity-Relationship Diagram (ERD)

```
       +------------------+
       |      users       |
       +--------+---------+
                | 1
                |
                | creates
                v N
       +--------+---------+          1:N          +------------------+
       |     projects     +---------------------->+   experiments    |
       +--------+---------+                       +--------+---------+
                |                                          |
                | 1:N                                      | 1:N
                v                                          v
       +--------+---------+                       +--------+---------+
       |     samples      |                       |    parameters    |
       +--------+---------+                       +------------------+
                |                                          |
                | N:1                                      | 1:N
                v                                          v
       +--------+---------+                       +--------+---------+
       |    protocols     |                       |   observations   |
       +--------+---------+                       +------------------+
                |                                          |
                | 1:N                                      | 1:N
                v                                          v
       +--------+---------+                       +--------+---------+
       |protocol_revisions|                       |     datasets     |
       +------------------+                       +--------+---------+
                                                           |
                                                           | 1:N
                                                           v
                                                  +--------+---------+
                                                  |     analyses     |
                                                  +--------+---------+
                                                           |
                                                           | 1:N
                                                           v
                                                  +--------+---------+
                                                  |     results      |
                                                  +------------------+
```

---

## 2. Relational Table Specifications

### 2.1 Table: `users`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique user ID (e.g. `USR-001`) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Scientist corporate/academic email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `full_name` | VARCHAR(255) | NOT NULL | Scientist legal name |
| `role` | VARCHAR(64) | NOT NULL | One of 6 RBAC roles |
| `department` | VARCHAR(255) | NULL | Academic/clinical department |
| `institution` | VARCHAR(255) | NULL | Host research institute |
| `orcid` | VARCHAR(32) | NULL | Open Researcher and Contributor ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

### 2.2 Table: `projects`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Project ID (e.g. `PRJ-001`) |
| `code` | VARCHAR(64) | UNIQUE, NOT NULL | Short code (e.g. `CRISPR-HSC`) |
| `name` | VARCHAR(255) | NOT NULL | Project title |
| `description` | TEXT | NULL | Scientific scope and endpoints |
| `lead_researcher`| VARCHAR(255) | NOT NULL | Principal Investigator name |
| `department` | VARCHAR(255) | NULL | Host department |
| `start_date` | DATE | NOT NULL | Inception date |
| `target_end_date`| DATE | NULL | Target milestone date |
| `status` | VARCHAR(32) | DEFAULT 'Active' | Active, Completed, On Hold |
| `budget` | VARCHAR(64) | NULL | Grant budget allocation |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2.3 Table: `protocols`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Protocol ID (e.g. `PROT-101`) |
| `code` | VARCHAR(64) | NOT NULL | SOP Code (e.g. `SOP-CAS9-EP`) |
| `name` | VARCHAR(255) | NOT NULL | Full procedure title |
| `version` | VARCHAR(32) | NOT NULL | Version tag (e.g. `v3.2`) |
| `category` | VARCHAR(128) | NOT NULL | Protocol domain |
| `author` | VARCHAR(255) | NOT NULL | Scientist who certified SOP |
| `status` | VARCHAR(32) | DEFAULT 'Validated' | Validated, Draft, Deprecated |
| `description` | TEXT | NULL | Detailed procedure scope |
| `steps_json` | TEXT | NOT NULL | JSON array of ordered steps |
| `reagents_json` | TEXT | NULL | JSON array of reagents & storage temps |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2.4 Table: `experiments`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Experiment ID (e.g. `EXP-2024-001`) |
| `code` | VARCHAR(64) | NULL | Experiment run code |
| `name` | VARCHAR(255) | NOT NULL | Assay title |
| `project_id` | VARCHAR(64) | REFERENCES projects(id) | Parent research project |
| `protocol_id` | VARCHAR(64) | REFERENCES protocols(id) | Bound SOP |
| `protocol_version`| VARCHAR(32) | NOT NULL | Snapshot version tag at run time |
| `researcher` | VARCHAR(255) | NOT NULL | Lead researcher |
| `operator` | VARCHAR(255) | NULL | Bench operator |
| `start_date` | DATE | NOT NULL | Run start date |
| `completion_date`| DATE | NULL | Run conclusion date |
| `status` | VARCHAR(32) | DEFAULT 'In Progress' | In Progress, Completed, On Hold |
| `description` | TEXT | NULL | Assay notes & objectives |
| `parameters_json`| TEXT | NULL | Key-value dictionary of parameters |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2.5 Table: `samples`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Specimen ID (e.g. `SMP-2024-0101`) |
| `name` | VARCHAR(255) | NOT NULL | Sample description |
| `sample_type` | VARCHAR(128) | NOT NULL | Primary Cells, DNA, Tissue, etc. |
| `organism` | VARCHAR(128) | NOT NULL | Species / source |
| `storage_location`| VARCHAR(255) | NOT NULL | Exact freezer, shelf, rack, box, slot |
| `temperature` | VARCHAR(32) | NOT NULL | `-196°C`, `-80°C`, `-20°C`, `4°C` |
| `concentration`| VARCHAR(128) | NULL | Biological concentration |
| `volume` | VARCHAR(64) | NULL | Volume remaining |
| `aliquots` | INTEGER | DEFAULT 1 | Count of individual vials |
| `biosafety_level`| VARCHAR(16) | DEFAULT 'BSL-1' | BSL-1, BSL-2, BSL-3 |
| `associated_experiment_id`| VARCHAR(64) | REFERENCES experiments(id) | Linked experiment |
| `project_id` | VARCHAR(64) | REFERENCES projects(id) | Linked project |
| `status` | VARCHAR(32) | DEFAULT 'Available' | Available, In Assay, Depleted |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2.6 Table: `datasets`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Dataset ID (e.g. `DS-2024-001`) |
| `name` | VARCHAR(255) | NOT NULL | Actual file name |
| `format` | VARCHAR(64) | NOT NULL | FASTQ, BAM, HDF5, CSV, mzML |
| `size_bytes` | BIGINT | NOT NULL | Exact byte length |
| `file_path` | VARCHAR(512) | NOT NULL | Path on disk or storage bucket URI |
| `checksum_sha256`| VARCHAR(64) | NOT NULL | 64-char SHA-256 digest |
| `associated_experiment_id`| VARCHAR(64) | REFERENCES experiments(id) | Originating assay run |
| `researcher` | VARCHAR(255) | NOT NULL | Depositor scientist |
| `upload_date` | DATE | NOT NULL | Date uploaded |
| `status` | VARCHAR(32) | DEFAULT 'Validated' | Validation status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2.7 Table: `analyses`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Analysis Run ID (e.g. `ANA-2024-001`) |
| `name` | VARCHAR(255) | NOT NULL | Computational pipeline title |
| `pipeline_version`| VARCHAR(128) | NOT NULL | Software tool & version string |
| `associated_experiment_id`| VARCHAR(64) | REFERENCES experiments(id) | Linked experiment |
| `dataset_id` | VARCHAR(64) | REFERENCES datasets(id) | Input data file |
| `analyst` | VARCHAR(255) | NOT NULL | Computational researcher |
| `execution_date` | DATE | NOT NULL | Date executed |
| `methods` | TEXT | NULL | Algorithmic parameter notes |
| `status` | VARCHAR(32) | DEFAULT 'Completed' | Pipeline completion status |

### 2.8 Table: `results`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Result ID (e.g. `RES-2024-001`) |
| `experiment_id`| VARCHAR(64) | REFERENCES experiments(id) | Originating experiment |
| `project_id` | VARCHAR(64) | REFERENCES projects(id) | Parent project |
| `title` | VARCHAR(255) | NOT NULL | Validated finding summary |
| `summary` | TEXT | NOT NULL | Detailed empirical evidence |
| `primary_metric`| VARCHAR(128) | NOT NULL | Core scientific metric |
| `secondary_metric`| VARCHAR(128)| NULL | Supporting metric |
| `validation_status`| VARCHAR(32)| DEFAULT 'Validated' | Certification status |
| `lead_scientist`| VARCHAR(255)| NOT NULL | Certifying scientist |
| `published_date`| DATE | NOT NULL | Date certified |
| `reproducibility_score`| VARCHAR(32)| NOT NULL | Reproducibility percentage |
| `conclusions` | TEXT | NULL | Scientific translational impact |

### 2.9 Table: `audit_logs`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Log entry ID (e.g. `ACT-9901`) |
| `event_type` | VARCHAR(64) | NOT NULL | Action category |
| `action_title` | VARCHAR(255) | NOT NULL | Human-readable action description |
| `details` | TEXT | NULL | Structured modification delta |
| `user_name` | VARCHAR(255) | NOT NULL | Operating scientist identity |
| `entity_type` | VARCHAR(64) | NULL | Target resource type |
| `entity_id` | VARCHAR(64) | NULL | Target resource ID |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Non-repudiable UTC timestamp |
