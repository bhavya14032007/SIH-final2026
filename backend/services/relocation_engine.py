"""
SANRAKSHAK - Relocation Intelligence Engine
Ranks zones by evacuation priority and recommends relocation actions.
"""

from datetime import datetime


class RelocationEngine:
    """Ranks zones by relocation priority using risk, population, and exposure."""

    PRIORITY_ACTIONS = {
        'P1': 'IMMEDIATE EVACUATION',
        'P2': 'PREPARE EVACUATION',
        'P3': 'SHELTER IN PLACE',
        'P4': 'MONITOR',
        'P5': 'NO ACTION REQUIRED',
    }

    def calculate_priorities(self, zone_assessments, capacity_data):
        """
        Calculate relocation priority for each zone.

        Args:
            zone_assessments: list of zone risk assessments from HazardEngine
            capacity_data: capacity assessment from CapacityEngine

        Returns:
            list of zones ranked by relocation priority
        """
        priorities = []

        for zone in zone_assessments:
            # Find matching capacity data
            cap_zone = next(
                (z for z in capacity_data.get('zones', []) if z['zone_name'] == zone['name']),
                {}
            )

            # Calculate priority score (higher = more urgent)
            risk_weight = {'RED': 4, 'ORANGE': 3, 'YELLOW': 2, 'GREEN': 1}.get(zone.get('risk_level', 'GREEN'), 0)
            population_factor = zone.get('population', 0) / 1000  # Normalize
            exposure_factor = zone.get('exposure', 0)
            capacity_factor = 1.5 if cap_zone.get('status') == 'OVER_CAPACITY' else 1.0

            priority_score = (risk_weight * 30) + (population_factor * 20) + (exposure_factor * 25) + (capacity_factor * 10)

            # Determine priority level
            if zone.get('risk_level') == 'RED':
                priority = 'P1'
            elif zone.get('risk_level') == 'ORANGE':
                priority = 'P2'
            elif zone.get('risk_level') == 'YELLOW' and cap_zone.get('status') == 'OVER_CAPACITY':
                priority = 'P3'
            elif zone.get('risk_level') == 'YELLOW':
                priority = 'P4'
            else:
                priority = 'P5'

            # Build reason string
            reasons = []
            if zone.get('risk_level') in ['RED', 'ORANGE']:
                reasons.append(f"Risk level: {zone['risk_level']}")
            if zone.get('in_plume_path'):
                reasons.append("In direct plume path")
            if cap_zone.get('status') == 'OVER_CAPACITY':
                reasons.append(f"Over capacity ({cap_zone.get('utilization', 0)}%)")
            if zone.get('exposure_time') and zone['exposure_time'] < 20:
                reasons.append(f"Exposure in {zone['exposure_time']} min")

            priorities.append({
                'priority': priority,
                'priority_score': round(priority_score, 1),
                'action': self.PRIORITY_ACTIONS.get(priority, 'MONITOR'),
                'zone_name': zone['name'],
                'label': zone.get('label', ''),
                'population': zone.get('population', 0),
                'risk_level': zone.get('risk_level', 'GREEN'),
                'exposure': zone.get('exposure', 0),
                'exposure_time': zone.get('exposure_time'),
                'nearest_shelter': zone.get('nearest_shelter', 'N/A'),
                'shelter_capacity': zone.get('shelter_capacity', 0),
                'evacuation_route': zone.get('evacuation_route', 'N/A'),
                'evacuation_time': zone.get('evacuation_time', 0),
                'capacity_status': cap_zone.get('status', 'N/A'),
                'utilization': cap_zone.get('utilization', 0),
                'reasons': reasons,
            })

        # Sort by priority (P1 first), then by score
        order = {'P1': 0, 'P2': 1, 'P3': 2, 'P4': 3, 'P5': 4}
        priorities.sort(key=lambda p: (order.get(p['priority'], 5), -p['priority_score']))

        return {
            'priorities': priorities,
            'immediate_evacuation_count': sum(1 for p in priorities if p['priority'] == 'P1'),
            'prepare_evacuation_count': sum(1 for p in priorities if p['priority'] == 'P2'),
            'total_affected': sum(p['population'] for p in priorities if p['priority'] in ['P1', 'P2']),
            'timestamp': datetime.now().isoformat()
        }


# Global instance
relocation_engine = RelocationEngine()
