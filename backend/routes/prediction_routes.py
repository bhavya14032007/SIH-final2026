"""
SANRAKSHAK - Prediction Routes
Endpoints for risk assessment, predictions, and dashboard data.
"""

from flask import Blueprint, jsonify
from services.sensor_simulator import simulator
from services.risk_engine import risk_engine
from services.hazard_engine import hazard_engine
from services.capacity_engine import capacity_engine
from services.relocation_engine import relocation_engine

prediction_bp = Blueprint('predictions', __name__)

# Store historical data for charts
_risk_history = []
_MAX_HISTORY = 100


@prediction_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get comprehensive dashboard data — single endpoint for the main view."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    # Store risk history for charts
    _risk_history.append({
        'risk_score': risk['risk_score'],
        'timestamp': readings['timestamp']
    })
    if len(_risk_history) > _MAX_HISTORY:
        _risk_history.pop(0)

    # Get hazard zones
    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )

    sensors = simulator.get_sensor_statuses()
    online = sum(1 for s in sensors if s['status'] != 'OFFLINE')

    # Active hazards count
    active_hazards = sum(1 for z in propagation['zones'] if z['risk_level'] in ['RED', 'ORANGE'])

    return jsonify({
        'risk_score': risk['risk_score'],
        'severity': risk['severity'],
        'hazard_type': risk['hazard_type'],
        'probability': risk['probability'],
        'confidence': risk['confidence'],
        'time_to_critical': risk['time_to_critical'],
        'sensors_online': online,
        'sensors_total': len(sensors),
        'active_hazards': active_hazards,
        'predicted_incidents': max(1, active_hazards),
        'affected_population': propagation['total_affected_population'],
        'safe_capacity_pct': 78 if risk['risk_score'] < 50 else max(45, 100 - risk['risk_score']),
        'simulation_mode': readings.get('mode', 'normal'),
        'simulation_stage': readings.get('stage', 0),
        'simulation_progress': readings.get('simulation_progress', 0),
        'timestamp': readings['timestamp'],
    })


@prediction_bp.route('/predictions', methods=['GET'])
def get_predictions():
    """Get current hazard predictions."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    # Generate prediction cards based on current risk assessment
    predictions = []

    if risk['risk_score'] >= 40:
        predictions.append({
            'id': 1,
            'hazard_type': risk['hazard_type'],
            'probability': risk['probability'],
            'severity': risk['severity'],
            'confidence': risk['confidence'],
            'time_to_critical': risk['time_to_critical'],
            'trend': 'increasing' if readings.get('mode') == 'incident' else 'stable',
            'affected_radius': 1.2 + (risk['risk_score'] / 100),
            'feature_importance': risk['feature_importance'],
            'contributing_factors': risk['contributing_factors'],
        })

    if risk['risk_score'] >= 60:
        predictions.append({
            'id': 2,
            'hazard_type': 'Thermal Runaway',
            'probability': round(risk['probability'] * 0.75, 2),
            'severity': 'HIGH' if risk['risk_score'] >= 70 else 'ELEVATED',
            'confidence': round(risk['confidence'] * 0.85, 2),
            'time_to_critical': (risk.get('time_to_critical') or 30) + 10,
            'trend': 'increasing',
            'affected_radius': 0.8,
            'feature_importance': risk['feature_importance'],
            'contributing_factors': [],
        })

    if risk['risk_score'] >= 70:
        predictions.append({
            'id': 3,
            'hazard_type': 'Toxic Plume Exposure',
            'probability': round(risk['probability'] * 0.88, 2),
            'severity': risk['severity'],
            'confidence': round(risk['confidence'] * 0.9, 2),
            'time_to_critical': (risk.get('time_to_critical') or 30) + 5,
            'trend': 'increasing',
            'affected_radius': 1.8,
            'feature_importance': risk['feature_importance'],
            'contributing_factors': [],
        })

    return jsonify({
        'predictions': predictions,
        'model_version': risk.get('model_version', 'rule-based'),
        'ml_available': risk.get('ml_available', False),
        'timestamp': readings['timestamp'],
    })


@prediction_bp.route('/risk', methods=['GET'])
def get_risk():
    """Get detailed risk assessment."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)
    risk['risk_history'] = _risk_history[-50:]
    risk['sensor_data'] = readings
    return jsonify(risk)
