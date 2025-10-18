import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Modal,
    Fade,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { getUserFromToken } from '../../utils/auth';
import { MusicContext } from '../../contexts/MusicContext';

// Background assets
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";

const ProfileModal = ({ open, onClose, onUpdate }) => {
    const [editMode, setEditMode] = useState(false);
    const userID = getUserFromToken()?.userId;
    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({});
    const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
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

    const { 
        setSrc, 
        setActivityMode, 
        playLaserSuccess, 
        playLaserFail, 
        playHeal, 
        playShield, 
        playSkip,
        playHit,
        playEnemyAttack, 
        playEnemyDead, 
        playConfirm, 
        playDenied, 
        playCancel
      } = useContext(MusicContext);
      
    useEffect(() => {
        const loadProfile = async () => {
            if (!userID) return;
            try {
                const response = await API.get(`/${userID}`);
                setProfile(response.data);
                setFormData(response.data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                showSnack('Failed to load profile', 'error');
            }
        };

        if (open) {
            loadProfile();
        }
    }, [open, userID]);

    useEffect(() => {
        if (!open) {
            setEditMode(false);
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // Check for missing fields
        if (!formData.firstName || !formData.middleName || !formData.lastName || !formData.email) {
            showSnack("All fields are required.", "warning");
            return;
        }

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
            setProfile(response.data);
            setFormData(response.data);
            // notify parent that profile was updated so they can refresh displayed data
            if (typeof onUpdate === 'function') onUpdate(response.data);
            showSnack('Profile updated successfully', 'success');
            setTimeout(() => onClose(), 1500);
            playCancel();
        } catch (err) {
            playDenied();
            console.error('Failed to update profile:', err);
            showSnack('Update failed', 'error');
        }
    };


    const handlePwdDialogOpen = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPwdDialogOpen(true);
        playCancel();
    };

    const handlePwdDialogClose = () => {
        setPwdDialogOpen(false);
        playCancel();
    };

    const handlePwdConfirm = async () => {
        if (newPassword.length < 8) {
            showSnack("New password must be at least 8 characters long.", "warning");
            playDenied();
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showSnack("New passwords do not match.", "warning");
            playDenied();
            return;
        }

        const payload = { oldPassword: currentPassword, newPassword: newPassword };

        try {
            await API.put(`/${userID}/reset-password`, payload);
            setPwdDialogOpen(false);
            showSnack("Password updated successfully.", "success");
            playConfirm();
        } catch (error) {
            showSnack("Failed to update password. Please check your current password.", "error");
            playDenied();
        }
    };

    const showSnack = (message, severity = "info") => {
        setSnackMessage(message);
        setSnackSeverity(severity);
        setSnackOpen(true);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackOpen(false);
    };

    const handleCancel = () => {
        setFormData(profile);
        setEditMode(false);
        playCancel();
    };

    return (
        <>
            <Modal open={open} onClose={onClose} closeAfterTransition BackdropProps={{ invisible: true }}>
                <Fade in={open}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            height: 500,
                            backgroundImage: `url(${GameTextFieldBig})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            borderRadius: 2,
                            p: 4,
                        }}
                    >
                        <IconButton
                            onClick={()=>{onClose();playCancel();}}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#5D4037' }}>
                            {editMode ? 'Edit Profile' : 'Profile Information'}
                        </Typography>

                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ height: 10 }} />

                        <Stack spacing={4} sx={{ mb: 2 }}>
                            {editMode ? (
                                <>
                                    <TextField
                                        name="firstName"
                                        label="First Name"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                backgroundImage: `url(${GameTextFieldLong})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                height: 40,
                                                pl: 1,
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: {
                                                top: -6,
                                                '&.MuiInputLabel-shrink': {
                                                    top: -12,

                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        name="middleName"
                                        label="Middle Name"
                                        value={formData.middleName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                backgroundImage: `url(${GameTextFieldLong})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                height: 40,
                                                pl: 1,
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: {
                                                top: -6,
                                                '&.MuiInputLabel-shrink': {
                                                    top: -12,
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        name="lastName"
                                        label="Last Name"
                                        value={formData.lastName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                backgroundImage: `url(${GameTextFieldLong})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                height: 40,
                                                pl: 1,
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: {
                                                top: -6,
                                                '&.MuiInputLabel-shrink': {
                                                    top: -12,
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        name="email"
                                        label="Email"
                                        value={formData.email || ''}
                                        disabled
                                        fullWidth
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                backgroundImage: `url(${GameTextFieldLong})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                height: 40,
                                                pl: 1,
                                            },
                                        }}
                                        InputLabelProps={{
                                            sx: {
                                                top: -6,
                                                '&.MuiInputLabel-shrink': {
                                                    top: -12,
                                                },
                                            },
                                        }}
                                    />


                                    <Button
                                        onClick={handlePwdDialogOpen}
                                        sx={{
                                            backgroundImage: `url(${GameTextBoxLong})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            textTransform: 'none',
                                            width: 360,
                                            height: 40,
                                            alignSelf: 'center',
                                        }}
                                    >
                                        Change Password
                                    </Button>

                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                backgroundColor: '#AED581',
                                                color: '#5D4037',
                                                '&:hover': { backgroundColor: '#C5E1A5' },
                                            }}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleCancel}
                                            sx={{
                                                backgroundColor: '#FFB74D',
                                                color: '#5D4037',
                                                '&:hover': { backgroundColor: '#FFA726' },
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                </>
                            ) : (
                                <>
                                    <Typography><strong>First Name:</strong> {profile.firstName}</Typography>
                                    <Typography><strong>Middle Name:</strong> {profile.middleName}</Typography>
                                    <Typography><strong>Last Name:</strong> {profile.lastName}</Typography>
                                    <Typography><strong>Email:</strong> {profile.email}</Typography>

                                    <Button
                                        variant="contained"
                                        onClick={() => {setEditMode(true);playCancel();}}
                                        sx={{
                                            mt: 2,
                                            backgroundColor: '#AED581',
                                            color: '#5D4037',
                                            '&:hover': { backgroundColor: '#C5E1A5' },
                                        }}
                                    >
                                        Edit Profile Details
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>
                </Fade>
            </Modal>

            <Dialog open={pwdDialogOpen} onClose={handlePwdDialogClose} BackdropProps={{ invisible: true }}>
                <Box sx={{
                    p: 2,
                    backgroundImage: `url(${GameTextFieldBig})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 445,
                    height: 540,
                }}>
                    <DialogTitle sx={{ textAlign: 'center', color: '#5D4037' }}>Confirm Password Change</DialogTitle>
                    <Divider sx={{ mb: 1 }} />

                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 6 }}>
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
                                required
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
                                required
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
                                required
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
                        <Button onClick={handlePwdConfirm}>Confirm</Button>
                        <Button onClick={handlePwdDialogClose}>Cancel</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                container={document.body}
                sx={{
                    position: "fixed",      // not relative to modal
                    zIndex: 20000,          // force much higher than modal/dialog
                }}
            >
                <Alert
                    onClose={handleSnackClose}
                    severity={snackSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackMessage}
                </Alert>
            </Snackbar>


        </>
    );
};

export default ProfileModal;
