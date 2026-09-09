"""
SANRAKSHAK - AI-Powered Industrial Hazard Prediction & Early Warning System
Main Flask Application
"""

import os
import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config


def get_db():
    """Get SQLite database connection."""
    db_path = os.path.join(os.path.dirname(__file__), 'sanrakshak.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(app):
    """Initialize database with schema and seed data."""
    db_path = os.path.join(os.path.dirname(__file__), 'sanrakshak.db')
    if not os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
        seed_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'seed.sql')

        with open(schema_path, 'r') as f:
            conn.executescript(f.read())

        if os.path.exists(seed_path):
            with open(seed_path, 'r') as f:
                conn.executescript(f.read())

        conn.commit()
        conn.close()
        print("[SANRAKSHAK] Database initialized with schema and seed data.")
    else:
        print("[SANRAKSHAK] Database already exists.")


def create_app():
    """Flask application factory."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    init_db(app)

    # Ensure ML directories exist
    os.makedirs(Config.EXPERIMENTS_DIR, exist_ok=True)
    os.makedirs(Config.RAW_DATA_DIR, exist_ok=True)
    os.makedirs(Config.SYNTHETIC_DATA_DIR, exist_ok=True)

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.sensor_routes import sensor_bp
    from routes.prediction_routes import prediction_bp
    from routes.hazard_routes import hazard_bp
    from routes.simulation_routes import simulation_bp
    from routes.training_routes import training_bp
    from routes.gemini_routes import gemini_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(sensor_bp, url_prefix='/api')
    app.register_blueprint(prediction_bp, url_prefix='/api')
    app.register_blueprint(hazard_bp, url_prefix='/api')
    app.register_blueprint(simulation_bp, url_prefix='/api')
    app.register_blueprint(training_bp, url_prefix='/api')
    app.register_blueprint(gemini_bp, url_prefix='/api')

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'operational',
            'service': 'SANRAKSHAK',
            'version': '1.0.0',
            'components': {
                'api': 'online',
                'database': 'online',
                'ml_model': os.path.exists(Config.MODEL_PATH),
                'gemini': bool(Config.GEMINI_API_KEY)
            }
        })

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n" + "=" * 60)
    print("  SANRAKSHAK - Industrial Safety Intelligence")
    print("  AI-Powered Hazard Prediction & Early Warning")
    print("=" * 60)
    print(f"  API: http://localhost:5000/api")
    print(f"  Health: http://localhost:5000/api/health")
    print("=" * 60 + "\n")
    app.run(debug=True, port=5000)
