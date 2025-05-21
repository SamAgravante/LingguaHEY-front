import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Avatar,
  Modal,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ClassIcon from "@mui/icons-material/Class";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";

const TeacherDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openStudentListModal, setOpenStudentListModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    role: null,
  });
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [activityStatus, setActivityStatus] = useState("Deployed");
  const [isLoading, setIsLoading] = useState(true);
  
  // Activity statistics
  const [activityStats, setActivityStats] = useState({
    averageScore: 0,
    lowestScore: 0,
    highestScore: 0,
    studentsReachedGoal: 0,
    studentsFailed: 0
  });
  
  // Progress tracking data
  const [progressData, setProgressData] = useState([]);
  
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch user data
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const fetchUser = async () => {
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
          }
        };
        fetchUser();
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  // Fetch classrooms/rooms
  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const decoded = jwtDecode(token);
      const response = await API.get(`/api/lingguahey/classrooms/teacher/${decoded.userId}`);
      setRooms(
        response.data.map((room) => ({
          id: room.classroomID,
          name: room.classroomName || room.name || "Unnamed Room",
          activities: room.activities || []
        }))
      );
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all students for potential enrollment
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API.get('/api/lingguahey/users?role=USER');
      if (Array.isArray(response.data)) {
        setAllStudents(response.data.filter(student => student.role === "USER"));
      } else {
        setAllStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setAllStudents([]);
    }
  };

  // Setup sample progress data
  useEffect(() => {
    if (selectedRoom) {
      // Example progress data
      setProgressData([
        { id: 1, name: "Maria Christina Falls", progress: "Lesson 25" },
        { id: 2, name: "Juan Dela Cruz", progress: "Lesson 30" },
        { id: 3, name: "Jose Rizz Ali", progress: "Lesson 17" },
        { id: 4, name: "Pepe Rizzler", progress: "Lesson 24" },
        { id: 5, name: "Josefina Rizal", progress: "Lesson 25" }
      ]);
      
      // Example enrolled students
      setEnrolledStudents([
        { id: 1, name: "Maria Christina Falls" },
        { id: 2, name: "Juan Dela Cruz" },
        { id: 3, name: "Jose Rizz Ali" },
        { id: 4, name: "Pepe Rizzler" },
        { id: 5, name: "Josefina Rizal" }
      ]);
    }
  }, [selectedRoom]);

  // Fetch enrolled students when a room is selected
  useEffect(() => {
    fetchEnrolledStudents();
    fetchActivityStats();
    fetchProgressData();
  }, [selectedRoom]);

  const fetchEnrolledStudents = async () => {
    if (selectedRoom) {
      try {
        const response = await API.get(`/api/lingguahey/classrooms/${selectedRoom.id}/students`);
        setSelectedRoomStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch enrolled students:", error);
      }
    }
  };

  // Fetch activity statistics when a room is selected
  const fetchActivityStats = async () => {
    if (selectedRoom) {
      try {
        const response = await API.get(`/api/lingguahey/activities/${selectedRoom.id}/activities`);
        setActivityStats(response.data);
      } catch (error) {
        console.error("Failed to fetch activity stats:", error);
      }
    }
  };

  const fetchProgressData = async () => {
    if (selectedRoom) {
      try {
        const response = await API.get(`/api/lingguahey/activities/${selectedRoom.id}/progress`);
        setProgressData(response.data);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
        setProgressData([]);
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      const response = await API.post('/api/lingguahey/classrooms', {
        classroomName: newRoomName
      });
      
      setRooms(prev => [...prev, { 
        id: response.data.classroomID, 
        name: response.data.classroomName,
        activities: []
      }]);
      setNewRoomName("");
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await API.delete(`/api/lingguahey/classrooms/${roomId}`);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRoom(null);
  };

  const handleOpenStudentListModal = () => {
    setOpenStudentListModal(true);
  };

  const handleCloseStudentListModal = () => {
    setOpenStudentListModal(false);
  };

  const handleAddStudent = async (student) => {
    try {
      if (!selectedRoom) {
        console.error("No classroom selected");
        return;
      }

      const response = await API.post(
        `/api/lingguahey/classrooms/${selectedRoom.id}/students/${student.userId}`,
        {} 
      );

      if (response.status === 200 || response.status === 201) {
        setSelectedRoomStudents(prev => [...prev, student]);
        console.log(`Successfully added ${student.firstName} ${student.lastName} to the classroom`);
      }
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await API.delete(`/api/lingguahey/classrooms/${selectedRoom.id}/students/${studentId}`);
      setSelectedRoomStudents(prev => prev.filter(student => student.userId !== studentId));
    } catch (error) {
      console.error("Failed to remove student:", error);
    }
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const StudentListModal = () => (
    <Modal
      open={openStudentListModal}
      onClose={handleCloseStudentListModal}
      aria-labelledby="student-list-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%', // Increased from 90%
        maxWidth: 1200, // Increased from 800
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 0,
      }}>
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f5f5f5'
        }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
            Student List
          </Typography>
          <IconButton
            onClick={handleCloseStudentListModal}
            sx={{ color: '#616161' }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Grid container>
          {/* Left Panel - Current Student List */}
          <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: '1px solid #e0e0e0' } }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
              Enrolled Students
            </Typography>
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              p: 1,
              maxHeight: 500, // Increased from 300
              overflowY: 'auto'
            }}>
              <List>
                {selectedRoomStudents.map((student) => (
                  <ListItem 
                    key={student.userId}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveStudent(student.userId)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={`${student.firstName} ${student.lastName}`} 
                      secondary={student.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          
          {/* Right Panel - Add Students */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
              Add Students
            </Typography>
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              maxHeight: 500, // Increased from 300
              overflowY: 'auto',
              mb: 2
            }}>
              <List>
                {allStudents
                  .filter(student => !selectedRoomStudents.find(enrolled => enrolled.userId === student.userId))
                  .map((student) => (
                    <ListItem 
                      key={student.userId}
                      button
                      onClick={() => handleAddStudent(student)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(63, 81, 181, 0.1)',
                          transition: 'background-color 0.2s'
                        },
                        '&:active': {
                          bgcolor: 'rgba(63, 81, 181, 0.2)'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography
                            component="span"
                            sx={{
                              color: '#3f51b5',
                              fontWeight: 500,
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {`${student.firstName} ${student.lastName}`}
                          </Typography>
                        }
                        secondary={student.email}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 2 }}
                      >
                        Add
                      </Button>
                    </ListItem>
                  ))}
              </List>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );

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
            LingguaHey Learning Platform
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1600, mx: "auto", px: 3 }}>
        {/* Create Room Section */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          <TextField
            label="New Room Name"
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ 
              backgroundColor: "#fff",
              borderRadius: 1
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleCreateRoom}
            sx={{ 
              backgroundColor: "#3f51b5", 
              "&:hover": { backgroundColor: "#303f9f" } 
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
        <Grid container spacing={3}>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                    }
                  }}
                  onClick={() => handleRoomClick(room)}
                >
                  <CardContent sx={{ position: "relative", p: 3 }}>
                    <IconButton 
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8, 
                        color: "#f44336",
                        "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
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
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No rooms created yet. Create your first room to get started.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Room Details Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="room-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
        }}>
          {selectedRoom && (
            <>
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                bgcolor: '#3f51b5',
                color: 'white',
                borderRadius: '8px 8px 0 0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={handleCloseModal}
                    sx={{ color: 'white', mr: 1 }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography id="room-modal-title" variant="h5" component="h2">
                    {selectedRoom.name}
                  </Typography>
                  <Chip 
                    label="Edit Class Details" 
                    size="small" 
                    sx={{ 
                      ml: 2, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                    }}
                  />
                </Box>
                <IconButton
                  onClick={handleCloseModal}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Grid container>
                {/* Left Panel - Activity Data */}
                <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: '1px solid #e0e0e0' } }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
                    Activity Data
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Select Activity
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Select
                        value={selectedWeek}
                        onChange={handleWeekChange}
                        displayEmpty
                        sx={{ 
                          bgcolor: 'background.paper'
                        }}
                      >
                        <MenuItem value="Week 1">Week 1</MenuItem>
                        <MenuItem value="Week 2">Week 2</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#3f51b5', 
                    color: 'white',
                    borderRadius: 1,
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Status:
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {activityStatus}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        bgcolor: '#424242', 
                        p: 2, 
                        borderRadius: 1,
                        textAlign: 'center',
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Average Score
                        </Typography>
                        <Typography variant="h4" fontWeight={600}>
                          {activityStats.averageScore}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          over 25
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        bgcolor: '#f44336', 
                        p: 2, 
                        borderRadius: 1,
                        textAlign: 'center',
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Lowest Score
                        </Typography>
                        <Typography variant="h4" fontWeight={600}>
                          {activityStats.lowestScore}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          only 1 student got this score
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        bgcolor: '#4caf50', 
                        p: 2, 
                        borderRadius: 1,
                        textAlign: 'center',
                        color: 'white'
                      }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Highest Score
                        </Typography>
                        <Typography variant="h4" fontWeight={600}>
                          {activityStats.highestScore}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          2 students got this score
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Button variant="contained" sx={{ bgcolor: '#9e9e9e', flexGrow: 1 }}>
                      View Scores
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#9e9e9e', flexGrow: 1 }}>
                      Delete
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#ff9800', flexGrow: 1 }}>
                      Edit
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#f44336', flexGrow: 1 }}>
                      Undeploy
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#4caf50', flexGrow: 1 }}>
                      Deploy
                    </Button>
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        Enrolled Students
                      </Typography>
                      <Button 
                        startIcon={<EditIcon />}
                        size="small"
                        sx={{ color: '#3f51b5' }}
                        onClick={handleOpenStudentListModal}
                      >
                        Edit Student List
                      </Button>
                    </Box>
                    <Box sx={{ 
                      bgcolor: '#f5f5f5', 
                      p: 2, 
                      borderRadius: 1,
                      height: 200,
                      overflowY: 'auto'
                    }}>
                      {selectedRoomStudents.map((student) => (
                        <Typography key={student.userId} variant="body2" sx={{ mb: 1 }}>
                          {`${student.firstName} ${student.lastName}`}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Grid>
                
                {/* Right Panel - Activity Progress */}
                <Grid item xs={12} md={6} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: '#3f51b5', fontWeight: 500 }}>
                    Activity Progress
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        bgcolor: '#f44336', 
                        p: 2, 
                        borderRadius: 1,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Typography variant="body2">
                          Only
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {activityStats.studentsFailed}
                        </Typography>
                        <Typography variant="body2">
                          Student Failed to reach the goal
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        bgcolor: '#4caf50', 
                        p: 2, 
                        borderRadius: 1,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Typography variant="body2">
                          There are
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {activityStats.studentsReachedGoal}
                        </Typography>
                        <Typography variant="body2">
                          Students who reached the goal
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2, 
                      bgcolor: '#f5f5f5',
                      p: 2,
                      borderRadius: '4px 4px 0 0'
                    }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        Student Name
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={500}>
                        Progress Tracker
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: '0 0 4px 4px' }}>
                      {progressData.length > 0 ? (
                        progressData.map((student) => (
                          <Box 
                            key={student.userId}
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              p: 2,
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <Typography variant="body2">
                              {`${student.firstName} ${student.lastName}`}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: student.progress >= 70 ? '#4caf50' : '#f44336',
                                fontWeight: 500
                              }}
                            >
                              {`${student.completedActivities || 0} / ${student.totalActivities || 0} Activities`}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No progress data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Modal>

      {/* Student List Modal */}
      <StudentListModal />
    </Box>
  );
};

export default TeacherDashboard;