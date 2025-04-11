import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Activities = () => {
  const navigate = useNavigate();
  const [activityName, setActivityName] = useState("");

  // Placeholder for saving activity (replace with backend call)
  // const createActivity = async () => {
  //   try {
  //     const response = await axios.post('/api/activities', { name: activityName }); // Replace with actual endpoint
  //     navigate('/admin-dashboard');
  //   } catch (error) {
  //     console.error("Error creating activity:", error);
  //   }
  // };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#1E1E1E", p: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="white" mb={3}>
        Create New Activity
      </Typography>
      <TextField
        label="Activity Name"
        variant="filled"
        fullWidth
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
        sx={{ bgcolor: "#424242", mb: 3 }}
      />
      <Button
        variant="contained"
        sx={{ bgcolor: "#10B981", color: "white" }}
        onClick={() => createActivity()} // Trigger backend call to save activity
      >
        Create Activity
      </Button>
    </Box>
  );
};

export default Activities;
