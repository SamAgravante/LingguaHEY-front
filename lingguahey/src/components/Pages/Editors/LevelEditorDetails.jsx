import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const LevelEditorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { level } = location.state || {}; // level passed from LevelEditor.jsx

  const [levelDetails, setLevelDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Axios instance
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/levels`,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchLevelDetails = async () => {
      try {
        const response = await API.get(`/${level.id}`);
        const fetchedLevel = response.data;

        const mapped = {
          id: fetchedLevel.levelId,
          name: fetchedLevel.levelName,
          coins: fetchedLevel.coinsReward,
          gems: fetchedLevel.gemsReward,
          monsters: fetchedLevel.levelMonsters.map((m) => ({
            id: m.id,
            type: m.monsterType,
            name: m.monster?.tagalogName || "Unknown Monster",
            image: m.monster?.imageData
              ? `data:image/png;base64,${m.monster.imageData}`
              : "👾",
            bossForms: m.bossForms || [],
          })),
        };

        setLevelDetails(mapped);
      } catch (error) {
        console.error("Error fetching level details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (level?.id) {
      fetchLevelDetails();
    }
  }, [level]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!levelDetails) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load level details.
        </Typography>
        <Button onClick={handleBack}>Back</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
      }}
    >
      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          marginBottom: 4,
          textAlign: "center",
          color: "#3f51b5",
        }}
      >
        {levelDetails.name} - Monsters
      </Typography>

      {/* Monsters List */}
      <Grid container spacing={3} justifyContent="center" maxWidth="600px">
        {levelDetails.monsters.map((monster) => (
          <Grid item xs={12} key={monster.id}>
            <Card
              sx={{
                backgroundColor: "#fff",
                border: "2px solid #ddd",
                borderRadius: 2,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#3f51b5" }}
                  >
                    {monster.type} - {monster.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Back Button */}
      <Button
        onClick={handleBack}
        sx={{
          marginTop: 4,
          backgroundColor: "#3f51b5",
          color: "#fff",
          fontWeight: "bold",
          padding: "8px 16px",
          borderRadius: 2,
          "&:hover": {
            backgroundColor: "#5c6bc0",
          },
        }}
      >
        Back
      </Button>
    </Box>
  );
};

export default LevelEditorDetails;
