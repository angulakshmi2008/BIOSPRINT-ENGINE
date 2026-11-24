import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// GET /api/provenance/:experimentId
router.get('/:experimentId', (req, res) => {
  const { experimentId } = req.params;

  // 1. Fetch Experiment
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(experimentId);
  if (!exp) {
    return res.status(404).json({ success: false, error: `Experiment '${experimentId}' not found in registry.` });
  }

  // 2. Upstream Project
  const project = exp.project_id
    ? db.prepare('SELECT id, code, name, lead_researcher, department, status, budget FROM projects WHERE id = ?').get(exp.project_id)
    : { id: 'PRJ-N/A', name: 'Unassigned Research Project', code: 'PRJ-N/A', lead_researcher: 'N/A' };

  // 3. Upstream Protocol SOP
  const protocol = exp.protocol_id
    ? db.prepare('SELECT id, code, name, version, category, author, status, description, reagents_json FROM protocols WHERE id = ?').get(exp.protocol_id)
    : { id: 'PROT-N/A', name: 'Standard Operating Procedure', code: 'SOP-N/A', version: exp.protocol_version || 'v1.0', category: 'General' };

  let protocolReagents = [];
  try {
    if (protocol?.reagents_json) {
      protocolReagents = JSON.parse(protocol.reagents_json);
    }
  } catch {}

  // 4. Bound Biological Samples
  const samplesRows = db.prepare('SELECT * FROM samples WHERE associated_experiment_id = ?').all(exp.id);
  const samples = samplesRows.map((s) => ({
    id: s.id,
    name: s.name,
    sampleType: s.sample_type,
    organism: s.organism,
    source: s.source,
    storageLocation: s.storage_location,
    temperature: s.temperature,
    concentration: s.concentration,
    volume: s.volume,
    aliquots: s.aliquots,
    biosafetyLevel: s.biosafety_level,
    status: s.status
  }));

  // 5. Environmental Parameters & Observations
  let parameters = {};
  try {
    parameters = exp.parameters_json ? JSON.parse(exp.parameters_json) : {};
  } catch {}

  const observations = db.prepare('SELECT id, timestamp, note, recorded_by FROM experiment_observations WHERE experiment_id = ? ORDER BY timestamp ASC').all(exp.id);

  // 6. Downstream Datasets
  const datasetsRows = db.prepare('SELECT * FROM datasets WHERE associated_experiment_id = ?').all(exp.id);
  const datasets = datasetsRows.map((d) => ({
    id: d.id,
    name: d.name,
    format: d.format,
    sizeBytes: Number(d.size_bytes),
    checksumSha256: d.checksum_sha256,
    researcher: d.researcher,
    uploadDate: d.upload_date,
    status: d.status
  }));

  // 7. Computational Analyses
  const analysesRows = db.prepare('SELECT * FROM analyses WHERE associated_experiment_id = ?').all(exp.id);
  const analyses = analysesRows.map((a) => {
    let aParams = {};
    let aMetrics = {};
    try { aParams = a.parameters_json ? JSON.parse(a.parameters_json) : {}; } catch {}
    try { aMetrics = a.metrics_json ? JSON.parse(a.metrics_json) : {}; } catch {}

    return {
      id: a.id,
      name: a.name,
      pipelineVersion: a.pipeline_version,
      datasetId: a.dataset_id,
      analyst: a.analyst,
      executionDate: a.execution_date,
      methods: a.methods,
      parameters: aParams,
      metrics: aMetrics,
      status: a.status
    };
  });

  // 8. Final Results
  const resultsRows = db.prepare('SELECT * FROM results WHERE experiment_id = ?').all(exp.id);
  const results = resultsRows.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    primaryMetric: r.primary_metric,
    secondaryMetric: r.secondary_metric,
    validationStatus: r.validation_status,
    leadScientist: r.lead_scientist,
    publishedDate: r.published_date,
    reproducibilityScore: r.reproducibility_score,
    conclusions: r.conclusions
  }));

  // Construct DAG Nodes & Edges
  const nodes = [
    {
      id: 'node-project',
      stage: 1,
      type: 'Project',
      entityId: project?.id || 'PRJ-N/A',
      title: project?.name || 'Research Program',
      subtitle: project?.lead_researcher || 'Principal Investigator',
      status: project?.status || 'Active'
    },
    {
      id: 'node-experiment',
      stage: 2,
      type: 'Experiment',
      entityId: exp.id,
      title: exp.name,
      subtitle: `Operator: ${exp.operator || exp.researcher}`,
      status: exp.status
    },
    {
      id: 'node-protocol',
      stage: 3,
      type: 'Protocol',
      entityId: protocol?.id || 'PROT-N/A',
      title: protocol?.name || 'Protocol SOP',
      subtitle: `Version: ${exp.protocol_version}`,
      status: protocol?.status || 'Validated'
    },
    {
      id: 'node-samples',
      stage: 4,
      type: 'Sample',
      entityId: samples[0]?.id || (samples.length ? `${samples.length} Samples` : 'SMP-PENDING'),
      title: samples[0]?.name || (samples.length ? `${samples.length} Specimens Logged` : 'Awaiting Specimen Intake'),
      subtitle: samples[0]?.storageLocation || (samples.length ? 'Multiple Coordinates' : 'Cold Chain Storage'),
      status: samples[0]?.status || (samples.length ? 'Available' : 'Pending')
    },
    {
      id: 'node-parameters',
      stage: 5,
      type: 'Parameters',
      entityId: 'ENV-PARAMS',
      title: `${Object.keys(parameters).length} FAIR Parameters Logged`,
      subtitle: `${observations.length} Bench Audit Notes`,
      status: 'Recorded'
    },
    {
      id: 'node-datasets',
      stage: 6,
      type: 'Dataset',
      entityId: datasets[0]?.id || (datasets.length ? `${datasets.length} Datasets` : 'DS-PENDING'),
      title: datasets[0]?.name || (datasets.length ? `${datasets.length} Files Ingested` : 'Awaiting File Ingestion'),
      subtitle: datasets[0]?.checksumSha256
        ? `SHA-256: ${datasets[0].checksumSha256.substring(0, 10)}...`
        : 'Cryptographic Digest',
      status: datasets[0]?.status || (datasets.length ? 'Validated' : 'Pending')
    },
    {
      id: 'node-analyses',
      stage: 7,
      type: 'Analysis',
      entityId: analyses[0]?.id || (analyses.length ? `${analyses.length} Pipeline Runs` : 'ANA-PENDING'),
      title: analyses[0]?.name || (analyses.length ? `${analyses.length} Pipelines Executed` : 'Awaiting Pipeline Job'),
      subtitle: analyses[0]?.pipelineVersion || 'Bioinformatics Environment',
      status: analyses[0]?.status || (analyses.length ? 'Completed' : 'Pending')
    },
    {
      id: 'node-results',
      stage: 8,
      type: 'Result',
      entityId: results[0]?.id || (results.length ? `${results.length} Findings` : 'RES-PENDING'),
      title: results[0]?.title || (results.length ? `${results.length} Certified Conclusions` : 'Pending Empirical Validation'),
      subtitle: results[0]?.primaryMetric || 'Reproducibility Metric',
      status: results[0]?.validationStatus || (results.length ? 'Validated' : 'Pending')
    }
  ];

  const edges = [
    { from: 'node-project', to: 'node-experiment', relationship: 'authorizes' },
    { from: 'node-experiment', to: 'node-protocol', relationship: 'executes_sop' },
    { from: 'node-protocol', to: 'node-samples', relationship: 'applied_to' },
    { from: 'node-samples', to: 'node-parameters', relationship: 'conditioned_by' },
    { from: 'node-parameters', to: 'node-datasets', relationship: 'measures' },
    { from: 'node-datasets', to: 'node-analyses', relationship: 'processes' },
    { from: 'node-analyses', to: 'node-results', relationship: 'concludes' }
  ];

  // Integrity Check
  const hasGaps = !project?.id || !exp.id || samples.length === 0 || datasets.length === 0 || results.length === 0;
  const integrityStatus = hasGaps ? 'WARN_INCOMPLETE_PROVENANCE' : 'CERTIFIED_FAIR_COMPLIANT';

  res.json({
    success: true,
    data: {
      experimentId: exp.id,
      experimentName: exp.name,
      integrityStatus,
      project: {
        id: project?.id || 'PRJ-N/A',
        code: project?.code || 'PRJ-N/A',
        name: project?.name || 'Research Project',
        leadResearcher: project?.lead_researcher || 'N/A',
        department: project?.department || 'N/A',
        status: project?.status || 'Active'
      },
      experiment: {
        id: exp.id,
        code: exp.code,
        name: exp.name,
        startDate: exp.start_date,
        completionDate: exp.completion_date,
        status: exp.status,
        researcher: exp.researcher,
        operator: exp.operator,
        description: exp.description
      },
      protocol: {
        id: protocol?.id || 'PROT-N/A',
        code: protocol?.code || 'SOP-N/A',
        name: protocol?.name || 'Laboratory Protocol',
        version: exp.protocol_version || protocol?.version || 'v1.0',
        category: protocol?.category || 'General',
        author: protocol?.author || 'N/A',
        reagents: protocolReagents
      },
      samples,
      parameters,
      observations,
      datasets,
      analyses,
      results,
      graph: {
        nodes,
        edges
      }
    }
  });
});

export default router;
