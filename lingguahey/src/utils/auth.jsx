// auth.jsx
import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        
        // 1. Check for token expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn("Token expired. Logging out user.");
            localStorage.removeItem("token"); // Clear the expired token
            return null;
        }

        // If not expired, return the decoded user object
        return decoded;
    } catch (error) {
        // 2. Handle invalid token (e.g., corrupted structure)
        console.error("Failed to decode token or token is invalid:", error);
        localStorage.removeItem("token");
        return null;
    }
};