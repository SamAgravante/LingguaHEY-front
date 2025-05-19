import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import API from "../../api";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [classroomData, setClassroomData] = useState([]); // State for classroom data
  const [newClassroomName, setNewClassroomName] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [error, setError] = useState(""); // Define the error state variable
  const [users, setUsers] = useState([]);
  const [concurrentUsers, setConcurrentUsers] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const [teachersRegistered, setTeachersRegistered] = useState(0);
  const [classroomName, setClassroomName] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Fetch user data and role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const fetchUser = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`, {
              // Fetch all users
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setUsers(response.data); // Set all users to recentUsers
            const user = response.data; // Get the user data from the response
            setUserData({
              userId: user.userId,
              firstName: user.firstName,
              middleName: user.middleName || "",
              lastName: user.lastName || "",
              role: user.role,
            });

            // Count concurrent users (assuming token presence means active)
            setConcurrentUsers(1); // Increment for the current user

            // Count registered users
            setRegisteredUsers(response.data.length);

            // Count students and teachers
            let studentCount = 0;
            let teacherCount = 0;
            response.data.forEach((user) => {
              if (user.role === "USER") {
                studentCount++;
              } else if (user.role === "TEACHER") {
                teacherCount++;
              }
            });
            setStudentsRegistered(studentCount);
            setTeachersRegistered(teacherCount);
          } catch (err) {
            console.error("Failed to fetch user:", err);
            setError("Failed to fetch users. Please try again later.");
          }
        };

        fetchUser();
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Failed to decode token. Please try again later.");
      }
    }
  }, []);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve the token from local storage
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Classroom API response:", response.data);

        // Map the response to ensure the name field is populated
        setClassrooms(
          response.data.map((classroom) => ({
            ...classroom,
            name: classroom.name || classroom.classroomName || "Unnamed Classroom", // Adjust field names as needed
            id: classroom.classroomID,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
        setClassrooms([]); // Fallback to an empty array in case of an error
      }
    };

    fetchClassrooms();
  }, []);

  const usersData = [
    { label: "Concurrent users", count: concurrentUsers, color: "#FFEBEE" },
    { label: "Registered users", count: registeredUsers, color: "#E3F2FD" },
    { label: "Students Registered", count: studentsRegistered, color: "#FFF9C4" },
    { label: "Teachers Registered", count: teachersRegistered, color: "#E8F5E9" },
  ];

  const handleClassroomClick = async (classroom) => {
    setSelectedClassroom(classroom);
    setOpen(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${classroom.id}/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedClassroom({ ...classroom, activities: response.data });
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setSelectedClassroom({ ...classroom, activities: [] });
    }
  };

  const handleCloseModal = () => setOpen(false);

  const handleSubjectSelect = (subject) => {
    navigate(`/activities/${selectedClassroom}/${subject}`);
    setOpen(false);
  };

  const handleDeleteClassroom = async (classroomId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassroomData((prev) => prev.filter((classroom) => classroom.classroomId !== classroomId));
      alert("Classroom deleted successfully.");
    } catch (error) {
      console.error("Failed to delete classroom:", error);
      alert("Failed to delete classroom. Please try again.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `application/json`
        },
      });
      setUsers((prev) => prev.filter((user) => user.userId !== userId)); // Remove the classroom from the state
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedClassroom((prev) => ({
        ...prev,
        activities: prev.activities.filter((activity) => activity.activityId !== activityId),
      })); // Remove the activity from the selected classroom
      alert("Activity deleted successfully.");
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  // Handle Edit Classroom
  const handleEditClassroom = async (classroomId, newName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${classroomId}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClassroomData((prev) =>
        prev.map((classroom) => (classroom.id === classroomId ? { ...classroom, label: newName } : classroom))
      ); // Update the classroom name in the state
      alert("Classroom name updated successfully.");
    } catch (error) {
      console.error("Failed to update classroom name:", error);
      alert("Failed to update classroom name. Please try again.");
    }
  };

  const handleCreateClassroom = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token from local storage
      // Ensure classroomName is not empty before making the API call
      if (!classroomName.trim()) {
        console.warn("Classroom name cannot be empty.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms`,
        { classroomName: classroomName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Classroom created:", response.data);
      // Instead of adding the entire response, only add the classroomName and classroomID to the state
      setClassrooms((prev) => [
        ...prev,
        { name: response.data.classroomName, id: response.data.classroomID },
      ]);
      setClassroomName(""); // Clear the input field

      // Navigate to the classroom page after creating the classroom
      navigate(`/classroom/${response.data.classroomID}`);
    } catch (error) {
      console.error("Failed to create classroom:", error);
    }
  };

  const handleViewClassroom = (classroomId) => {
    console.log("Navigating to classroom with ID:", classroomId);
    if (!classroomId) {
      alert("Classroom ID is invalid.");
      return;
    }
    navigate(`/classroom/${classroomId}`);
  };

  const handleOpenDialog = () => setOpenCreateDialog(true);
  const handleCloseDialog = () => setOpenCreateDialog(false);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}
    >
      <Typography variant="h4" sx={{ mb: 2, color: "#4E342E" }}>
        Admin Dashboard
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: "#6D4C41" }}>
        Manage Classrooms and Users
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Classroom Data */}
        <Grid item xs={12} md={6}>
          <Typography color="#4E342E" mb={2} variant="h6">
            Classroom Data
          </Typography>
          <Box mt={4} sx={{ maxHeight: "340px", width: "100%", maxWidth: 670, overflowY: "auto" }}>
          <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
          <Grid container spacing={2}>
            {classrooms.length > 0 ? (
              classrooms.map((classroom, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Paper
                    sx={{
                      bgcolor: classroom.color,
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography variant="caption" color="#6D4C41">
                      There are
                    </Typography>
                    <Typography fontWeight="bold" variant="h5" color="#4E342E">
                      {classroom.activities ? classroom.activities.length : 0}
                    </Typography>
                    <Typography variant="body2" color="#6D4C41">
                      Activities in {classroom.name}
                    </Typography>
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: "#E3F2FD", "&:hover": { backgroundColor: "#BBDEFB" } }}
                        onClick={() => handleViewClassroom(classroom.id)}
                      >
                        View Classroom
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: "#E3F2FD", "&:hover": { backgroundColor: "#BBDEFB" } }}
                        onClick={() => handleClassroomClick(classroom)}
                      >
                        View Lessons
                      </Button>
                      {/*<Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteClassroom(classroom.classroomId)}
                      >
                        Delete
                      </Button>*/}
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Typography color="#4E342E" sx={{ mt: 2, textAlign: "center" }}>
                No classrooms found.
              </Typography>
            )}
          </Grid>
          </Paper>
          </Box>
        </Grid>

        {/* Users Data */}
        <Grid item xs={12} md={6}>
          <Typography color="#4E342E" mb={2} variant="h6">
            Users Data
          </Typography>
          <Grid container spacing={2}>
            {usersData.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Paper
                  sx={{
                    bgcolor: item.color,
                    p: 2,
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="caption" color="#6D4C41">
                    There are
                  </Typography>
                  <Typography fontWeight="bold" variant="h5" color="#4E342E">
                    {item.count}
                  </Typography>
                  <Typography variant="body2" color="#6D4C41">
                    {item.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Trigger Button */}
      <Box sx={{ mt: 6 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FFCCBC", "&:hover": { backgroundColor: "#FFAB91" } }}
          onClick={handleOpenDialog}
        >
          Create a Classroom
        </Button>
      </Box>

      {/* 🪟 Create Classroom Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create a New Classroom</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Classroom Name"
            type="text"
            fullWidth
            variant="outlined"
            value={classroomName}
            onChange={(e) => setClassroomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => {
              handleCreateClassroom();
              handleCloseDialog();
            }}
            sx={{ backgroundColor: "#FFCCBC", "&:hover": { backgroundColor: "#FFAB91" } }}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users List */}
      <Box mt={4} sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h6" color="black" mb={2}>
          List of Users
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
          <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
            <List>
              {users.map((user, index) => (
                <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText
                    primary={`${index + 1}. ${user.firstName}`}
                    secondary={`Role: ${user.role}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="error" onClick={() => handleDelete(user.userId)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>

      {/* Activities Modal */}
      <Modal open={open} onClose={handleCloseModal}>
        <Paper
          sx={{
            width: 400,
            margin: "auto",
            marginTop: "10vh",
            padding: 3,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#4E342E">
              Lessons for {selectedClassroom?.name}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {selectedClassroom?.activities?.map((activity) => (
              <ListItem key={activity.activityId}>
                <ListItemText
                  primary={activity.activityName}
                  secondary={`Game Type: ${
                      activity.gameType === "GAME1"
                        ? "One Pic Four Words"
                        : activity.gameType === "GAME2"
                        ? "Phrase Translation"
                        : activity.gameType === "GAME3"
                        ? "Word Translation"
                        : activity.activityName // Default to activityName if gameType doesn't match
                    }`}
                />
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteActivity(activity.activityId)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Modal>
    </Grid>
  );
};

export default Dashboard;