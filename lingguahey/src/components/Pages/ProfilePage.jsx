import { Box, Typography, Grid, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";

export default function ProfilePage() {
  // ---- LOGIC: DO NOT MODIFY ----
  const userID = getUserFromToken().userId;
  const [userDetails, setUserDetails] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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
      }
    };
    fetchUser();
  }, [userID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      userId:      formData.userId,
      firstName:   formData.firstName,
      middleName:  formData.middleName,
      lastName:    formData.lastName,
      email:       formData.email,
      password:    formData.password,
      idNumber:    formData.idNumber,
      totalPoints: formData.totalPoints,
      profilePic:  formData.profilePic,
      role:        formData.role,
    };
    try {
      const response = await API.put(`/${userID}`, payload);
      setUserDetails(response.data);
      setEditMode(false);
      setFormData(response.data);
    } catch (error) {
      console.error("Failed to update profile", error);
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

  const handlePwdConfirm = () => {
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    // Optionally: validate currentPassword here
    setFormData((prev) => ({ ...prev, password: newPassword }));
    setPwdDialogOpen(false);
  };

  const panelBg = "#FFF9C4";
  const inputBg = "#FFFFFF";
  const buttonPrimary = "#FFCC80";
  const buttonSecondary = "#FFE0B2";
  const textPrimary = "#6D4C41";

  return (
    <Box sx={{ width: '82vw', minHeight: '90vh', backgroundColor: '#FFECB3', p: 3 }}>
      <Grid container justifyContent="center">
        <Box sx={{ backgroundColor: panelBg, p: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ color: textPrimary, textAlign: 'center' }}>Profile Information</Typography>
            {editMode ? (
              <Stack spacing={2}>
                <TextField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} fullWidth variant="outlined" sx={{ backgroundColor: inputBg, borderRadius: 1 }} />
                <TextField label="Middle Name" name="middleName" value={formData.middleName || ''} onChange={handleChange} fullWidth variant="outlined" sx={{ backgroundColor: inputBg, borderRadius: 1 }} />
                <TextField label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} fullWidth variant="outlined" sx={{ backgroundColor: inputBg, borderRadius: 1 }} />
                <TextField label="Email" name="email" value={formData.email || ''} disabled fullWidth variant="outlined" sx={{ backgroundColor: inputBg, borderRadius: 1 }} />
                <Button variant="outlined" onClick={handlePwdDialogOpen} sx={{ textTransform: 'none', width: 'fit-content' }}>Change Password</Button>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: buttonPrimary, color: textPrimary, textTransform: 'none' }}>Save</Button>
                  <Button variant="contained" onClick={() => setEditMode(false)} sx={{ backgroundColor: buttonSecondary, color: textPrimary, textTransform: 'none' }}>Cancel</Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography sx={{ color: textPrimary }}>First Name: {userDetails.firstName}</Typography>
                <Typography sx={{ color: textPrimary }}>Middle Name: {userDetails.middleName}</Typography>
                <Typography sx={{ color: textPrimary }}>Last Name: {userDetails.lastName}</Typography>
                <Typography sx={{ color: textPrimary }}>Email: {userDetails.email}</Typography>
                <Box textAlign="right" sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={() => setEditMode(true)} sx={{ backgroundColor: buttonPrimary, color: textPrimary, textTransform: 'none' }}>Edit</Button>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      </Grid>
      <Dialog open={pwdDialogOpen} onClose={handlePwdDialogClose}>
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth variant="outlined" />
            <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth variant="outlined" />
            <TextField label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} fullWidth variant="outlined" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePwdDialogClose} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handlePwdConfirm} sx={{ textTransform: 'none' }}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}