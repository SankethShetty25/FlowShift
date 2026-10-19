# FlowShift – Dynamic Urban Route Optimization System

<p align="center">
  <strong>Intelligent Route Planning | Dynamic Road Management | Traffic Simulation</strong>
</p>

## Overview

FlowShift is a dynamic urban route optimization system designed to calculate optimal routes across a road network using graph algorithms.

The system models urban roads as a weighted graph, where intersections represent nodes and roads represent edges. Using Dijkstra's shortest-path algorithm, FlowShift identifies optimal routes based on distance and travel time.

It dynamically recalculates routes when roads become blocked or traffic congestion conditions change, helping users identify alternative paths.

## Problem Statement

Urban transportation networks frequently experience traffic congestion, road accidents, construction activities and unexpected road closures.

Traditional route planning cannot always account for sudden changes in road availability.

FlowShift addresses this problem by providing dynamic route optimization through road network modelling, traffic simulation and alternative route generation.

## Key Features

### 1. Interactive Road Network
- Visualizes 12 intersections and 22 bidirectional road connections.
- Interactive SVG-based road network.
- Click-to-select intersections and roads.

### 2. Dynamic Route Planning
- Calculates optimal routes using Dijkstra's algorithm.
- Supports distance-based and travel-time-based optimization.
- Displays total distance, estimated travel time and route segments.
- Generates alternative routes.

### 3. Dynamic Road Management
- Block and unblock individual roads.
- Supports multiple simultaneous road blockages.
- Automatically recalculates routes when roads become unavailable.
- Handles disconnected networks.

### 4. Traffic Simulation
- Simulates different congestion levels:
  - Low: 1.0x
  - Moderate: 1.8x
  - Heavy: 3.0x
- Dynamically adjusts travel-time weights.
- Recommends alternative routes to avoid congested roads.

### 5. Analytics Dashboard
- Route calculation statistics.
- Available versus blocked road analysis.
- Route comparison and detour impact.
- Distance-saving analysis.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Python, Django |
| API | Django REST Framework |
| Graph Processing | NetworkX |
| Algorithm | Dijkstra's Shortest-Path Algorithm |
| Data Visualization | Recharts |
| Network Visualization | SVG |

## System Architecture

```text
          React Frontend
                |
                |
          API Integration
                |
                |
       Django REST Framework
                |
                |
        NetworkX Graph Engine
                |
                |
      Dijkstra Routing Algorithm
                |
                |
       Optimal Route Response
                |
                |
       Interactive Visualization
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/network/` | Retrieve road network |
| GET | `/api/network/node/<id>/` | Retrieve node connectivity |
| POST | `/api/route/` | Calculate optimal route |
| POST | `/api/route/alternatives/` | Generate alternative routes |
| POST | `/api/simulate/traffic/` | Simulate traffic congestion |

## Testing

The backend includes 22 automated tests covering:

- Graph structure and construction.
- Road blockage handling.
- Shortest-path calculations.
- Alternative route generation.
- Network connectivity.
- API endpoint functionality.
- Traffic simulation.

**Backend Test Results: 22/22 Passed**

## Installation and Setup

### Prerequisites

- Python
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/FlowShift.git
cd FlowShift
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Django:

```bash
python manage.py runserver
```

Backend runs at:

`http://localhost:8000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

`http://localhost:5173`

## Future Enhancements

- Real-world geographical map integration.
- Live traffic data integration.
- Citizen-based incident reporting.
- Authority-based incident verification.
- GPS-based location tracking.
- Persistent road and incident management.
- Machine learning-based traffic prediction.

## Current Limitations

- Uses a predefined road network.
- Traffic conditions are simulated rather than obtained from live traffic sources.
- Does not currently provide GPS-based navigation.
- Does not currently integrate with external traffic data providers.

## Author

**Sanketh K Shetty**

MCA Student | AI & Machine Learning

GitHub: https://github.com/sankethshetty@25

---

<p align="center">
  <strong>FlowShift – Making Urban Route Planning Dynamic and Intelligent.</strong>
</p>
