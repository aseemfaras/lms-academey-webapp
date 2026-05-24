import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const storedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        console.log("AuthContext: RESTORING SESSION", { hasUser: !!storedUser, hasToken: !!accessToken });

        if (storedUser && accessToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("AuthContext: Session restored successfully for", parsedUser.email);
                setUser(parsedUser);
            } catch (err) {
                console.error("AuthContext: Failed to parse stored user", err);
                logout(); // Use centralized logout to clear everything
            }
        } else {
            console.log("AuthContext: No active session found in storage");
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            console.log("AuthContext: LOGIN ATTEMPT", credentials.email);
            const data = await loginUser(credentials);
            console.log("AuthContext: LOGIN RESPONSE RECEIVED", data);

            // Expected backend response: { access, refresh, user: { id, username, email, role } }
            const { access, refresh, user: userData } = data;

            if (!access) {
                console.error("AuthContext: No access token in response!");
                throw new Error("No access token received from server");
            }

            localStorage.setItem("accessToken", access);
            if (refresh) localStorage.setItem("refreshToken", refresh);
            localStorage.setItem("user", JSON.stringify(userData));

            console.log("AuthContext: localStorage set. accessToken present:", !!localStorage.getItem("accessToken"));
            console.log("AuthContext: Tokens and user saved to localStorage");

            setUser(userData);
            return userData;
        } catch (err) {
            console.error("AuthContext: Login service error:", err);
            throw err;
        }
    };

    const logout = () => {
        console.log("AuthContext: LOGGING OUT - Clearing storage");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Clear anything else that might have been set
        localStorage.clear();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role?.toLowerCase() === "admin",
        isStudent: user?.role?.toLowerCase() === "student",
        isTrainer: user?.role?.toLowerCase() === "trainer",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
