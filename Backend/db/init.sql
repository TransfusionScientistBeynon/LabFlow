CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  forename TEXT NOT NULL,
  surname TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  hospital_Number TEXT NOT NULL,
  NHS_Number TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  patients_id INTEGER NOT NULL REFERENCES patients(id),
  
  
  PatientStability TEXT NOT NULL,
  BleedingOrHaemolysing TEXT NOT NULL,
  Hb TEXT NOT NULL,
  ClinicalDetails TEXT NOT NULL,
  PatientTransfusedInLastThreeMonths TEXT NOT NULL,
  TransfusionDate DATE, 
  HospitalName TEXT NOT NULL,
  LaboratoryContactNumber TEXT NOT NULL,
  ABOGroup TEXT NOT NULL,
  RhDGroup TEXT NOT NULL,
  SerologicalResults TEXT NOT NULL,
  TestRequested TEXT NOT NULL,
  AdditionalInfo TEXT,
  DateRequested DATE NOT NULL,
  TimeRequested TIME NOT NULL,
  SampleTransportMethod TEXT,
  DateOfSampleArrival DATE,
  TimeOfSampleArrival TIME,
  UnitsRequired INTEGER,
  SpecialRequirements TEXT,

  Requester TEXT NOT NULL,
  request_status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id),
  action TEXT NOT NULL,
  status_changed_from TEXT NOT NULL,
  status_changed_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);