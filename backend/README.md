# Stock Visualizer Backend

Backend service for the Stock Visualizer application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the backend server:
```bash
python app.py
```

The server will typically run on `http://localhost:5000` or `http://127.0.0.1:5000`

## Environment Variables

Create a `.env` file in the backend directory and configure any required environment variables:
```
FLASK_ENV=development
FLASK_DEBUG=True
```

## API Endpoints

Refer to the API documentation for available endpoints and usage.

## Development

To run in development mode with auto-reload:
```bash
export FLASK_ENV=development
python app.py
```

## Testing

Run tests with:
```bash
pytest
```

## Troubleshooting

- Ensure the virtual environment is activated before running commands
- Clear pip cache if installation issues occur: `pip cache purge`
- Check that port 5000 is not already in use
