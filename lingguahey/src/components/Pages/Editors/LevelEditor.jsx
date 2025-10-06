import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
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

import bg from "../../../assets/images/backgrounds/Editor_BG.png";
import cardBG from "../../../assets/images/backgrounds/Card_Border.png";
import EditBG from "../../../assets/images/backgrounds/GameShopBoxSmall.png";
import ListContainerBG from "../../../assets/images/backgrounds/MonsterEditUIOuter.png";

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
    const formattedMonsters = level.monsters.map((m) => {
      // If it's a boss
      if (m.monsterType === "BOSS") {
        // Some APIs return a list of boss form monsters, adjust if needed
        const bossForms = m.bossFormsMinions || m.bossForms || [];

        return {
          monsterType: "BOSS",
          bossForms: bossForms.map((bf) => bf.monsterId || bf), // normalize IDs
        };
      }

      // Otherwise it's a regular minion
      return {
        monsterId: m.monster?.monsterId || m.monsterId,
        monsterType: "MINION",
      };
    });

    setLevelForm({
      id: level.id,
      name: level.name,
      coins: level.coins,
      gems: level.gems,
      monsters: formattedMonsters,
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



  // Fetch Levels
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
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        levelName: levelForm.name,
        coinsReward: levelForm.coins,
        gemsReward: levelForm.gems,
        monsters: levelForm.monsters.map(m => {
          if (m.monsterType === "BOSS") {
            return {
              monsterType: "BOSS",
              bossFormsMinionIds: (m.bossForms || []).filter(id => id)
            };
          }
          return {
            monsterId: m.monsterId,
            monsterType: "MINION"
          };
        })
      };

      if (levelForm.id) {
        await API.put(`/${levelForm.id}`, payload);
      } else {
        await API.post("", payload);
      }

      fetchLevels();
      handleCloseDialog();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
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
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          backgroundColor: "transparent",
          color: "#3f51b5",
          fontWeight: "bold",
          fontSize: "20px",
          "&:hover": { backgroundColor: "transparent" },
        }}
      >
        ← Return
      </Button>

      {/* Header */}
      <Typography
        sx={{
          fontWeight: 600,
          textAlign: "center",
          marginBottom: 6,
          color: "#6fa8dc",
          fontSize: "60px",
        }}
      >
        Level Editor
      </Typography>

      {/* Level List Container */}
      <Box
        sx={{
          maxHeight: "70vh",
          overflowY: "auto",
          px: 0,
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.8)",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
        }}
      >
        <Grid container direction="column" spacing={3} alignItems="center" >
          {levels.map((level) => (
            <Grid item key={level.id} sx={{ width: "100%", maxWidth: 1000 }}>
              <Box
                sx={{
                  backgroundImage: `url(${cardBG})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  padding: 4,
                  minHeight: 140,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 40px",
                    height: "100%",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#000", fontSize: "60px" }}>
                      {level.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      sx={{
                        backgroundImage: `url(${EditBG})`,
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        color: "#000",
                        fontWeight: "bold",
                        width: 100,
                        height: 40,
                        fontSize: "18px",
                        mr: 2,
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
                </Box>
              </Box>
            </Grid>
          ))}

          {/* Add Level Box */}
          <Grid item sx={{ width: "100%", maxWidth: 1000 }}>
            <Box
              onClick={handleOpenAdd}
              sx={{
                backgroundImage: `url(${cardBG})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                padding: 4,
                minHeight: 140,
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "50px", color: "#000" }}>
                Add New Level +
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>



      {/* Add/Edit Dialog */}
      <Dialog
        open={openAddDialog || openEditDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundImage: `url(${ListContainerBG})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: 3,
          },
        }}
      >
        <DialogTitle>{levelForm.id ? "Edit Level" : "Add New Level"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Level Name"
            value={levelForm.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "2px solid #5b3138",
                borderRadius: "8px",
                minHeight: 40,
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "#dba463",
                padding: "0 4px",
                transform: "translate(14px, -6px) scale(0.75)",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -6px) scale(0.75)",
              },
            }}
          />
          <TextField
            label="Coins Reward"
            type="number"
            value={levelForm.coins}
            onChange={(e) => handleFormChange("coins", e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "2px solid #5b3138",
                borderRadius: "8px",
                minHeight: 40,
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "#dba463",
                padding: "0 4px",
                transform: "translate(14px, -6px) scale(0.75)",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -6px) scale(0.75)",
              },
            }}
          />
          <TextField
            label="Gems Reward"
            type="number"
            value={levelForm.gems}
            onChange={(e) => handleFormChange("gems", e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "2px solid #5b3138",
                borderRadius: "8px",
                minHeight: 40,
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "#dba463",
                padding: "0 4px",
                transform: "translate(14px, -6px) scale(0.75)",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -6px) scale(0.75)",
              },
            }}
          />

          <Typography variant="h6" sx={{ mt: 2 }}>Monsters</Typography>
          {levelForm.monsters.map((monster, index) => (
            <Box
              key={index}
              sx={{
                display: "flex", flexDirection: "column", gap: 1, mb: 2, 
                "& .MuiOutlinedInput-root": {
                  border: "2px solid #5b3138",
                  borderRadius: "8px",
                  minHeight: 40,
                },
                "& .MuiInputLabel-root": {
                  backgroundColor: "#dba463",
                  padding: "0 4px",
                  transform: "translate(14px, -6px) scale(0.75)",
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(14px, -6px) scale(0.75)",
                }
              }}
            >
              {/* Identifier Row */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {monster.monsterType === "MINION" && (
                  <TextField
                    select
                    label="Monster"
                    value={monster.monsterId || ""}
                    onChange={(e) => handleMonsterFieldChange(index, "monsterId", e.target.value)}
                    sx={{ flex: 2 }}
                  >
                    {monsterPool.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <TextField
                  label="Type"
                  value={monster.monsterType}
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 1 }}
                />

                <IconButton color="error" onClick={() => handleRemoveMonsterField(index)}>
                  <Delete />
                </IconButton>
              </Box>

              {/* Boss-specific fields */}
              {monster.monsterType === "BOSS" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  <TextField
                    select
                    label="Boss Form 1"
                    value={monster.bossForms?.[0] || ""}
                    onChange={(e) => {
                      const updatedForms = [...(monster.bossForms || [])];
                      updatedForms[0] = e.target.value;
                      handleMonsterFieldChange(index, "bossForms", updatedForms);
                    }}
                  >
                    {/* blank/none option */}
                    <MenuItem value="">None</MenuItem>
                    {monsterPool.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Boss Form 2"
                    value={monster.bossForms?.[1] || ""}
                    onChange={(e) => {
                      const updatedForms = [...(monster.bossForms || [])];
                      updatedForms[1] = e.target.value;
                      handleMonsterFieldChange(index, "bossForms", updatedForms);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {monsterPool.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Boss Form 3"
                    value={monster.bossForms?.[2] || ""}
                    onChange={(e) => {
                      const updatedForms = [...(monster.bossForms || [])];
                      updatedForms[2] = e.target.value;
                      handleMonsterFieldChange(index, "bossForms", updatedForms);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {monsterPool.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            </Box>
          ))}

          {/* Add Minion and Add Boss buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button startIcon={<AddCircle />} onClick={() => {
              setLevelForm({
                ...levelForm,
                monsters: [...levelForm.monsters, { monsterId: "", monsterType: "MINION" }]
              });
            }}>
              Add Minion
            </Button>

            <Button startIcon={<AddCircle />} disabled={levelForm.monsters.some(m => m.monsterType === "BOSS")}
              onClick={() => {
                setLevelForm({
                  ...levelForm,
                  monsters: [...levelForm.monsters, { monsterType: "BOSS", bossForms: [] }]
                });
              }}
            >
              Add Boss
            </Button>
          </Box>

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
