import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import ClassIcon from "@mui/icons-material/Class";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Classroom from "./Classroom";
import LiveActClassroom from "./Live-Activity-Classroom/LiveActClassroom";
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import SubscriptionIcon from '@mui/icons-material/Subscriptions';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Book from '../../assets/images/teacherUI/Book.png';

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import MonsterEditUIOuter from "../../assets/images/backgrounds/MonsterEditUIOuter.png";
import MonsterEditUIOuterLight from "../../assets/images/backgrounds/MonsterEditUIOuterLight.png";
import ForestwithShops from "../../assets/images/backgrounds/ForestwithShops.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import SummonUI from "../../assets/images/backgrounds/SummonUI.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Tablet from "../../assets/images/objects/Tablet.png";
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';

const TeacherDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const getRandomColor = () => {
    const colors = ['#F08080', '#FA8072', '#E9967A', '#F4A460', '#E6B8AF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const API = React.useMemo(() => {
    if (!token) return null;
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL, // Ensure this is configured
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate("/login"); // Or your login route
    }
  }, [navigate]);


  // Fetch user data
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const fetchUser = async () => {
          if (!API) return;
          try {
            const response = await API.get(`/api/lingguahey/users/${decoded.userId}`);
            setUserData({
              userId: response.data.userId,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role,
            });
          } catch (err) {
            console.error("Failed to fetch user:", err);
            // Potentially set an error state for user data
          }
        };
        fetchUser();
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [token, API]);

  const fetchRooms = useCallback(async () => {
    if (!API) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // User ID for fetching rooms should come from the decoded token or userData
      // Assuming the teacher's own rooms are fetched.
      // If your API doesn't need teacherId in path because it's derived from token, adjust accordingly.
      const decoded = jwtDecode(token); // Ensure token is valid before decoding
      const response = await API.get(`/api/lingguahey/classrooms/teacher/${decoded.userId}`);
      setRooms(
        response.data.map((room) => ({
          id: room.classroomID,
          name: room.classroomName || room.name || "Unnamed Room",
          activities: room.activities || [], // Keep activities count if shown on card
        }))
      );
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load rooms. Please try again.");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [API, token]); // Added token dependency

  // Fetch classrooms/rooms
  useEffect(() => {
    if (token && userData.userId) { // Ensure userData.userId is available if API needs it explicitly
      fetchRooms();
    }
  }, [token, userData.userId, fetchRooms]);


  const handleCreateRoomDialogOpen = () => {
    setCreateRoomDialogOpen(true);
  };

  const handleCreateRoomDialogClose = () => {
    setCreateRoomDialogOpen(false);
    setNewRoomName(""); // Clear the input when closing the dialog
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !API) return;

    try {
      const response = await API.post('/api/lingguahey/classrooms', {
        classroomName: newRoomName
      });

      setRooms(prev => [...prev, {
        id: response.data.classroomID,
        name: response.data.classroomName,
        activities: response.data.activities || []
      }]);
      handleCreateRoomDialogClose(); // Close the dialog after successful creation
    } catch (err) {
      console.error("Failed to create room:", err);
      // Add user feedback (e.g., toast notification)
    }
  };

  const handleDeleteClick = (e, room) => {
    e.stopPropagation();
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const handleDeleteRoom = async () => {
    if (!API || !roomToDelete) return;

    try {
      await API.delete(`/api/lingguahey/classrooms/${roomToDelete.id}`);
      setRooms(prev => prev.filter(room => room.id !== roomToDelete.id));
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      console.error("Failed to delete room:", err);
      // Add user feedback
    }
  };

  const handleEditClick = (e, room) => {
    e.stopPropagation();
    setRoomToEdit(room);
    setEditRoomName(room.name);
    setEditModalOpen(true);
  };

  const handleEditRoom = async () => {
    if (!API || !roomToEdit || !editRoomName.trim()) return;

    try {
      const response = await API.put(`/api/lingguahey/classrooms/${roomToEdit.id}`, {
        classroomName: editRoomName
      });

      setRooms(prev => prev.map(room =>
        room.id === roomToEdit.id ? { ...room, name: editRoomName } : room
      ));
      setEditModalOpen(false);
      setRoomToEdit(null);
      setEditRoomName("");
    } catch (err) {
      console.error("Failed to edit room:", err);
    }
  };

  const handleRoomClick = (room) => {
    navigate(`/teacherdashboard/classroom/${room.id}`); // Navigate to the new classroom details page
  };

  if (isLoading && rooms.length === 0) { // Show loader only on initial load
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "96.5%",
        width: "98%",
        overflow: "hidden",
        backgroundImage: `url(${MonsterEditUIOuterLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        //alignItems: "center",
        p: 2,
      }}>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, pl: 7 }}>
        {/* Header */}
        <Typography variant="h5" component="h2" gutterBottom>
          View Classrooms
        </Typography>

        {/* Classroom Cards */}
        <Grid container spacing={3}>
          {/* Existing Classroom Cards */}
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  minWidth: 230,
                  transition: "all 0.2s ease-in-out",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  backgroundColor: 'rgba(233, 30, 98, 0)', // Example background color
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleRoomClick(room)}
              >


                <CardContent sx={{ p: 2, position: "relative", backgroundColor: getRandomColor(), borderRadius: 2, alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ justifyContent: 'center' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "transparent",
                        alignItems: 'center',
                      }}
                    >
                      <img src={Book} alt="Book Icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Avatar>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      textAlign: 'center',
                      backgroundColor: '#00000069',
                      padding: '4px 8px',
                      borderRadius: 1,
                      width: '100%',
                    }}
                  >
                    {room.name}
                  </Typography>
                </CardContent>


              </Card>
            </Grid>
          ))}

          {/* "Create New Classroom" Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: 208,
                transition: "all 0.2s ease-in-out",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                backgroundImage: `url(${GameTextFieldMedium})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundcolor: 'transparent',
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                },
                cursor: 'pointer',
              }}
              onClick={handleCreateRoomDialogOpen}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">Create New Classroom +</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Create New Classroom Dialog */}
      <Dialog open={createRoomDialogOpen} onClose={handleCreateRoomDialogClose}>
        <Box
          sx={{
            p: 2,
            backgroundImage: `url(${GameTextFieldMedium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: 400,
            minHeight: 300,
          }}
        >
          <DialogTitle sx={{ textAlign: "center", color: "#5D4037", }}>
            Create New Classroom
          </DialogTitle>
          <Divider sx={{ mb: 1 }} />

          <DialogContent>
            <TextField
              sx={{
                backgroundImage: `url(${GameTextBox})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: 300,
                height: 60,
                alignSelf: "center",
                ml:3
              }}
              label="Classroom Name"
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                sx: {
                  top: -6,
                  "&.MuiInputLabel-shrink": { top: -6 },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmall})`,
                backgroundSize: 'cover',
                width: '180px',
                height: '50px',
                top: 20,
                color: '#5D4037'
              }}
              onClick={handleCreateRoomDialogClose}>Cancel</Button>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmall})`,
                backgroundSize: 'cover',
                width: '180px',
                height: '50px',
                top: 20,
                color: '#5D4037'
              }}
              onClick={handleCreateRoom} disabled={!newRoomName.trim()}>
              Create
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            p: 2,
            backgroundImage: `url(${GameTextFieldBig})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: 350,
            minHeight: 250,
          }}
        >
          <DialogTitle sx={{ textAlign: "center", color: "#5D4037" }}>
            Edit Room Name
          </DialogTitle>
          <Divider sx={{ mb: 1 }} />

          <DialogContent>
            <TextField
              sx={{
                backgroundImage: `url(${GameTextBox})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: 300,
                height: 60,
                alignSelf: "center",
              }}
              label="Room Name"
              type="text"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                sx: {
                  top: -6,
                  "&.MuiInputLabel-shrink": { top: -6 },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRoom}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            p: 2,
            backgroundImage: `url(${GameTextFieldBig})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: 350,
            minHeight: 220,
          }}
        >
          <DialogTitle sx={{ textAlign: "center", color: "#B71C1C" }}>
            Delete Room
          </DialogTitle>
          <Divider sx={{ mb: 1 }} />

          <DialogContent>
            <Typography align="center" sx={{ mb: 2 }}>
              Are you sure you want to delete{" "}
              <strong>{roomToDelete?.name}</strong>? <br /> This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteRoom} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
};

export default TeacherDashboard;
