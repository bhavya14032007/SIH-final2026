"""
SANRAKSHAK - Sensor Routes
Endpoints for sensor data, current readings, and weather information.
"""

from flask import Blueprint, jsonify
from services.sensor_simulator import simulator

sensor_bp = Blueprint('sensors', __name__)


@sensor_bp.route('/sensors', methods=['GET'])
def get_sensors():
    """Get all sensor definitions with current status."""
    sensors = simulator.get_sensor_statuses()
    online = sum(1 for s in sensors if s['status'] != 'OFFLINE')
    return jsonify({
        'sensors': sensors,
        'total': len(sensors),
        'online': online,
        'offline': len(sensors) - online,
        'warning': sum(1 for s in sensors if s['status'] == 'WARNING'),
        'critical': sum(1 for s in sensors if s['status'] == 'CRITICAL'),
    })


@sensor_bp.route('/sensors/current', methods=['GET'])
def get_current_readings():
    """Get latest sensor readings (polled by frontend every 2-5 seconds)."""
    readings = simulator.get_readings()
    return jsonify(readings)


@sensor_bp.route('/weather', methods=['GET'])
def get_weather():
    """Get current weather/environmental data."""
    return jsonify(simulator.get_weather())
