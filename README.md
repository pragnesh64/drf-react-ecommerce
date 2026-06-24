# ShopSphere - Complete Setup Guide

This guide provides step-by-step instructions for extracting, configuring, and running the **ShopSphere** project (MCA Final Year Project) on a completely new laptop. 

Since you are receiving this project as a `.zip` file, this document covers everything from extraction to getting both the backend and frontend up and running.

---

## 1. Prerequisites

Before starting, ensure your new laptop has the following software installed:

- **Python (3.8 or newer)**: Required for the Django backend. You can download it from [python.org](https://www.python.org/downloads/). Ensure you check the box that says **"Add Python to PATH"** during installation.
- **Node.js (v16 or newer)**: Required for the React frontend. You can download it from [nodejs.org](https://nodejs.org/).
- **Git** (Optional but recommended): Download from [git-scm.com](https://git-scm.com/).

---

## 2. Extracting the Project

1. Copy the `ShopSphere.zip` file to your desired directory (e.g., `Documents/Projects/`).
2. Right-click the `.zip` file and select **Extract All...** (on Windows) or double-click it (on macOS).
3. Open a terminal (Command Prompt/PowerShell on Windows, or Terminal on macOS/Linux) and navigate into the extracted folder:
   ```bash
   cd path/to/ShopSphere
   ```

---

## 3. Backend Setup (Django)

The backend is powered by Python and Django. We will use a virtual environment to keep dependencies contained.

### Step 3.1: Create a Virtual Environment
Inside the `ShopSphere` directory, run the following command to create a virtual environment named `venv`:

**On macOS/Linux:**
```bash
python3 -m venv venv
```

**On Windows:**
```bash
python -m venv venv
```

### Step 3.2: Activate the Virtual Environment
You must activate the virtual environment every time you work on the project.

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```
*(You should see `(venv)` appear at the beginning of your terminal prompt).*

### Step 3.3: Install Dependencies
With the virtual environment active, install the required Python packages:
```bash
pip install -r requirements.txt
```

### Step 3.4: Configure Environment Variables
1. In the root of the `ShopSphere` directory, create a new file named `.env`.
2. Open the `.env` file in any text editor and add the following contents:
   ```env
   SECRET_KEY=your_secure_secret_key_here
   DEBUG=True
   STRIPE_API_KEY=your_stripe_test_key_here
   ```
   *(Note: You can put any random string for the SECRET_KEY for local development).*

### Step 3.5: Setup the Database
We will use the default SQLite database for local development. Run the migrations to create the database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3.6: Create an Admin User (Superuser)
To access the Admin dashboard, create a superuser account:
```bash
python manage.py createsuperuser
```
Follow the prompts to enter a username, email, and password.

---

## 4. Frontend Setup (React)

The frontend is built with React. The Django backend is configured to serve the built React files, but for active development, you'll want to run the React development server.

### Step 4.1: Navigate to the Frontend Directory
Open a **new, separate terminal window**, navigate to your project folder, and then go into the frontend folder:
```bash
cd path/to/ShopSphere/frontend
```

### Step 4.2: Install Node Dependencies
Run the following command to download all necessary React packages:
```bash
npm install
```
*(This will create a `node_modules` folder inside the frontend directory).*

---

## 5. Running the Application

To run the full project, you need both the backend and frontend servers running simultaneously in two separate terminal windows.

### Terminal 1: Run the Django Backend
Make sure your virtual environment is activated (`source venv/bin/activate` or `venv\Scripts\activate`), then run:
```bash
python manage.py runserver
```
*The backend API will run on `http://127.0.0.1:8000/`.*

### Terminal 2: Run the React Frontend
Make sure you are in the `frontend` directory, then run:
```bash
npm start
```
*The frontend development server will start and automatically open in your browser at `http://localhost:3000/` or `http://localhost:3001/`.*

---

## 6. Accessing the System

- **Main Shop Website:** Go to `http://localhost:3001/` (or the port your React app opened on).
- **Admin Login:** Go to the website, click "LOGIN", and enter the superuser credentials you created in Step 3.6. 
- **Django Admin Panel:** Go to `http://127.0.0.1:8000/admin/` (for direct database management).

---

## Note on Production Build
If you make changes to the React code and want Django to serve them directly (without needing `npm start`), go into the `frontend` directory and run:
```bash
npm run build
```
This generates a `build` folder that Django automatically serves at `http://127.0.0.1:8000/`.
