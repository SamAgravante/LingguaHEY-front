import React from "react";
import { Box, Typography, Button, Grid, Card, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Activities = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleLevelEditorClick = () => {
    navigate("/leveleditor");
  };

  const handleMonsterEditorClick = () => {
    navigate("/monstereditor"); // Navigate to the Monster Editor page
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5", // ✅ old background
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 2,
        position: "relative",
      }}
    >
      {/* Return Button (top-right) */}
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
          marginTop: 4,
          marginBottom: 6,
          color: "#3f51b5", // ✅ old header color
        }}
      >
        Game Editor
      </Typography>

      {/* Editor Options */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={6}
      >
        {/* Level Editor */}
        <Grid item>
          <Card
            sx={{
              width: 280,
              height: 280,
              backgroundColor: "#fff", // ✅ old card color
              border: "2px solid #ddd",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
            }}
          >
            <CardActionArea
              onClick={handleLevelEditorClick}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: "200px",
                  height: "150px",
                  border: "2px dashed #aaa",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Typography variant="body1" sx={{ color: "#666" }}>
                  [Box Placeholder]
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#3f51b5" }}>
                Level Editor
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        {/* Monster Editor */}
        <Grid item>
          <Card
            sx={{
              width: 280,
              height: 280,
              backgroundColor: "#fff",
              border: "2px solid #ddd",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
            }}
          >
            <CardActionArea
              onClick={handleMonsterEditorClick}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: "200px",
                  height: "150px",
                  border: "2px dashed #aaa",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Typography variant="body1" sx={{ color: "#666" }}>
                  [Box Placeholder]
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#3f51b5" }}>
                Monster Editor
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Activities;