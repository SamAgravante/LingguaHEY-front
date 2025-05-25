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
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import ClassIcon from "@mui/icons-material/Class";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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

  const handleDeleteRoom = async (roomId) => {
    if (!API) return;
    try {
      await API.delete(`/api/lingguahey/classrooms/${roomId}`);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error("Failed to delete room:", err);
      // Add user feedback
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
        <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="New Room Name"
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ 
              backgroundColor: "#fff",
              borderRadius: 1,
              flexGrow: 1,
              minWidth: '250px'
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleCreateRoom}
            disabled={!newRoomName.trim()}
            sx={{ 
              backgroundColor: "#3f51b5", 
              "&:hover": { backgroundColor: "#303f9f" },
              height: '56px' // Match TextField height
            }}
            startIcon={<AddIcon />}
          >
            Create Room
          </Button>
        </Box>

        {/* Rooms Grid */}
        <Typography variant="h5" sx={{ mb: 3, color: "#3f51b5", fontWeight: 500 }}>
          Your Rooms
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={
            <Button color="inherit" size="small" onClick={fetchRooms}>
              RETRY
            </Button>
          }>
            {error}
          </Alert>
        )}
        {isLoading && rooms.length > 0 && <CircularProgress sx={{ display: 'block', margin: '20px auto'}}/>}

        <Grid container spacing={3}>
          {!isLoading && rooms.length > 0 ? (
            rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    height: '100%', // Ensure cards have same height if content varies
                    display: 'flex',
                    flexDirection: 'column',
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                    }
                  }}
                  onClick={() => handleRoomClick(room)}
                >
                  <CardContent sx={{ position: "relative", p: 3, flexGrow: 1 }}>
                    <IconButton 
                      aria-label={`Delete room ${room.name}`}
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8, 
                        color: "#f44336",
                        "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" }
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when deleting
                        handleDeleteRoom(room.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "#3f51b5", mr: 2 }}>
                        <ClassIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {room.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {room.activities?.length || 0} Activities
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
             !isLoading && ( // Only show "no rooms" if not loading
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    No rooms created yet. Create your first room to get started.
                  </Typography>
                </Paper>
              </Grid>
            )
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
