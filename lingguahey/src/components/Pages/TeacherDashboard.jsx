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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";

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
      setClassroomName(""); // Clear the input field

      // Navigate to the classroom page after creating the classroom
      navigate(`/classroom/${response.data.classroomID}`);
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
    navigate(`/classroom/${classroomId}`);
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
                  }}
                >
                  <Typography variant="h6" color="#4E342E">
                    {classroom.name || "Unnamed Classroom"}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: "#E3F2FD", "&:hover": { backgroundColor: "#BBDEFB" } }}
                    onClick={() => handleViewClassroom(classroom.id)} // Pass the classroom ID
                  >
                    View Classroom
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
                    primary={`${index + 1}. ${student.firstName} ${student.lastName}`}
                    secondary={`Email: ${student.email}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};

export default TeacherDashboard;