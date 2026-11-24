import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { runMigrations } from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedDemoDatabase(dbInstance) {
  const db = dbInstance || new DatabaseSync(path.join(__dirname, '../../data/biosprint_demo.db'));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Ensure all tables exist before seeding
  runMigrations(db);

  console.log('[BioSprint Demo] Seeding Isolated Faculty Evaluation Database (biosprint_demo.db)...');

  // Clear demo tables
  const tables = [
    'audit_logs',
    'results',
    'analyses',
    'datasets',
    'samples',
    'experiment_observations',
    'experiments',
    'protocols',
    'projects',
    'users'
  ];

  for (const t of tables) {
    db.prepare(`DELETE FROM ${t}`).run();
  }

  // 1. Seed 6 Demonstration Users
  const defaultPasswordHash = bcrypt.hashSync('BioSprint2026!', 10);
  const defaultAccessCodeHash = bcrypt.hashSync('BioSprint2026!', 10);

  const demoUsers = [
    {
      id: 'USR-DEMO-PI',
      email: 'elena.rostova@biosprint.org',
      full_name: 'Dr. Elena Rostova',
      role: 'Principal Investigator',
      department: 'Molecular Genetics & Functional Genomics',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0002-8419-7201',
      avatar_url: null
    },
    {
      id: 'USR-DEMO-SCIENTIST',
      email: 'm.thorne@biosprint.org',
      full_name: 'Dr. Marcus Thorne',
      role: 'Research Scientist',
      department: 'Neuro-Oncology & Functional Genomics',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0001-9234-1188',
      avatar_url: null
    },
    {
      id: 'USR-DEMO-TECH',
      email: 'l.wei@biosprint.org',
      full_name: 'Lin Wei',
      role: 'Laboratory Technician',
      department: 'Specimen Repository & Cold Chain',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0003-4412-8890',
      avatar_url: null
    },
    {
      id: 'USR-DEMO-BIOINF',
      email: 'j.miller@biosprint.org',
      full_name: 'Dr. James Miller',
      role: 'Bioinformatics Analyst',
      department: 'Computational Biology & NGS Core',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0002-7711-3094',
      avatar_url: null
    },
    {
      id: 'USR-DEMO-AUDITOR',
      email: 'auditor@biosprint.org',
      full_name: 'Dr. Clara Sterling',
      role: 'Compliance Auditor',
      department: 'Quality Assurance & Regulatory Affairs',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0002-1200-4491',
      avatar_url: null
    },
    {
      id: 'USR-DEMO-ADMIN',
      email: 'admin@biosprint.org',
      full_name: 'System Administrator',
      role: 'System Administrator',
      department: 'Research IT & DevOps Infrastructure',
      institution: 'BioSprint Institute of Advanced Bioscience',
      orcid: '0000-0000-0000-0000',
      avatar_url: null
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, access_code_hash, full_name, role, department, institution, orcid, avatar_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  for (const u of demoUsers) {
    insertUser.run(
      u.id,
      u.email,
      defaultPasswordHash,
      defaultAccessCodeHash,
      u.full_name,
      u.role,
      u.department,
      u.institution,
      u.orcid,
      u.avatar_url
    );
  }

  // 2. Demo Projects
  const insertProject = db.prepare(`
    INSERT INTO projects (id, code, name, description, lead_researcher, department, start_date, target_end_date, status, budget)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run(
    'PRJ-DEMO-001',
    'CRISPR-HSC',
    '[DEMO] CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells',
    'Targeted precision correction of the HBB sickle-cell mutation (E6V) using adenine base editors (ABE8e) in primary CD34+ human stem cells.',
    'Dr. Elena Rostova',
    'Molecular Genetics & Functional Genomics',
    '2024-01-15',
    '2024-12-30',
    'Active',
    '$340,000'
  );

  insertProject.run(
    'PRJ-DEMO-002',
    'ONCO-NGS',
    '[DEMO] Single-Cell Transcriptomic Atlas of Glioblastoma Microenvironment',
    'Longitudinal scRNA-seq mapping of glioma recurrence signatures, immune infiltration phenotypes, and therapy resistance targets.',
    'Dr. Marcus Thorne',
    'Neuro-Oncology & Functional Genomics',
    '2024-03-01',
    '2025-06-30',
    'Active',
    '$420,000'
  );

  // 3. Demo Protocols
  const insertProtocol = db.prepare(`
    INSERT INTO protocols (id, code, name, version, category, author, status, description, steps_json, reagents_json, revisions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProtocol.run(
    'PROT-DEMO-101',
    'SOP-CAS9-EP',
    '[DEMO] High-Fidelity Cas9 RNP Electroporation in CD34+ Primary Cells',
    'v3.2',
    'Transfection / Electroporation',
    'Dr. Elena Rostova',
    'Validated',
    'Standard operating protocol for ribonucleoprotein nucleofection using the Lonza 4D system with primary human mobilized apheresis stem cells.',
    JSON.stringify([
      { step: 1, title: 'Reagent Equilibrations', instruction: 'Thaw HiFi Cas9 nuclease and synthetic sgRNA on ice for 15 minutes.' },
      { step: 2, title: 'RNP Complex Assembly', instruction: 'Mix 100 pmol Cas9 nuclease with 250 pmol synthetic sgRNA at 1:2.5 molar ratio. Incubate 20 min at RT.' },
      { step: 3, title: 'Cell Preparation & Pulse', instruction: 'Harvest 1.0 x 10^6 CD34+ cells in 20 uL P3 solution. Pulse with program CA-137.' },
      { step: 4, title: 'Post-Electroporation Recovery', instruction: 'Add 80 uL pre-warmed StemSpan SFEM II. Transfer to 37°C incubator.' }
    ]),
    JSON.stringify([
      { name: 'HiFi Cas9 Nuclease V3', catalogNo: 'IDT-1081060', storage: '-20°C' },
      { name: 'P3 Primary Cell 4D-Nucleofector Kit', catalogNo: 'V4XP-3024', storage: 'Room Temp' },
      { name: 'StemSpan SFEM II Expansion Medium', catalogNo: 'STEM-09655', storage: '-20°C' }
    ]),
    JSON.stringify([
      { version: 'v3.2', date: '2024-03-12', author: 'Dr. Elena Rostova', notes: 'Increased Cas9:sgRNA molar ratio from 1:2 to 1:2.5 to suppress off-target cleavage.' },
      { version: 'v3.1', date: '2024-01-20', author: 'Dr. Marcus Thorne', notes: 'Validated pulse parameter CA-137 on Lonza 4D.' }
    ])
  );

  insertProtocol.run(
    'PROT-DEMO-102',
    'SOP-CRYO-INTAKE',
    '[DEMO] Standardized Cryopreservation & Cold-Chain Intake Procedure',
    'v2.0',
    'Cryopreservation',
    'Lin Wei',
    'Validated',
    'Liquid nitrogen vapor phase accessioning, barcoding, 2D matrix verification, and temperature-logged transfer.',
    JSON.stringify([
      { step: 1, title: 'Specimen Verification', instruction: 'Scan 2D matrix tube barcode and verify BSL-2 documentation.' },
      { step: 2, title: 'Controlled-Rate Freezing', instruction: 'Place vials in CoolCell container at -1°C/minute in -80°C for 24h.' },
      { step: 3, title: 'Vapor Phase LN2 Transfer', instruction: 'Transfer to designated cryogenic rack and log box coordinates.' }
    ]),
    JSON.stringify([
      { name: 'CryoStor CS10 Freezing Media', catalogNo: 'STEM-07930', storage: '2-8°C' },
      { name: 'FluidX 2D Barcoded Cryo Vials 1.0 mL', catalogNo: 'FX-65-7643', storage: 'Room Temp' }
    ]),
    JSON.stringify([
      { version: 'v2.0', date: '2024-02-01', author: 'Lin Wei', notes: 'Mandated dual-technician verification for all liquid nitrogen transfers.' }
    ])
  );

  // 4. Demo Experiments
  const insertExp = db.prepare(`
    INSERT INTO experiments (id, code, name, project_id, protocol_id, protocol_version, researcher, operator, start_date, completion_date, status, description, parameters_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExp.run(
    'EXP-DEMO-001',
    'EXP-CRISPR-01',
    '[DEMO] HBB Sickle Mutation Base Editing & GUIDE-seq Off-Target Quantification',
    'PRJ-DEMO-001',
    'PROT-DEMO-101',
    'v3.2',
    'Dr. Elena Rostova',
    'E. Rostova / J. Miller',
    '2024-03-14',
    '2024-03-24',
    'Completed',
    'Precision nucleofection of adenine base editor ABE8e targeting human HBB codon 6 in mobilised CD34+ hematopoietic stem cells.',
    JSON.stringify({
      nucleofectionProgram: 'CA-137',
      cellDensity: '1.0 x 10^6 cells / 20 uL',
      cas9MolarRatio: '1:2.5 (Cas9:sgRNA)',
      temperature: '37.0°C / 5% CO2'
    })
  );

  insertExp.run(
    'EXP-DEMO-002',
    'EXP-ONCO-02',
    '[DEMO] Droplet scRNA-Seq Profiling of Primary Glioma Biopsies',
    'PRJ-DEMO-002',
    'PROT-DEMO-102',
    'v2.0',
    'Dr. Marcus Thorne',
    'M. Thorne / L. Wei',
    '2024-04-01',
    null,
    'In Progress',
    '10x Genomics Chromium Next GEM single cell 3 v3.1 library preparation targeting 12,000 cells per lane.',
    JSON.stringify({
      targetCellRecovery: '12,000 cells/lane',
      lysisBuffer: 'Hypotonic Detergent Buffer v4',
      pcrCycles: 14,
      sequencer: 'Illumina NovaSeq 6000'
    })
  );

  // 5. Demo Observations
  const insertObs = db.prepare(`
    INSERT INTO experiment_observations (id, experiment_id, timestamp, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertObs.run('OBS-DEMO-001', 'EXP-DEMO-001', '2024-03-14 10:45', 'Pre-electroporation viability: 96.4% via acridine orange / propidium iodide.', 'Dr. Elena Rostova');
  insertObs.run('OBS-DEMO-002', 'EXP-DEMO-001', '2024-03-15 09:30', '24h post-transfection viability: 88.7%. No observable aggregate clumping.', 'Dr. Elena Rostova');
  insertObs.run('OBS-DEMO-003', 'EXP-DEMO-001', '2024-03-24 16:00', 'Amplicon NGS demultiplexing complete. Q30 score > 94.8%.', 'Dr. James Miller');

  // 6. Demo Samples
  const insertSample = db.prepare(`
    INSERT INTO samples (id, name, sample_type, organism, source, storage_location, temperature, concentration, volume, aliquots, biosafety_level, collection_date, status, associated_experiment_id, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSample.run(
    'SMP-DEMO-001',
    '[DEMO] CD34+ Human Hematopoietic Stem Cells (Donor #902)',
    'Primary Human Cells',
    'Homo sapiens',
    'Mobilized Apheresis Peripheral Blood',
    'Liquid Nitrogen Tank Cryo-1, Rack 04, Box B, Slot 12',
    '-196°C',
    '1.2 x 10^7 cells/mL',
    '1.0 mL',
    4,
    'BSL-2',
    '2024-02-14',
    'Available',
    'EXP-DEMO-001',
    'PRJ-DEMO-001'
  );

  insertSample.run(
    'SMP-DEMO-002',
    '[DEMO] Recurrent Glioblastoma Primary Tissue Biopsy #418',
    'Solid Tumor Biopsy',
    'Homo sapiens',
    'Surgical Resection (Right Frontal Lobe)',
    'Ultra-Low Freezer ULT-02, Shelf 3, Box C, Slot 05',
    '-80°C',
    '250 mg intact tissue',
    '2.0 mL',
    2,
    'BSL-2',
    '2024-03-28',
    'Available',
    'EXP-DEMO-002',
    'PRJ-DEMO-002'
  );

  // 7. Demo Datasets
  const insertDataset = db.prepare(`
    INSERT INTO datasets (id, name, format, size_bytes, file_path, checksum_sha256, associated_experiment_id, researcher, upload_date, read_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDataset.run(
    'DS-DEMO-001',
    'HBB_Target_Amplicon_NovaSeq_R1_R2.fastq.gz',
    'FASTQ (Compressed)',
    2845417472,
    'uploads/demo_hbb_amplicon.fastq.gz',
    '4a89fb3fbc23f95b77d61b3691657a82664cf12efb756e09e1cf3e63fe3fba93',
    'EXP-DEMO-001',
    'Dr. James Miller',
    '2024-03-18',
    '24,850,210 paired reads',
    'Validated'
  );

  insertDataset.run(
    'DS-DEMO-002',
    'GBM_scRNA_Chromium_GeneExpression_Raw.tar.gz',
    'TAR / CellRanger Archive',
    8420104192,
    'uploads/demo_gbm_scrna.tar.gz',
    '87e3cb8993f4e243918a994ef92bb213a528659b867c2f0f4a8169e5d4cb07da',
    'EXP-DEMO-002',
    'Dr. Marcus Thorne',
    '2024-04-03',
    '48,200,100 reads',
    'Processing'
  );

  // 8. Demo Analyses
  const insertAnalysis = db.prepare(`
    INSERT INTO analyses (id, name, pipeline_version, associated_experiment_id, dataset_id, analyst, execution_date, methods, parameters_json, metrics_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAnalysis.run(
    'ANA-DEMO-001',
    '[DEMO] CRISPResso2 Allele Quantification & GUIDE-seq Off-Target Profiling',
    'CRISPResso2 v2.2.14 / Bowtie2 v2.5.1',
    'EXP-DEMO-001',
    'DS-DEMO-001',
    'Dr. James Miller',
    '2024-03-21',
    'Paired-end amplicon reads aligned against GRCh38 HBB genomic locus. Base editing conversion efficiency and indel noise computed.',
    JSON.stringify({ window: '10 bp', minQuality: 30, quantificationWindowCenter: -10 }),
    JSON.stringify({ onTarget: 87.4, indelNoise: 0.38, accuracyScore: '99.4%' }),
    'Completed'
  );

  // 9. Demo Results
  const insertResult = db.prepare(`
    INSERT INTO results (id, experiment_id, project_id, title, summary, primary_metric, secondary_metric, validation_status, lead_scientist, published_date, reproducibility_score, conclusions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertResult.run(
    'RES-DEMO-001',
    'EXP-DEMO-001',
    'PRJ-DEMO-001',
    '[DEMO] 87.4% High-Fidelity A-to-G Conversion with Undetectable Translocations',
    'CA-137 nucleofection with HiFi Cas9 achieved 87.4% A-to-G base conversion at HBB codon 6, reversing the sickle mutation while maintaining cell viability above 88%.',
    '87.4% Base Editing Efficiency',
    '0.38% Indel Frequency',
    'Validated',
    'Dr. Elena Rostova',
    '2024-03-24',
    '99.4%',
    'High-fidelity electroporation protocol validated for preclinical scale-up and compliant with GLP standards.'
  );

  // 10. Demo Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, event_type, action_title, details, user_name, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('ACT-DEMO-001', 'project_created', '[DEMO] Research Project Created', 'Project PRJ-DEMO-001 initialized with budget $340,000.', 'Dr. Elena Rostova', 'project', 'PRJ-DEMO-001');
  insertAudit.run('ACT-DEMO-002', 'protocol_approved', '[DEMO] Protocol SOP-CAS9-EP Approved', 'SOP v3.2 validated and signed off for GLP assay execution.', 'Dr. Elena Rostova', 'protocol', 'PROT-DEMO-101');
  insertAudit.run('ACT-DEMO-003', 'sample_intake', '[DEMO] Specimen Intake Logged', 'Primary CD34+ Apheresis cells banked in LN2 Tank Cryo-1.', 'Lin Wei', 'sample', 'SMP-DEMO-001');
  insertAudit.run('ACT-DEMO-004', 'dataset_hashed', '[DEMO] Checksum SHA-256 Calculated', 'NovaSeq FASTQ dataset cryptographically sealed.', 'Dr. James Miller', 'dataset', 'DS-DEMO-001');
  insertAudit.run('ACT-DEMO-005', 'result_certified', '[DEMO] Experimental Conclusion Certified', 'Result RES-DEMO-001 certified with 99.4% reproducibility score.', 'Dr. Elena Rostova', 'result', 'RES-DEMO-001');

  console.log('[BioSprint Demo] Isolated Faculty Evaluation Database populated successfully.');
}

if (process.argv[1]?.endsWith('seedDemo.js')) {
  seedDemoDatabase();
}
