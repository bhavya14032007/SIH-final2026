"""
SANRAKSHAK - Gemini AI Routes
Endpoints for AI explanations, emergency actions, and data export.
"""

import csv
import io
from flask import Blueprint, jsonify, request, Response
from services.sensor_simulator import simulator
from services.risk_engine import risk_engine
from services.hazard_engine import hazard_engine
from services.gemini_service import gemini_service

gemini_bp = Blueprint('gemini', __name__)


@gemini_bp.route('/gemini/explain', methods=['POST'])
def get_explanation():
    """Get AI-generated explanation of current prediction."""
    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    propagation = hazard_engine.calculate_propagation(
        readings.get('wind_direction', 315),
        readings.get('wind_speed', 8),
        readings.get('gas_ppm', 150),
        risk['risk_score']
    )

    # Build context for Gemini
    context = {
        'risk_score': risk['risk_score'],
        'hazard_type': risk['hazard_type'],
        'probability': risk['probability'],
        'confidence': risk['confidence'],
        'severity': risk['severity'],
        'gas_ppm': readings.get('gas_ppm', 0),
        'temperature': readings.get('temperature', 0),
        'pressure': readings.get('pressure', 0),
        'humidity': readings.get('humidity', 0),
        'wind_speed': readings.get('wind_speed', 0),
        'wind_direction': readings.get('wind_direction', 0),
        'affected_zones': [z['name'] for z in propagation['zones'] if z['risk_level'] in ['RED', 'ORANGE']],
        'affected_population': propagation['total_affected_population'],
        'contributing_factors': risk.get('contributing_factors', []),
        'feature_importance': risk.get('feature_importance', {}),
    }

    explanation = gemini_service.explain_prediction(context)
    return jsonify(explanation)


@gemini_bp.route('/emergency', methods=['POST'])
def emergency_action():
    """Handle emergency protocol actions (prototype — requires confirmation)."""
    data = request.get_json()
    action = data.get('action', '')

    valid_actions = {
        'initiate_evacuation': 'Evacuation protocol initiated for affected zones.',
        'dispatch_response': 'Emergency response team dispatched.',
        'shutdown_sector': 'Sector shutdown initiated. Awaiting confirmation.',
        'notify_authorities': 'Notification sent to local authorities and NDRF.',
    }

    if action not in valid_actions:
        return jsonify({'error': 'Invalid emergency action'}), 400

    return jsonify({
        'success': True,
        'action': action,
        'message': valid_actions[action],
        'timestamp': simulator.get_readings()['timestamp'],
        'note': 'PROTOTYPE: This is a simulated emergency action.'
    })


@gemini_bp.route('/export', methods=['POST'])
def export_data():
    """Export data as CSV."""
    data = request.get_json()
    export_type = data.get('type', 'sensors')

    readings = simulator.get_readings()
    risk = risk_engine.assess_risk(readings)

    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == 'sensors':
        writer.writerow(['Parameter', 'Value', 'Unit', 'Status', 'Threshold'])
        sensors = simulator.get_sensor_statuses()
        for s in sensors:
            writer.writerow([s['name'], s['value'], s['unit'], s['status'], s['threshold']])
    elif export_type == 'risk':
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Risk Score', risk['risk_score']])
        writer.writerow(['Severity', risk['severity']])
        writer.writerow(['Hazard Type', risk['hazard_type']])
        writer.writerow(['Probability', risk['probability']])
        writer.writerow(['Confidence', risk['confidence']])
    elif export_type == 'zones':
        propagation = hazard_engine.calculate_propagation(
            readings.get('wind_direction', 315),
            readings.get('wind_speed', 8),
            readings.get('gas_ppm', 150),
            risk['risk_score']
        )
        writer.writerow(['Zone', 'Risk Level', 'Population', 'Distance', 'Exposure', 'In Plume'])
        for z in propagation['zones']:
            writer.writerow([z['name'], z['risk_level'], z['population'],
                             z['distance'], z['exposure'], z['in_plume_path']])

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = f'attachment; filename=sanrakshak_{export_type}_export.csv'
    return response
