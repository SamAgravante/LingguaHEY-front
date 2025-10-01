import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";

// Backgrounds
import ListContainerBG from "../../../assets/images/backgrounds/MonsterEditUIOuter.png";
import ListBG from "../../../assets/images/backgrounds/NameTab.png";
import EditBG from "../../../assets/images/backgrounds/GameShopBoxSmall.png";
import bg from "../../../assets/images/backgrounds/Editor_BG.png";
import DeleteBG from "../../../assets/images/ui-assets/DeleteButton.png";

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
      if (editForm.file) {
        formData.append("file", editForm.file);
      }

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
          "Content-Type": "multipart/form-data",
        },
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

      {/* Title */}
      <Typography
        sx={{
          fontWeight: 600,
          textAlign: "center",
          marginBottom: 4,
          color: "#3f51b5",
          fontSize: "60px",
        }}
      >
        Monster Editor
      </Typography>

      {/* Outer Container Background */}
      <Box
        sx={{
          backgroundImage: `url(${ListContainerBG})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          padding: 4,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {monsters.map((monster) => (
              <Box
                key={monster.id}
                sx={{
                  backgroundImage: `url(${ListBG})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  padding: 2,
                  paddingTop: 5,
                  minHeight: 120,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {editMonster === monster.id ? (
                  // Edit Form
                  <Box sx={{ width: "100%", padding: 2 }}>
                    <Grid container spacing={2}>
                      {/* Add Image Box */}
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            border: "2px dashed #5b3138",
                            borderRadius: "8px",
                            height: "100%",
                            minHeight: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundColor: "#f7cb97",
                            "&:hover": { backgroundColor: "#f5b971" },
                          }}
                          onClick={() => document.getElementById("editImageInput").click()}
                        >
                          <Typography
                            sx={{
                              color: "#5b3138",
                              fontWeight: "bold",
                              textAlign: "center",
                              fontSize: "14px", // Slightly smaller font size
                            }}
                          >
                            Change Image
                          </Typography>
                          <input
                            type="file"
                            id="editImageInput"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, file: e.target.files[0] }))
                            }
                          />
                        </Box>
                      </Grid>

                      {/* Form Fields */}
                      <Grid item xs={12} sm={9}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              label="English Name"
                              name="english"
                              value={editForm.english}
                              onChange={handleChange}
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "2px solid #5b3138", // Add border
                                  borderRadius: "8px", // Optional: Add rounded corners
                                  minHeight: 40, // Reduced height
                                },
                                "& .MuiInputLabel-root": {
                                  backgroundColor: "#f7cb97", // Add background to prevent overlap
                                  padding: "0 4px", // Add padding to the label
                                  transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
                                },
                                "& .MuiInputLabel-shrink": {
                                  transform: "translate(14px, -6px) scale(0.75)", // Ensure proper position when focused
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Tagalog Name"
                              name="tagalog"
                              value={editForm.tagalog}
                              onChange={handleChange}
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "2px solid #5b3138", // Add border
                                  borderRadius: "8px", // Optional: Add rounded corners
                                  minHeight: 40, // Reduced height
                                },
                                "& .MuiInputLabel-root": {
                                  backgroundColor: "#f7cb97", // Add background to prevent overlap
                                  padding: "0 4px", // Add padding to the label
                                  transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
                                },
                                "& .MuiInputLabel-shrink": {
                                  transform: "translate(14px, -6px) scale(0.75)", // Ensure proper position when focused
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Description"
                              name="description"
                              value={editForm.description}
                              onChange={handleChange}
                              fullWidth
                              multiline
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "2px solid #5b3138", // Add border
                                  borderRadius: "8px", // Optional: Add rounded corners
                                  minHeight: 40, // Reduced height
                                },
                                "& .MuiInputLabel-root": {
                                  backgroundColor: "#f7cb97", // Add background to prevent overlap
                                  padding: "0 4px", // Add padding to the label
                                  transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
                                },
                                "& .MuiInputLabel-shrink": {
                                  transform: "translate(14px, -6px) scale(0.75)", // Ensure proper position when focused
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Save and Cancel Buttons */}
                      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: "#4caf50" }}
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: "#9e9e9e" }}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "15px", paddingBottom: "18px" }}>
                      {monster.image.startsWith("data:") ? (
                        <img
                          src={monster.image}
                          alt={monster.english}
                          style={{ width: 100, height: 100 }}
                        />
                      ) : (
                        <Typography variant="h4">{monster.image}</Typography>
                      )}
                      <Box>
                        <Typography sx={{ fontWeight: "bold", fontSize: 30 }}>
                          English: {monster.english}
                        </Typography>
                        <Typography sx={{ fontWeight: "bold", fontSize: 30 }}>
                          Tagalog: {monster.tagalog}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ marginRight: "15px", paddingBottom: "18px" }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundImage: `url(${EditBG})`,
                          backgroundSize: "100% 100%",
                          backgroundRepeat: "no-repeat",
                          color: "#000",
                          marginRight: 2,
                          fontWeight: "bold",
                          width: 100,
                          height: 40,
                          fontSize: "16px",
                          padding: 1,
                        }}
                        onClick={() => handleEditClick(monster)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundImage: `url(${DeleteBG})`,
                          backgroundSize: "100% 100%",
                          backgroundRepeat: "no-repeat",
                          fontWeight: "bold",
                          width: 100,
                          height: 40,
                          fontSize: "16px",
                          "&:hover": { backgroundColor: "#d32f2f" },
                        }}
                        onClick={() => handleDelete(monster.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            ))}

            {/* Add Monster Box */}
            <Box
              onClick={() => setOpenAddDialog(true)}
              sx={{
                backgroundImage: `url(${ListBG})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                padding: 3,
                minHeight: 100,
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{ fontWeight: "bold", fontSize: "28px", color: "#000" }}
              >
                Add New Monster +
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      {/* Add Monster Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundImage: `url(${ListContainerBG})`, // ✅ use same outer BG
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            textAlign: "center",
            fontSize: "28px",
          }}
        >
          Add a New Monster
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Add Image Box (same style as edit) */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  border: "2px dashed #5b3138",
                  borderRadius: "8px",
                  height: "100%",
                  minHeight: 120,
                  minWidth: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: "#f7cb97",
                  "&:hover": { backgroundColor: "#f5b971" },
                }}
                onClick={() =>
                  document.getElementById("addImageInput").click()
                }
              >
                <Typography
                  sx={{
                    color: "#5b3138",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  Add Image
                </Typography>
                <input
                  type="file"
                  id="addImageInput"
                  name="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleNewMonsterChange}
                />
              </Box>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} sm={8}>
              <Stack spacing={2}>
                <TextField
                  label="English Name"
                  name="english"
                  value={newMonsterForm.english}
                  onChange={handleNewMonsterChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      border: "2px solid #5b3138", // Add border
                      borderRadius: "8px", // Optional: Add rounded corners
                      minHeight: 40, // Reduced height
                    },
                    "& .MuiInputLabel-root": {
                      backgroundColor: "#dba463", // Add background to prevent overlap
                      padding: "0 4px", // Add padding to the label
                      transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
                    },
                    "& .MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)", // Ensure proper position when focused
                    },
                    width: "380px",
                  }}
                  fullWidth
                />
                <TextField
                  label="Tagalog Name"
                  name="tagalog"
                  value={newMonsterForm.tagalog}
                  onChange={handleNewMonsterChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      border: "2px solid #5b3138", // Add border
                      borderRadius: "8px", // Optional: Add rounded corners
                      minHeight: 40, // Reduced height
                    },
                    "& .MuiInputLabel-root": {
                      backgroundColor: "#dba463", // Add background to prevent overlap
                      padding: "0 4px", // Add padding to the label
                      transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
                    },
                    "& .MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)", // Ensure proper position when focused
                    },
                  }}
                  fullWidth
                />
                <TextField
                  label="Description"
                  name="description"
                  value={newMonsterForm.description}
                  onChange={handleNewMonsterChange}
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
                  multiline
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            variant="contained"
            sx={{ backgroundColor: "#9e9e9e" }}
          >
            Cancel
          </Button>
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
