import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";

const pastels = [
  "#FFCDD2", // light red
  "#C8E6C9", // light green
  "#BBDEFB", // light blue
  "#FFF9C4", // light yellow
  "#D1C4E9", // light purple
];

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [severity, setSeverity] = useState("info");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth/resend-verification`,
        { email }
      );
      setInfo("✅ Check your inbox—another link has been sent.");
      setSeverity("success");
      setOpen(true);
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Error sending email.";
      setInfo(msg);
      setSeverity("error");
      setOpen(true);
    }
  };

  return (
    <Box
      sx={{
        width: "95vw",
        height: "95vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          bgcolor: pastels[4],
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          🔄 Resend Verification
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
          <TextField
            label="Your School Email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
            }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Send Email
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/")}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: "none",
              mt: 1,
            }}
          >
            ← Back to Home
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={severity}
          onClose={() => setOpen(false)}
          sx={{ bgcolor: severity === "success" ? pastels[1] : pastels[0] }}
        >
          {info}
        </Alert>
      </Snackbar>
    </Box>
  );
}