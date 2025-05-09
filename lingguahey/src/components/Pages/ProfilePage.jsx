import { Box, Typography, Grid, Stack, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";
import API from "../../api"; 
export default function ProfilePage() {
  // ---- LOGIC: DO NOT MODIFY ----
  const userID = getUserFromToken().userId;
  const [userDetails, setUserDetails] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
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
        console.log("User data fetched", response.data);
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
        userId:        formData.userId,
        firstName:     formData.firstName,
        middleName:    formData.middleName,
        lastName:      formData.lastName,
        email:         formData.email,
        password:      formData.password,
        idNumber:      formData.idNumber,
        totalPoints:   formData.totalPoints,
        profilePic:    formData.profilePic,
        role:          formData.role
    };
  
    //console.log("payload ", payload);
  
    try {
        const response = await API.put(`/${userID}`, payload);
        setUserDetails(response.data);
        setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const panelBg = "#FFF9C4";
  const inputBg = "#FFFFFF";
  const buttonPrimary = "#FFCC80";
  const buttonSecondary = "#FFE0B2";
  const textPrimary = "#6D4C41";

  return (
    <Box sx={{ 
        width: '82vw', 
        minHeight: '90vh', 
        //background: 'linear-gradient(135deg,#FFECB3 30%,#E1F5FE 90%)', 
        backgroundColor: '#FFECB3',
        p: 3 
    }}>
      <Grid container justifyContent="center">
        <Box sx={{
          backgroundColor: panelBg,
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: 600,
        }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ color: textPrimary, textAlign: 'center' }}>
              Profile Information
            </Typography>

            {editMode ? (
              <Stack spacing={2}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: inputBg, borderRadius: 1 }}
                />
                <TextField
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: inputBg, borderRadius: 1 }}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: inputBg, borderRadius: 1 }}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: inputBg, borderRadius: 1 }}
                />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ backgroundColor: buttonPrimary, color: textPrimary, textTransform: 'none' }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setEditMode(false)}
                    sx={{ backgroundColor: buttonSecondary, color: textPrimary, textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography sx={{ color: textPrimary }}>
                  First Name: {userDetails.firstName}
                </Typography>
                <Typography sx={{ color: textPrimary }}>
                  Middle Name: {userDetails.middleName}
                </Typography>
                <Typography sx={{ color: textPrimary }}>
                  Last Name: {userDetails.lastName}
                </Typography>
                <Typography sx={{ color: textPrimary }}>
                  Email: {userDetails.email}
                </Typography>
                <Box textAlign="right" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setEditMode(true)}
                    sx={{ backgroundColor: buttonPrimary, color: textPrimary, textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      </Grid>
    </Box>
  );
}
