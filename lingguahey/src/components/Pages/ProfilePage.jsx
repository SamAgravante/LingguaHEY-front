import { Box, Typography, Grid, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

// Background assets
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";

export default function ProfilePage() {
  const userID = getUserFromToken()?.userId;
  const [userDetails, setUserDetails] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Snackbar state
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("info");

  const token = localStorage.getItem("token");
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`,
    timeout: 1000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get(`/${userID}`);
        setUserDetails(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Failed to get data", error);
        showSnack("Failed to fetch user details.", "error");
      }
    };
    if (userID) fetchUser();
  }, [userID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      userId: formData.userId,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      idNumber: formData.idNumber,
      totalPoints: formData.totalPoints,
      profilePic: formData.profilePic,
      role: formData.role,
    };
    try {
      const response = await API.put(`/${userID}`, payload);
      setUserDetails(response.data);
      setFormData(response.data);
      setEditMode(false);
      showSnack("Profile updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update profile", error);
      showSnack("Failed to update profile.", "error");
    }
  };

  const handlePwdDialogOpen = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwdDialogOpen(true);
  };

  const handlePwdDialogClose = () => {
    setPwdDialogOpen(false);
  };

  const showSnack = (message, severity = "info") => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
  };

  const handlePwdConfirm = async () => {
    if (newPassword.length < 8) {
      showSnack("New password must be at least 8 characters long.", "warning");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showSnack("New passwords do not match.", "warning");
      return;
    }
    const payload = { oldPassword: currentPassword, newPassword: newPassword };
    try {
      await API.put(`/${userID}/reset-password`, payload);
      setPwdDialogOpen(false);
      showSnack("Password updated successfully.", "success");
    } catch (error) {
      showSnack("Failed to update password. Please check your current password.", "error");
    }
  };

  // Shared textfield style
  const customTextFieldProps = {
    fullWidth: true,
    variant: "outlined",
    InputProps: {
      sx: {
        backgroundImage: `url(${GameTextFieldLong})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: 40,
        pl: 1,
      },
    },
    InputLabelProps: {
      sx: {
        top: -6,
        "&.MuiInputLabel-shrink": { top: -12 },
      },
    },
  };

  return (
    <>
      <Grid container justifyContent="center" sx={{ p: 4 }}>
        <Box
          sx={{
            backgroundImage: `url(${GameTextFieldBig})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: 400,
            minHeight: 550,
            borderRadius: 3,
            p: 5,
            position: "relative",
          }}
        >
          <Typography variant="h4" sx={{ textAlign: "center", mb: 3, color: "#5D4037" }}>
            {editMode ? "Edit Profile" : "Profile Information"}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height:20}}/>

          <Stack spacing={3}>
            {editMode ? (
              <>
                <TextField label="First Name" name="firstName" value={formData.firstName || ""} onChange={handleChange} {...customTextFieldProps} />
                <TextField label="Middle Name" name="middleName" value={formData.middleName || ""} onChange={handleChange} {...customTextFieldProps} />
                <TextField label="Last Name" name="lastName" value={formData.lastName || ""} onChange={handleChange} {...customTextFieldProps} />
                <TextField label="Email" name="email" value={formData.email || ""} disabled {...customTextFieldProps} />

                <Button
                  onClick={handlePwdDialogOpen}
                  sx={{
                    backgroundImage: `url(${GameTextBoxLong})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    textTransform: "none",
                    width: 360,
                    height: 40,
                    alignSelf: "center",
                  }}
                >
                  Change Password
                </Button>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    onClick={handleSave}
                    sx={{
                      backgroundColor: "#AED581",
                      color: "#5D4037",
                      "&:hover": { backgroundColor: "#C5E1A5" },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditMode(false)}
                    sx={{
                      backgroundColor: "#FFB74D",
                      color: "#5D4037",
                      "&:hover": { backgroundColor: "#FFA726" },
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography><strong>First Name:</strong> {userDetails.firstName}</Typography>
                <Typography><strong>Middle Name:</strong> {userDetails.middleName}</Typography>
                <Typography><strong>Last Name:</strong> {userDetails.lastName}</Typography>
                <Typography><strong>Email:</strong> {userDetails.email}</Typography>

                <Button
                  onClick={() => setEditMode(true)}
                  sx={{
                    mt: 2,
                    backgroundColor: "#AED581",
                    color: "#5D4037",
                    "&:hover": { backgroundColor: "#C5E1A5" },
                  }}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={pwdDialogOpen} onClose={handlePwdDialogClose} sx={{paddingLeft:30,paddingBottom:30}}>
        <Box sx={{
          p: 2,
          backgroundImage: `url(${GameTextFieldBig})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: 350,
          height: 425,
        }}>
          <DialogTitle sx={{ textAlign: 'center', color: '#5D4037' }}>Confirm Password Change</DialogTitle>
          <Divider sx={{ mb: 1 }} />

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                sx={{
                  backgroundImage: `url(${GameTextBox})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  textTransform: 'none',
                  width: 300,
                  height: 60,
                  alignSelf: 'center',
                }}
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  sx: {
                    top: -6,
                    '&.MuiInputLabel-shrink': {
                      top: -6,
                    },
                  },
                }}

              />
              <TextField
                sx={{
                  backgroundImage: `url(${GameTextBox})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  textTransform: 'none',
                  width: 300,
                  height: 60,
                  alignSelf: 'center',
                }}
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  sx: {
                    top: -6,
                    '&.MuiInputLabel-shrink': {
                      top: -6,
                    },
                  },
                }}
              />
              <TextField
                sx={{
                  backgroundImage: `url(${GameTextBox})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  textTransform: 'none',
                  width: 300,
                  height: 60,
                  alignSelf: 'center',
                }}
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  sx: {
                    top: -6,
                    '&.MuiInputLabel-shrink': {
                      top: -6,
                    },
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePwdDialogClose}>Cancel</Button>
            <Button onClick={handlePwdConfirm}>Confirm</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
