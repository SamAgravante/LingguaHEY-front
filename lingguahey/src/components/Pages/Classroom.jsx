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

  useEffect(() => {
    if (classroomId) {
      const fetchClassroom = async () => {
        try {
          const response = await API.get(`/api/lingguahey/classrooms/${classroomId}`);
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
      try {
        // Use the correct API endpoint to get all activities for a classroom
        const response = await API.get(`/api/lingguahey/activities/${classroomId}/activities`);
        setActivities(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err.response?.data || err.message);
        setError("Failed to fetch activities. Please try again later.");
      }
    };

    fetchActivities();
  }, [classroomId]);

  const createActivity = async () => {
    try {
      let gameType;
      switch (selectedActivityType) {
        case "One Pic Four Words":
          gameType = "GAME1";
          break;
        case "Phrase Translation":
          gameType = "GAME2";
          break;
        case "Words Translation":
          gameType = "GAME3";
          break;
        default:
          gameType = null; // Or handle the default case as needed
      }

      // Use the correct API endpoint to create a new activity
      const response = await API.post(`/api/lingguahey/activities/classrooms/${classroomId}`, {
        activityName: selectedActivityType,
        gameType: gameType,
        completed: false,
      });
      console.log("Activity created:", response.data);
      setActivities((prevActivities) => [...prevActivities, response.data]);
      setSelectedActivityType("");

      // Redirect to the newly created activity
      navigate(`/classroom/${classroomId}/activities/${response.data.id}`);
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleDelete = async (activityId) => {
    try {
      // Use the correct API endpoint to delete an activity
      await API.delete(`/api/lingguahey/activities/${activityId}`);
      alert("Activity deleted successfully.");
    } catch (err) {
      console.error("Error deleting activity:", err.response?.data || err.message);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const handleGoToActivity = (activity) => {
    console.log("activity:", activity); // ADDED
    let gameRoute = "";
  
    switch (activity.gameType) {
      case "GAME1":
        gameRoute = `/classroom/${classroomId}/activities/${activity.activityId}/one-pic-four-words`;
        break;
      case "GAME2":
        gameRoute = `/classroom/${classroomId}/activities/${activity.activityId}/phrase-translation`;
        break;
      case "GAME3":
        gameRoute = `/classroom/${classroomId}/activities/${activity.activityId}/word-translation`;
        break;
      default:
        console.warn("Unknown game type:", activity.gameType);
        return;
    }
  
    navigate(gameRoute);
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
      <Box mt={4} p={4}>
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
            <MenuItem value="One Pic Four Words">One Pic Four Words</MenuItem>
            <MenuItem value="Phrase Translation">Phrase Translation</MenuItem>
            <MenuItem value="Word Translation">Word Translation</MenuItem>
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
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <List>
            {activities.map((activity, index) => {
              return (
                <ListItem key={activity.id} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText
                    primary={`${index + 1}: ${
                      activity.gameType === "GAME1"
                        ? "One Pic Four Words"
                        : activity.gameType === "GAME2"
                        ? "Phrase Translation"
                        : activity.gameType === "GAME3"
                        ? "Word Translation"
                        : activity.activityName // Default to activityName if gameType doesn't match
                    }`}
                    secondary={`Activity ID: ${activity.activityId}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleGoToActivity(activity)}
                      sx={{ mr: 1 }}
                    >
                      Go To Activity
                    </Button>
                    <IconButton edge="end" color="error" onClick={() => handleDelete(activity.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Classroom;