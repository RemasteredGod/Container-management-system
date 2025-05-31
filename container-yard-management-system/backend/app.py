from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
import os
import sys
from pathlib import Path

# Add parent directory to path to fix import issues
sys.path.insert(0, str(Path(__file__).parent))
from models import db, User
from routes.logistics_routes import logistics_bp
from routes.visualization_routes import visualization_bp
from routes.inventory__routes import inventory_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
# Use absolute path for database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', '..', 'instance', 'container_yard.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(logistics_bp)
app.register_blueprint(visualization_bp)
app.register_blueprint(inventory_bp)

# Create static directory for maps if it doesn't exist
os.makedirs(os.path.join(app.root_path, 'static', 'maps'), exist_ok=True)

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create database tables
with app.app_context():
    db.create_all()
    print(f"Database initialized at: {app.config['SQLALCHEMY_DATABASE_URI']}")

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Check required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data or not data.get(field):
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'success': False, 'message': 'Username already taken'}), 400
    
    # Create new user
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        first_name=data.get('firstName', ''),
        last_name=data.get('lastName', ''),
    )
    user.password = data.get('password')
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            'success': True, 
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'role': user.role
            }
        })
    
    return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'firstName': current_user.first_name,
        'lastName': current_user.last_name,
        'role': current_user.role
    })

# Sample protected route
@app.route('/api/dashboard', methods=['GET'])
@login_required
def get_dashboard_data():
    # This would be replaced with actual data from your database
    return jsonify({
        'containers': [
            {'id': 'C1001', 'status': 'In Transit', 'destination': 'Port of Rotterdam', 'arrival': '2025-05-03'},
            {'id': 'C1002', 'status': 'At Yard', 'destination': 'Hamburg', 'arrival': '2025-04-28'},
            {'id': 'C1003', 'status': 'Delivered', 'destination': 'Shanghai', 'arrival': '2025-04-22'}
        ],
        'stats': {
            'totalContainers': 125,
            'inTransit': 43,
            'atYard': 67,
            'delivered': 15
        }
    })

if __name__ == '__main__':
    app.run(debug=True)