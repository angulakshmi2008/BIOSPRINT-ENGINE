# Verification and Validation Test Report
## BioSprint Engine: Automated Test Execution Results
**Document Identifier:** DOC-TEST-REP-001  
**Execution Date:** November 22, 2026  
**Environment:** Node.js v24.14.0 on Windows (x64)  
**Test Framework:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)  
**Overall Status:** **PASSED (100% Pass Rate)**  

---

## 1. Summary of Execution

```
-------------------------------------------------------------------------------
Test Suite                                  Total   Pass   Fail   Duration
-------------------------------------------------------------------------------
BioSprint Backend Suite — Core Engine & Provenance
  1. Database standard provisioned roles     1       1      0     2.09 ms
  2. Relational Project CRUD & constraints   1       1      0     18.00 ms
  3. Real File Ingestion SHA-256 accuracy    1       1      0     0.94 ms
  4. Relational Provenance DAG Integrity     1       1      0     39.58 ms
-------------------------------------------------------------------------------
TOTAL TESTS RUN:                            4       4      0     62.61 ms
-------------------------------------------------------------------------------
```

---

## 2. Test Case Execution Details

### 2.1 User Roles & Authentication Test (`TC-SEC-01`)
- **Assertion:** Database contains standard provisioned roles (PI, Scientist, Lab Tech, Bioinformatics Analyst, Compliance Auditor, System Admin).
- **Result:** **PASSED** (Found 6 certified laboratory role profiles in `users` table).

### 2.2 Relational Project CRUD & Integrity Test (`TC-PRJ-01`, `TC-DB-01`)
- **Assertion:** Can insert and retrieve project record; verified that duplicate unique codes trigger a database-level `UNIQUE constraint failed` error as expected.
- **Result:** **PASSED**.

### 2.3 Real File Streaming SHA-256 Checksum Test (`TC-DAT-01`, `TC-DAT-02`)
- **Assertion:** Cryptographic hash generation computes an exact 64-character hexadecimal digest from real byte streams.
- **Result:** **PASSED** (Computed digest matched expected SHA-256 hash byte-for-byte).

### 2.4 Relational Provenance DAG Traversal Test (`TC-PRV-01`)
- **Assertion:** Experiment links to parent project and bound protocol version; foreign key relationships verified.
- **Result:** **PASSED**.
