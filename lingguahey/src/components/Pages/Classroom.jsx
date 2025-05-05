import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { jwtDecode } from "jwt-decode";

const Classroom = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams(); // Get classroomId from URL
  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState(""); // State for selected activity type
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [classroom, setClassroom] = useState(null); // State to store classroom data
  const [loading, setLoading] = useState(true); // State to track loading
  const [userRole, setUserRole] = useState(null); // State to store user role

  // Fetch user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // Assuming the token contains the user's role
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Failed to decode token. Please try again later.");
      }
    }
  }, []);

  useEffect(() => {
    if (classroomId) { // Check if classroomId is defined
      const fetchClassroom = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login.");
          setLoading(false);
          return;
        }
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${classroomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setClassroom(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching classroom:", err.response?.data || err.message);
          setError("Failed to fetch classroom. Please try again later.");
          setLoading(false);
        }
      };

      fetchClassroom();
    }
  }, [classroomId]);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms/${classroomId}/live-activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setActivities(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err.response?.data || err.message);
        //setError("Failed to fetch activities. Please try again later.");
      }
    };

    fetchActivities();
  }, [classroomId]);

  const createActivity = async () => {
    const token = localStorage.getItem("token");
     if (!token) {
        setError("No token found. Please login.");
        return;
      }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/live-activities`,
        {
          activityName: selectedActivityType, // Use the selected activity type
          isDeployed: false, // Set a default isDeployed
          classroomId: classroomId, // Include the classroomId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Activity created:", response.data);
      setActivities((prevActivities) => [...prevActivities, response.data]); // Update activities list
      setSelectedActivityType(""); // Clear the selected activity type
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleDelete = async (activityId) => {
    const token = localStorage.getItem("token");
     if (!token) {
        setError("No token found. Please login.");
        return;
      }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/live-activities/${activityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActivities((prev) => prev.filter((activity) => activity.activityID !== activityId));
      alert("Activity deleted successfully.");
    } catch (err) {
      console.error("Error deleting activity:", err.response?.data || err.message);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const handleGoToActivity = (activityId) => {
    navigate(`/classroom/${classroomId}/activities/${activityId}`); // Updated route
  };

  if (loading) {
    return (
      <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
          Loading Classroom Data...
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
        Activities for Classroom {classroomId}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Create New Activity Section */}
      <Box mt={4}>
        <Typography variant="h6" color="black" mb={2}>
          Create a New Activity
        </Typography>
        <FormControl variant="outlined" sx={{ mr: 2, width: "300px" }}>
          <InputLabel id="activity-type-label">Activity Type</InputLabel>
          <Select
            labelId="activity-type-label"
            id="activity-type"
            value={selectedActivityType}
            onChange={(e) => setSelectedActivityType(e.target.value)}
            label="Activity Type"
          >
            <MenuItem value="Word Translation">Word Translation</MenuItem>
            <MenuItem value="Phrase Translation">Phrase Translation</MenuItem>
            <MenuItem value="One Pic Four Words">One Pic Four Words</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FFCCBC", "&:hover": { backgroundColor: "#FFAB91" } }}
          onClick={createActivity}
          disabled={!selectedActivityType}
        >
          Create Activity
        </Button>
      </Box>

      {/* Activity List */}
      <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
        <Box
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <List>
            {activities.map((activity) => (
              <ListItem key={activity.activityID} sx={{ borderBottom: "1px solid #444" }}>
                <ListItemText
                  primary={`${activity.activityName} (ID: ${activity.activityID})`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleGoToActivity(activity.activityID)}
                    sx={{ mr: 1 }}
                  >
                    Go To Activity
                  </Button>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(activity.activityID)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Classroom;