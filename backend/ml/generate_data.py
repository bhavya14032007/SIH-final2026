"""
SANRAKSHAK - Synthetic Dataset Generator
Generates ~150 rows of realistic industrial sensor data.
CLEARLY LABELED AS SYNTHETIC DATA for prototype demonstration.

Relationships preserved:
- Gas ↑ + Temperature ↑ + Pressure unstable → Higher hazard
- Wind toward population + High gas → Higher exposure risk
- Correlated sensor degradation patterns
"""

import csv
import os
import random
import math
import numpy as np


def generate_dataset(output_path, n_samples=150):
    """Generate synthetic industrial hazard dataset with realistic correlations."""
    random.seed(42)
    np.random.seed(42)

    # Target distribution (approx): LOW=45%, MODERATE=25%, HIGH=20%, CRITICAL=10%
    # This creates class imbalance similar to real industrial data
    target_distribution = (
        ['LOW'] * 68 +
        ['MODERATE'] * 37 +
        ['HIGH'] * 30 +
        ['CRITICAL'] * 15
    )
    random.shuffle(target_distribution)

    rows = []
    for i, hazard_level in enumerate(target_distribution):
        row = _generate_row(i, hazard_level)
        rows.append(row)

    # Write CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fieldnames = [
        'sample_id', 'gas_ppm', 'temperature', 'pressure', 'humidity',
        'wind_speed', 'wind_direction', 'vibration', 'air_quality',
        'flow_rate', 'hour_of_day', 'hazard_level'
    ]

    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[DataGen] Generated {len(rows)} synthetic samples at {output_path}")
    print(f"[DataGen] Distribution: LOW={target_distribution.count('LOW')}, "
          f"MODERATE={target_distribution.count('MODERATE')}, "
          f"HIGH={target_distribution.count('HIGH')}, "
          f"CRITICAL={target_distribution.count('CRITICAL')}")

    return output_path


def _generate_row(idx, hazard_level):
    """Generate a single row with correlations based on hazard level."""

    if hazard_level == 'LOW':
        gas = np.random.normal(140, 30)
        temp = np.random.normal(33, 5)
        pressure = np.random.normal(5.0, 0.4)
        humidity = np.random.normal(52, 8)
        wind_speed = np.random.normal(8, 3)
        wind_dir = np.random.uniform(0, 360)
        vibration = np.random.normal(3.0, 1.0)
        aqi = np.random.normal(75, 15)
        flow = np.random.normal(125, 15)

    elif hazard_level == 'MODERATE':
        gas = np.random.normal(250, 40)
        temp = np.random.normal(50, 8)
        pressure = np.random.normal(6.2, 0.6)
        humidity = np.random.normal(62, 8)
        wind_speed = np.random.normal(12, 4)
        # Slightly biased toward populated direction
        wind_dir = np.random.normal(180, 80) % 360
        vibration = np.random.normal(6.5, 2.0)
        aqi = np.random.normal(130, 25)
        flow = np.random.normal(105, 20)

    elif hazard_level == 'HIGH':
        gas = np.random.normal(380, 50)
        temp = np.random.normal(72, 10)
        pressure = np.random.normal(7.5, 0.8)
        humidity = np.random.normal(72, 7)
        wind_speed = np.random.normal(18, 5)
        # Biased toward SE (populated Zone D at ~135°)
        wind_dir = np.random.normal(145, 40) % 360
        vibration = np.random.normal(11, 3)
        aqi = np.random.normal(210, 35)
        flow = np.random.normal(85, 15)

    else:  # CRITICAL
        gas = np.random.normal(510, 40)
        temp = np.random.normal(92, 6)
        pressure = np.random.normal(9.0, 0.7)
        humidity = np.random.normal(82, 5)
        wind_speed = np.random.normal(24, 4)
        # Strong bias toward populated area
        wind_dir = np.random.normal(135, 20) % 360
        vibration = np.random.normal(17, 2)
        aqi = np.random.normal(320, 30)
        flow = np.random.normal(65, 10)

    # Clamp values to realistic ranges
    gas = max(50, min(700, gas))
    temp = max(20, min(110, temp))
    pressure = max(3, min(12, pressure))
    humidity = max(25, min(95, humidity))
    wind_speed = max(0, min(35, wind_speed))
    wind_dir = wind_dir % 360
    vibration = max(0, min(25, vibration))
    aqi = max(20, min(500, aqi))
    flow = max(30, min(200, flow))

    hour = random.randint(0, 23)

    return {
        'sample_id': idx + 1,
        'gas_ppm': round(gas, 1),
        'temperature': round(temp, 1),
        'pressure': round(pressure, 2),
        'humidity': round(humidity, 1),
        'wind_speed': round(wind_speed, 1),
        'wind_direction': round(wind_dir, 1),
        'vibration': round(vibration, 2),
        'air_quality': round(aqi, 1),
        'flow_rate': round(flow, 1),
        'hour_of_day': hour,
        'hazard_level': hazard_level,
    }


if __name__ == '__main__':
    output = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic', 'industrial_hazard_data.csv')
    generate_dataset(output)
