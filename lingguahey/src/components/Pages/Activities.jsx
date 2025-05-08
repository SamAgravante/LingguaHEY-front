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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Activities = () => {
  const navigate = useNavigate();
  const { classroomId, activityId } = useParams();
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      const token = localStorage.getItem("token");
      try {
        // Use the correct API endpoint to get all games for an activity
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/games/activities/${activityId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGames(response.data);
      } catch (err) {
        console.error("Error fetching games:", err.response?.data || err.message);
        setError("Failed to fetch games. Please try again later.");
      }
    };

    fetchGames();
  }, [activityId]);

  const createGame = async (gameType, redirectPath) => {
    const token = localStorage.getItem("token");
    try {
      // Use the correct API endpoint to create a new game for an activity
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/games/activities/${activityId}`,
        {
          gameType: gameType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Game created:", response.data);
      navigate(`${redirectPath}/${response.data.gameId}`);
    } catch (err) {
      console.error("Error creating game:", err.response?.data || err.message);
      alert("Failed to create game. Please try again.");
    }
  };

  const handleEdit = (gameId, gameType) => {
    let path = "";

    switch (gameType) {
      case "GAME1":
        path = "/create-activity/OnePicFourWords";
        break;
      case "GAME2":
        path = "/create-activity/PhraseTranslation";
        break;
      case "GAME3":
        path = "/create-activity/WordTranslation";
        break;
      default:
        alert("Unknown game type");
        return;
    }

    navigate(`${path}/${gameId}`);
  };

  const handleDelete = async (gameId) => {
    const token = localStorage.getItem("token");
    try {
      // Use the correct API endpoint to delete a game
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGames((prev) => prev.filter((game) => game.gameId !== gameId));
      //alert("Game deleted successfully.");
    } catch (err) {
      console.error("Error deleting game:", err.response?.data || err.message);
      alert("Failed to delete game. Please try again.");
    }
  };

  return (
    <Box sx={{ maxHeight: "90vh", minHeight: "60vh", bgcolor: "#A6D6D6", p: 4 }}>
      <Typography
        onClick={() => navigate("/admin")}
        sx={{
          color: "black",
          cursor: "pointer",
          textDecoration: "underline",
          mb: 2,
        }}
      >
        Back
      </Typography>
      <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
        Games for Activity {activityId}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/*Game List*/}
      <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
        <Box
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <List>
            {games.map((game) => (
              <ListItem key={game.gameId} sx={{ borderBottom: "1px solid #444" }}>
                <ListItemText
                  primary={`${game.gameName} (ID: ${game.gameId})`}
                  secondary={`Game Type: ${game.gameType}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" color="primary" onClick={() => handleEdit(game.gameId, game.gameType)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(game.gameId)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      <Box mt={4}>
        <Typography variant="h6" color="black" mb={2}>
          Create a New Game
        </Typography>
        <Grid container spacing={3} sx={{ display: "flex" }}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "#10B981", ":hover": { bgcolor: "#059669" }, color: "black" }}
              onClick={() =>
                createGame(
                  "GAME1",
                  "/create-activity/OnePicFourWords"
                )
              }
            >
              One Pic Four Words
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "#3B82F6", ":hover": { bgcolor: "#2563EB" }, color: "black" }}
              onClick={() =>
                createGame(
                  "GAME2",
                  "/create-activity/PhraseTranslation"
                )
              }
            >
              Phrase Translation
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "#F59E0B", ":hover": { bgcolor: "#D97706" }, color: "black" }}
              onClick={() =>
                createGame("GAME3", "/create-activity/WordTranslation")
              }
            >
              Word Translation
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Activities;