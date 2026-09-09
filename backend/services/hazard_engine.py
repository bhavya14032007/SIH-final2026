"""
SANRAKSHAK - Hazard Propagation Engine
Simplified directional plume model for prototype.
Calculates hazard spread direction, affected zones, and population exposure.
NOTE: This is a prototype approximation. Production systems should use
validated atmospheric dispersion models (e.g., Gaussian plume).
"""

import math
from datetime import datetime


class HazardPropagationEngine:
    """Calculates hazard propagation based on wind, source, and geography."""

    # Population zones around Industrial Complex Alpha (Mumbai MIDC)
    ZONES = [
        {
            'name': 'Zone A', 'label': 'North Residential',
            'lat': 19.0810, 'lng': 72.8777,
            'population': 2450, 'safe_capacity': 2000,
            'direction': 0, 'distance': 0.8,
            'nearest_shelter': 'Community Hall A', 'shelter_capacity': 800,
            'evacuation_route': 'NH-48 North', 'evacuation_time': 12
        },
        {
            'name': 'Zone B', 'label': 'Northeast Colony',
            'lat': 19.0800, 'lng': 72.8830,
            'population': 1680, 'safe_capacity': 1500,
            'direction': 45, 'distance': 1.2,
            'nearest_shelter': 'School B', 'shelter_capacity': 600,
            'evacuation_route': 'Link Road NE', 'evacuation_time': 15
        },
        {
            'name': 'Zone C', 'label': 'East Commercial',
            'lat': 19.0760, 'lng': 72.8840,
            'population': 860, 'safe_capacity': 700,
            'direction': 90, 'distance': 0.9,
            'nearest_shelter': 'Mall Shelter C', 'shelter_capacity': 400,
            'evacuation_route': 'Eastern Express', 'evacuation_time': 10
        },
        {
            'name': 'Zone D', 'label': 'Southeast Housing',
            'lat': 19.0720, 'lng': 72.8830,
            'population': 1240, 'safe_capacity': 800,
            'direction': 135, 'distance': 1.0,
            'nearest_shelter': 'Temple Hall D', 'shelter_capacity': 350,
            'evacuation_route': 'SE Bypass Road', 'evacuation_time': 18
        },
        {
            'name': 'Zone E', 'label': 'South District',
            'lat': 19.0710, 'lng': 72.8777,
            'population': 1950, 'safe_capacity': 1800,
            'direction': 180, 'distance': 0.7,
            'nearest_shelter': 'Stadium E', 'shelter_capacity': 1200,
            'evacuation_route': 'SV Road South', 'evacuation_time': 8
        },
        {
            'name': 'Zone F', 'label': 'West Industrial',
            'lat': 19.0760, 'lng': 72.8720,
            'population': 420, 'safe_capacity': 400,
            'direction': 270, 'distance': 0.6,
            'nearest_shelter': 'Factory Shelter F', 'shelter_capacity': 200,
            'evacuation_route': 'Western Highway', 'evacuation_time': 6
        },
    ]

    # Industrial Complex Alpha center
    SOURCE_LAT = 19.0760
    SOURCE_LNG = 72.8777

    def calculate_propagation(self, wind_direction, wind_speed, gas_ppm, risk_score):
        """
        Calculate hazard propagation using a simplified directional plume model.

        Args:
            wind_direction: Wind direction in degrees (where wind comes FROM)
            wind_speed: Wind speed in km/h
            gas_ppm: Gas concentration at source
            risk_score: Overall risk score (0-100)

        Returns:
            dict with affected zones, plume geometry, and population data
        """
        # Wind blows FROM wind_direction, hazard moves in OPPOSITE direction
        # Actually wind_direction here means the bearing the wind is heading toward
        plume_direction = wind_direction  # Direction hazard is moving

        # Calculate affected radius based on gas concentration and wind speed
        base_radius = 0.5  # km minimum
        gas_factor = min(gas_ppm / 300, 2.0)
        wind_factor = min(wind_speed / 15, 2.0)
        affected_radius = base_radius + (gas_factor * 0.5) + (wind_factor * 0.3)
        affected_radius = min(affected_radius, 3.0)  # Cap at 3km for prototype

        # Calculate plume cone (±45° from wind direction)
        plume_half_angle = 45  # degrees

        # Assess each zone
        zone_assessments = []
        total_affected_population = 0

        for zone in self.ZONES:
            assessment = self._assess_zone(
                zone, plume_direction, plume_half_angle,
                affected_radius, gas_ppm, wind_speed, risk_score
            )
            zone_assessments.append(assessment)
            if assessment['risk_level'] in ['RED', 'ORANGE']:
                total_affected_population += zone['population']

        # Sort by risk (RED first)
        risk_order = {'RED': 0, 'ORANGE': 1, 'YELLOW': 2, 'GREEN': 3}
        zone_assessments.sort(key=lambda z: risk_order.get(z['risk_level'], 4))

        return {
            'source': {'lat': self.SOURCE_LAT, 'lng': self.SOURCE_LNG},
            'plume_direction': round(plume_direction, 1),
            'plume_half_angle': plume_half_angle,
            'affected_radius': round(affected_radius, 2),
            'wind_speed': wind_speed,
            'wind_direction_label': self._wind_label(plume_direction),
            'zones': zone_assessments,
            'total_affected_population': total_affected_population,
            'risk_multiplier': round(1 + (wind_speed / 30) * 0.5, 2),
            'timestamp': datetime.now().isoformat()
        }

    def _assess_zone(self, zone, plume_dir, half_angle, radius, gas_ppm, wind_speed, risk_score):
        """Assess risk level for a specific zone based on plume geometry."""
        zone_dir = zone['direction']
        zone_dist = zone['distance']

        # Calculate angular difference between plume direction and zone direction
        angle_diff = abs(plume_dir - zone_dir)
        if angle_diff > 180:
            angle_diff = 360 - angle_diff

        # Determine if zone is in the plume path
        in_plume = angle_diff <= half_angle
        near_plume = angle_diff <= (half_angle * 1.5)
        in_radius = zone_dist <= radius

        # Calculate exposure score
        if in_plume and in_radius:
            # Direct exposure — highest risk
            distance_factor = 1 - (zone_dist / (radius * 1.5))
            angle_factor = 1 - (angle_diff / (half_angle * 1.5))
            exposure = distance_factor * angle_factor
            if risk_score >= 80:
                risk_level = 'RED'
            elif risk_score >= 60:
                risk_level = 'ORANGE'
            else:
                risk_level = 'YELLOW'
        elif near_plume and in_radius:
            # Near plume edge
            exposure = 0.3
            risk_level = 'YELLOW' if risk_score >= 50 else 'GREEN'
        elif in_radius:
            # In radius but not in plume direction
            exposure = 0.1
            risk_level = 'YELLOW' if risk_score >= 70 else 'GREEN'
        else:
            exposure = 0.0
            risk_level = 'GREEN'

        # Calculate estimated exposure time (minutes until plume reaches zone)
        if wind_speed > 0 and in_plume:
            exposure_time = round((zone_dist / (wind_speed / 60)) * 60, 1)  # minutes
        else:
            exposure_time = None

        return {
            'name': zone['name'],
            'label': zone['label'],
            'lat': zone['lat'],
            'lng': zone['lng'],
            'population': zone['population'],
            'safe_capacity': zone['safe_capacity'],
            'distance': zone['distance'],
            'direction': zone['direction'],
            'risk_level': risk_level,
            'exposure': round(exposure, 2),
            'exposure_time': exposure_time,
            'in_plume_path': in_plume,
            'nearest_shelter': zone['nearest_shelter'],
            'shelter_capacity': zone['shelter_capacity'],
            'evacuation_route': zone['evacuation_route'],
            'evacuation_time': zone['evacuation_time'],
        }

    def _wind_label(self, degrees):
        """Convert degrees to compass direction."""
        directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
        idx = round(degrees / 22.5) % 16
        return directions[idx]


# Global engine instance
hazard_engine = HazardPropagationEngine()
