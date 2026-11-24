# Kano Model Requirements Analysis
## BioSprint Engine: Feature Prioritization & Customer Satisfaction Modeling
**Document Identifier:** DOC-REQ-KANO-001  
**Methodology Notice:** This classification is a **proposed stakeholder-based Kano analysis** derived from biological laboratory workflow requirements, GLP compliance mandates, and qualitative researcher interviews. **No synthetic customer survey questionnaire responses or manufactured percentage satisfaction scores have been fabricated.** The curves depicted represent theoretical Kano functional dynamics.

---

## 1. Overview of the Kano Model

The Kano model classifies product features into distinct categories based on how customer satisfaction correlates with the degree of feature implementation:

1. **Must-be (M) [Basic / Mandatory]:** Taken for granted when present. If absent or malfunctioning, causes extreme user dissatisfaction. Cannot increase satisfaction above neutral regardless of implementation depth.
2. **One-dimensional (O) [Performance]:** Satisfaction is directly proportional to implementation level: higher execution speed, capacity, and accuracy yield directly higher user satisfaction.
3. **Attractive (A) [Excitement / Delighters]:** Features not explicitly expected by researchers. When present, they generate disproportionate enthusiasm and competitive differentiation; their absence does not cause dissatisfaction.
4. **Indifferent (I):** Features where the user does not care whether they are present or absent.
5. **Reverse (R):** Features where increased presence actually reduces customer satisfaction (e.g. excessive bureaucracy or forced multi-factor hurdles on rapid bench tasks).

---

## 2. Theoretical Kano Model Curves Visualization

```
                       CUSTOMER SATISFACTION (+1.0)
                                    ^
                                    |         / ATTRACTIVE (Delighters)
                                    |        /  [Interactive Provenance DAG,
                                    |       /   Automated SHA-256 Hashing]
                                    |      /
                                    |     /
                                    |    /
         DISCONTENTED               |   /              DELIGHTED
    <-------------------------------+----------------------------->
    (Degree of                      | /              (Degree of
     Implementation: 0%)            |/                Implementation: 100%)
                                   /|
                                  / |
                                 /  |             / ONE-DIMENSIONAL (Performance)
                                /   |            /  [Throughput Charts, Query Speed,
                               /    |           /   Multi-level Filters, CSV Export]
                              /     |          /
                             /      |         /
                            /       |        /
       MUST-BE (Basic)     /        |       /
       [Data Persistence,           |
        SOP Version Locking,        |
        Sample Coordinates,         |
        Audit Trail Non-repudiation]|
                                    v
                       CUSTOMER DISSATISFACTION (-1.0)
```

### Mathematical Formulation of Theoretical Curves
For any degree of implementation $x \in [-1, +1]$:
- **Attractive Curve ($A$):** $S_A(x) = c_A \cdot e^{k_A \cdot x} - c_A$, where $S(0) = 0$ and $S(1) > 0$.
- **One-Dimensional Curve ($O$):** $S_O(x) = k_O \cdot x$, linear slope where satisfaction scales directly with quality.
- **Must-be Curve ($M$):** $S_M(x) = -c_M \cdot e^{-k_M \cdot x}$, where $S(1) \approx 0$ (neutral satisfaction at full implementation) and $S(-1) \ll 0$ (extreme dissatisfaction if missing).

---

## 3. Proposed Feature Classification Table

| Feature / Capability | Module | Kano Category | Engineering Justification |
|---|---|:---:|---|
| **Persistent Relational Database Storage** | System Architecture | **Must-Be (M)** | If laboratory data is lost upon closing the browser, the software is completely unacceptable for research. |
| **SOP Protocol Version Locking** | Protocols | **Must-Be (M)** | Standard operating procedures must never silently mutate under historical experiments. |
| **Exact Cryogenic Storage Coordinates** | Samples | **Must-Be (M)** | Technicians cannot afford to search 50 boxes at -80°C; freezer shelf/box coordinates are a baseline requirement. |
| **Immutable 21 CFR Part 11 Audit Trail** | Compliance | **Must-Be (M)** | Required by regulatory bodies (FDA/GLP). Absence prevents institutional adoption. |
| **Role-Based Access Control (RBAC)** | Security | **Must-Be (M)** | Unrestricted public editing of peer research records destroys institutional data trust. |
| **Search & Multi-Facet Filtering** | Cross-Module | **One-Dimensional (O)** | Faster, more granular search directly scales user productivity and satisfaction as lab records multiply. |
| **Data Ingestion Throughput & Storage** | Research Data | **One-Dimensional (O)** | Support for larger genomic file sizes (FASTQ/BAM) and fast upload pipelines directly scales satisfaction. |
| **One-Click Regulatory CSV/JSON Exports** | Reports | **One-Dimensional (O)** | Faster and more versatile export options save hours during grant and paper reporting. |
| **API Response Latency (< 150 ms)** | Performance | **One-Dimensional (O)** | Snappy interface transitions improve day-to-day bench utility. |
| **Interactive Provenance DAG Lineage Graph** | Data Provenance | **Attractive (A)** | Visualizing the complete interconnected lineage from Project to Result in a clickable DAG delights researchers and reviewers. |
| **Automated SHA-256 Cryptographic Sealing** | Research Data | **Attractive (A)** | Automatic instant hashing upon upload gives researchers peace of mind regarding data integrity without manual CLI tools. |
| **Live Bench Observation Notes Stream** | Experiments | **Attractive (A)** | Adding timestamped notes live during bench protocol execution without leaving the experiment view is an unexpected productivity booster. |
| **Dual Provenance View (DAG + Chronological)** | Data Provenance | **Attractive (A)** | Offering both visual node traversal and chronological audit trail modes satisfies both visual researchers and strict auditors. |
| **Custom Theme Color Customization** | Settings | **Indifferent (I)** | Research scientists care about data integrity and speed; custom decorative themes do not meaningfully impact workflow. |
| **Forced Multi-Step Confirmation on View Only** | Navigation | **Reverse (R)** | Requiring confirmation dialogs merely to view read-only records introduces bench friction and causes frustration. |

---

## 4. Product Strategy Derived from Kano Analysis

1. **Protect the "Must-Be" Core:** All architectural efforts must guarantee persistent storage, SOP immutability, exact coordinates, and non-repudiation.
2. **Optimize "One-Dimensional" Engines:** Invest in responsive database indexing, fast query pagination, and streamable multipart file transfers.
3. **Elevate "Attractive" Differentiators:** Position the **Data Provenance DAG Engine** and **Automated SHA-256 Hashing** as the flagship features that differentiate BioSprint Engine from conventional electronic lab notebooks (ELNs).
