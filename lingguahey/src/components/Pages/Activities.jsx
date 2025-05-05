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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

const Activities = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams(); // Get classroomId and activityId from URL
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/live-activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setActivities(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err.response?.data || err.message);
        setError("Failed to fetch activities. Please try again later.");
      }
    };

    fetchActivities();
  }, [classroomId]);

  const handleGoToActivity = (activityId, activityName) => {
    switch (activityName) {
      case "One Pic Four Words":
        navigate(`/classroom/${classroomId}/activities/${activityId}/one-pic-four-words`);
        break;
      case "Phrase Translation":
        navigate(`/classroom/${classroomId}/activities/${activityId}/phrase-translation`);
        break;
      case "Word Translation":
        navigate(`/classroom/${classroomId}/activities/${activityId}/word-translation`);
        break;
      default:
        console.warn("Unknown game type:", activityName);
        break;
    }
  };

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
      <Link to={`/classroom/${classroomId}`} style={{ textDecoration: 'none', color: 'black' }}>
        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ArrowBackIcon />
          Back to Classroom
        </Typography>
      </Link>
      <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
        Activities for Classroom {classroomId}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Activity Buttons */}
      <Box mt={4}>
        <Typography variant="h6" color="black" mb={2}>
          Select Activity Type:
        </Typography>
        <Grid container spacing={2}>
          {activities.map((activity) => (
            <Grid item key={activity.activityID}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleGoToActivity(activity.activityID, activity.activityName)}
              >
                {activity.activityName}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Activity List */}
      <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black", mt: 4 }}>
        <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
          <List>
            {activities.map((activity) => (
              <ListItem key={activity.activityID} sx={{ borderBottom: "1px solid #444" }}>
                <ListItemText primary={`${activity.activityName} (ID: ${activity.activityID})`} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Activities;