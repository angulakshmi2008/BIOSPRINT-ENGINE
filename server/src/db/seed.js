import db from './index.js';

export function seedDevelopmentFixtures() {
  console.log('[BioSprint DB] Seeding Isolated Development / Testing Fixtures...');

  // 1. Project
  const insertProject = db.prepare(`
    INSERT OR REPLACE INTO projects (id, code, name, description, lead_researcher, department, start_date, target_end_date, status, budget)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProject.run(
    'PRJ-001',
    'CRISPR-HSC',
    'CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells',
    'Precision correction of the HBB sickle-cell mutation (E6V) using adenine base editors.',
    'Dr. Elena Rostova',
    'Molecular Therapeutics & Gene Editing',
    '2024-01-15',
    '2024-12-30',
    'Active',
    '$340,000'
  );

  // 2. Protocol
  const stepsJson = JSON.stringify([
    { step: 1, title: 'Reagent Equilibrations', instruction: 'Thaw Cas9 protein on ice for 15 minutes.' },
    { step: 2, title: 'RNP Complex Assembly', instruction: 'Mix 100 pmol Cas9 nuclease with 250 pmol synthetic sgRNA.' },
    { step: 3, title: 'Electroporation Pulse', instruction: 'Pulse with Lonza 4D program CA-137.' }
  ]);
  const reagentsJson = JSON.stringify([
    { name: 'HiFi Cas9 Nuclease V3', catalogNo: 'IDT-1081060', storage: '-20°C' },
    { name: 'P3 Primary Cell 4D-Nucleofector Kit', catalogNo: 'V4XP-3024', storage: 'Room Temp' }
  ]);
  const revisionsJson = JSON.stringify([
    { version: 'v3.2', date: '2024-03-12', author: 'Dr. Elena Rostova', notes: 'Increased Cas9:sgRNA molar ratio to 1:2.5.' }
  ]);

  const insertProtocol = db.prepare(`
    INSERT OR REPLACE INTO protocols (id, code, name, version, category, author, status, description, steps_json, reagents_json, revisions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProtocol.run(
    'PROT-101',
    'SOP-CAS9-EP',
    'High-Fidelity Cas9 RNP Electroporation in CD34+ Cells',
    'v3.2',
    'Transfection / Electroporation',
    'Dr. Elena Rostova',
    'Validated',
    'Standardized nucleofection procedure using Lonza 4D-Nucleofector.',
    stepsJson,
    reagentsJson,
    revisionsJson
  );

  // 3. Experiment
  const paramsJson = JSON.stringify({
    nucleofectionProgram: 'CA-137',
    cellDensity: '1.0 x 10^6 cells / 20 uL',
    cas9MolarRatio: '1:2.5 (Cas9 to sgRNA)',
    temperature: '37.0°C / 5% CO2'
  });

  const insertExp = db.prepare(`
    INSERT OR REPLACE INTO experiments (id, code, name, project_id, protocol_id, protocol_version, researcher, operator, start_date, completion_date, status, description, parameters_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExp.run(
    'EXP-2024-001',
    'EXP-CRISPR-01',
    'HBB Sickle Mutation Base Editing & GUIDE-seq Off-Target Quantification',
    'PRJ-001',
    'PROT-101',
    'v3.2',
    'Dr. Elena Rostova',
    'E. Rostova / J. Miller',
    '2024-03-14',
    '2024-03-24',
    'Completed',
    'Electroporation of adenine base editor ABE8e mRNA into CD34+ cells.',
    paramsJson
  );

  // 4. Observation
  const insertObs = db.prepare(`
    INSERT OR REPLACE INTO experiment_observations (id, experiment_id, timestamp, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertObs.run('OBS-001', 'EXP-2024-001', '2024-03-14 10:45', 'Cell viability measured at 96.2% prior to Lonza 4D nucleofection.', 'Dr. Elena Rostova');
  insertObs.run('OBS-002', 'EXP-2024-001', '2024-03-15 09:30', '24h post-transfection cell viability counted at 88.4%.', 'Dr. Elena Rostova');

  // 5. Sample
  const insertSample = db.prepare(`
    INSERT OR REPLACE INTO samples (id, name, sample_type, organism, source, storage_location, temperature, concentration, volume, aliquots, biosafety_level, collection_date, status, associated_experiment_id, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSample.run(
    'SMP-2024-0101',
    'CD34+ Peripheral Blood Stem Cells (Donor #902)',
    'Primary Human Cells',
    'Homo sapiens',
    'Mobilized Apheresis Blood',
    'Liquid Nitrogen Tank Cryo-1, Rack 04, Box B, Slot 12',
    '-196°C',
    '1.2 x 10^7 cells/mL',
    '1.0 mL',
    4,
    'BSL-2',
    '2024-02-14',
    'Available',
    'EXP-2024-001',
    'PRJ-001'
  );

  // 6. Dataset
  const insertDataset = db.prepare(`
    INSERT OR REPLACE INTO datasets (id, name, format, size_bytes, file_path, checksum_sha256, associated_experiment_id, researcher, upload_date, read_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDataset.run(
    'DS-2024-001',
    'HBB_Target_Amplicon_NovaSeq_R1_R2.fastq.gz',
    'FASTQ (Compressed)',
    2845417472,
    'uploads/sample_fixture.fastq.gz',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'EXP-2024-001',
    'Dr. Elena Rostova',
    '2024-03-18',
    '24,850,210 paired reads',
    'Validated'
  );

  // 7. Analysis
  const insertAnalysis = db.prepare(`
    INSERT OR REPLACE INTO analyses (id, name, pipeline_version, associated_experiment_id, dataset_id, analyst, execution_date, methods, parameters_json, metrics_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAnalysis.run(
    'ANA-2024-001',
    'CRISPResso2 Deep Quantification of On/Off-Target Alleles',
    'CRISPResso2 v2.2.14 / Bowtie2 v2.5.1',
    'EXP-2024-001',
    'DS-2024-001',
    'Dr. James Miller',
    '2024-03-21',
    'Demultiplexed reads processed in base-editor mode targeting human HBB exon 1.',
    JSON.stringify({ window: '10 bp', minQuality: 30 }),
    JSON.stringify({ onTargetEditing: '87.4%', indels: '0.38%' }),
    'Completed'
  );

  // 8. Result
  const insertResult = db.prepare(`
    INSERT OR REPLACE INTO results (id, experiment_id, project_id, title, summary, primary_metric, secondary_metric, validation_status, lead_scientist, published_date, reproducibility_score, conclusions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertResult.run(
    'RES-2024-001',
    'EXP-2024-001',
    'PRJ-001',
    '87.4% High-Fidelity A-to-G Conversion with Undetectable Translocations',
    'The optimized CA-137 nucleofection achieved 87.4% A-to-G conversion at HBB position 6.',
    '87.4% Base Editing Efficiency',
    '0.38% Indel Frequency',
    'Validated',
    'Dr. Elena Rostova',
    '2024-03-24',
    '99.4%',
    'Certified for preclinical safety scale-up.'
  );

  // 9. Audit Log
  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, event_type, action_title, details, user_name, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('ACT-001', 'experiment_completed', 'Experiment EXP-2024-001 Completed', 'Marked completed with 87.4% editing efficiency.', 'Dr. Elena Rostova', 'experiment', 'EXP-2024-001');

  console.log('[BioSprint DB] Development fixtures seeded successfully.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDevelopmentFixtures();
}
