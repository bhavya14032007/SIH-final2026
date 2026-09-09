"""
SANRAKSHAK - Carrying Capacity Engine
Assesses population vs safe capacity and evacuation readiness.
"""

from datetime import datetime


class CapacityEngine:
    """Evaluates carrying capacity and evacuation logistics for affected zones."""

    def assess_capacity(self, zone_assessments):
        """
        Calculate carrying capacity for all zones.

        Args:
            zone_assessments: list of zone dicts from HazardPropagationEngine

        Returns:
            dict with capacity metrics
        """
        total_population = 0
        total_safe_capacity = 0
        total_shelter_capacity = 0
        affected_population = 0
        zones_over_capacity = 0
        zone_details = []

        for zone in zone_assessments:
            pop = zone.get('population', 0)
            capacity = zone.get('safe_capacity', 0)
            shelter = zone.get('shelter_capacity', 0)
            total_population += pop
            total_safe_capacity += capacity
            total_shelter_capacity += shelter

            utilization = round((pop / capacity * 100), 1) if capacity > 0 else 0
            excess = max(0, pop - capacity)

            if zone.get('risk_level') in ['RED', 'ORANGE']:
                affected_population += pop

            if utilization > 100:
                zones_over_capacity += 1

            zone_details.append({
                'zone_name': zone['name'],
                'label': zone.get('label', ''),
                'population': pop,
                'safe_capacity': capacity,
                'utilization': utilization,
                'excess_population': excess,
                'shelter_capacity': shelter,
                'status': 'OVER_CAPACITY' if utilization > 100 else 'ADEQUATE' if utilization < 80 else 'NEAR_CAPACITY',
                'risk_level': zone.get('risk_level', 'GREEN'),
                'nearest_shelter': zone.get('nearest_shelter', 'N/A'),
                'evacuation_time': zone.get('evacuation_time', 0),
                'evacuation_route': zone.get('evacuation_route', 'N/A'),
            })

        overall_utilization = round((total_population / total_safe_capacity * 100), 1) if total_safe_capacity > 0 else 0
        overall_status = 'OVER_CAPACITY' if overall_utilization > 100 else 'NEAR_CAPACITY' if overall_utilization > 80 else 'ADEQUATE'

        # Estimate evacuation metrics
        max_evac_time = max((z['evacuation_time'] for z in zone_details if z['risk_level'] in ['RED', 'ORANGE']), default=0)

        return {
            'total_population': total_population,
            'total_safe_capacity': total_safe_capacity,
            'total_shelter_capacity': total_shelter_capacity,
            'overall_utilization': overall_utilization,
            'overall_status': overall_status,
            'affected_population': affected_population,
            'excess_population': max(0, total_population - total_safe_capacity),
            'zones_over_capacity': zones_over_capacity,
            'estimated_evacuation_time': max_evac_time,
            'zones': zone_details,
            'timestamp': datetime.now().isoformat()
        }


# Global instance
capacity_engine = CapacityEngine()
