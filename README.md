# Container Management System

A comprehensive container yard management and license plate recognition system designed to streamline container operations and automate vehicle identification processes.

## 🚀 Project Overview

This project consists of two main components:

1. **Container Yard Management System** - A full-stack web application for managing container operations, logistics optimization, and real-time tracking
2. **License Plate Recognition System** - An AI-powered system for automated license plate detection and recognition

## 📁 Project Structure

```
├── container-yard-management-system/    # Main container management application
│   ├── backend/                        # Flask backend API
│   ├── frontend/                       # React frontend application
│   └── README.md                       # Detailed setup instructions
├── LiscencePlateRecog/                 # License plate recognition system
│   ├── api.py                         # Flask API for plate recognition
│   ├── llmModule.py                   # AI/ML module for recognition
│   ├── index.html                     # Web interface
│   └── ...
├── instance/                          # Database files
└── hicv.py                           # Utility scripts
```

## 🌟 Features

### Container Yard Management System

- **Real-time Container Tracking** - Monitor container locations and status
- **Logistics Optimization** - Route planning and minimum spanning tree algorithms
- **Interactive Dashboards** - Modern React-based user interface
- **Inventory Management** - Comprehensive container inventory system
- **Network Visualization** - Interactive maps and route visualization
- **User Authentication** - Secure login and role-based access
- **RESTful API** - Full backend API for all operations

### License Plate Recognition

- **AI-Powered Recognition** - Advanced machine learning for plate detection
- **Multiple Input Methods** - Support for image uploads and URL inputs
- **Real-time Processing** - Fast and accurate license plate extraction
- **Web Interface** - Easy-to-use frontend for testing and operation

## 🛠️ Technology Stack

### Backend

- **Python 3.12+**
- **Flask** - Web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database
- **Geopy** - Geographic calculations
- **Folium** - Map visualization
- **OpenRouteService** - Route optimization

### Frontend

- **React 17** - UI framework
- **Webpack** - Module bundler
- **D3.js** - Data visualization
- **Leaflet** - Interactive maps
- **Bootstrap** - UI components
- **Axios** - HTTP client

### AI/ML

- **Custom LLM Module** - License plate recognition
- **Image Processing** - Computer vision capabilities

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 16+
- npm or yarn

### Container Yard Management System

1. **Backend Setup**

   ```bash
   cd container-yard-management-system/backend
   pip install -r requirements.txt
   python init_db.py  # Initialize database
   python app.py      # Start backend server
   ```

2. **Frontend Setup**

   ```bash
   cd container-yard-management-system/frontend
   npm install
   npm start          # Start development server
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### License Plate Recognition System

1. **Setup**

   ```bash
   cd LiscencePlateRecog
   pip install flask flask-cors  # Install dependencies
   python api.py                 # Start recognition API
   ```

2. **Access**
   - Open `index.html` in a web browser
   - API endpoint: http://localhost:5001

## 📖 Detailed Documentation

### API Endpoints

#### Container Management API

- `GET /api/containers` - List all containers
- `POST /api/containers` - Create new container
- `GET /api/logistics/optimize` - Get optimized routes
- `GET /api/visualization/mst` - Generate MST visualization
- `GET /api/inventory` - Inventory management

#### License Plate Recognition API

- `POST /recognize` - Recognize license plate from image

### Database Schema

The system uses SQLite with the following main entities:

- **Users** - Authentication and role management
- **Containers** - Container information and tracking
- **Locations** - Yard locations and coordinates
- **Routes** - Optimized route data

### Key Components

#### Logistics Optimizer

- Implements minimum spanning tree algorithms
- Route optimization using OpenRouteService
- Real-time distance calculations

#### Network Visualizer

- Interactive network graphs using D3.js
- Real-time data visualization
- Customizable display options

#### Authentication System

- Flask-Login integration
- Session management
- Role-based access control

## 🧪 Testing

### Backend Tests

```bash
cd container-yard-management-system/backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd container-yard-management-system/frontend
npm test
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
OPENROUTESERVICE_KEY=your-ors-api-key
DATABASE_URL=sqlite:///instance/container_yard.db
```

### Frontend Configuration

Update API endpoints in `frontend/src/services/api.js` if needed.

## 📊 Performance

- **Backend**: Optimized Flask application with SQLAlchemy ORM
- **Frontend**: React with code splitting and lazy loading
- **Database**: SQLite with indexed queries
- **Maps**: Efficient rendering with Leaflet and D3.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in each component's README
- Review the API documentation

## 🎯 Future Roadmap

- [ ] Real-time container tracking with IoT integration
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Integration with external logistics systems
- [ ] Enhanced AI capabilities for license plate recognition
- [ ] Docker containerization
- [ ] Kubernetes deployment support

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│   Flask API     │────│   SQLite DB     │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Map Services   │    │  AI/ML Module   │
│ (Leaflet/D3.js) │    │ (License Plate) │
└─────────────────┘    └─────────────────┘
```

---

**Built with ❤️ for efficient container management and automated vehicle recognition**
