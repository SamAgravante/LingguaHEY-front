import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddLevelForm = ({ open, onClose }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const API_LEVELS = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/levels`,
    timeout: 5000,
    headers: { Authorization: `Bearer ${token}` },
  });

  const API_MONSTERS = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/monsters`,
    timeout: 5000,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Level fields
  const [levelName, setLevelName] = useState("");
  const [coinsReward, setCoinsReward] = useState("");
  const [gemsReward, setGemsReward] = useState("");

  // Monster selection
  const [availableMonsters, setAvailableMonsters] = useState([]);
  const [monsterSelections, setMonsterSelections] = useState([
    { monsterId: "", monsterType: "MINION" },
  ]);

  // Fetch monsters
  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        const response = await API_MONSTERS.get("");
        setAvailableMonsters(response.data);
      } catch (error) {
        console.error("Error fetching monsters:", error);
      }
    };
    fetchMonsters();
  }, []);

  const handleAddMonsterRow = () => {
    setMonsterSelections([
      ...monsterSelections,
      { monsterId: "", monsterType: "MINION" },
    ]);
  };

  const handleMonsterChange = (index, field, value) => {
    const updated = [...monsterSelections];
    updated[index][field] = value;
    setMonsterSelections(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newLevel = {
      levelName,
      coinsReward: parseInt(coinsReward, 10),
      gemsReward: parseInt(gemsReward, 10),
      monsters: monsterSelections
        .filter((m) => m.monsterId) // only include valid picks
        .map((m) => ({
          monsterId: parseInt(m.monsterId, 10),
          monsterType: m.monsterType,
          bossFormsMinionIds: [], // kept as [] for safety
        })),
    };

    try {
      await API_LEVELS.post("", newLevel);
      onClose();
      navigate("/leveleditor");
    } catch (error) {
      console.error("Error creating level:", error.response?.data || error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Level</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Level Name"
            fullWidth
            margin="normal"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            required
          />
          <TextField
            label="Coins Reward"
            type="number"
            fullWidth
            margin="normal"
            value={coinsReward}
            onChange={(e) => setCoinsReward(e.target.value)}
            required
          />
          <TextField
            label="Gems Reward"
            type="number"
            fullWidth
            margin="normal"
            value={gemsReward}
            onChange={(e) => setGemsReward(e.target.value)}
            required
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Monsters
          </Typography>

          {monsterSelections.map((selection, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  select
                  label="Select Monster"
                  fullWidth
                  value={selection.monsterId}
                  onChange={(e) =>
                    handleMonsterChange(index, "monsterId", e.target.value)
                  }
                  required
                >
                  {availableMonsters.map((monster) => (
                    <MenuItem
                      key={monster.monsterId}
                      value={monster.monsterId}
                    >
                      {monster.tagalogName} ({monster.englishName})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Type"
                  fullWidth
                  value={selection.monsterType}
                  onChange={(e) =>
                    handleMonsterChange(index, "monsterType", e.target.value)
                  }
                >
                  <MenuItem value="MINION">Minion</MenuItem>
                  <MenuItem value="BOSS">Boss</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          ))}

          <Button
            onClick={handleAddMonsterRow}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            + Add Another Monster
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ backgroundColor: "#3f51b5", color: "#fff" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLevelForm;
