import React from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

const pastels = [
  "#FFCDD2", // light red
  "#C8E6C9", // light green
  "#BBDEFB", // light blue
  "#FFF9C4", // light yellow
  "#D1C4E9", // light purple
];

export default function VerificationStatusPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const theme = useTheme();

  // Defaults
  let title = "❔ Unknown Status";
  let text =
    message ||
    "We’re not sure what happened. Please contact support if this persists.";
  let Icon = WarningIcon;
  let cardBg = pastels[4];
  let iconColor = theme.palette.grey[600];

  // Adjust per status
  if (status === "success") {
    title = "Verification Successful!";
    text =
      message ||
      "Your email is verified! You can now safely log in and enjoy.";
    Icon = CheckCircleIcon;
    cardBg = pastels[1];
    iconColor = theme.palette.success.main;
  } else if (status === "failure") {
    title = "Verification Failed";
    text =
      message ||
      "That link didn’t work—try again or resend a new verification email.";
    Icon = ErrorIcon;
    cardBg = pastels[0];
    iconColor = theme.palette.error.main;
  } else if (status === "info") {
    title = "ℹ️ Already Verified";
    text =
      message ||
      "Looks like you’re already good to go! Feel free to log in.";
    Icon = InfoIcon;
    cardBg = pastels[2];
    iconColor = theme.palette.info.main;
  }

  return (
    <Box
      sx={{
        width: "95vw",
        height: "95vh",
        display: "flex",
        background: `linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)`,
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          bgcolor: cardBg,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: "inline-flex",
            p: 1.5,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.7)",
          }}
        >
          <Icon sx={{ fontSize: 64, color: iconColor }} />
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: theme.palette.text.secondary }}
        >
          {text}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            component={RouterLink}
            to="/login"
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
            Go to Login
          </Button>

          {status === "failure" && (
            <Button
              component={RouterLink}
              to="/resend-verification"
              variant="outlined"
              sx={{
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(200,200,200,0.1)",
                  borderColor: theme.palette.secondary.dark,
                },
              }}
            >
              Resend Email
            </Button>
          )}

          <Button
            component={RouterLink}
            to="/"
            variant="text"
            sx={{
              color: theme.palette.text.secondary,
              textTransform: "none",
              mt: { xs: 1, sm: 0 },
            }}
          >
            ← Back to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
