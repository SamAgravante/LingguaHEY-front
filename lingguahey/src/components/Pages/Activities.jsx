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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useAuth } from "../../contexts/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";

/*Game Creations*/
import OnePicFourWords from "./Games/GameCreation/OnePicFourWords";
import PhraseTranslation from "./Games/GameCreation/PhraseTranslation";
import WordTranslation from "./Games/GameCreation/WordTranslation";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend } from "recharts";

const Activities = () => {
  const navigate = useNavigate();
  const { classroomId, activityId } = useParams();
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    topicNumber: "",
    lessonNumber: "",
    lessonName: "",
    gameType: "",
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [gameUsageData, setGameUsageData] = useState([
    { name: "One Pic Four Words", value: 0 },
    { name: "Phrase Translation", value: 0 },
    { name: "Word Translation", value: 0 }
  ]);
  const GAME_COLORS = ["#42a5f5", "#66bb6a", "#ffa726"];

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };

  const handleAddActivity = async () => {
    const token = localStorage.getItem("token");
    try {
      // Use the correct API endpoint to create a new activity
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities`,
        {
          topicNumber: newActivity.topicNumber,
          lessonNumber: newActivity.lessonNumber,
          lessonName: newActivity.lessonName,
          gameType: newActivity.gameType,
          classroomId: classroomId, // Ensure classroomId is passed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Activity created:", response.data);
      handleCloseDialog();
      fetchActivities(); // Refresh the list of activities

      // Automatically open the edit dialog for the new activity
      setSelectedActivity(response.data);
      setOpenEditDialog(true);
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  const fetchActivities = async () => {
    const token = localStorage.getItem("token");
    try {
      // Use the correct API endpoint to get all activities for a classroom
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities`,
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

  useEffect(() => {
    fetchActivities();
  }, [classroomId]);

  const handleOpenEditDialog = (activity) => {
    setSelectedActivity(activity);
    setOpenEditDialog(true);
    console.log("Selected activity for editing:", activity.activityId);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedActivity(null);
  };

  const handleSaveActivity = async (updatedActivity) => {
    // Implement your save logic here, e.g., make an API call to update the activity
    console.log("Saving activity:", updatedActivity);
    handleCloseEditDialog();
    fetchActivities(); // Refresh the list of activities
  };

  const handleDelete = async (activityId) => {
    const token = localStorage.getItem("token");
    try {
      // Use the correct API endpoint to delete an activity
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivities((prev) => prev.filter((activity) => activity.activityId !== activityId));
      alert("Activity deleted successfully.");
    } catch (err) {
      console.error("Error deleting activity:", err.response?.data || err.message);
      alert("Failed to delete activity. Please try again.");
    }
  };

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
          alignItems: "center",
        }}
      >
        <DashboardIcon sx={{ mr: 2, color: "#3f51b5", fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#3f51b5" }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575" }}>
            LinguaHey Learning Platform Management
          </Typography>
        </Box>

        <Button
          sx={{ borderRadius: 6, ml: "auto", backgroundColor: "#3f51b5", color: "#fff" }}
          onClick={() => navigate(`/admindashboard`)}
        >
          <Typography variant="body1" sx={{ color: "white" }}>
            Back
          </Typography>
        </Button>
      </Box>

      
      <Grid container spacing={3} p={3} sx={{justifyContent: "center"}}>{/* Activities List 
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, p: 2, height: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#3f51b5", mb: 2 }}>
                Game Usage by Classroom
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={gameUsageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {gameUsageData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={GAME_COLORS[idx % GAME_COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip />
                  <PieLegend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>*/}

        <Grid item xs={12} width={550}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  Lesson Activities
                </Typography>
                <IconButton 
                  sx={{
                    borderRadius: 1,
                    padding: 1.5, 
                    paddingBottom: 1,
                    width: 120,   
                    height: 48,  
                  }}
                  onClick={handleOpenDialog}
                >
                  <Typography sx={{color: "#3f51b5", fontSize: 14, fontWeight: 600}}>
                   + Add Activity
                  </Typography>
                </IconButton>
              </Box>
              <Divider />
              <List>
                {activities.map((activity, index) => (
                  <ListItem
                    key={activity.activityId}
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenEditDialog(activity)}
                          
                        >
                          <EditIcon/>
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(activity.activityId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={activity.lessonName}
                      secondary={
                        `Topic: ${activity.topicNumber}, 
                        Lesson: ${activity.lessonNumber},  
                        Game Type: ${index + 1} - 
                        ${activity.gameType === "GAME1" ? "One Pic Four Words" 
                          : activity.gameType === "GAME2" ? "Phrase Translation"
                          : activity.gameType === "GAME3" ? "Word Translation"
                          : activity.lessonName
                    }`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Lesson Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Lesson</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="lessonName"
            label="Lesson Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="lessonNumber"
            label="Lesson Number"
            type="number"
            fullWidth
            variant="standard"
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="topicNumber"
            label="Topic Number"
            type="number"
            fullWidth
            variant="standard"
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="game-type-label">Game Type</InputLabel>
            <Select
              labelId="game-type-label"
              name="gameType"
              value={newActivity.gameType}
              label="Game Type"
              onChange={handleInputChange}
            >
              <MenuItem value="GAME1">One Pic Four Words</MenuItem>
              <MenuItem value="GAME2">Phrase Translation</MenuItem>
              <MenuItem value="GAME3">Word Translation</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddActivity}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>{selectedActivity?.lessonName}</DialogTitle>
        <DialogContent>
          {selectedActivity?.gameType === "GAME1" && (
            <OnePicFourWords
              activityId={selectedActivity.activityId}
              activity={selectedActivity}
              onSave={handleSaveActivity}
              onCancel={handleCloseEditDialog}
            />
          )}
          {selectedActivity?.gameType === "GAME2" && (
            <PhraseTranslation
              activityId={selectedActivity.activityId}
              activity={selectedActivity}
              onSave={handleSaveActivity}
              onCancel={handleCloseEditDialog}
            />
          )}
          {selectedActivity?.gameType === "GAME3" && (
            <WordTranslation
              activityId={selectedActivity.activityId}
              onSave={handleSaveActivity}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={() => handleSaveActivity(selectedActivity)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Activities;