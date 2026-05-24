# LMS Academy WebApp

A modern Learning Management System (LMS) web application built with React, designed to support multiple user roles including students, trainers, and administrators.

## About the Project

LMS Academy WebApp is a comprehensive educational platform that enables:
- **Students** to enroll in courses, view course details, and access learning materials
- **Trainers** to manage courses, conduct live sessions, and upload course notes
- **Administrators** to manage users, courses, and oversee platform operations

The application features a responsive design with smooth animations and intuitive user interfaces for each user role.

## Tech Stack

### Frontend Framework
- **React** 19.2.0 - Modern UI library for building interactive components
- **React Router DOM** 7.13.0 - Client-side routing for seamless navigation
- **React DOM** 19.2.0 - React rendering library

### Styling & UI
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework for responsive design
- **Lucide React** 0.563.0 - Beautiful and consistent icon library
- **Framer Motion** 12.31.0 - Animation library for smooth transitions and interactions

### Build & Development
- **Vite** 7.2.4 - Lightning-fast build tool and development server (port 5173)
- **ESLint** 9.39.1 - Code quality and linting
- **@vitejs/plugin-react** - React support for Vite
- **TypeScript** types for enhanced development experience

### HTTP Communication
- **Axios** 1.13.4 - HTTP client for API requests to the backend

### Deployment
- **Vercel** - Configured for seamless cloud deployment

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lms-academy-webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open your browser and navigate to `http://localhost:5173`
   - The development server will automatically reload when you make changes (hot reload enabled)

### Environment Configuration

By default, the application proxies API requests to `http://43.205.127.39:8000`. To use a different backend:

```bash
VITE_PROXY_TARGET=http://your-backend-url npm run dev
```

## How to Build

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   This generates optimized and minified files in the `dist/` directory.

2. **Preview the production build locally (optional):**
   ```bash
   npm run preview
   ```
   This allows you to test the production build before deployment.

## How to Access

### Local Development
- **Development URL:** `http://localhost:5173`
- **API Proxy:** `/api` and `/media` requests are forwarded to the backend server

### Production Deployment
The application is configured for **Vercel deployment**:
1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect the repository to Vercel at https://vercel.com
3. Vercel automatically detects Vite configuration and runs `npm run build`
4. Your app is deployed and accessible via Vercel's provided URL

### Alternatively Deploy to Other Platforms
- **Netlify:** Upload the `dist/` folder or connect your Git repository
- **GitHub Pages:** Deploy the `dist/` folder
- **AWS S3/CloudFront:** Upload built files to S3
- **Firebase Hosting:** Use Firebase CLI to deploy the `dist/` folder

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components for different routes
├── context/            # React Context for state management
├── services/           # API service calls
├── data/               # Static data files
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Backend Integration

The application communicates with a backend API at `http://43.205.127.39:8000`. Ensure the backend server is running before starting the development server for full functionality.

API endpoints are proxied through:
- `/api/*` - Backend API requests
- `/media/*` - Media file requests

## License

[Add your license information here]