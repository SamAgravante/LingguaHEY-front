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
  DialogTitle
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
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

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


  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !API) return;
    
    try {
      // The classroom creation endpoint might associate the room with the logged-in teacher via token
      const response = await API.post('/api/lingguahey/classrooms', {
        classroomName: newRoomName
        // teacherId: userData.userId, // Include if your API requires it explicitly
      });
      
      setRooms(prev => [...prev, { 
        id: response.data.classroomID, 
        name: response.data.classroomName,
        activities: response.data.activities || []
      }]);
      setNewRoomName("");
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
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      {/* Header */}
      <Box 
        sx={{ 
          backgroundColor: "#fff", 
          py: 2, 
          px: 3, 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          mb: 4,
          display: "flex",
          alignItems: "center"
        }}
      >
        <DashboardIcon sx={{ mr: 2, color: "#3f51b5", fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#3f51b5" }}>
            Teacher Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575" }}>
            {userData.firstName ? `Welcome, ${userData.firstName} ${userData.lastName}` : "LingguaHey Learning Platform"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1600, mx: "auto", px: 3 }}>
        {/* Create Room Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            backgroundColor: "#fff",
            border: "1px solid rgba(0, 0, 0, 0.12)"
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              gap: 2, 
              alignItems: 'center', 
              width: { xs: '100%', md: '50%', lg: '40%' }
            }}
          >
            <TextField
              fullWidth
              label="New Room Name"
              variant="outlined"
              value={newRoomName}
              placeholder="Enter room name..."
              onChange={(e) => setNewRoomName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  "&:hover fieldset": {
                    borderColor: "#3f51b5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3f51b5",
                  }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              sx={{
                height: 56,
                px: 3,
                backgroundColor: "#3f51b5",
                "&:hover": {
                  backgroundColor: "#303f9f"
                },
                "&.Mui-disabled": {
                  backgroundColor: "#e0e0e0"
                },
                whiteSpace: "nowrap"
              }}
              startIcon={<AddIcon />}
            >
              Create Room
            </Button>
          </Box>
        </Paper>

        {/* Rooms Grid */}
        <Box sx={{ mb: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": { fontSize: "0.95rem" }
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={fetchRooms}
                  sx={{ fontWeight: 500 }}
                >
                  RETRY
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {isLoading && rooms.length > 0 && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress size={32} sx={{ color: "#3f51b5" }}/>
            </Box>
          )}

          <Grid container spacing={3}>
            {!isLoading && rooms.length > 0 ? (
              rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      minWidth: 230,
                      transition: "all 0.2s ease-in-out",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                      }
                    }}
                    onClick={() => handleRoomClick(room)}
                  >
                    <CardContent sx={{ p: 3, position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0 }}>
                        <Tooltip title="Edit Room" placement="top">
                          <IconButton
                            size="small"
                            edge="end"
                            aria-label={`Edit room ${room.name}`}
                            sx={{
                              color: "rgb(73, 73, 73)",
                              opacity: 0.34,
                              "&:hover": {
                                opacity: 1,
                                backgroundColor: "rgba(33, 150, 243, 0.08)"
                              }
                            }}
                            onClick={(e) => handleEditClick(e, room)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Room" placement="top">
                          <IconButton
                            size="small"
                            edge="end"
                            aria-label={`Delete room ${room.name}`}
                            sx={{
                              color: "#f44336",
                              opacity: 0.7,
                              "&:hover": {
                                opacity: 1,
                                backgroundColor: "rgba(244, 67, 54, 0.08)"
                              }
                            }}
                            onClick={(e) => handleDeleteClick(e, room)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: "#3f51b5",
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <ClassIcon />
                        </Avatar>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: "1.1rem",
                            color: "#1a237e"
                          }}
                        >
                          {room.name}
                        </Typography>
                      </Box>
                      {/*
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          mt: 1
                        }}
                      >
                        {room.activities?.length || 0} Activities
                      </Typography>
                      */}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              !isLoading && (
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 4, 
                      textAlign: "center",
                      borderRadius: 2,
                      backgroundColor: "#f8f9fa",
                      border: "1px solid rgba(0, 0, 0, 0.12)"
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "text.secondary",
                        fontWeight: 500
                      }}
                    >
                      No rooms created yet. Create your first room to get started.
                    </Typography>
                  </Paper>
                </Grid>
              )
            )}
          </Grid>
        </Box>
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="delete-dialog-title">
          {"Delete Room"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{roomToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteModalOpen(false)} 
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRoom} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="edit-dialog-title">
          {"Edit Room Name"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="edit-dialog-description">
            Update the name of the room.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editRoomName}
            onChange={(e) => setEditRoomName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: 1,
                "&:hover fieldset": {
                  borderColor: "#3f51b5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3f51b5",
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditModalOpen(false)} 
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditRoom} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherDashboard;
