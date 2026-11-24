# Data Provenance Model Specification
## BioSprint Engine: Relational Lineage Graph & W3C PROV-O Alignment
**Document Identifier:** DOC-ARCH-PRV-001  
**Standards Alignment:** W3C PROV Data Model (PROV-DM) / FAIR Scientific Data Principles  

---

## 1. Provenance Philosophy & Concept

In empirical biosciences, an isolated finding (e.g. "87.4% Base Editing Efficiency") is scientifically meaningless without its complete evidentiary lineage. The BioSprint Data Provenance Engine models research activities as a Directed Acyclic Graph (DAG) that connects 8 discrete research stages:

$$\mathbf{Project} \xrightarrow{\text{initiates}} \mathbf{Experiment} \xrightarrow{\text{executes}} \mathbf{Protocol}_{(v)} \xrightarrow{\text{utilizes}} \mathbf{Sample} \xrightarrow{\text{parameterizes}} \mathbf{Observation} \xrightarrow{\text{generates}} \mathbf{Dataset}_{(SHA256)} \xrightarrow{\text{analyzed by}} \mathbf{Analysis} \xrightarrow{\text{yields}} \mathbf{Result}$$

---

## 2. Mapping to W3C PROV Core Classes

The BioSprint provenance schema maps directly to the standard W3C PROV-DM entity model:

| BioSprint Concept | W3C PROV Category | Description in BioSprint |
|---|---|---|
| `Project` | `prov:Plan` / `prov:Activity` | High-level research program defining scientific objectives and regulatory protocols. |
| `Experiment` | `prov:Activity` | The physical assay execution bound to an operator and timeframe. |
| `Protocol Version` | `prov:Plan` | The version-locked standard operating procedure followed during execution. |
| `Sample` | `prov:Entity` | The biological physical input (cell line, DNA, organoid, serum). |
| `Parameters & Obs` | `prov:Entity` (Metadata) | Environmental conditions, reagent lots, and bench technician logs. |
| `Dataset` | `prov:Entity` | Raw digital artifact sealed with a cryptographic SHA-256 digest. |
| `Analysis` | `prov:Activity` | Computational pipeline run transforming raw data into statistical derivations. |
| `Result` | `prov:Entity` | The certified scientific finding with a quantified reproducibility score. |
| `Scientist / Operator`| `prov:Agent` | The human actor authenticated and associated with each transition. |

---

## 3. Relational Lineage Traversal Algorithm

When a researcher or compliance auditor requests the provenance of experiment $E_i$:

```
Algorithm: BuildProvenanceDAG(experiment_id)
Input: experiment_id (e.g. "EXP-2024-001")
Output: Structured DAG { Nodes, Edges, IntegrityStatus }

1. Query Experiment: E = SELECT * FROM experiments WHERE id = experiment_id;
   If E is NULL -> Return 404 (Not Found).

2. Traverse Upstream Project:
   P = SELECT * FROM projects WHERE id = E.project_id;
   Add Node(P, type="Project");
   Add Node(E, type="Experiment");
   Add Edge(P -> E, label="authorizes");

3. Traverse Bound Protocol Version:
   PR = SELECT * FROM protocols WHERE id = E.protocol_id;
   Add Node(PR, type="Protocol", version=E.protocol_version);
   Add Edge(E -> PR, label="executes_sop");

4. Traverse Bound Physical Specimens:
   S_list = SELECT * FROM samples WHERE associated_experiment_id = E.id;
   For each S in S_list:
       Add Node(S, type="Sample", location=S.storage_location);
       Add Edge(PR -> S, label="applied_to");

5. Extract Assay Environment:
   PARAMS = Parse(E.parameters_json);
   OBS = SELECT * FROM observations WHERE experiment_id = E.id;
   Add Node(PARAMS_OBS, type="Parameters", count=len(PARAMS), obs_count=len(OBS));
   Add Edge(S -> PARAMS_OBS, label="conditioned_by");

6. Traverse Downstream Datasets:
   D_list = SELECT * FROM datasets WHERE associated_experiment_id = E.id;
   For each D in D_list:
       Verify SHA-256 against stored digest;
       Add Node(D, type="Dataset", hash=D.checksum_sha256, size=D.size_bytes);
       Add Edge(PARAMS_OBS -> D, label="measured_as");

7. Traverse Computational Analyses:
   A_list = SELECT * FROM analyses WHERE associated_experiment_id = E.id;
   For each A in A_list:
       Add Node(A, type="Analysis", pipeline=A.pipeline_version);
       Add Edge(D -> A, label="processed_by");

8. Traverse Certified Scientific Findings:
   R_list = SELECT * FROM results WHERE experiment_id = E.id;
   For each R in R_list:
       Add Node(R, type="Result", metric=R.primary_metric, score=R.reproducibility_score);
       Add Edge(A -> R, label="concludes");

9. Validate Continuity:
   If any mandatory link is broken (e.g. Dataset missing or untagged Protocol),
   mark IntegrityStatus = "WARN_INCOMPLETE_PROVENANCE";
   Else mark IntegrityStatus = "CERTIFIED_FAIR_COMPLIANT";

10. Return { Nodes, Edges, IntegrityStatus, ExportManifest };
```

---

## 4. Cryptographic Manifest & Verification

The exported JSON provenance manifest contains cryptographic proofs for FDA 21 CFR Part 11 validation:
- Entity IDs and version snapshot strings.
- SHA-256 checksums of all ingested datasets.
- Operating technician user identities and UTC timestamps.
- A master manifest hash calculated over the canonical JSON serialization of the graph.
