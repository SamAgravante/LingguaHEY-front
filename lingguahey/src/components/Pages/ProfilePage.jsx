import { Typography, Grid, Stack, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";

export default function ProfilePage() {
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
        const fetchUser = async (userID) => {
            try {
                const response = await API.get(`/${userID}`);
                setUserDetails(response.data);
                setFormData(response.data);
            } catch (error) {
                console.error("Failed to get data", error);
            }
        };
        console.log(token);
        fetchUser(userID);
    }, [userID]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
          role:          formData.role,
        };
      
        console.log("payload ", payload);
      
        try {
          const response = await API.put("", payload, { params: { id: userID } });
          setUserDetails(response.data);
          setEditMode(false);
        } catch (error) {
          console.error("Failed to update profile", error);
        }
      };
      

    return (
        <Grid
            container
            sx={{
                position: 'relative',
                backgroundSize: 'cover',
                backgroundColor: '#FFCBE1',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100%',
                minWidth: '100%',
                display: 'flex',
                alignContent: 'center'
            }}
        >
            <Grid
                container
                sx={{
                    position: 'relative',
                    backgroundSize: 'cover',
                    backgroundColor: '#C9E4DE',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '70vh',
                    minWidth: '70vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                    borderRadius: 4
                }}
            >
                <Stack spacing={2} direction="column">
                    <Typography variant="h4">Profile Information</Typography>
                    {editMode ? (
                        <>
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={formData.firstName || ""}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Middle Name"
                                name="middleName"
                                value={formData.middleName || ""}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName || ""}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={formData.email || ""}
                                onChange={handleChange}
                            />
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" color="primary" onClick={handleSave}>
                                    Save
                                </Button>
                                <Button variant="outlined" onClick={() => setEditMode(false)}>
                                    Cancel
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <>
                            <Typography variant="body1">First Name: {userDetails.firstName}</Typography>
                            <Typography variant="body1">Middle Name: {userDetails.middleName}</Typography>
                            <Typography variant="body1">Last Name: {userDetails.lastName}</Typography>
                            <Typography variant="body1">Email: {userDetails.email}</Typography>
                            <Button variant="contained" onClick={() => setEditMode(true)}>
                                Edit
                            </Button>
                        </>
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
}
