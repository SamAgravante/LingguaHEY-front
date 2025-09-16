import React, { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LevelEditor = () => {
  const navigate = useNavigate();

  const [levels, setLevels] = useState([
    { id: 1, name: "Level 1", category: "Animals" },
    { id: 2, name: "Level 2", category: "Animals" },
  ]);

  const handleReturn = () => {
    navigate(-1);
  };

  const handleEdit = (level) => {
    navigate(`/edit-level/${level.id}`, { state: { level } });
  };

  const handleDelete = (id) => {
    setLevels(levels.filter((level) => level.id !== id));
  };

  const handleAddNewLevel = () => {
    const newId = levels.length + 1;
    setLevels([
      ...levels,
      { id: newId, name: `Level ${newId}`, category: "New Category" },
    ]);
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
          <Grid item key={level.id} sx={{ width: "100%", maxWidth: 600 }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#3f51b5" }}>
                    {level.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {level.category}
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

        {/* Add New Level */}
        <Grid item sx={{ width: "100%", maxWidth: 600 }}>
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
            onClick={handleAddNewLevel}
          >
            Add New Level +
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LevelEditor;