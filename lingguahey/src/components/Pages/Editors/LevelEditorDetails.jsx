import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";

const LevelEditorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { level } = location.state || {};

  const [monsters, setMonsters] = useState([]);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [openMonsterDialog, setOpenMonsterDialog] = useState(false);
  const [selectedMonsterSlot, setSelectedMonsterSlot] = useState(null);

  const monsterPool = {
    Normal: [
      { id: 1, name: "Aso" },
      { id: 2, name: "Tikbalang" },
      { id: 3, name: "Kapre" },
    ],
    Boss: [
      { id: 101, name: "Manananggal" },
      { id: 102, name: "Aswang Queen" },
    ],
  };

  const handleAddMonsterClick = () => {
    setOpenTypeDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenTypeDialog(false);
    setOpenMonsterDialog(false);
  };

  const handleSelectType = (type) => {
    const newMonster = {
      id: monsters.length + 1,
      type: type,
      name: "Add +",
    };
    setMonsters([...monsters, newMonster]);
    setOpenTypeDialog(false);
  };

  const handleOpenMonsterList = (monster) => {
    setSelectedMonsterSlot(monster);
    setOpenMonsterDialog(true);
  };

  const handleChooseMonster = (chosen) => {
    setMonsters(
      monsters.map((m) =>
        m.id === selectedMonsterSlot.id ? { ...m, name: chosen.name } : m
      )
    );
    setOpenMonsterDialog(false);
    setSelectedMonsterSlot(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 4,
      }}
    >
      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          marginBottom: 4,
          textAlign: "center",
          color: "#3f51b5",
        }}
      >
        {level?.name || "Unknown Level"} - Monsters
      </Typography>

      {/* Monsters List */}
      <Grid container spacing={3} justifyContent="center" maxWidth="600px">
        {monsters.map((monster) => (
          <Grid item xs={12} key={monster.id}>
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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#3f51b5" }}
                >
                  {monster.type} Type - {monster.name}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "#aaa",
                    color: "#3f51b5",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleOpenMonsterList(monster)}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Monster Button */}
      <Button
        onClick={handleAddMonsterClick}
        sx={{
          marginTop: 4,
          backgroundColor: "#3f51b5",
          color: "#fff",
          fontWeight: "bold",
          padding: "8px 16px",
          borderRadius: 2,
          "&:hover": {
            backgroundColor: "#5c6bc0",
          },
        }}
      >
        Add Monster
      </Button>

      {/* Dialog for selecting monster type */}
      <Dialog open={openTypeDialog} onClose={handleCloseDialog}>
        <DialogTitle>Select Monster Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              fullWidth
              sx={{
                backgroundColor: "#fff",
                color: "#3f51b5",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => handleSelectType("Normal")}
            >
              Normal Type
            </Button>
            <Button
              fullWidth
              sx={{
                backgroundColor: "#e53935",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#d32f2f" },
              }}
              onClick={() => handleSelectType("Boss")}
            >
              Boss Type
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for selecting monster from pool */}
      <Dialog open={openMonsterDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Choose a {selectedMonsterSlot?.type} Monster</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {monsterPool[selectedMonsterSlot?.type || "Normal"].map((m) => (
              <Grid item xs={6} key={m.id}>
                <Button
                  fullWidth
                  sx={{
                    backgroundColor: "#fff",
                    color: "#3f51b5",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                  onClick={() => handleChooseMonster(m)}
                >
                  {m.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Back Button */}
      <Button
        onClick={handleBack}
        sx={{
          marginTop: 2,
          backgroundColor: "#3f51b5",
          color: "#fff",
          fontWeight: "bold",
          "&:hover": { backgroundColor: "#5c6bc0" },
        }}
      >
        Back
      </Button>
    </Box>
  );
};

export default LevelEditorDetails;