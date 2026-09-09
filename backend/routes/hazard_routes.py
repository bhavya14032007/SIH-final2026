"""
SANRAKSHAK - Hazard Routes
Endpoints for hazard zones, alerts, carrying capacity, and relocation.
"""

from flask import Blueprint, jsonify
from services.sensor_simulator import simulator
from services.risk_engine import risk_engine
from services.hazard_engine import hazard_engine
from services.capacity_engine import capacity_engine
from services.relocation_engine import relocation_engine
from datetime import datetime

hazard_bp = Blueprint('hazards', __name__)

# Alert history
_alerts = []


def _generate_alerts(readings, risk, propagation):
    """Generate alerts based on current state changes."""
    now = datetime.now().strftime('%H:%M')

    if readings.get('gas_ppm', 0) > 450 and not any(
        a.get('source') == 'S4-CHEM' and a.get('severity') == 'CRITICAL'
        for a in _alerts[-5:]
    ):
        _alerts.append({
            'id': len(_alerts) + 1,
            'time': now,
            'severity': 'CRITICAL',
            'source': 'S4-CHEM',
            'message': f"Chemical sensor S4: {readings['gas_ppm']:.0f} ppm — Critical threshold exceeded",
            'value': readings['gas_ppm'],
            'threshold': 450
        })

    if risk.get('risk_score', 0) > 60 and len(_alerts) < 20:
        _alerts.append({
            'id': len(_alerts) + 1,
            'time': now,
            'severity': 'HIGH',
            'source': 'AI Risk Engine',
            'message': f"Risk score increased to {risk['risk_score']}/100",
            'value': risk['risk_score'],
            'threshold': 60
        })

    for zone in propagation.get('zones', []):
        if zone['risk_level'] == 'RED' and not any(
            a.get('message', '').startswith(f"{zone['name']} classified")
            for a in _alerts[-10:]
        ):
            _alerts.append({
                'id': len(_alerts) + 1,
                'time': now,
                'severity': 'CRITICAL',
                'source': 'Zone Engine',
                'message': f"{zone['name']} classified as RED — Population: {zone['population']}",
                'value': None,
                'threshold': None
            })

    # Keep only last 50 alerts
    while len(_alerts) > 50:
        _alerts.pop(0)


@hazard_bp.route('/hazard-zones', methods=['GET'])
def get_hazard_zones():
    """Get current hazard zone classifications with propagation data."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )

    _generate_alerts(readings, risk, propagation)

    return jsonify(propagation)


@hazard_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get alert timeline."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)
    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )
    _generate_alerts(readings, risk, propagation)

    return jsonify({
        'alerts': list(reversed(_alerts[-20:])),
        'total': len(_alerts),
        'critical': sum(1 for a in _alerts if a['severity'] == 'CRITICAL'),
        'high': sum(1 for a in _alerts if a['severity'] == 'HIGH'),
        'warning': sum(1 for a in _alerts if a['severity'] == 'WARNING'),
    })


@hazard_bp.route('/capacity', methods=['GET'])
def get_capacity():
    """Get carrying capacity assessment."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )

    capacity = capacity_engine.assess_capacity(propagation['zones'])
    return jsonify(capacity)


@hazard_bp.route('/relocation', methods=['GET'])
def get_relocation():
    """Get relocation intelligence and priority rankings."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )

    capacity = capacity_engine.assess_capacity(propagation['zones'])
    relocation = relocation_engine.calculate_priorities(propagation['zones'], capacity)
    return jsonify(relocation)
