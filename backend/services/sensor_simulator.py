"""
SANRAKSHAK - Sensor Simulator
Generates realistic simulated industrial sensor data.
Supports NORMAL mode and INCIDENT SIMULATION mode.
NOTE: Simulated data for prototype. Replace with real IoT sensors in production.
"""

import math
import random
import time
from datetime import datetime


class SensorSimulator:
    """Simulates industrial sensor readings with realistic correlations."""

    def __init__(self):
        self.mode = 'normal'  # 'normal' or 'incident'
        self.simulation_stage = 0
        self.simulation_start_time = None
        self.stage_duration = 4  # seconds per stage
        self.max_stages = 13
        self.base_values = {
            'gas_ppm': 150,
            'temperature': 35,
            'pressure': 5.2,
            'humidity': 55,
            'wind_speed': 8,
            'wind_direction': 315,  # NW
            'vibration': 3.5,
            'air_quality': 85,
            'flow_rate': 120,
        }
        self.current_values = dict(self.base_values)
        self._noise_seed = random.random()

    def start_simulation(self):
        """Start incident simulation mode."""
        self.mode = 'incident'
        self.simulation_stage = 0
        self.simulation_start_time = time.time()
        self.current_values = dict(self.base_values)
        return {'status': 'simulation_started', 'stages': self.max_stages}

    def reset_simulation(self):
        """Reset to normal mode."""
        self.mode = 'normal'
        self.simulation_stage = 0
        self.simulation_start_time = None
        self.current_values = dict(self.base_values)
        return {'status': 'simulation_reset'}

    def _add_noise(self, value, noise_pct=0.03):
        """Add realistic noise to a sensor value."""
        noise = value * noise_pct * (random.random() * 2 - 1)
        return round(value + noise, 2)

    def _calculate_incident_stage(self):
        """Determine current simulation stage based on elapsed time."""
        if self.simulation_start_time is None:
            return 0
        elapsed = time.time() - self.simulation_start_time
        stage = min(int(elapsed / self.stage_duration), self.max_stages)
        self.simulation_stage = stage
        return stage

    def get_readings(self):
        """Generate current sensor readings based on mode."""
        if self.mode == 'incident':
            return self._get_incident_readings()
        return self._get_normal_readings()

    def _get_normal_readings(self):
        """Generate normal operating sensor values with minor fluctuations."""
        t = time.time()
        readings = {
            'gas_ppm': self._add_noise(150 + 20 * math.sin(t / 30), 0.05),
            'temperature': self._add_noise(35 + 3 * math.sin(t / 60), 0.02),
            'pressure': self._add_noise(5.2 + 0.3 * math.sin(t / 45), 0.01),
            'humidity': self._add_noise(55 + 5 * math.sin(t / 90), 0.02),
            'wind_speed': self._add_noise(8 + 3 * math.sin(t / 40), 0.05),
            'wind_direction': self._add_noise(315 + 15 * math.sin(t / 120), 0.01),
            'vibration': self._add_noise(3.5 + 1 * math.sin(t / 25), 0.04),
            'air_quality': self._add_noise(85 + 10 * math.sin(t / 50), 0.03),
            'flow_rate': self._add_noise(120 + 10 * math.sin(t / 35), 0.02),
        }

        readings['risk_score'] = self._calculate_risk_score(readings)
        readings['timestamp'] = datetime.now().isoformat()
        readings['mode'] = 'normal'
        readings['stage'] = 0
        readings['status'] = self._determine_status(readings)
        return readings

    def _get_incident_readings(self):
        """
        Generate escalating sensor values following the 13-stage incident scenario.
        Values change realistically with correlations:
        Gas ↑ → Temperature ↑ → Pressure unstable → Wind shifts → Hazard escalates
        """
        stage = self._calculate_incident_stage()
        progress = min((time.time() - self.simulation_start_time) / (self.stage_duration * self.max_stages), 1.0)

        # Stage-based escalation with smooth interpolation
        if stage <= 2:
            # Stage 1-2: Gas begins increasing
            gas = 150 + (stage * 80) + (progress * 100)
            temp = 35 + (stage * 5)
            pressure = 5.2 + (stage * 0.3)
            humidity = 55 + (stage * 3)
            wind_speed = 8 + (stage * 1)
            wind_dir = 315 - (stage * 10)  # Starting to shift
            vibration = 3.5 + (stage * 1.5)
            aqi = 85 + (stage * 20)
        elif stage <= 4:
            # Stage 3-4: Temperature increases, pressure destabilizes
            gas = 310 + ((stage - 2) * 50)
            temp = 45 + ((stage - 2) * 15)
            pressure = 5.8 + ((stage - 2) * 0.8) + random.uniform(-0.3, 0.5)
            humidity = 61 + ((stage - 2) * 4)
            wind_speed = 10 + ((stage - 2) * 3)
            wind_dir = 295 - ((stage - 2) * 30)  # Shifting more
            vibration = 6.5 + ((stage - 2) * 2)
            aqi = 125 + ((stage - 2) * 30)
        elif stage <= 7:
            # Stage 5-7: Wind shifts toward population, ML detects escalation
            gas = 410 + ((stage - 4) * 30)
            temp = 75 + ((stage - 4) * 5)
            pressure = 7.4 + ((stage - 4) * 0.4) + random.uniform(-0.5, 0.7)
            humidity = 69 + ((stage - 4) * 3)
            wind_speed = 16 + ((stage - 4) * 2)
            wind_dir = 235 - ((stage - 4) * 25)  # Heading SE toward Zone D
            vibration = 10.5 + ((stage - 4) * 2)
            aqi = 185 + ((stage - 4) * 25)
        elif stage <= 10:
            # Stage 8-10: Critical escalation
            gas = 500 + ((stage - 7) * 20)
            temp = 90 + ((stage - 7) * 3)
            pressure = 8.6 + ((stage - 7) * 0.3) + random.uniform(-0.8, 1.0)
            humidity = 78 + ((stage - 7) * 3)
            wind_speed = 22 + ((stage - 7) * 2)
            wind_dir = 160 - ((stage - 7) * 10)  # Settled toward SE
            vibration = 16.5 + ((stage - 7) * 1)
            aqi = 260 + ((stage - 7) * 15)
        else:
            # Stage 11-13: Peak critical, alerts fire
            gas = 560 + ((stage - 10) * 10)
            temp = 99 + ((stage - 10) * 0.5)
            pressure = 9.5 + random.uniform(-1.0, 1.2)
            humidity = 87 + ((stage - 10) * 1)
            wind_speed = 28 + ((stage - 10) * 0.5)
            wind_dir = 135 + random.uniform(-5, 5)  # Locked SE
            vibration = 19.5 + ((stage - 10) * 0.3)
            aqi = 305 + ((stage - 10) * 5)

        readings = {
            'gas_ppm': self._add_noise(gas, 0.03),
            'temperature': self._add_noise(temp, 0.02),
            'pressure': self._add_noise(pressure, 0.02),
            'humidity': self._add_noise(humidity, 0.02),
            'wind_speed': self._add_noise(wind_speed, 0.03),
            'wind_direction': self._add_noise(wind_dir, 0.01),
            'vibration': self._add_noise(vibration, 0.04),
            'air_quality': self._add_noise(aqi, 0.03),
            'flow_rate': self._add_noise(max(60, 120 - stage * 8), 0.02),
        }

        readings['risk_score'] = self._calculate_risk_score(readings)
        readings['timestamp'] = datetime.now().isoformat()
        readings['mode'] = 'incident'
        readings['stage'] = stage
        readings['status'] = self._determine_status(readings)
        readings['simulation_progress'] = round(progress * 100, 1)

        self.current_values = readings
        return readings

    def _calculate_risk_score(self, readings):
        """
        Calculate composite risk score (0-100) from sensor values.
        Uses weighted multi-factor scoring with thresholds.
        """
        score = 0

        # Gas contribution (weight: 0.25)
        gas = readings.get('gas_ppm', 150)
        if gas > 450:
            score += 25
        elif gas > 300:
            score += 18
        elif gas > 200:
            score += 10
        else:
            score += 4

        # Temperature contribution (weight: 0.20)
        temp = readings.get('temperature', 35)
        if temp > 85:
            score += 20
        elif temp > 60:
            score += 14
        elif temp > 45:
            score += 8
        else:
            score += 3

        # Pressure instability (weight: 0.15)
        pressure = readings.get('pressure', 5.2)
        if pressure > 8.5:
            score += 15
        elif pressure > 7:
            score += 10
        elif pressure > 6:
            score += 6
        else:
            score += 2

        # Wind exposure (weight: 0.15)
        wind_speed = readings.get('wind_speed', 8)
        wind_dir = readings.get('wind_direction', 315)
        # Higher risk if wind heads toward SE (populated Zone D ~135°)
        dir_risk = max(0, 1 - abs(wind_dir - 135) / 180) * 10
        speed_risk = min(wind_speed / 30, 1) * 5
        score += dir_risk + speed_risk

        # Vibration (weight: 0.10)
        vib = readings.get('vibration', 3.5)
        if vib > 15:
            score += 10
        elif vib > 10:
            score += 7
        elif vib > 6:
            score += 4
        else:
            score += 1

        # Air quality (weight: 0.10)
        aqi = readings.get('air_quality', 85)
        if aqi > 250:
            score += 10
        elif aqi > 150:
            score += 6
        elif aqi > 100:
            score += 3
        else:
            score += 1

        # Humidity amplifier (weight: 0.05)
        hum = readings.get('humidity', 55)
        if hum > 80:
            score += 5
        elif hum > 65:
            score += 3
        else:
            score += 1

        return min(round(score), 100)

    def _determine_status(self, readings):
        """Determine overall system status from readings."""
        risk = readings.get('risk_score', 0)
        if risk >= 80:
            return 'CRITICAL'
        elif risk >= 60:
            return 'HIGH'
        elif risk >= 40:
            return 'ELEVATED'
        return 'NORMAL'

    def get_sensor_statuses(self):
        """Get individual sensor status cards."""
        readings = self.current_values
        sensors = [
            {
                'id': 'S1-GAS', 'name': 'Gas Concentration', 'type': 'gas',
                'value': readings.get('gas_ppm', 150), 'unit': 'ppm',
                'threshold': 300, 'critical': 450,
                'status': 'CRITICAL' if readings.get('gas_ppm', 0) > 450 else 'WARNING' if readings.get('gas_ppm', 0) > 300 else 'ONLINE',
                'battery': 94, 'signal': 98
            },
            {
                'id': 'S2-TEMP', 'name': 'Temperature', 'type': 'temperature',
                'value': readings.get('temperature', 35), 'unit': '°C',
                'threshold': 60, 'critical': 85,
                'status': 'CRITICAL' if readings.get('temperature', 0) > 85 else 'WARNING' if readings.get('temperature', 0) > 60 else 'ONLINE',
                'battery': 87, 'signal': 95
            },
            {
                'id': 'S3-PRESS', 'name': 'Pressure', 'type': 'pressure',
                'value': readings.get('pressure', 5.2), 'unit': 'bar',
                'threshold': 7, 'critical': 9,
                'status': 'CRITICAL' if readings.get('pressure', 0) > 9 else 'WARNING' if readings.get('pressure', 0) > 7 else 'ONLINE',
                'battery': 91, 'signal': 97
            },
            {
                'id': 'S4-CHEM', 'name': 'Chemical Sensor', 'type': 'chemical',
                'value': readings.get('gas_ppm', 150) * 0.8, 'unit': 'ppm',
                'threshold': 250, 'critical': 400,
                'status': 'CRITICAL' if readings.get('gas_ppm', 0) * 0.8 > 400 else 'WARNING' if readings.get('gas_ppm', 0) * 0.8 > 250 else 'ONLINE',
                'battery': 82, 'signal': 93
            },
            {
                'id': 'S5-VIB', 'name': 'Vibration', 'type': 'vibration',
                'value': readings.get('vibration', 3.5), 'unit': 'mm/s',
                'threshold': 10, 'critical': 18,
                'status': 'CRITICAL' if readings.get('vibration', 0) > 18 else 'WARNING' if readings.get('vibration', 0) > 10 else 'ONLINE',
                'battery': 96, 'signal': 99
            },
            {
                'id': 'S6-HUM', 'name': 'Humidity', 'type': 'humidity',
                'value': readings.get('humidity', 55), 'unit': '%',
                'threshold': 70, 'critical': 85,
                'status': 'WARNING' if readings.get('humidity', 0) > 70 else 'ONLINE',
                'battery': 89, 'signal': 96
            },
            {
                'id': 'S7-FLOW', 'name': 'Flow Rate', 'type': 'flow_rate',
                'value': readings.get('flow_rate', 120), 'unit': 'L/min',
                'threshold': 200, 'critical': 280,
                'status': 'ONLINE',
                'battery': 93, 'signal': 94
            },
            {
                'id': 'S8-AQI', 'name': 'Air Quality', 'type': 'air_quality',
                'value': readings.get('air_quality', 85), 'unit': 'AQI',
                'threshold': 150, 'critical': 300,
                'status': 'CRITICAL' if readings.get('air_quality', 0) > 300 else 'WARNING' if readings.get('air_quality', 0) > 150 else 'ONLINE',
                'battery': 88, 'signal': 92
            },
        ]
        return sensors

    def get_weather(self):
        """Get simulated weather data."""
        readings = self.current_values
        return {
            'temperature': readings.get('temperature', 35),
            'humidity': readings.get('humidity', 55),
            'wind_speed': readings.get('wind_speed', 8),
            'wind_direction': readings.get('wind_direction', 315),
            'pressure': readings.get('pressure', 5.2) * 200,  # Convert to hPa approx
            'rainfall': 0,
            'aqi': readings.get('air_quality', 85),
            'visibility': max(2, 10 - readings.get('air_quality', 85) / 50),
            'wind_direction_label': self._wind_label(readings.get('wind_direction', 315)),
            'timestamp': datetime.now().isoformat()
        }

    def _wind_label(self, degrees):
        """Convert degrees to compass direction."""
        directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
        idx = round(degrees / 22.5) % 16
        return directions[idx]


# Global simulator instance
simulator = SensorSimulator()
