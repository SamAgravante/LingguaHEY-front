import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddLevelForm from "./AddLevelForm";

const LevelEditor = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);

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
    const fetchLevels = async () => {
      try {
        const response = await API.get("");
        const fetchedLevels = response.data.map((level) => ({
          id: level.levelId,
          name: level.levelName,
          coins: level.coinsReward,
          gems: level.gemsReward,
          monsters: level.levelMonsters || [],
        }));
        setLevels(fetchedLevels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleReturn = () => {
    navigate(-1);
  };

  const handleEdit = (level) => {
    navigate(`/edit-level/${level.id}`, { state: { level } });
  };

  const handleDelete = (id) => {
    setLevels(levels.filter((level) => level.id !== id));
  };

  const handleOpenAdd = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAdd = () => {
    setOpenAddDialog(false);
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

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: 4,
        position: "relative",
      }}
    >
      {/* Return Button */}
      <Button
        onClick={handleReturn}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "#3f51b5",
          color: "#fff",
          fontWeight: "bold",
          padding: "6px 16px",
          borderRadius: 2,
          "&:hover": { backgroundColor: "#5c6bc0" },
        }}
      >
        Return
      </Button>

      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          marginBottom: 6,
          color: "#3f51b5",
        }}
      >
        Level Editor
      </Typography>

      {/* Level List */}
      <Grid container direction="column" spacing={3} alignItems="center">
        {levels.map((level) => (
          <Grid item key={level.id} sx={{ width: "100%", maxWidth: 700 }}>
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
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "#3f51b5" }}
                  >
                    {level.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coins: {level.coins} | Gems: {level.gems}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#fbc02d",
                      color: "#000",
                      marginRight: 2,
                      fontWeight: "bold",
                      "&:hover": { backgroundColor: "#f9a825" },
                    }}
                    onClick={() => handleEdit(level)}
                  >
                    View Monsters
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#e53935",
                      fontWeight: "bold",
                      "&:hover": { backgroundColor: "#d32f2f" },
                    }}
                    onClick={() => handleDelete(level.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Add New Level Card */}
        <Grid item sx={{ width: "100%", maxWidth: 700 }}>
          <Card
            sx={{
              backgroundColor: "#f0f0f0",
              border: "2px dashed #aaa",
              borderRadius: 2,
              cursor: "pointer",
              textAlign: "center",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
            onClick={handleOpenAdd}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#3f51b5" }}
              >
                + Add New Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Level Dialog */}
      <AddLevelForm open={openAddDialog} onClose={handleCloseAdd} />
    </Box>
  );
};

export default LevelEditor;
