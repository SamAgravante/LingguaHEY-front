import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Stack,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../contexts/AuthContext";

// Axios instance
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const RoleSelect = () => {
const [showPassword, setShowPassword] = useState(false);
const [form, setForm] = useState({ email: "", password: "" });
const [error, setError] = useState("");
const navigate = useNavigate();
const { setToken } = useAuth();


const handleSelect = (role) => {
    if (role === "Student") {
        navigate("/signup", { state: { role: "USER" } });
    }   
    else if (role === "Teacher") {
        navigate("/signup", { state: { role: "USER" } });
    }
};

    return (
        <Grid
            container
            sx={{
                backgroundColor: "#e2a5bf",
                minHeight: "100vh",
                minWidth: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
            >
            <Grid
                container
                sx={{
                    backgroundColor: '#C9E4DE',
                    minHeight: '70vh',
                    minWidth: '70vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4
                }}
            >
                <Stack direction="row" spacing={2}>
                    {["Student", "Teacher"].map((role) => (
                    <Box
                        key={role}
                        onClick={() => handleSelect(role)}
                        sx={{
                            backgroundColor: '#F7D9C4',
                            minHeight: '50vh',
                            minWidth: '20vw',
                            maxHeight: '60vh',
                            maxWidth: '50vw',
                            display: 'flex',
                            justifyContent: "center",
                            alignItems: "center",
                            margin: 3,
                            cursor: 'pointer',
                            borderRadius: 2,
                            boxShadow: 3,
                            transition: '0.3s',
                            '&:hover': {
                            transform: 'scale(1.05)'
                            }
                        }}
                        >
                        <Typography>{role}</Typography>
                    </Box>
                    ))}
                </Stack>
            </Grid>
        </Grid>
    );
};

export default RoleSelect;
