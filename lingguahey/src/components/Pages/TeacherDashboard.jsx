import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
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
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import Classroom from "./Classroom";
import LiveActClassroom from "./Live-Activity-Classroom/LiveActClassroom";

const TeacherDashboard = () => {
  const [classroomName, setClassroomName] = useState(""); // State for new classroom name
  const [students, setStudents] = useState([]); // State for students
  const [classrooms, setClassrooms] = useState([]); // State for classrooms
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  // State for dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedClassroomId, setSelectedClassroomId] = useState(null);
  const [studentId, setStudentId] = useState(""); // State for student ID input

  // Function to open the dialog for adding a student
  const openAddStudentDialog = (classroomId) => {
    setSelectedClassroomId(classroomId);
    setDialogMessage("Enter the student's ID:");
    setOpenDialog(true);
  };

  // Function to close the dialog
  const closeDialog = () => {
    setOpenDialog(false);
    setDialogMessage("");
    setStudentId(""); // Clear the student ID input
  };

  // Function to handle the confirmation of adding a student
  const handleConfirmAddStudent = async () => {
    if (!studentId) {
      setDialogMessage("Student ID is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${selectedClassroomId}/students/${studentId}`,
        {}, // Empty body for POST request
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Student added to classroom:", response.data);
      setDialogMessage("Student added to classroom successfully!");
    } catch (error) {
      console.error("Failed to add student to classroom:", error);
      setDialogMessage("Failed to add student to classroom. Please try again.");
    } finally {
      closeDialog();
    }
  };

  // Function to open the dialog for deleting a classroom
  const openConfirmationDialog = (classroomId) => {
    setSelectedClassroomId(classroomId);
    setDialogMessage("Are you sure you want to delete this classroom?");
    setOpenDialog(true);
  };

  // Function to handle the confirmation of classroom deletion
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${selectedClassroomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassrooms((prev) => prev.filter((classroom) => classroom.id !== selectedClassroomId)); // Remove the classroom from the state
      setDialogMessage("Classroom deleted successfully.");
    } catch (error) {
      console.error("Failed to delete classroom:", error);
      setDialogMessage("Failed to delete classroom. Please try again.");
    } finally {
      closeDialog();
    }
  };

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

        const fetchUser = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${decoded.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const user = response.data;

            setUsername(user.firstName);
            setUserData({
              userId: user.userId,
              firstName: user.firstName,
              middleName: user.middleName || "",
              lastName: user.lastName || "",
              role: user.role,
            });
            setUserRole(user.role);
            setIsAdmin(user.role === "ADMIN");
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

  // Fetch classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve the token from local storage
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
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
        setClassrooms(
          response.data.map((classroom) => {
            const id = classroom.classroomID;
            const name = classroom.name || classroom.classroomName || "Unnamed Classroom";
            if (!id) {
              console.warn("Invalid classroom object:", classroom);
            }
            return { name, id };
          })
        ); // Fallback to an empty array in case of an error
      }
    };

    fetchClassrooms();
  }, []);

  // Fetch students based on user role
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`;

        // If the user is a teacher, fetch only users with the role "USER"
        if (!isAdmin) {
          url = `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users?role=USER`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the response is an array before setting the state
        if (Array.isArray(response.data)) {
          // Filter the students array to only include users with the "USER" role
          const userStudents = response.data.filter((student) => student.role === "USER");
          setStudents(userStudents);
        } else {
          console.warn("Unexpected response format for students:", response.data);
          // Handle the unexpected response format appropriately
          // For example, you could set an empty array or display an error message
          setStudents([]);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
        setError("Failed to fetch students. Please try again later.");
      }
    };

    fetchStudents();
  }, [isAdmin]); // Fetch students whenever the userRole changes

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents((prev) => prev.filter((user) => user.userId !== userId)); // Remove the classroom from the state
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Handle classroom creation
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
      setClassroomName("");
      navigate(`/classroom/${response.data.classroomID}/live-activities`); // Redirect to the classroom page
    } catch (error) {
      console.error("Failed to create classroom:", error);
    }
  };

  // Navigate to Classroom Component
  const handleViewClassroom = (classroomId) => {
    console.log("Navigating to classroom with ID:", classroomId);
    if (!classroomId) {
      alert("Classroom ID is invalid.");
      return;
    }
    navigate(`/classroom/${classroomId}/live-activities`);
  };

  const handleAddStudent = (classroomId) => {
    openAddStudentDialog(classroomId);
  };

  const handleDeleteClassroom = (classroomId) => {
    openConfirmationDialog(classroomId);
  };

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, color: "#4E342E" }}>
        Teacher Dashboard
      </Typography>

      {/* Create Classroom Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#6D4C41" }}>
          Create a Classroom
        </Typography>
        <TextField
          label="Classroom Name"
          value={classroomName}
          onChange={(e) => setClassroomName(e.target.value)}
          variant="outlined"
          sx={{ mr: 2, width: "300px" }}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FFCCBC", "&:hover": { backgroundColor: "#FFAB91" } }}
          onClick={handleCreateClassroom}
        >
          Create
        </Button>
      </Box>

      {/* View Classrooms Section */}
      <Box mt={4} sx={{ maxHeight: "340px", width: "100%", overflowY: "auto" }}>
        <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#6D4C41" }}>
              Your Classrooms
            </Typography>
            <Grid container spacing={2}>
              {classrooms.length > 0 ? (
                classrooms.map((classroom, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        position: "relative",
                      }}
                    >
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteClassroom(classroom.id)}
                        sx={{ position: "absolute", top: 5, right: 5, color: `grey[500]` }}
                      >
                        <CloseIcon />
                      </IconButton>
                      <Typography variant="h6" color="#4E342E">
                        {classroom.name || "Unnamed Classroom"}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, color: "black", marginRight: 1, backgroundColor: "#E3F2FD", "&:hover": { backgroundColor: "#BBDEFB" } }}
                        onClick={() => handleViewClassroom(classroom.id)} // Pass the classroom ID
                      >
                        View Classroom
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, color: "black", backgroundColor: "#E3F2FD", "&:hover": { backgroundColor: "#BBDEFB" } }}
                        onClick={() => handleAddStudent(classroom.id)} // Pass the classroom ID
                      >
                        Add Student
                      </Button>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography color="#4E342E" sx={{ mt: 2, textAlign: "center" }}>
                  No classrooms found.
                </Typography>
              )}
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* View Students Section */}
      <Box mt={4} sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h6" color="black" mb={2}>
          List of Students
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <List>
              {students.map((student, index) => (
                <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText
                    primary={`${index + 1}. ${student.firstName} ${student.lastName} - ID: ${student.userId}`}
                    secondary={`Email: ${student.email}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Add Student"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="studentId"
            label="Student ID"
            type="text"
            fullWidth
            variant="outlined"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAddStudent} color="primary" autoFocus>
            Add Student
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default TeacherDashboard;