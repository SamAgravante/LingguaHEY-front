import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Classroom = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  // Placeholder for fetching lessons (replace with backend call)
  // const fetchLessons = async (classroomId) => {
  //   try {
  //     const response = await axios.get(`/api/classrooms/${classroomId}/lesson`); // Replace with actual endpoint
  //     setLessons(response.data);
  //   } catch (error) {
  //     console.error("Error fetching Lessons:", error);
  //   }
  // };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#1E1E1E", p: 4 }}>
      <Typography variant="h5" fontWeight="bold" color="white" mb={3}>
        Select a Lesson
      </Typography>
      <Box>
        {lessons.map((lesson, index) => (
          <Button
            key={index}
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#10B981", mb: 2 }}
            onClick={() => navigate(`/activities/${lesson.id}`)} // Navigate to activities page
          >
            {lesson.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default Classroom;
