# Vehicle Information Management System

A full-stack vehicle information application built with **Django REST Framework** (Backend) and **Ionic React + Vite** (Frontend).

## Project Structure

```text
vechicle/
├── backend/                  # Django REST Framework Backend
│   ├── api/                  # Vehicle API application
│   ├── vehicleinfo_backend/  # Project configuration & settings
│   ├── api_data.json         # Seed/Fixture data
│   ├── requirements.txt      # Python dependencies
│   └── manage.py
├── frontend/                 # Ionic React + Vite Frontend
│   ├── src/                  # React components and pages
│   ├── public/               # Public assets
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
└── README.md
```

## Backend Setup (Django)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure MySQL database in `vehicleinfo_backend/settings.py` if needed.
5. Run migrations and load initial data:
   ```bash
   python manage.py migrate
   python manage.py loaddata api_data.json
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Frontend Setup (Ionic React)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
