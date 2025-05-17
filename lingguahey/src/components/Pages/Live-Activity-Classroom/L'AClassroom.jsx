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
//import API from "../../api";

const LiveActClassroom = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams(); 
  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState(""); 
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [classroom, setClassroom] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [userRole, setUserRole] = useState(null);
  const [students, setStudents] = useState([]);

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
  }, [classroomId,API]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await API.get(`/api/lingguahey/live-activities/${classroomId}/live-activities`);
        const activitiesWithGameType = response.data.map((activity) => {
        let mappedGameType = null;
        switch (activity.activity_ActivityName) {
          case "One Pic Four Words":
            mappedGameType = "GAME1";
            break;
          case "Phrase Translation":
            mappedGameType = "GAME2";
            break;
          case "Word Translation":
            mappedGameType = "GAME3";
            break;
          default:
            mappedGameType = activity.gameType || null;
        }
        return {
          ...activity,
          gameType: activity.gameType || mappedGameType,
        };
      });
        setActivities(activitiesWithGameType);
      } catch (err) {
        console.error("Error fetching activities:", err.response?.data || err.message);
        setError("Failed to fetch activities. Please try again later.");
      }
    };

    fetchActivities();
  }, [classroomId, API]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await API.get(`/api/lingguahey/classrooms/${classroomId}/students`);
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err.response?.data || err.message);
        setError("Failed to fetch students. Please try again later.");
      }
    };

    fetchStudents();
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
        case "Word Translation":
          gameType = "GAME3";
          break;
        default:
          gameType = null;
      }
      const response = await API.post(`/api/lingguahey/live-activities/classrooms/${classroomId}`, {
        activityName: selectedActivityType,
        gameType: gameType,
        completed: false,
        questions: [],
      });
      console.log("Activity created:", response.data);
        const newActivity = {
        ...response.data,
        gameType: gameType,
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
      setSelectedActivityType("");
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleDelete = async (activityId) => {
    try {
      // Use the correct API endpoint to delete an activity
      await API.delete(`/api/lingguahey/live-activities/${activityId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivities(activities.filter((activity) => activity.activity_ActivityId !== activityId));
      //alert("Activity deleted successfully.");
    } catch (err) {
      console.error("Error deleting activity:", err.response?.data || err.message);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const handleGoToActivity = (activity) => {
    console.log("activity:", activity); // ADDED
    let gameRoute = "";

    console.log("activity.gameType:", activity.gameType); // ADDED

    if (!activity.gameType) {
      console.warn("Game type is undefined for activity:", activity);
      return;
    }

    switch (activity.gameType) {
      case "GAME1":
        gameRoute = `/classroom/${classroomId}/live-activities/${activity.activity_ActivityId}/live-act-one-pic-four-words`;
        break;
      case "GAME2":
        gameRoute = `/classroom/${classroomId}/live-activities/${activity.activity_ActivityId}/live-act-phrase-translation`;
        break;
      case "GAME3":
        gameRoute = `/classroom/${classroomId}/live-activities/${activity.activity_ActivityId}/live-act-word-translation`;
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
        Live Activities for Classroom {classroomId}
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
                        : activity.activity_ActivityName 
                    }`}
                    secondary={`Activity ID: ${activity.activity_ActivityId}`}
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
                    <IconButton edge="end" color="error" onClick={() => handleDelete(activity.activity_ActivityId)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>

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

export default LiveActClassroom;