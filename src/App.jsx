import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/loginpage/login";
import Dashboard from "./pages/dashboard";
import Courses from "./pages/courses";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import AdminDashboard from "./pages/admindashboard/admindashboard";
import AdminCourses from "./pages/admindashboard/AdminCourses";
import AdminCourseDetail from "./pages/admindashboard/AdminCourseDetail";
import AdminUsers from "./pages/admindashboard/AdminUsers";
import AdminLiveSessions from "./pages/admindashboard/AdminLiveSessions";
import AdminLiveSessionCreate from "./pages/admindashboard/AdminLiveSessionCreate";
import TrainerDashboard from "./pages/trainerdashboard/TrainerDashboard";
import TrainerCourses from "./pages/trainerdashboard/TrainerCourses";
import TrainerUploadNotes from "./pages/trainerdashboard/TrainerUploadNotes";
import TrainerLiveSessions from "./pages/trainerdashboard/TrainerLiveSessions";
import TrainerLiveSessionRoom from "./pages/trainerdashboard/TrainerLiveSessionRoom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentCourseDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-live-sessions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLiveSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-live-sessions/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLiveSessionCreate />
              </ProtectedRoute>
            }
          />

          {/* Trainer Routes */}
          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-courses"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-upload"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerUploadNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-live"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerLiveSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/live-room/:sessionId"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerLiveSessionRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
