"""
SANRAKSHAK - Training Routes
Endpoints for ML model training pipeline management.
"""

import os
import json
from flask import Blueprint, jsonify, request
from config import Config

training_bp = Blueprint('training', __name__)


@training_bp.route('/training/start', methods=['POST'])
def start_training():
    """Initiate the ML training pipeline."""
    try:
        from ml.training_controller import TrainingController
        controller = TrainingController()
        result = controller.run()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 500


@training_bp.route('/training/status', methods=['GET'])
def training_status():
    """Get current training status and model info."""
    model_exists = os.path.exists(Config.MODEL_PATH)
    metadata = {}

    if model_exists and os.path.exists(Config.MODEL_METADATA_PATH):
        with open(Config.MODEL_METADATA_PATH, 'r') as f:
            metadata = json.load(f)

    experiments = []
    if os.path.exists(Config.EXPERIMENTS_DIR):
        for fname in sorted(os.listdir(Config.EXPERIMENTS_DIR)):
            if fname.endswith('.json'):
                with open(os.path.join(Config.EXPERIMENTS_DIR, fname), 'r') as f:
                    experiments.append(json.load(f))

    return jsonify({
        'model_trained': model_exists,
        'model_metadata': metadata,
        'total_experiments': len(experiments),
        'latest_experiment': experiments[-1] if experiments else None,
    })


@training_bp.route('/training/experiments', methods=['GET'])
def get_experiments():
    """Get all experiment logs."""
    experiments = []
    if os.path.exists(Config.EXPERIMENTS_DIR):
        for fname in sorted(os.listdir(Config.EXPERIMENTS_DIR)):
            if fname.endswith('.json'):
                with open(os.path.join(Config.EXPERIMENTS_DIR, fname), 'r') as f:
                    experiments.append(json.load(f))

    return jsonify({'experiments': experiments})
