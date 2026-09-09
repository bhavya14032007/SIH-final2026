-- ============================================================
-- SANRAKSHAK Database Schema
-- AI-Powered Industrial Hazard Prediction & Early Warning System
-- NOTE: Using SQLite for prototype. Easily portable to PostgreSQL.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    industry_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'chemical',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    sectors INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_code TEXT UNIQUE NOT NULL,
    sensor_type TEXT NOT NULL,
    unit TEXT NOT NULL,
    industry_id INTEGER REFERENCES industries(id),
    sector INTEGER,
    latitude REAL,
    longitude REAL,
    min_threshold REAL,
    max_threshold REAL,
    critical_threshold REAL,
    status TEXT DEFAULT 'online',
    battery_level REAL DEFAULT 100,
    signal_strength REAL DEFAULT 95,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER REFERENCES sensors(id),
    value REAL NOT NULL,
    gas_ppm REAL,
    temperature REAL,
    pressure REAL,
    humidity REAL,
    wind_speed REAL,
    wind_direction REAL,
    vibration REAL,
    air_quality REAL,
    flow_rate REAL,
    status TEXT DEFAULT 'normal',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL,
    humidity REAL,
    wind_speed REAL,
    wind_direction REAL,
    pressure REAL,
    rainfall REAL,
    aqi REAL,
    visibility REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_score REAL NOT NULL,
    hazard_type TEXT,
    probability REAL,
    confidence REAL,
    severity TEXT,
    time_to_critical REAL,
    affected_radius REAL,
    model_version TEXT,
    feature_importance TEXT,  -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hazard_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_name TEXT NOT NULL,
    risk_level TEXT NOT NULL,  -- GREEN, YELLOW, ORANGE, RED
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius REAL,
    population INTEGER,
    distance_from_source REAL,
    exposure_direction TEXT,
    safe_capacity INTEGER,
    nearest_shelter TEXT,
    shelter_capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT NOT NULL,  -- CRITICAL, HIGH, WARNING, INFO
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    sensor_code TEXT,
    value REAL,
    threshold REAL,
    acknowledged INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    latitude REAL,
    longitude REAL,
    affected_population INTEGER,
    affected_radius REAL,
    status TEXT DEFAULT 'active',
    response_actions TEXT,  -- JSON string
    resolution_time REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS population_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_name TEXT NOT NULL,
    zone_type TEXT DEFAULT 'residential',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    population INTEGER NOT NULL,
    safe_capacity INTEGER,
    nearest_shelter TEXT,
    shelter_capacity INTEGER,
    distance_from_industry REAL,
    direction_from_industry REAL,  -- degrees
    evacuation_route TEXT,
    estimated_evacuation_time REAL,  -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
