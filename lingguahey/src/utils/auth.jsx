import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};