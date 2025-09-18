import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LevelEditor = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Form state
  const [levelForm, setLevelForm] = useState({
    id: null,
    name: "",
    coins: "",
    gems: "",
    monsters: [],
  });

  const token = localStorage.getItem("token");

  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/levels`,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const MonsterAPI = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/monsters`,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Available monsters to pick from
  const [monsterPool, setMonsterPool] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch levels
        const response = await API.get("");
        const fetchedLevels = response.data.map((level) => ({
          id: level.levelId,
          name: level.levelName,
          coins: level.coinsReward,
          gems: level.gemsReward,
          monsters: level.levelMonsters || [],
        }));
        setLevels(fetchedLevels);

        // Fetch monster pool
        const monsterRes = await MonsterAPI.get("");
        const fetchedMonsters = monsterRes.data.map((m) => ({
          id: m.monsterId,
          name: m.tagalogName,
        }));
        setMonsterPool(fetchedMonsters);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReturn = () => {
    navigate(-1);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/${id}`);
      setLevels(levels.filter((level) => level.id !== id));
    } catch (error) {
      console.error("Error deleting level:", error);
    }
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setLevelForm({ id: null, name: "", coins: "", gems: "", monsters: [] });
    setOpenAddDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (level) => {
    setLevelForm({
      id: level.id,
      name: level.name,
      coins: level.coins,
      gems: level.gems,
      monsters: level.monsters.map((m) => ({
        monsterId: m.monster?.monsterId,
        monsterType: m.monsterType,
      })),
    });
    setOpenEditDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
  };

  const handleFormChange = (field, value) => {
    setLevelForm({ ...levelForm, [field]: value });
  };

  const handleAddMonsterField = () => {
    setLevelForm({
      ...levelForm,
      monsters: [...levelForm.monsters, { monsterId: "", monsterType: "MINION" }],
    });
  };

  const handleRemoveMonsterField = (index) => {
    const updated = [...levelForm.monsters];
    updated.splice(index, 1);
    setLevelForm({ ...levelForm, monsters: updated });
  };

  const handleMonsterFieldChange = (index, field, value) => {
    const updated = [...levelForm.monsters];
    updated[index][field] = value;
    setLevelForm({ ...levelForm, monsters: updated });
  };

  const handleSave = async () => {
    const payload = {
      levelName: levelForm.name,
      coinsReward: Number(levelForm.coins),
      gemsReward: Number(levelForm.gems),
      monsters: levelForm.monsters.map((m) => ({
        monsterId: Number(m.monsterId),
        monsterType: m.monsterType,
      })),
    };

    try {
      if (levelForm.id) {
        // Edit existing level
        const response = await API.put(`/${levelForm.id}`, payload);
        setLevels(
          levels.map((lvl) =>
            lvl.id === levelForm.id
              ? {
                  ...lvl,
                  name: response.data.levelName,
                  coins: response.data.coinsReward,
                  gems: response.data.gemsReward,
                  monsters: response.data.levelMonsters,
                }
              : lvl
          )
        );
      } else {
        // Add new level
        const response = await API.post("", payload);
        setLevels([
          ...levels,
          {
            id: response.data.levelId,
            name: response.data.levelName,
            coins: response.data.coinsReward,
            gems: response.data.gemsReward,
            monsters: response.data.levelMonsters,
          },
        ]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving level:", error);
    }
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
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#3f51b5" }}>
                    {level.name}
                  </Typography>
                  <Typography variant="body2">
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
                    onClick={() => handleOpenEdit(level)}
                  >
                    Edit
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

        {/* Add Level Box */}
        <Grid item sx={{ width: "100%", maxWidth: 700 }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              padding: 2,
              fontWeight: "bold",
              border: "2px dashed #aaa",
              color: "#3f51b5",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
            onClick={handleOpenAdd}
          >
            Add New Level +
          </Button>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openAddDialog || openEditDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{levelForm.id ? "Edit Level" : "Add New Level"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Level Name"
            value={levelForm.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Coins Reward"
            type="number"
            value={levelForm.coins}
            onChange={(e) => handleFormChange("coins", e.target.value)}
            fullWidth
          />
          <TextField
            label="Gems Reward"
            type="number"
            value={levelForm.gems}
            onChange={(e) => handleFormChange("gems", e.target.value)}
            fullWidth
          />

          <Typography variant="h6">Monsters</Typography>
          {levelForm.monsters.map((monster, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <TextField
                select
                label="Monster"
                value={monster.monsterId}
                onChange={(e) =>
                  handleMonsterFieldChange(index, "monsterId", e.target.value)
                }
                sx={{ flex: 2 }}
              >
                {monsterPool.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Type"
                value={monster.monsterType}
                onChange={(e) =>
                  handleMonsterFieldChange(index, "monsterType", e.target.value)
                }
                sx={{ flex: 1 }}
              >
                <MenuItem value="MINION">Minion</MenuItem>
                <MenuItem value="BOSS">Boss</MenuItem>
              </TextField>
              <IconButton color="error" onClick={() => handleRemoveMonsterField(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddCircle />}
            onClick={handleAddMonsterField}
            sx={{ alignSelf: "flex-start" }}
          >
            Add Monster
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#3f51b5", color: "#fff" }}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LevelEditor;
