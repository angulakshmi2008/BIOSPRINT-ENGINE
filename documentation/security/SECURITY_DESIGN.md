# Security & Research Data Protection Design
## BioSprint Engine: Security Architecture & 21 CFR Part 11 Compliance
**Document Identifier:** DOC-SEC-001  
**Standards:** OWASP Top 10 / FDA 21 CFR Part 11 / FAIR Principles  

---

## 1. Security Architecture Principles

BioSprint Engine treats research data integrity and confidentiality as fundamental architectural requirements. The platform enforces defense-in-depth across the application lifecycle:

```
[ Web Browser ]
      |
      | 1. HTTPS / TLS 1.3 Transport Encryption
      v
[ Helmet Security Headers & CORS Policy ]
      |
      | 2. Rate Limiting (Prevents Brute Force / DoS)
      v
[ JWT Authentication Filter ]
      |
      | 3. Server-Side RBAC Authorization Guard (6 Roles)
      v
[ Input Validation & Path Traversal Sanitizer ]
      |
      | 4. Streaming SHA-256 Hashing & Multer File Ingestion
      v
[ Parameterized SQL Queries & Relational Constraints ]
      |
      | 5. Immutable 21 CFR Part 11 Audit Trail
      v
[ Encrypted Database & File Storage ]
```

---

## 2. Authentication & Credential Security

1. **Password Hashing:** All user passwords are encrypted using `bcryptjs` with 10 salt rounds before storage. Plaintext passwords are never logged, stored in cache, or returned in API responses.
2. **Stateless JWT Tokens:** Authentication tokens are signed using HMAC-SHA256 with a high-entropy secret loaded from environment variables (`JWT_SECRET`). Tokens expire after 24 hours.
3. **Role Authorization:** Every protected route passes through `requireRole([...])` middleware, verifying that the authenticated token contains the requisite permissions.

---

## 3. Research Data Integrity & File Upload Protection

1. **Streaming SHA-256 Checksumming:** File uploads stream through Node.js `crypto.createHash('sha256')`. This guarantees that file integrity is mathematically provable against tampering or bitrot.
2. **Path Traversal Prevention:** Files are assigned unique server-side filenames (`Date.now() + '-' + sanitizedOriginalName`), preventing directory traversal (`../../etc/passwd`) attacks.
3. **Payload Size Guard:** Uploads are strictly capped at 500 MB per file to prevent Denial of Service via memory exhaustion.
4. **Authorized Downloads:** Files can only be downloaded through authenticated endpoints (`/api/datasets/:id/download`) validating bearer tokens. Direct public web access to upload directories is strictly disabled.

---

## 4. FDA 21 CFR Part 11 & GLP Audit Logging

To comply with FDA 21 CFR Part 11 regulations for electronic records:
1. **Computer-Generated, Time-Stamped Audit Trail:** Every creation, modification, and deletion records the UTC timestamp, user identity, event type, action description, and affected entity ID in the `audit_logs` table.
2. **Append-Only Immutability:** No API endpoint or user action allows modification or deletion of records in `audit_logs`.
3. **Protocol Snapshot Locking:** Protocols linked to executed assays cannot be mutated retroactively, ensuring experimental conditions remain historically accurate and reproducible.

---

## 5. Secrets Management & Environment Configuration

- Real secrets (database passwords, JWT keys) are excluded from version control via `.gitignore`.
- Development defaults are defined in `.env.example`.
- Production deployments load secrets through Docker environment variables or Kubernetes Secret objects.
