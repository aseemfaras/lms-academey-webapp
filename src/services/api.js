import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        // console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, { hasToken: !!token });
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;

        if (response && response.status === 401) {
            console.warn("401 Unauthorized encountered:", {
                url: config.url,
                data: response.data
            });

            // Avoid redirecting if we're already on the login page or trying to login
            const isLoginPage = window.location.pathname === '/login';
            const isLoginRequest = config.url.includes('/users/login/');
            const hasAccessToken = !!localStorage.getItem('accessToken');

            if (!isLoginPage && !isLoginRequest && hasAccessToken) {
                console.warn("In-app 401 error. Session might have expired.");

                // For now, we still redirect but we could add refresh token logic here later
                // We clear everything to ensure a clean state
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Use replace to avoid back-button loops
                console.warn("Redirecting to login due to 401...");
                window.location.replace('/login');
            } else if (!hasAccessToken && !isLoginPage && !isLoginRequest) {
                console.warn("Request attempted without access token. Redirecting to login.");
                window.location.replace('/login');
            }
        } else if (error.code === 'ECONNABORTED' || !response) {
            console.error("Network or Timeout Error:", error.message);
        } else {
            console.error("API Error:", {
                status: response?.status,
                url: config?.url,
                data: response?.data
            });
        }
        return Promise.reject(error);
    }
);

// Auth Services — POST /api/users/login/ only (GET returns 405)
export const loginUser = async (credentials) => {
    const { email, password } = credentials;
    const response = await api.post('users/login/', { email, password }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// User Services
export const getUsers = async () => {
    const response = await api.get('users/');
    return response.data;
};

export const addUser = async (userData) => {
    const response = await api.post('users/register/', userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`users/${id}/`);
    return response.data;
};

// Course Services
export const getCourses = async () => {
    const response = await api.get('courses/');
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await api.post('courses/', courseData);
    return response.data;
};

export const updateCourse = async (id, courseData) => {
    const response = await api.patch(`courses/${id}/`, courseData);
    return response.data;
};

export const getCourse = async (id) => {
    const response = await api.get(`courses/${id}/`);
    return response.data;
};

export const createCourseBatch = async (courseId, batchName) => {
    const response = await api.post(`courses/${courseId}/batches/`, { name: batchName });
    return response.data;
};

// --- Trainer Assignment APIs ---
export const deleteCourse = async (id) => {
    const response = await api.delete(`courses/${id}/`);
    return response.data;
};

// Enrollment Services
export const getEnrollments = async (params) => {
    const response = await api.get('students/enrollments/', { params });
    return response.data;
};

export const enrollStudent = async (data) => {
    const response = await api.post('students/enrollments/', data);
    return response.data;
};

// Module Services
export const getModules = async (courseId) => {
    const response = await api.get('modules/', { params: { course: courseId } });
    return response.data;
};

export const createModule = async (moduleData) => {
    // moduleData should include batch
    const response = await api.post('modules/', moduleData);
    return response.data;
};

export const updateModule = async (id, moduleData) => {
    const response = await api.patch(`modules/${id}/`, moduleData);
    return response.data;
};

export const deleteModule = async (id) => {
    const response = await api.delete(`modules/${id}/`);
    return response.data;
};

// Live Session Services
export const getLiveSessions = async (params) => {
    const response = await api.get('live-sessions/', { params });
    return response.data;
};

export const createLiveSession = async (sessionData) => {
    const response = await api.post('live-sessions/', sessionData);
    return response.data;
};

export const updateLiveSession = async (id, sessionData) => {
    const response = await api.patch(`live-sessions/${id}/`, sessionData);
    return response.data;
};

export const assignTrainer = async (courseId, email, name, batch) => {
    const response = await api.post(`courses/${courseId}/assign_trainer/`, { email, name, batch });
    return response.data;
};


export const toggleTrainerActivation = async (courseId, userId, isActive, batch) => {
    const response = await api.post(`courses/${courseId}/toggle_trainer_activation/`, {
        user_id: userId,
        is_active: isActive,
        batch: batch
    });
    return response.data;
};

export const unassignTrainer = async (courseId, userId, batch) => {
    const responseArr = await api.post(`courses/${courseId}/unassign_trainer/`, { user_id: userId, batch });
    return responseArr.data;
};

export const uploadRecording = async (sessionId, file) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('recording', file, 'recording.webm');

    const response = await api.post('upload-recording/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Trainer Activities
export const getTrainerActivities = async () => {
    const response = await api.get('trainer-activities/');
    return response.data;
};

export default api;
