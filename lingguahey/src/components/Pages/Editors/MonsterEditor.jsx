import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";

const MonsterEditor = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editMonster, setEditMonster] = useState(null);
  const [editForm, setEditForm] = useState({
    english: "",
    tagalog: "",
    description: "",
  });

  // Add monster state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMonsterForm, setNewMonsterForm] = useState({
    english: "",
    tagalog: "",
    description: "",
    file: null,
  });

  // Axios instance
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/monsters`,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        const response = await API.get("");
        const fetchedMonsters = response.data.map((monster) => ({
          id: monster.monsterId,
          english: monster.englishName,
          tagalog: monster.tagalogName,
          description: monster.description,
          image: monster.imageData
            ? `data:image/png;base64,${monster.imageData}`
            : "👾",
        }));
        setMonsters(fetchedMonsters);
      } catch (error) {
        console.error("Error fetching monsters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonsters();
  }, []);

  // Handle edit form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Start editing
  const handleEditClick = (monster) => {
    setEditMonster(monster.id);
    setEditForm({
      english: monster.english,
      tagalog: monster.tagalog,
      description: monster.description,
    });
  };

  const handleCancelEdit = () => {
    setEditMonster(null);
    setEditForm({ english: "", tagalog: "", description: "" });
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("englishName", editForm.english);
      formData.append("tagalogName", editForm.tagalog);
      formData.append("description", editForm.description);

      const response = await API.put(`/${editMonster}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMonsters((prev) =>
        prev.map((m) =>
          m.id === editMonster
            ? {
                ...m,
                english: response.data.englishName,
                tagalog: response.data.tagalogName,
                description: response.data.description,
                image: response.data.imageData
                  ? `data:image/png;base64,${response.data.imageData}`
                  : m.image,
              }
            : m
        )
      );

      setEditMonster(null);
    } catch (error) {
      console.error("Error updating monster:", error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await API.delete(`/${id}`);
      setMonsters((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting monster:", error);
    }
  };

  // Add monster handlers
  const handleNewMonsterChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setNewMonsterForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setNewMonsterForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddMonster = async () => {
    try {
      const formData = new FormData();
      formData.append("englishName", newMonsterForm.english);
      formData.append("tagalogName", newMonsterForm.tagalog);
      formData.append("description", newMonsterForm.description);
      if (newMonsterForm.file) {
        formData.append("file", newMonsterForm.file);
      }

      const response = await API.post("", formData, {
        headers: { 
          "Content-Type": "multipart/form-data" },
      });

      const newMonster = {
        id: response.data.monsterId,
        english: response.data.englishName,
        tagalog: response.data.tagalogName,
        description: response.data.description,
        image: response.data.imageData
          ? `data:image/png;base64,${response.data.imageData}`
          : "👾",
      };

      setMonsters((prev) => [...prev, newMonster]);
      setOpenAddDialog(false);
      setNewMonsterForm({
        english: "",
        tagalog: "",
        description: "",
        file: null,
      });
    } catch (error) {
      console.error("Error adding monster:", error);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

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
        }}
      >
        Return
      </Button>

      <Typography
        variant="h3"
        sx={{ fontWeight: 600, textAlign: "center", mb: 6, color: "#3f51b5" }}
      >
        Monster Editor
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container direction="column" spacing={3} alignItems="center">
          {monsters.map((monster) => (
            <Grid item key={monster.id} sx={{ width: "100%", maxWidth: 800 }}>
              <Card sx={{ backgroundColor: "#fff", border: "1px solid #ddd" }}>
                <CardContent>
                  {editMonster === monster.id ? (
                    // Edit Form
                    <Stack spacing={2}>
                      <TextField
                        label="English Name"
                        name="english"
                        value={editForm.english}
                        onChange={handleChange}
                        fullWidth
                      />
                      <TextField
                        label="Tagalog Name"
                        name="tagalog"
                        value={editForm.tagalog}
                        onChange={handleChange}
                        fullWidth
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={editForm.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                      />
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          onClick={handleSaveEdit}
                          sx={{ backgroundColor: "#4caf50" }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleCancelEdit}
                          sx={{ backgroundColor: "#9e9e9e" }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    // Display View
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {monster.image.startsWith("data:") ? (
                          <img
                            src={monster.image}
                            alt={monster.english}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                          />
                        ) : (
                          <Typography variant="h4">{monster.image}</Typography>
                        )}
                        <Box>
                          <Typography>
                            <strong>English:</strong> {monster.english}
                          </Typography>
                          <Typography>
                            <strong>Tagalog:</strong> {monster.tagalog}
                          </Typography>
                          {/* Commented out description, might delete later */}
                          {/*<Typography color="text.secondary">
                            <strong>Description:</strong> {monster.description}
                          </Typography>*/}
                        </Box>
                      </Box>

                      <Box>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: "#2196f3", mr: 2 }}
                          onClick={() => handleEditClick(monster)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: "#e53935" }}
                          onClick={() => handleDelete(monster.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Add Monster Card */}
          <Grid item sx={{ width: "100%", maxWidth: 800 }}>
            <Card
              sx={{
                backgroundColor: "#fafafa",
                border: "2px dashed #aaa",
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => setOpenAddDialog(true)}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  + Add Monster
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Monster Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add a New Monster</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="English Name"
              name="english"
              value={newMonsterForm.english}
              onChange={handleNewMonsterChange}
              fullWidth
            />
            <TextField
              label="Tagalog Name"
              name="tagalog"
              value={newMonsterForm.tagalog}
              onChange={handleNewMonsterChange}
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={newMonsterForm.description}
              onChange={handleNewMonsterChange}
              fullWidth
              multiline
            />
            <input
              type="file"
              name="file"
              accept="image/*"
              onChange={handleNewMonsterChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddMonster}
            variant="contained"
            sx={{ backgroundColor: "#4caf50" }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonsterEditor;
