"""
SANRAKSHAK - Authentication Routes
Simple mock authentication for prototype.
"""

from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

# Mock user for prototype demonstration
MOCK_USERS = {
    'admin@sanrakshak.in': {
        'password': 'sanrakshak2026',
        'industry_id': 'IND-ALPHA-001',
        'name': 'Dr. Priya Sharma',
        'role': 'admin'
    },
    'operator@sanrakshak.in': {
        'password': 'operator123',
        'industry_id': 'IND-ALPHA-001',
        'name': 'Raj Patel',
        'role': 'operator'
    }
}


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Mock login endpoint for prototype."""
    data = request.get_json()
    email = data.get('email', '')
    password = data.get('password', '')
    industry_id = data.get('industry_id', '')

    user = MOCK_USERS.get(email)

    if user and user['password'] == password:
        return jsonify({
            'success': True,
            'token': 'mock-jwt-token-sanrakshak-2026',
            'user': {
                'email': email,
                'name': user['name'],
                'role': user['role'],
                'industry_id': user['industry_id'],
                'industry_name': 'Industrial Complex Alpha'
            }
        })

    return jsonify({
        'success': False,
        'error': 'Invalid credentials'
    }), 401
