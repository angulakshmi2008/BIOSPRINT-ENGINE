# System Architecture Specification
## BioSprint Engine: Multi-Tier Laboratory Orchestration Platform
**Document Identifier:** DOC-ARCH-SYS-001  
**Architecture Style:** Layered Client-Server / RESTful API / Directed Acyclic Graph (DAG) Engine  

---

## 1. Architectural Overview & C4 Context

BioSprint Engine is structured as a decoupled, multi-tier system separating visual user presentation, business logic & authorization enforcement, relational graph query operations, and physical file/database persistence:

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|                                                                                   |
|  React 18 SPA (Vite) | Tailwind CSS Design System | Recharts Analytics            |
|  - 10 Functional Research Modules                                                 |
|  - DataContext State Manager & API Client Service Layer                           |
|  - Provenance DAG Canvas & Inspector Drawer                                       |
|  - Toast Non-blocking Alert System & Responsive Mobile Shell                      |
+-----------------------------------------+-----------------------------------------+
                                          | JSON over HTTPS / REST + Multipart Form
+-----------------------------------------v-----------------------------------------+
|                                  API GATEWAY & ROUTING                            |
|                                                                                   |
|  Node.js / Express 4.x                                                            |
|  - Security Middleware: Helmet, CORS, Rate-Limiting, Path Traversal Sanitizer     |
|  - Authentication: JWT Verification & Extraction                                  |
|  - Authorization: Server-Side RBAC Guard (6 Laboratory Roles)                     |
|  - Audit Dispatcher: Intercepts mutations and logs immutable entries             |
+-----------------------------------------+-----------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
+-------v---------------------------------+       +-------------------------v-------+
|            SERVICE & LOGIC LAYER        |       |       FILE STORAGE ENGINE       |
|                                         |       |                                 |
| - ProjectService: Milestones & Team     |       | - Multer Streaming Ingestion    |
| - ExperimentService: Parameters & Obs   |       | - Streaming Crypto SHA-256 Hash |
| - ProtocolService: Immutability Locking |       | - File Size & Format Validator  |
| - SampleService: Coordinate Collision   |       | - Secure Authenticated Download |
| - ProvenanceService: Graph Traverser    |       |   Storage: Local Disk / S3 Obj  |
| - AuditService: 21 CFR Part 11 Log      |       +---------------------------------+
+-----------------------+-----------------+
                        | Parameterized SQL Queries
+-----------------------v-----------------------------------------------------------+
|                              PERSISTENCE & DATA LAYER                             |
|                                                                                   |
| Relational Storage:                                                               |
|  - Development / Windows Local: SQLite 3 with Foreign Key Enforcement             |
|  - Production / Docker / Kubernetes: PostgreSQL 15+ Container                     |
| Tables: users, projects, experiments, protocols, samples, datasets,               |
|         analyses, results, audit_logs, settings                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Design & Data Flow

### 2.1 Authentication & Request Flow
1. **Client Login:** User submits credentials to `POST /api/auth/login`.
2. **Password Verification:** Server verifies password hash using `bcrypt.compare`.
3. **Token Issuance:** Server generates a signed JWT payload containing `{ id, email, role, department }` with a 24-hour expiration.
4. **Authorized Requests:** Client sends `Authorization: Bearer <token>` with every subsequent HTTP request.
5. **Server RBAC Guard:** Middleware decodes the token, checks the user's role against the endpoint's permitted roles list, and either grants access or responds with `HTTP 403 Forbidden`.

### 2.2 File Upload & Checksum Flow
1. **Multipart Upload:** Client attaches file via `FormData` to `POST /api/datasets/upload`.
2. **Streaming Ingestion:** `multer` receives file chunks, while `crypto.createHash('sha256')` calculates the cryptographic digest on the fly without loading the entire file into memory.
3. **Storage & Database Commit:** File is saved to `server/uploads/`, and metadata (`id`, `name`, `size_bytes`, `checksum_sha256`, `associated_experiment_id`, `upload_date`) is committed in a relational transaction.
4. **Audit Log:** Mutation triggers an immutable audit log entry.

### 2.3 Provenance Graph Query Flow
1. **Client Request:** User selects an experiment ID and calls `GET /api/provenance/:experimentId`.
2. **Relational Graph Traversal:** Server queries the experiment, looks up its parent project, its bound protocol (with specific historical version), all bound biological samples, parameter key-values, observation logs, registered datasets, computational analyses, and validated results.
3. **Graph Assembly:** Server structures the payload into graph `nodes` and directional `edges`, returning a DAG ready for interactive visual rendering.
