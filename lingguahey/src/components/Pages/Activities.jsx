import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Activities = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //PlaceHolder pani || static
  useEffect(() => {
    const token = localStorage.getItem("token");

    const API = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const fetchActivityTypes = async () => {
      try {
        // const response = await API.get("");
        // setActivityTypes(response.data);

        //PlaceHolder pa
        setActivityTypes([
          { id: 1, name: "1 Pic 4 Words", code: "1pic4words" },
          { id: 2, name: "Word Translation", code: "wordtranslation" },
          { id: 3, name: "Phrase Translation", code: "phrasetranslation" },
        ]);
      } catch (err) {
        console.error("Failed to fetch activity types", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityTypes();
  }, []);

  const handleActivitySelect = (code) => {
    //PlaceHolder Pani
    console.log("Selected activity type:", code);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Select Activity Type
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : (
        <Grid container spacing={3} mt={2}>
          {activityTypes.map((activity) => (
            <Grid key={activity.id} item xs={12} sm={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>{activity.name}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleActivitySelect(activity.code)}
                >
                  Create
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Activities;
