// BioSprint Engine - Initial Mock Data Store
// Realistic biological laboratory workflows, protocols, samples, datasets, and provenance chains

export const initialProjects = [
  {
    id: 'PRJ-001',
    name: 'CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells',
    code: 'CRISPR-HSC',
    description: 'Precision correction of the HBB sickle-cell mutation (E6V) using adenine base editors in mobilized human CD34+ stem cells with minimal off-target translocations.',
    leadResearcher: 'Dr. Elena Rostova',
    department: 'Molecular Therapeutics & Gene Editing',
    startDate: '2024-01-15',
    targetEndDate: '2024-11-30',
    status: 'Active',
    budget: '$340,000',
    experimentsCount: 3,
    samplesCount: 4,
    color: 'teal'
  },
  {
    id: 'PRJ-002',
    name: 'Single-Cell Spatial Transcriptomics of Glioblastoma Microenvironment',
    code: 'GBM-SPATIAL',
    description: 'High-resolution spatial RNA sequencing and cellular deconvolution of recurrent glioblastoma surgical resections to identify immunosuppressive niche interactions.',
    leadResearcher: 'Dr. Marcus Thorne',
    department: 'Neuro-Oncology & Genomics',
    startDate: '2024-02-01',
    targetEndDate: '2024-12-15',
    status: 'Active',
    budget: '$490,000',
    experimentsCount: 2,
    samplesCount: 3,
    color: 'navy'
  },
  {
    id: 'PRJ-003',
    name: 'Directed Evolution of High-Affinity Nanobodies for Viral Epitopes',
    code: 'NANO-EVO',
    description: 'Yeast display library screening and kinetic characterization of synthetic single-domain camelid antibodies targeting conserved coronavirus spike glycoproteins.',
    leadResearcher: 'Dr. Ananya Chen',
    department: 'Structural Immunology',
    startDate: '2023-10-10',
    targetEndDate: '2024-08-20',
    status: 'Completed',
    budget: '$280,000',
    experimentsCount: 2,
    samplesCount: 3,
    color: 'emerald'
  },
  {
    id: 'PRJ-004',
    name: 'Microfluidic Lipid Nanoparticle Formulation for mRNA Therapeutics',
    code: 'LNP-MRNA',
    description: 'Optimization of ionizable lipid molar ratios, nitrogen-to-phosphate (N/P) stoichiometry, and microfluidic total flow rates to maximize intracellular mRNA translation.',
    leadResearcher: 'Dr. Robert Sterling',
    department: 'Pharmaceutical Nanotechnology',
    startDate: '2024-03-01',
    targetEndDate: '2025-02-28',
    status: 'Active',
    budget: '$410,000',
    experimentsCount: 2,
    samplesCount: 2,
    color: 'amber'
  },
  {
    id: 'PRJ-005',
    name: 'Untargeted High-Resolution LC-MS Metabolomics of Hypoxic Hepatocytes',
    code: 'METABO-HEP',
    description: 'Profiling alteration in tricarboxylic acid cycle intermediates and acylcarnitine fluxes in primary human hepatocytes under controlled 1% oxygen tension.',
    leadResearcher: 'Dr. Sophia Vance',
    department: 'Metabolic Biochemistry',
    startDate: '2024-04-10',
    targetEndDate: '2024-10-30',
    status: 'Completed',
    budget: '$215,000',
    experimentsCount: 1,
    samplesCount: 2,
    color: 'indigo'
  }
];

export const initialProtocols = [
  {
    id: 'PROT-101',
    name: 'High-Fidelity Cas9 RNP Electroporation in CD34+ Cells',
    code: 'SOP-CAS9-EP',
    version: 'v3.2',
    category: 'Transfection / Electroporation',
    author: 'Dr. Elena Rostova',
    lastModified: '2024-03-12',
    status: 'Validated',
    description: 'Standardized nucleofection procedure using Lonza 4D-Nucleofector for delivery of pre-complexed Cas9 ribonucleoprotein (RNP) and single-stranded guide RNAs into primary mobilized human hematopoietic stem and progenitor cells.',
    reagents: [
      { name: 'HiFi Cas9 Nuclease V3', catalogNo: 'IDT-1081060', storage: '-20°C' },
      { name: 'Synthetic sgRNA (HPLC purified)', catalogNo: 'SYN-8821-HBB', storage: '-80°C' },
      { name: 'P3 Primary Cell 4D-Nucleofector Kit', catalogNo: 'V4XP-3024', storage: 'Room Temp' },
      { name: 'StemSpan SFEM II Media', catalogNo: 'STEM-09655', storage: '4°C' }
    ],
    steps: [
      { step: 1, title: 'Reagent Equilibrations', instruction: 'Thaw Cas9 protein on ice for 15 minutes. Pre-warm StemSpan SFEM II culture medium to 37°C in water bath.' },
      { step: 2, title: 'RNP Complex Assembly', instruction: 'Mix 100 pmol Cas9 nuclease with 250 pmol synthetic sgRNA at 1:2.5 molar ratio in 5 uL sterile IDTE buffer. Incubate at 25°C for 15 min.' },
      { step: 3, title: 'Cell Preparation & Counting', instruction: 'Centrifuge 1x10^6 viable CD34+ cells at 300 x g for 5 min. Aspirate supernatant completely without disturbing the pellet.' },
      { step: 4, title: 'Resuspension in P3 Buffer', instruction: 'Resuspend cell pellet in 20 uL room-temperature P3 primary cell nucleofection solution. Combine immediately with 5 uL RNP complex.' },
      { step: 5, title: 'Electroporation Pulse', instruction: 'Transfer 25 uL mixture to 16-well Nucleocuvette strip. Place into Lonza 4D core unit and pulse program CA-137.' },
      { step: 6, title: 'Post-Pulse Recovery', instruction: 'Immediately add 80 uL pre-warmed media without antibiotics. Rest at 37°C incubator for 10 minutes prior to plated recovery.' }
    ],
    revisions: [
      { version: 'v3.2', date: '2024-03-12', author: 'Dr. Elena Rostova', notes: 'Increased Cas9:sgRNA molar ratio from 1:2 to 1:2.5 to boost target saturation.' },
      { version: 'v3.1', date: '2023-11-05', author: 'Dr. Elena Rostova', notes: 'Updated nucleofection pulse code to CA-137 for higher CD34+ cell viability.' },
      { version: 'v3.0', date: '2023-06-18', author: 'Lab Operations', notes: 'Initial migration to Lonza 4D platform from Neon transfection.' }
    ]
  },
  {
    id: 'PROT-102',
    name: '10x Genomics Chromium 3\' Single-Cell RNA-seq Library Prep',
    code: 'SOP-10X-3PRIME',
    version: 'v2.0',
    category: 'Genomics / Library Prep',
    author: 'Dr. Marcus Thorne',
    lastModified: '2024-02-18',
    status: 'Validated',
    description: 'Encapsulation of single cells into nanoliter Gel Beads-in-emulsion (GEMs) using Chromium X controller, followed by reverse transcription, cDNA amplification, fragmentation, and Illumina dual-index library construction.',
    reagents: [
      { name: 'Chromium Next GEM Single Cell 3\' Kit v3.1', catalogNo: '10X-1000268', storage: '-20°C' },
      { name: 'Single Cell 3\' Gel Beads v3.1', catalogNo: '10X-1000120', storage: '-80°C' },
      { name: 'Chromium Next GEM Chip G', catalogNo: '10X-1000127', storage: 'Room Temp' },
      { name: 'SPRIselect Magnetic Beads', catalogNo: 'B23318', storage: '4°C' }
    ],
    steps: [
      { step: 1, title: 'Cell Suspension Quality Check', instruction: 'Verify cell viability > 90% via automated acridine orange / propidium iodide (AO/PI) fluorescence counting.' },
      { step: 2, title: 'GEM Generation on Chromium X', instruction: 'Load cell master mix, Gel Beads, and Partitioning Oil into Chip G. Run Chromium 3\' GEM generation profile (6.5 min).' },
      { step: 3, title: 'Post-GEM RT Incubation', instruction: 'Thermal cycler GEM-RT: 53°C for 45 min, 85°C for 5 min, hold at 4°C.' },
      { step: 4, title: 'cDNA Cleanup & Amplification', instruction: 'Break emulsion with recovery agent, perform SPRIselect bead cleanup (1.2x ratio), amplify cDNA for 12 cycles.' },
      { step: 5, title: 'Enzymatic Fragmentation & Indexing', instruction: 'Perform cDNA fragmentation, end repair, A-tailing, adaptor ligation, and sample index PCR (14 cycles).' }
    ],
    revisions: [
      { version: 'v2.0', date: '2024-02-18', author: 'Dr. Marcus Thorne', notes: 'Incorporated dual-index dual-UDI primers to eliminate index hopping.' },
      { version: 'v1.0', date: '2023-08-10', author: 'Dr. Marcus Thorne', notes: 'Standard protocol establishment for solid tumor disaggregations.' }
    ]
  },
  {
    id: 'PROT-103',
    name: 'Yeast Surface Display MACS & FACS Biopanning',
    code: 'SOP-YEAST-MACS',
    version: 'v1.4',
    category: 'Protein Engineering',
    author: 'Dr. Ananya Chen',
    lastModified: '2024-01-22',
    status: 'Validated',
    description: 'Enrichment of high-affinity synthetic single-domain camelid antibodies displayed on Saccharomyces cerevisiae using streptavidin magnetic beads (MACS) and dual-color FACS selection.',
    reagents: [
      { name: 'Streptavidin MicroBeads', catalogNo: 'MIL-130-048-101', storage: '4°C' },
      { name: 'Biotinylated SARS-CoV-2 RBD Protein', catalogNo: 'ACRO-SPD-C82E9', storage: '-80°C' },
      { name: 'Anti-HA Tag FITC Conjugate', catalogNo: 'AB-A190-108F', storage: '4°C (Dark)' }
    ],
    steps: [
      { step: 1, title: 'Galactose Induction', instruction: 'Induce yeast library in SG-CAA medium at 20°C with 220 rpm shaking for 24 hours to express surface scFv-HA.' },
      { step: 2, title: 'Antigen Incubation', instruction: 'Incubate 1x10^9 yeast cells with 50 nM biotinylated antigen in PBS-BSA (0.1%) on rotator for 1 hr at 22°C.' },
      { step: 3, title: 'Magnetic Depletion & Positive Sort', instruction: 'Wash with ice-cold PBS, incubate with Streptavidin MicroBeads for 15 min at 4°C, pass through LS column on QuadroMACS magnet.' }
    ],
    revisions: [
      { version: 'v1.4', date: '2024-01-22', author: 'Dr. Ananya Chen', notes: 'Decreased target antigen concentration from 100 nM to 50 nM to enforce stringent Kd cutoff.' }
    ]
  },
  {
    id: 'PROT-104',
    name: 'Microfluidic Assembly & SEC Purification of LNPs',
    code: 'SOP-LNP-MICROFL',
    version: 'v2.1',
    category: 'Formulation / Nanomedicine',
    author: 'Dr. Robert Sterling',
    lastModified: '2024-03-05',
    status: 'Validated',
    description: 'Controlled chaotic-mixer microfluidic synthesis of lipid nanoparticles encapsulating luciferase or therapeutic mRNA using ethanol and citrate buffer streams.',
    reagents: [
      { name: 'Ionizable Lipid SM-102', catalogNo: 'CAY-33474', storage: '-20°C' },
      { name: 'DSPC & Cholesterol & DMG-PEG2000', catalogNo: 'AVANTI-LNP-KIT', storage: '-20°C' },
      { name: 'CleanCap EGFP mRNA', catalogNo: 'TRIL-L-7601', storage: '-80°C' },
      { name: 'Citrate Buffer (50 mM, pH 4.0)', catalogNo: 'BUFF-CIT40', storage: 'Room Temp' }
    ],
    steps: [
      { step: 1, title: 'Lipid Ethanol Phase Prep', instruction: 'Dissolve lipids in 100% ethanol at molar ratio 50:10:38.5:1.5 (SM-102:DSPC:Cholesterol:DMG-PEG2000).' },
      { step: 2, title: 'Aqueous mRNA Phase Prep', instruction: 'Dilute mRNA in 50 mM sodium citrate buffer (pH 4.0) to achieve target N/P charge ratio of 6.0.' },
      { step: 3, title: 'Microfluidic Mixing', instruction: 'Inject phases via dual syringe pumps into herringbone micromixer cartridge at 3:1 aqueous-to-organic flow rate ratio, total flow rate 12 mL/min.' },
      { step: 4, title: 'Buffer Exchange & Sizing', instruction: 'Dialyze against 1x PBS (pH 7.4) in 100 kDa MWCO cassettes for 18h at 4°C. Measure diameter via DLS.' }
    ],
    revisions: [
      { version: 'v2.1', date: '2024-03-05', author: 'Dr. Robert Sterling', notes: 'Calibrated total flow rate from 9 mL/min to 12 mL/min to tighten polydispersity index below 0.08.' }
    ]
  },
  {
    id: 'PROT-105',
    name: 'Two-Phase Methanol/Chloroform Polar Metabolite Extraction',
    code: 'SOP-METAB-EXTRACT',
    version: 'v1.8',
    category: 'Metabolomics',
    author: 'Dr. Sophia Vance',
    lastModified: '2024-04-02',
    status: 'Validated',
    description: 'Rapid cold organic solvent quenching and liquid-liquid partition of primary hepatocytes to preserve unstable central carbon metabolites without enzymatic turnover.',
    reagents: [
      { name: 'LC-MS Grade Methanol (Pre-chilled -80°C)', catalogNo: 'FISH-A456-4', storage: 'Cold' },
      { name: 'LC-MS Grade Water with 13C-Internal Stds', catalogNo: 'CAM-MSK-MET', storage: '-20°C' },
      { name: 'Chloroform (Spectrophotometric)', catalogNo: 'SIG-366927', storage: 'Fume Hood' }
    ],
    steps: [
      { step: 1, title: 'Instantaneous Metabolic Quenching', instruction: 'Aspirate culture media, instantly wash plate with ice-cold 0.9% NaCl, add 80% MeOH (-80°C) to quench metabolism within 5 sec.' },
      { step: 2, title: 'Cell Scraping & Lysing', instruction: 'Scrape monolayer with sterile cell lifter into 2 mL screw-cap tube with 0.5 mm zirconium oxide beads. Homogenize at 6500 rpm for 30s.' },
      { step: 3, title: 'Phase Partitioning', instruction: 'Add chloroform and H2O (ratio 2:2:1.8 MeOH:CHCl3:H2O). Vortex 1 min, centrifuge at 16,000 x g for 15 min at 4°C.' },
      { step: 4, title: 'SpeedVac Lyophilization', instruction: 'Collect upper polar phase, dry in centrifugal vacuum concentrator without heat for 4 hours. Store pellet at -80°C.' }
    ],
    revisions: [
      { version: 'v1.8', date: '2024-04-02', author: 'Dr. Sophia Vance', notes: 'Integrated 13C-yeast universal metabolite extract as internal spike-in control.' }
    ]
  }
];

export const initialSamples = [
  {
    id: 'SMP-2024-0101',
    name: 'CD34+ Peripheral Blood Stem Cells (Donor #902)',
    sampleType: 'Primary Human Cells',
    organism: 'Homo sapiens',
    source: 'Mobilized Apheresis Peripheral Blood',
    storageLocation: 'Liquid Nitrogen Tank Cryo-1, Rack 04, Box B, Slot 12',
    temperature: '-196°C',
    concentration: '1.2 x 10^7 cells/mL',
    volume: '1.0 mL',
    aliquots: 4,
    biosafetyLevel: 'BSL-2',
    collectionDate: '2024-02-14',
    status: 'Available',
    associatedExperiment: 'EXP-2024-001',
    projectId: 'PRJ-001'
  },
  {
    id: 'SMP-2024-0102',
    name: 'Cas9-ABE8e Transfected CD34+ Cell Pellet (24h post-EP)',
    sampleType: 'Cell Pellet',
    organism: 'Homo sapiens',
    source: 'Post-Electroporation Recovery Culture',
    storageLocation: '-80°C Ultra-Low Freezer Alpha, Shelf 2, Box 14, Slot D3',
    temperature: '-80°C',
    concentration: '2.5 x 10^6 cells/pellet',
    volume: 'Pellet',
    aliquots: 2,
    biosafetyLevel: 'BSL-2',
    collectionDate: '2024-03-15',
    status: 'In Assay',
    associatedExperiment: 'EXP-2024-001',
    projectId: 'PRJ-001'
  },
  {
    id: 'SMP-2024-0103',
    name: 'Purified Genomic DNA - HBB Edited HSCs',
    sampleType: 'Genomic DNA',
    organism: 'Homo sapiens',
    source: 'DNeasy Blood & Tissue Extraction',
    storageLocation: '-20°C Specimen Freezer Beta, Rack 1, Box 08, Slot E7',
    temperature: '-20°C',
    concentration: '84.6 ng/uL (A260/280: 1.88)',
    volume: '65 uL',
    aliquots: 3,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2024-03-18',
    status: 'Available',
    associatedExperiment: 'EXP-2024-001',
    projectId: 'PRJ-001'
  },
  {
    id: 'SMP-2024-0201',
    name: 'GBM-042 Primary Surgical Core Biopsy (Subventricular Zone)',
    sampleType: 'Fresh Frozen Tissue',
    organism: 'Homo sapiens',
    source: 'Neurosurgical Resection Core',
    storageLocation: 'Liquid Nitrogen Tank Cryo-2, Rack 02, Box F, Slot 01',
    temperature: '-196°C',
    concentration: '180 mg tissue mass',
    volume: 'Solid Core',
    aliquots: 2,
    biosafetyLevel: 'BSL-2',
    collectionDate: '2024-02-28',
    status: 'Available',
    associatedExperiment: 'EXP-2024-002',
    projectId: 'PRJ-002'
  },
  {
    id: 'SMP-2024-0202',
    name: 'Single-Cell Suspension GBM-042 (Dissociated Viable)',
    sampleType: 'Single-Cell Suspension',
    organism: 'Homo sapiens',
    source: 'Papain Enzymatic Dissociation Kit',
    storageLocation: 'Benchtop Ice Box / Immediate GEM Loading',
    temperature: '4°C (Transient)',
    concentration: '1,250 cells/uL (94% Viability)',
    volume: '120 uL',
    aliquots: 1,
    biosafetyLevel: 'BSL-2',
    collectionDate: '2024-03-02',
    status: 'Depleted',
    associatedExperiment: 'EXP-2024-002',
    projectId: 'PRJ-002'
  },
  {
    id: 'SMP-2024-0301',
    name: 'Synthetic Yeast Naive Nanobody Display Library (v2.4)',
    sampleType: 'Engineered Microbial Culture',
    organism: 'Saccharomyces cerevisiae (EBY100)',
    source: 'High-diversity trimer codon synthetic CDR3',
    storageLocation: '-80°C Ultra-Low Freezer Alpha, Shelf 4, Box 02, Slot A1',
    temperature: '-80°C',
    concentration: '5.0 x 10^8 cells/vial (15% glycerol)',
    volume: '1.5 mL',
    aliquots: 8,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2023-11-01',
    status: 'Available',
    associatedExperiment: 'EXP-2024-003',
    projectId: 'PRJ-003'
  },
  {
    id: 'SMP-2024-0302',
    name: 'MACS Round 3 Enriched Yeast Clones (RBD-High)',
    sampleType: 'Engineered Microbial Culture',
    organism: 'Saccharomyces cerevisiae (EBY100)',
    source: 'Magnetic Bead Positive Eluate',
    storageLocation: '4°C Cold Room 102, Shaker Rack C',
    temperature: '4°C',
    concentration: '4.2 x 10^6 cells/mL',
    volume: '10 mL',
    aliquots: 2,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2024-01-28',
    status: 'Available',
    associatedExperiment: 'EXP-2024-003',
    projectId: 'PRJ-003'
  },
  {
    id: 'SMP-2024-0401',
    name: 'Formulated SM-102 LNP-mRNA Batch #LNP-048A',
    sampleType: 'Formulated Nanomedicine',
    organism: 'In Vitro Synthetic',
    source: 'Herringbone Microfluidic Assembly',
    storageLocation: '4°C Cold Room 102, Nitrogen purged desiccator',
    temperature: '4°C',
    concentration: '0.42 mg/mL mRNA encapsulated',
    volume: '3.5 mL',
    aliquots: 6,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2024-03-20',
    status: 'Available',
    associatedExperiment: 'EXP-2024-004',
    projectId: 'PRJ-004'
  },
  {
    id: 'SMP-2024-0501',
    name: 'Primary Human Hepatocyte Monolayer Extracts (Normoxia 21% O2)',
    sampleType: 'Lyophilized Polar Metabolites',
    organism: 'Homo sapiens (Donor H901)',
    source: 'Methanol/Water Polar Partition',
    storageLocation: '-80°C Ultra-Low Freezer Alpha, Shelf 1, Box 22, Slot G4',
    temperature: '-80°C',
    concentration: 'Extracted from 2.0 x 10^6 cells',
    volume: 'Dry Cake',
    aliquots: 3,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2024-04-18',
    status: 'Available',
    associatedExperiment: 'EXP-2024-005',
    projectId: 'PRJ-005'
  },
  {
    id: 'SMP-2024-0502',
    name: 'Primary Human Hepatocyte Monolayer Extracts (Hypoxia 1% O2)',
    sampleType: 'Lyophilized Polar Metabolites',
    organism: 'Homo sapiens (Donor H901)',
    source: 'Methanol/Water Polar Partition (48h Hypoxic Incubation)',
    storageLocation: '-80°C Ultra-Low Freezer Alpha, Shelf 1, Box 22, Slot G5',
    temperature: '-80°C',
    concentration: 'Extracted from 2.0 x 10^6 cells',
    volume: 'Dry Cake',
    aliquots: 3,
    biosafetyLevel: 'BSL-1',
    collectionDate: '2024-04-18',
    status: 'Available',
    associatedExperiment: 'EXP-2024-005',
    projectId: 'PRJ-005'
  }
];

export const initialExperiments = [
  {
    id: 'EXP-2024-001',
    name: 'HBB Sickle Mutation Base Editing & GUIDE-seq Off-Target Quantification',
    code: 'EXP-CRISPR-01',
    projectId: 'PRJ-001',
    projectName: 'CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells',
    protocolId: 'PROT-101',
    protocolName: 'High-Fidelity Cas9 RNP Electroporation in CD34+ Cells',
    protocolVersion: 'v3.2',
    researcher: 'Dr. Elena Rostova',
    operator: 'E. Rostova / J. Miller',
    startDate: '2024-03-14',
    completionDate: '2024-03-24',
    status: 'Completed',
    description: 'Electroporation of adenine base editor ABE8e mRNA with chemically modified sgRNA-7b into donor CD34+ HSPCs followed by targeted amplicon NGS and GUIDE-seq off-target screening.',
    parameters: {
      nucleofectionProgram: 'CA-137',
      cellDensity: '1.0 x 10^6 cells / 20 uL',
      cas9MolarRatio: '1:2.5 (Cas9 to sgRNA)',
      sgRNALength: '100 nt synthetically modified (2\'-O-methyl 3\' phosphorothioate)',
      postPulseMedia: 'StemSpan SFEM II + 100 ng/mL SCF, TPO, Flt3L',
      incubationDuration: '72 hours post-electroporation',
      temperature: '37.0°C / 5% CO2'
    },
    observations: [
      { timestamp: '2024-03-14 10:45', note: 'Cell viability measured at 96.2% prior to Lonza 4D nucleofection. No clumping observed in P3 solution.' },
      { timestamp: '2024-03-15 09:30', note: '24h post-transfection cell viability counted at 88.4%. Normal morphological blast appearance.' },
      { timestamp: '2024-03-17 14:00', note: 'Harvested 72h culture. DNA extracted with A260/A280 ratio 1.88. Sent for Illumina NovaSeq amplicon sequencing.' }
    ],
    sampleIds: ['SMP-2024-0101', 'SMP-2024-0102', 'SMP-2024-0103'],
    datasetIds: ['DS-2024-001', 'DS-2024-002'],
    analysisId: 'ANA-2024-001',
    resultId: 'RES-2024-001'
  },
  {
    id: 'EXP-2024-002',
    name: 'Chromium Single-Cell RNA Sequencing of Recurrent GBM Surgical Margins',
    code: 'EXP-GBM-SC01',
    projectId: 'PRJ-002',
    projectName: 'Single-Cell Spatial Transcriptomics of Glioblastoma Microenvironment',
    protocolId: 'PROT-102',
    protocolName: '10x Genomics Chromium 3\' Single-Cell RNA-seq Library Prep',
    protocolVersion: 'v2.0',
    researcher: 'Dr. Marcus Thorne',
    operator: 'M. Thorne / K. Patel',
    startDate: '2024-03-01',
    completionDate: '2024-03-10',
    status: 'Completed',
    description: 'Enzymatic tissue disaggregation of resection core GBM-042 into single cell suspension followed by Chromium X droplet capture, aiming for 10,000 targeted cells at 50,000 reads/cell.',
    parameters: {
      targetedCellRecovery: '10,000 cells',
      dissociationEnzyme: 'Papain (20 U/mL) + 0.005% DNase I',
      dissociationTime: '28 minutes at 37°C with gentle shaking',
      cdnaAmpCycles: '12 cycles',
      indexPlate: 'Chromium Dual Index Plate TT Set A'
    },
    observations: [
      { timestamp: '2024-03-02 08:15', note: 'Core biopsy tissue 180 mg received on wet ice within 18 min of neurosurgical resection.' },
      { timestamp: '2024-03-02 09:10', note: 'Dissociation yielded 1.5 x 10^6 cells, viability 94% on Countess II FL with AO/PI staining.' },
      { timestamp: '2024-03-02 11:30', note: 'GEM emulsion verified on microscope: uniform droplet size, zero detectable wetting failures.' }
    ],
    sampleIds: ['SMP-2024-0201', 'SMP-2024-0202'],
    datasetIds: ['DS-2024-003', 'DS-2024-004'],
    analysisId: 'ANA-2024-002',
    resultId: 'RES-2024-002'
  },
  {
    id: 'EXP-2024-003',
    name: 'Selection & Kinetic Titration of Nanobody Clones against Spike-RBD',
    code: 'EXP-NANO-03',
    projectId: 'PRJ-003',
    projectName: 'Directed Evolution of High-Affinity Nanobodies for Viral Epitopes',
    protocolId: 'PROT-103',
    protocolName: 'Yeast Surface Display MACS & FACS Biopanning',
    protocolVersion: 'v1.4',
    researcher: 'Dr. Ananya Chen',
    operator: 'A. Chen',
    startDate: '2024-01-20',
    completionDate: '2024-02-05',
    status: 'Completed',
    description: 'Third-round magnetic sorting and FACS gating of yeast display library with 20 nM biotin-RBD followed by surface plasmon resonance (Biacore 8K) kinetic off-rate validation.',
    parameters: {
      targetAntigen: 'SARS-CoV-2 BA.2.86 Spike RBD',
      antigenConcentration: '20 nM equilibrium titration',
      beadIncubationTemp: '4°C for 20 min',
      sortGatingStrategy: 'Top 0.5% FITC (HA expression) / APC (antigen binding)'
    },
    observations: [
      { timestamp: '2024-01-22 14:00', note: 'MACS Round 2 showed 4.8% enrichment. Proceeding with stringent 20 nM MACS Round 3 sorting.' },
      { timestamp: '2024-01-28 16:30', note: 'Round 3 sort yielded clear dual-positive population. High avidity binders identified in quadrant 2.' }
    ],
    sampleIds: ['SMP-2024-0301', 'SMP-2024-0302'],
    datasetIds: ['DS-2024-005'],
    analysisId: 'ANA-2024-003',
    resultId: 'RES-2024-003'
  },
  {
    id: 'EXP-2024-004',
    name: 'Staggered Herringbone Microfluidic LNP Hydrodynamic Size Screening',
    code: 'EXP-LNP-04',
    projectId: 'PRJ-004',
    projectName: 'Microfluidic Lipid Nanoparticle Formulation for mRNA Therapeutics',
    protocolId: 'PROT-104',
    protocolName: 'Microfluidic Assembly & SEC Purification of LNPs',
    protocolVersion: 'v2.1',
    researcher: 'Dr. Robert Sterling',
    operator: 'R. Sterling / L. Wei',
    startDate: '2024-03-18',
    completionDate: null,
    status: 'Active',
    description: 'Systematic testing of Total Flow Rates (6, 9, 12, 15 mL/min) and Flow Rate Ratios (3:1 vs 5:1) to determine smallest hydrodynamic diameter and lowest polydispersity index (PDI).',
    parameters: {
      totalFlowRates: '6, 9, 12, 15 mL/min',
      flowRateRatio: '3:1 (Aqueous : Ethanol)',
      lipidConcentration: '10 mM in ethanol',
      mRNAChargeNP: '6.0 (+/- charge ratio)',
      chipGeometry: 'Staggered herringbone mixer (SHM)'
    },
    observations: [
      { timestamp: '2024-03-19 11:20', note: 'Runs 1-3 completed. Dynamic light scattering (DLS) shows tight monodisperse distribution at 12 mL/min.' },
      { timestamp: '2024-03-21 15:45', note: 'Dialysis buffer exchanged completed. 24h stability run in progress at 4°C.' }
    ],
    sampleIds: ['SMP-2024-0401'],
    datasetIds: ['DS-2024-006'],
    analysisId: 'ANA-2024-004',
    resultId: 'RES-2024-004'
  },
  {
    id: 'EXP-2024-005',
    name: 'Hypoxia-Induced TCA Flux Reprogramming in Primary Hepatocytes (48h)',
    code: 'EXP-METAB-05',
    projectId: 'PRJ-005',
    projectName: 'Untargeted High-Resolution LC-MS Metabolomics of Hypoxic Hepatocytes',
    protocolId: 'PROT-105',
    protocolName: 'Two-Phase Methanol/Chloroform Polar Metabolite Extraction',
    protocolVersion: 'v1.8',
    researcher: 'Dr. Sophia Vance',
    operator: 'S. Vance / T. Gomez',
    startDate: '2024-04-15',
    completionDate: '2024-04-28',
    status: 'Completed',
    description: 'Cultivation of human primary hepatocytes under 21% O2 (normoxia) vs 1% O2 (hypoxia) in glove-box chamber, followed by cold methanol quenching and Orbitrap LC-MS metabolomics.',
    parameters: {
      hypoxiaLevel: '1.0% O2, 5% CO2, balanced N2',
      incubationDuration: '48 hours continuous',
      quenchingReagent: '80% LC-MS Methanol at -80°C',
      extractionSolventRatio: '2:2:1.8 (MeOH : CHCl3 : H2O)',
      reconstitutionVolume: '50 uL 50% acetonitrile with internal standards'
    },
    observations: [
      { timestamp: '2024-04-16 09:00', note: 'Hypoxic chamber O2 sensor verified calibrated at 0.98% O2. Cell morphology intact.' },
      { timestamp: '2024-04-18 10:15', note: 'Rapid cold quenching achieved in < 5 seconds per dish. Polar phase clear, phase boundary sharp.' }
    ],
    sampleIds: ['SMP-2024-0501', 'SMP-2024-0502'],
    datasetIds: ['DS-2024-007', 'DS-2024-008'],
    analysisId: 'ANA-2024-005',
    resultId: 'RES-2024-005'
  },
  {
    id: 'EXP-2024-006',
    name: 'CRISPR Off-Target Cleavage Genome-Wide Screen by GUIDE-seq',
    code: 'EXP-CRISPR-02',
    projectId: 'PRJ-001',
    projectName: 'CRISPR-Cas9 Base Editing in Hematopoietic Stem Cells',
    protocolId: 'PROT-101',
    protocolName: 'High-Fidelity Cas9 RNP Electroporation in CD34+ Cells',
    protocolVersion: 'v3.2',
    researcher: 'Dr. Elena Rostova',
    operator: 'J. Miller',
    startDate: '2024-04-02',
    completionDate: null,
    status: 'In Progress',
    description: 'Genome-wide unbiased identification of double-strand break sites using phosphorothioate-modified dsODN tag integration in CD34+ cells treated with ABE8e-sgRNA-7b.',
    parameters: {
      dsODNConcentration: '100 pmol dsODN tag per nucleofection',
      sequencingPlatform: 'Illumina NextSeq 2000 (2x150bp)',
      minSequencingDepth: '15 Million reads per library'
    },
    observations: [
      { timestamp: '2024-04-03 14:20', note: 'Transfection with dsODN completed. Cell recovery on track.' }
    ],
    sampleIds: ['SMP-2024-0101'],
    datasetIds: [],
    analysisId: null,
    resultId: null
  }
];

export const initialDatasets = [
  {
    id: 'DS-2024-001',
    name: 'HBB_Target_Amplicon_NovaSeq_R1_R2.fastq.gz',
    format: 'FASTQ (Compressed)',
    sizeBytes: 2845417472, // ~2.65 GB
    associatedExperiment: 'EXP-2024-001',
    experimentName: 'HBB Sickle Mutation Base Editing',
    researcher: 'Dr. Elena Rostova',
    uploadDate: '2024-03-18',
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    readCount: '24,850,210 paired reads',
    storageBucket: 's3://lab-genomics-raw/prj001/exp001/novaseq_r1_r2.fastq.gz',
    status: 'Validated'
  },
  {
    id: 'DS-2024-002',
    name: 'HBB_CRISPR_Aligned_BAM_Coordinates.bam',
    format: 'BAM (Binary Sequence Alignment)',
    sizeBytes: 1982345100, // ~1.85 GB
    associatedExperiment: 'EXP-2024-001',
    experimentName: 'HBB Sickle Mutation Base Editing',
    researcher: 'J. Miller (Bioinformatics)',
    uploadDate: '2024-03-20',
    checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    readCount: '24,210,880 mapped reads (97.4%)',
    storageBucket: 's3://lab-genomics-aligned/prj001/exp001/aligned_hbb.bam',
    status: 'Validated'
  },
  {
    id: 'DS-2024-003',
    name: 'GBM042_Chromium_SingleCell_Raw_Fastq.tar.gz',
    format: 'FASTQ / TAR',
    sizeBytes: 15482319000, // ~14.4 GB
    associatedExperiment: 'EXP-2024-002',
    experimentName: 'Chromium Single-Cell RNA Sequencing GBM',
    researcher: 'Dr. Marcus Thorne',
    uploadDate: '2024-03-05',
    checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    readCount: '348,190,000 paired reads',
    storageBucket: 's3://lab-singlecell-raw/prj002/exp002/gbm042_raw.tar.gz',
    status: 'Validated'
  },
  {
    id: 'DS-2024-004',
    name: 'GBM042_Filtered_Feature_Barcode_Matrix.h5',
    format: 'HDF5 Matrix',
    sizeBytes: 88450120, // ~84 MB
    associatedExperiment: 'EXP-2024-002',
    experimentName: 'Chromium Single-Cell RNA Sequencing GBM',
    researcher: 'K. Patel',
    uploadDate: '2024-03-07',
    checksumSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    readCount: '9,842 cells x 36,601 genes',
    storageBucket: 's3://lab-singlecell-processed/prj002/exp002/filtered_matrix.h5',
    status: 'Validated'
  },
  {
    id: 'DS-2024-005',
    name: 'Biacore8K_Surface_Plasmon_Resonance_Sensorgrams.csv',
    format: 'CSV (Tabular Sensorgram)',
    sizeBytes: 1420500, // ~1.4 MB
    associatedExperiment: 'EXP-2024-003',
    experimentName: 'Kinetic Titration of Nanobody Clones',
    researcher: 'Dr. Ananya Chen',
    uploadDate: '2024-02-02',
    checksumSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    readCount: '16 channel kinetic sensorgrams',
    storageBucket: 's3://lab-spr-data/prj003/exp003/biacore_sensorgrams.csv',
    status: 'Validated'
  },
  {
    id: 'DS-2024-006',
    name: 'Malvern_Zetasizer_DLS_Size_PDI_MultiFlow.csv',
    format: 'CSV (DLS Raw Spectra)',
    sizeBytes: 840200, // ~820 KB
    associatedExperiment: 'EXP-2024-004',
    experimentName: 'Herringbone Microfluidic LNP Screening',
    researcher: 'Dr. Robert Sterling',
    uploadDate: '2024-03-20',
    checksumSha256: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    readCount: '48 multi-run intensity autocorrelation files',
    storageBucket: 's3://lab-nanomed/prj004/exp004/dls_size_pdi.csv',
    status: 'Validated'
  },
  {
    id: 'DS-2024-007',
    name: 'Orbitrap_Exploris480_Polar_Metabolome_ESI_Neg.mzML',
    format: 'mzML (Standard XML MS)',
    sizeBytes: 4210450000, // ~3.9 GB
    associatedExperiment: 'EXP-2024-005',
    experimentName: 'Hypoxia-Induced TCA Flux Reprogramming',
    researcher: 'Dr. Sophia Vance',
    uploadDate: '2024-04-20',
    checksumSha256: 'd7a8fbb307d7809469ca9abec0003e0681a8047382985602177b0f37f4370f0f',
    readCount: '24 MS/MS spectra runs (DDA mode)',
    storageBucket: 's3://lab-masspec/prj005/exp005/orbitrap_neg.mzML',
    status: 'Validated'
  },
  {
    id: 'DS-2024-008',
    name: 'Targeted_TCA_Metabolite_Peak_Area_Integration.xlsx',
    format: 'XLSX / CSV',
    sizeBytes: 620400, // ~600 KB
    associatedExperiment: 'EXP-2024-005',
    experimentName: 'Hypoxia-Induced TCA Flux Reprogramming',
    researcher: 'T. Gomez',
    uploadDate: '2024-04-24',
    checksumSha256: '2c624232cdd221771294dfbb310aca000a0df6ec9b5feb9ebb95ab443f14022f',
    readCount: '142 quantified metabolite peaks',
    storageBucket: 's3://lab-masspec/prj005/exp005/tca_peaks.xlsx',
    status: 'Validated'
  }
];

export const initialAnalyses = [
  {
    id: 'ANA-2024-001',
    name: 'CRISPResso2 Deep Quantification of On/Off-Target Alleles',
    pipelineVersion: 'CRISPResso2 v2.2.14 / Bowtie2 v2.5.1',
    associatedExperiment: 'EXP-2024-001',
    datasetId: 'DS-2024-002',
    analyst: 'J. Miller',
    executionDate: '2024-03-21',
    status: 'Completed',
    methods: 'Demultiplexed paired-end reads were processed with CRISPResso2 in base-editor mode targeting human HBB exon 1 (hg38 chr11:5,227,002). Cleavage efficiency evaluated with window size 10 bp around guide target. Potential off-targets mapped via Cas-OFFinder with 3 mismatches allowance.',
    parameters: {
      quantificationWindow: '10 bp',
      minAverageReadQuality: '30 (Phred scale)',
      plotWindowSize: '30 bp',
      baseEditorOutputMode: 'Adenine Base Editor (A-to-G transition)'
    },
    metrics: {
      totalReadsAnalyzed: '24,210,880',
      onTargetTargetedEditing: '87.4%',
      indelsFrequency: '0.38%',
      bystanderEditingA9: '1.2%',
      offTargetCleavageTopSite: '0.04% (within background)'
    }
  },
  {
    id: 'ANA-2024-002',
    name: 'Seurat v5 Single-Cell Spatial & Immune Cluster Annotation',
    pipelineVersion: 'CellRanger v7.1.0 / Seurat v5.0.1 / Harmony',
    associatedExperiment: 'EXP-2024-002',
    datasetId: 'DS-2024-004',
    analyst: 'K. Patel',
    executionDate: '2024-03-08',
    status: 'Completed',
    methods: 'Filtered cell barcodes with >500 genes and <15% mitochondrial content. Normalized via SCTransform v2 with cell-cycle regression. Dimensionality reduction via PCA (top 30 components) and graph-based clustering at resolution 0.8. Cell types mapped using SingleR and GliomaAtlas signatures.',
    parameters: {
      minFeatures: 500,
      maxMitoPercent: '15.0%',
      pcaComponents: 30,
      clusteringResolution: 0.8,
      integrationMethod: 'Harmony batch-correction'
    },
    metrics: {
      cellsRecovered: '9,842',
      medianGenesPerCell: '3,842',
      medianUMIReadsPerCell: '12,940',
      identifiedCellClusters: '14 distinct clusters',
      immuneInfiltrateFraction: '31.4% (dominated by immunosuppressive TAMs)'
    }
  },
  {
    id: 'ANA-2024-003',
    name: 'Biacore Kinetic Sensorgram 1:1 Langmuir Binding Fit',
    pipelineVersion: 'Biacore Insight Evaluation Software v4.0.8',
    associatedExperiment: 'EXP-2024-003',
    datasetId: 'DS-2024-005',
    analyst: 'Dr. Ananya Chen',
    executionDate: '2024-02-03',
    status: 'Completed',
    methods: 'Multi-cycle kinetic analysis with 5 concentrations of SARS-CoV-2 RBD (1.25 nM to 20 nM). Double referencing against reference flow cell 1 and zero-concentration blank injections. Global fitting to 1:1 binding model with mass-transfer coefficient inclusion.',
    parameters: {
      fittingModel: '1:1 Langmuir Binding',
      temperature: '25.0°C',
      flowRate: '30 uL/min',
      contactTime: '180 s',
      dissociationTime: '600 s'
    },
    metrics: {
      associationRateKa: '3.42 x 10^5 M^-1 s^-1',
      dissociationRateKd: '4.78 x 10^-4 s^-1',
      equilibriumAffinityKD: '1.40 nM',
      chiSquaredFit: '0.42 RU^2'
    }
  },
  {
    id: 'ANA-2024-004',
    name: 'LNP Hydrodynamic Diameter & Polydispersity Regression Model',
    pipelineVersion: 'Zetasizer v8.02 / Python SciPy 1.11',
    associatedExperiment: 'EXP-2024-004',
    datasetId: 'DS-2024-006',
    analyst: 'Dr. Robert Sterling',
    executionDate: '2024-03-21',
    status: 'Completed',
    methods: 'Cumulants analysis and CONTIN distribution fits for dynamic light scattering intensity data across microfluidic flow conditions. Zeta-potential measured via laser Doppler velocimetry.',
    parameters: {
      laserWavelength: '633 nm He-Ne',
      scatteringAngle: '173° backscatter',
      dispersantRefractiveIndex: '1.330 (Water)',
      viscosity: '0.8872 cP'
    },
    metrics: {
      optimalFlowRate: '12 mL/min (TFR) at 3:1 (FRR)',
      meanZAverageDiameter: '68.4 nm (+/- 1.8 nm)',
      polydispersityIndexPDI: '0.068 (Highly monodisperse)',
      meanZetaPotential: '-4.2 mV (Neutral stealth)'
    }
  },
  {
    id: 'ANA-2024-005',
    name: 'MS-DIAL Metabolite Annotation & Statistical Volcanoplot Flux',
    pipelineVersion: 'MS-DIAL v4.92 / MetaboAnalyst 5.0',
    associatedExperiment: 'EXP-2024-005',
    datasetId: 'DS-2024-008',
    analyst: 'T. Gomez',
    executionDate: '2024-04-26',
    status: 'Completed',
    methods: 'Peak detection, deconvolution, and retention time alignment with MassBank and Fiehn MS/MS spectral libraries. False discovery rate (FDR) controlled by Benjamini-Hochberg adjustment. Pathway enrichment calculated against KEGG human metabolism.',
    parameters: {
      massToleranceMS1: '0.005 Da',
      massToleranceMS2: '0.01 Da',
      fdrSignificanceThreshold: '0.01',
      log2FoldChangeThreshold: '1.5'
    },
    metrics: {
      totalFeaturesDetected: '2,840 peaks',
      highConfidenceIdentifiedMetabolites: '184 metabolites',
      statisticallySignificantAltered: '34 metabolites (p < 0.001)',
      topUpregulatedPathway: 'Hypoxia-Inducible Glycolysis & Succinate Accumulation (log2FC = +3.42)'
    }
  }
];

export const initialResults = [
  {
    id: 'RES-2024-001',
    experimentId: 'EXP-2024-001',
    experimentName: 'HBB Sickle Mutation Base Editing',
    projectId: 'PRJ-001',
    title: '87.4% High-Fidelity A-to-G Conversion with Undetectable GUIDE-seq Translocations',
    summary: 'The optimized CA-137 nucleofection with 1:2.5 Cas9-to-sgRNA achieved therapeutic benchmark target base editing (87.4% A-to-G conversion at HBB position 6). No detectable genomic translocations above background threshold (0.04%).',
    primaryMetric: '87.4% Base Editing Efficiency',
    secondaryMetric: '0.38% Indel Frequency',
    validationStatus: 'Validated',
    leadScientist: 'Dr. Elena Rostova',
    publishedDate: '2024-03-24',
    reproducibilityScore: '99.4%',
    conclusions: 'The electroporation protocol PROT-101 v3.2 is certified for preclinical safety scale-up in mobilized patient CD34+ hematopoietic progenitors.'
  },
  {
    id: 'RES-2024-002',
    experimentId: 'EXP-2024-002',
    experimentName: 'Chromium Single-Cell RNA Sequencing GBM',
    projectId: 'PRJ-002',
    title: 'Identification of Immunosuppressive Hypoxic Macrophage Niche in Recurrent GBM Margins',
    summary: 'Transcriptomic profiling of 9,842 single cells revealed a specific CD163+/SPP1+ tumor-associated macrophage subpopulation enriched at the hypoxic invasive margin, driving T-cell exhaustion markers.',
    primaryMetric: '9,842 High-Quality Single Cells',
    secondaryMetric: '14 Resolved Cellular Subtypes',
    validationStatus: 'Validated',
    leadScientist: 'Dr. Marcus Thorne',
    publishedDate: '2024-03-10',
    reproducibilityScore: '98.1%',
    conclusions: 'SPP1/CD44 signaling axis prioritized as novel candidate for synergistic immunotherapy in recurrent high-grade glioma.'
  },
  {
    id: 'RES-2024-003',
    experimentId: 'EXP-2024-003',
    experimentName: 'Kinetic Titration of Nanobody Clones',
    projectId: 'PRJ-003',
    title: 'Discovery of Picomolar Affinity Camelid Nanobody Nb-RBD-89 (Kd = 1.40 nM)',
    summary: 'Screening of 5x10^8 yeast library members yielded clone Nb-RBD-89 with equilibrium dissociation constant Kd of 1.40 nM and robust thermal stability (Tm = 74.2°C).',
    primaryMetric: 'KD = 1.40 nM (Biacore 8K)',
    secondaryMetric: 'Tm = 74.2°C (Thermal Shift)',
    validationStatus: 'Validated',
    leadScientist: 'Dr. Ananya Chen',
    publishedDate: '2024-02-05',
    reproducibilityScore: '99.8%',
    conclusions: 'Clone Nb-RBD-89 advanced to structural cryo-EM characterization and pseudovirus neutralization assays.'
  },
  {
    id: 'RES-2024-004',
    experimentId: 'EXP-2024-004',
    experimentName: 'Herringbone Microfluidic LNP Screening',
    projectId: 'PRJ-004',
    title: 'Optimal Formulation Window for SM-102 LNPs: 68.4 nm Diameter at 12 mL/min Flow',
    summary: 'Identified precise microfluidic sweet spot at Total Flow Rate of 12 mL/min and 3:1 aqueous-to-organic ratio yielding ultra-monodisperse nanoparticles (PDI = 0.068) with 94.2% encapsulation efficiency.',
    primaryMetric: 'Diameter: 68.4 nm (PDI 0.068)',
    secondaryMetric: '94.2% mRNA Encapsulation',
    validationStatus: 'In Progress',
    leadScientist: 'Dr. Robert Sterling',
    publishedDate: '2024-03-22',
    reproducibilityScore: '96.5%',
    conclusions: 'Formulation parameter set saved as SOP-LNP-MICROFL v2.2 candidate.'
  },
  {
    id: 'RES-2024-005',
    experimentId: 'EXP-2024-005',
    experimentName: 'Hypoxia-Induced TCA Flux Reprogramming',
    projectId: 'PRJ-005',
    title: 'Hypoxic Succinate Accumulation (3.42-fold) Drives Inflammatory Metabolic Switch',
    summary: 'Primary hepatocytes exposed to 1% O2 exhibited massive accumulation of succinate and fumarate with concurrent reduction in alpha-ketoglutarate, confirming succinate dehydrogenase reversal.',
    primaryMetric: '+3.42 log2FC Succinate Elevation',
    secondaryMetric: '34 Altered Metabolic Intermediates',
    validationStatus: 'Validated',
    leadScientist: 'Dr. Sophia Vance',
    publishedDate: '2024-04-28',
    reproducibilityScore: '97.9%',
    conclusions: 'Data submitted to MetaboLights repository (MTBLS-8921) under FAIR reproducible provenance compliance.'
  }
];

export const initialActivities = [
  {
    id: 'ACT-001',
    type: 'experiment_completed',
    title: 'Experiment EXP-2024-001 marked Completed',
    details: 'HBB Sickle Mutation Base Editing & GUIDE-seq Off-Target Quantification completed with 87.4% editing efficiency.',
    user: 'Dr. Elena Rostova',
    timestamp: '2024-03-24 16:30',
    entityId: 'EXP-2024-001'
  },
  {
    id: 'ACT-002',
    type: 'dataset_uploaded',
    title: 'New Raw Dataset Uploaded',
    details: 'HBB_Target_Amplicon_NovaSeq_R1_R2.fastq.gz (2.65 GB) uploaded with SHA-256 hash verified.',
    user: 'J. Miller',
    timestamp: '2024-03-18 11:15',
    entityId: 'DS-2024-001'
  },
  {
    id: 'ACT-003',
    type: 'provenance_verified',
    title: 'Data Provenance Lineage Certified',
    details: 'End-to-end audit trail verified for EXP-2024-001 from Project PRJ-001 through Final Result RES-2024-001.',
    user: 'BioSprint Provenance Engine',
    timestamp: '2024-03-24 17:00',
    entityId: 'EXP-2024-001'
  },
  {
    id: 'ACT-004',
    type: 'protocol_updated',
    title: 'Protocol PROT-101 Revised to v3.2',
    details: 'Cas9:sgRNA molar ratio calibrated from 1:2 to 1:2.5 in standard operating procedure.',
    user: 'Dr. Elena Rostova',
    timestamp: '2024-03-12 14:10',
    entityId: 'PROT-101'
  },
  {
    id: 'ACT-005',
    type: 'sample_registered',
    title: 'Biological Sample Registered',
    details: 'Formulated SM-102 LNP-mRNA Batch #LNP-048A logged in Cold Room 102.',
    user: 'Dr. Robert Sterling',
    timestamp: '2024-03-20 09:45',
    entityId: 'SMP-2024-0401'
  }
];

export const initialDeadlines = [
  {
    id: 'DL-001',
    title: 'Microfluidic LNP Stability Run 48h Assay',
    experimentId: 'EXP-2024-004',
    experimentName: 'LNP Hydrodynamic Size Screening',
    dueDate: '2024-11-05',
    priority: 'High',
    owner: 'Dr. Robert Sterling'
  },
  {
    id: 'DL-002',
    title: 'GUIDE-seq NextSeq 2000 Flow Cell Loading',
    experimentId: 'EXP-2024-006',
    experimentName: 'CRISPR Off-Target Screening',
    dueDate: '2024-11-12',
    priority: 'High',
    owner: 'J. Miller'
  },
  {
    id: 'DL-003',
    title: 'Annual Institutional Biosafety (IBC) Protocol Audit',
    experimentId: null,
    experimentName: 'Lab Operations & Compliance',
    dueDate: '2024-11-20',
    priority: 'Medium',
    owner: 'BioSprint Compliance'
  },
  {
    id: 'DL-004',
    title: 'Single-Cell Spatial Tissue Core Resection #2',
    experimentId: 'EXP-2024-002',
    experimentName: 'Spatial Transcriptomics GBM',
    dueDate: '2024-11-28',
    priority: 'Medium',
    owner: 'Dr. Marcus Thorne'
  }
];

export const initialSettings = {
  profile: {
    fullName: 'Dr. Evelyn Vance, PhD',
    title: 'Principal Investigator & Senior Research Scientist',
    department: 'Laboratory of Quantitative Genetics & Functional Genomics',
    institution: 'BioSprint Institute of Advanced Bioscience',
    email: 'e.vance@biosprint-research.org',
    orcid: '0000-0002-8419-7201',
    avatarInitials: 'EV'
  },
  preferences: {
    defaultStorageTemp: '-80°C Ultra-Low Freezer',
    sequencingQCThreshold: 'Q30 (99.9% base accuracy)',
    autoProvenanceHashing: true,
    requireProtocolVersionTagging: true,
    enforceFAIRCompliance: true,
    storageQuotaLimitGB: 500,
    storageQuotaUsedGB: 182.4
  },
  notifications: {
    emailOnExperimentStatusChange: true,
    emailOnProtocolRevision: true,
    emailOnDatasetUpload: false,
    alertOnStorageQuota80Percent: true,
    dailyDigestReport: true
  }
};
