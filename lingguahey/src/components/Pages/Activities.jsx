import React from "react";
import { Box, Typography, Button, Grid, Card, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

import levelEditorIcon from "../../assets/images/ui-assets/LevelEditor_Button.jpg";
import monsterEditorIcon from "../../assets/images/ui-assets/MonsterEditor_Button.png";
import bg from "../../assets/images/backgrounds/Editor_BG.png";

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
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",       // makes sure it covers entire screen
        backgroundPosition: "center",  // centers the image
        backgroundRepeat: "no-repeat", // no tiling
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
          color: "#3f51b5",
          fontWeight: "bold",
          padding: "6px 16px",
          borderRadius: 2,
          marginRight: "30px",
          fontSize: "40px",
          "&:hover": { backgroundColor: "transparent" },
        }}
      >
        Return
      </Button>

      {/* Header */}
      <Typography
        variant="inherit"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          marginTop: 4,
          marginBottom: 6,
          color: "#3f51b5", // ✅ old header color
          fontSize: "80px"
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
              width: 500,
              height: 420,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
          >
            <CardActionArea
              onClick={handleLevelEditorClick}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={levelEditorIcon}
                alt="Monster Editor"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain", // scale properly inside card
                  backgroundColor: "transparent",
                }}
              />
            </CardActionArea>
          </Card>
        </Grid>

        {/* Monster Editor */}
        <Grid item>
          <Card
            sx={{
              width: 500,   // bigger size
              height: 420,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
          >
            <CardActionArea
              onClick={handleMonsterEditorClick}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={monsterEditorIcon}
                alt="Monster Editor"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Activities;