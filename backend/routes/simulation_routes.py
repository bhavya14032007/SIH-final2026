"""
SANRAKSHAK - Simulation Routes
Controls for starting and resetting the demo simulation.
"""

from flask import Blueprint, jsonify
from services.sensor_simulator import simulator

simulation_bp = Blueprint('simulation', __name__)


@simulation_bp.route('/simulation/start', methods=['POST'])
def start_simulation():
    """Start the 13-stage incident simulation."""
    result = simulator.start_simulation()
    return jsonify(result)


@simulation_bp.route('/simulation/reset', methods=['POST'])
def reset_simulation():
    """Reset simulation back to normal mode."""
    result = simulator.reset_simulation()
    return jsonify(result)


@simulation_bp.route('/simulation/status', methods=['GET'])
def simulation_status():
    """Get current simulation status."""
    readings = simulator.get_readings()
    return jsonify({
        'mode': readings.get('mode', 'normal'),
        'stage': readings.get('stage', 0),
        'progress': readings.get('simulation_progress', 0),
        'status': readings.get('status', 'NORMAL'),
    })
