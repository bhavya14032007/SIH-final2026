-- ============================================================
-- SANRAKSHAK Seed Data
-- Industrial Complex Alpha — Demo Configuration
-- ============================================================

-- Default admin user (password: sanrakshak2026)
INSERT INTO users (industry_id, email, password_hash, full_name, role)
VALUES ('IND-ALPHA-001', 'admin@sanrakshak.in', 'pbkdf2:sha256:600000$sanrakshak$demo_hash', 'Dr. Priya Sharma', 'admin');

-- Industrial Complex Alpha
INSERT INTO industries (name, type, latitude, longitude, address, sectors)
VALUES ('Industrial Complex Alpha', 'chemical', 19.0760, 72.8777, 'MIDC Andheri East, Mumbai, Maharashtra', 5);

-- Sensors
INSERT INTO sensors (sensor_code, sensor_type, unit, industry_id, sector, latitude, longitude, min_threshold, max_threshold, critical_threshold, status)
VALUES
    ('S1-GAS', 'gas', 'ppm', 1, 4, 19.0765, 72.8782, 0, 300, 450, 'online'),
    ('S2-TEMP', 'temperature', '°C', 1, 4, 19.0763, 72.8780, 20, 60, 85, 'online'),
    ('S3-PRESS', 'pressure', 'bar', 1, 3, 19.0761, 72.8785, 2, 7, 9, 'online'),
    ('S4-CHEM', 'chemical', 'ppm', 1, 4, 19.0767, 72.8779, 0, 250, 400, 'online'),
    ('S5-VIB', 'vibration', 'mm/s', 1, 2, 19.0758, 72.8775, 0, 10, 18, 'online'),
    ('S6-HUM', 'humidity', '%', 1, 1, 19.0760, 72.8790, 30, 70, 85, 'online'),
    ('S7-FLOW', 'flow_rate', 'L/min', 1, 4, 19.0764, 72.8783, 50, 200, 280, 'online'),
    ('S8-AQI', 'air_quality', 'AQI', 1, 1, 19.0755, 72.8770, 0, 150, 300, 'online');

-- Population Zones around Industrial Complex Alpha
INSERT INTO population_zones (zone_name, zone_type, latitude, longitude, population, safe_capacity, nearest_shelter, shelter_capacity, distance_from_industry, direction_from_industry, evacuation_route, estimated_evacuation_time)
VALUES
    ('Zone A - North Residential', 'residential', 19.0810, 72.8777, 2450, 2000, 'Community Hall A', 800, 0.8, 0, 'NH-48 North', 12),
    ('Zone B - Northeast Colony', 'residential', 19.0800, 72.8830, 1680, 1500, 'School B', 600, 1.2, 45, 'Link Road NE', 15),
    ('Zone C - East Commercial', 'commercial', 19.0760, 72.8840, 860, 700, 'Mall Shelter C', 400, 0.9, 90, 'Eastern Express', 10),
    ('Zone D - Southeast Housing', 'residential', 19.0720, 72.8830, 1240, 800, 'Temple Hall D', 350, 1.0, 135, 'SE Bypass Road', 18),
    ('Zone E - South District', 'residential', 19.0710, 72.8777, 1950, 1800, 'Stadium E', 1200, 0.7, 180, 'SV Road South', 8),
    ('Zone F - West Industrial', 'industrial', 19.0760, 72.8720, 420, 400, 'Factory Shelter F', 200, 0.6, 270, 'Western Highway', 6);
