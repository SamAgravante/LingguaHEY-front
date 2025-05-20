import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OnePicFourWords({ activityId, classroomId, onGameCreated, question, onClose }) {
  // Helper to choose between URL or base64 payload
  const getImageSrc = (img) =>
    img && img.startsWith("http") ? img : img ? `data:image/png;base64,${img}` : null;

  // State for adding a new question
  const [newQuestionImage, setNewQuestionImage] = useState(null);
  const [newQuestionChoices, setNewQuestionChoices] = useState([]);
  const [newQuestionInputChoice, setNewQuestionInputChoice] = useState("");
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState("");
  const [newQuestionImagePreview, setNewQuestionImagePreview] = useState(null);
  const [newQuestionMessage, setNewQuestionMessage] = useState("");

  // State for managing existing questions
  const [questions, setQuestions] = useState([]);

  // --- Edit state ---
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editChoices, setEditChoices] = useState([]);
  const [editInputChoice, setEditInputChoice] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const navigate = useNavigate();

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, [activityId]);

  // --- EDIT MODE: initialize edit state from question prop ---
  useEffect(() => {
    if (question) {
      setEditImage(null);
      setEditImagePreview(getImageSrc(question.questionImage));
      setEditChoices(question.choices ? question.choices.map(c => c.choiceText) : []);
      setEditCorrectAnswer(
        question.choices
          ? (question.choices.find(c => c.correct)?.choiceText || "")
          : ""
      );
      setEditInputChoice("");
      setEditMessage("");
    } else {
      setEditImage(null);
      setEditImagePreview(null);
      setEditChoices([]);
      setEditCorrectAnswer("");
      setEditInputChoice("");
      setEditMessage("");
    }
  }, [question]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/liveactivities/${activityId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setQuestions(response.data);
    } catch (err) {
      console.error(err);
      setNewQuestionMessage("Failed to fetch questions.");
    }
  };

  // --- New Question Logic ---

  const handleNewImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setNewQuestionMessage("File size exceeds the 10MB limit.");
        return;
      }
      setNewQuestionImage(file);
      setNewQuestionImagePreview(URL.createObjectURL(file));
      setNewQuestionMessage("");
    }
  };

  const addQuestionChoice = () => {
    const choice = newQuestionInputChoice.trim();
    if (!choice) return setNewQuestionMessage("Choice cannot be empty.");
    if (newQuestionChoices.includes(choice)) return setNewQuestionMessage("Duplicate choice.");
    if (newQuestionChoices.length >= 5) return setNewQuestionMessage("Max 5 choices.");
    setNewQuestionChoices([...newQuestionChoices, choice]);
    setNewQuestionInputChoice("");
    setNewQuestionMessage("");
  };

  const removeQuestionChoice = (choice) => {
    setNewQuestionChoices(newQuestionChoices.filter((c) => c !== choice));
    if (newQuestionCorrectAnswer === choice) setNewQuestionCorrectAnswer("");
    setNewQuestionMessage("");
  };

  const handleSelectCorrectAnswer = (choice) => setNewQuestionCorrectAnswer(choice);

  const handleSaveNewQuestion = async () => {
    if (!newQuestionImage) return setNewQuestionMessage("Upload an image.");
    if (newQuestionChoices.length < 3) return setNewQuestionMessage("Provide 3-5 choices.");
    if (!newQuestionCorrectAnswer) return setNewQuestionMessage("Select correct answer.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setNewQuestionMessage("Saving...");

    try {
      const formData = new FormData();
      formData.append("questionDescription", "");
      formData.append("questionText", "");
      formData.append("image", newQuestionImage);
      formData.append("gameType", "GAME1");

      const { data: { questionId } } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/liveactivities/${activityId}`,
        formData,
        { headers: 
          { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          } 
        }
      );

      let score = 0;
      for (const choice of newQuestionChoices) {
        const correct = choice === newQuestionCorrectAnswer;
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${questionId}`,
          { 
            choiceText: choice, correct 
          },
          { 
            headers: 
            { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            } 
          }
        );
        if (correct) score = 1;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${questionId}`,
        null,
        { 
          params: { scoreValue: score }, 
          headers: 
          { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          } 
        }
      );

      setNewQuestionMessage("Saved successfully!");
      setNewQuestionImage(null);
      setNewQuestionImagePreview(null);
      setNewQuestionChoices([]);
      setNewQuestionCorrectAnswer("");
      setNewQuestionInputChoice("");

      fetchQuestions();

      // Call the callback function after the game is created
      if (onGameCreated) {
        onGameCreated();
      }

    } catch (err) {
      console.error(err);
      setNewQuestionMessage("Failed to save new question.");
    }
  };

  // --- Edit Logic ---
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setEditMessage("File size exceeds the 10MB limit.");
        return;
      }
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
      setEditMessage("");
    }
  };

  const addEditChoice = () => {
    const choice = editInputChoice.trim();
    if (!choice) return setEditMessage("Choice cannot be empty.");
    if (editChoices.includes(choice)) return setEditMessage("Duplicate choice.");
    if (editChoices.length >= 5) return setEditMessage("Max 5 choices.");
    setEditChoices([...editChoices, choice]);
    setEditInputChoice("");
    setEditMessage("");
  };

  const removeEditChoice = (choice) => {
    setEditChoices(editChoices.filter((c) => c !== choice));
    if (editCorrectAnswer === choice) setEditCorrectAnswer("");
    setEditMessage("");
  };

  const handleSelectEditCorrectAnswer = (choice) => setEditCorrectAnswer(choice);

  const handleSaveEdit = async () => {
    if (!question) return;
    if (editChoices.length < 3) return setEditMessage("Provide 3-5 choices.");
    if (!editCorrectAnswer) return setEditMessage("Select correct answer.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setEditMessage("Saving...");

    try {
      // Update image if changed
      if (editImage) {
        const formData = new FormData();
        formData.append("questionDescription", "");
        formData.append("questionText", "");
        formData.append("image", editImage);
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${question.questionId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
      }

      // Update choices
      let score = 0;
      for (const c of question.choices) {
        const correct = editCorrectAnswer === c.choiceText;
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${c.choiceId}`,
          { choiceText: c.choiceText, correct },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (correct) score = 1;
      }
      // Add new choices if any
      for (const c of editChoices) {
        if (!question.choices.find(qc => qc.choiceText === c)) {
          const correct = editCorrectAnswer === c;
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${question.questionId}`,
            { choiceText: c, correct },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (correct) score = 1;
        }
      }

      // Update score
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${question.questionId}/score`,
        null,
        { params: { scoreValue: score }, headers: { Authorization: `Bearer ${token}` } }
      );

      setEditMessage("Updated successfully!");
      fetchQuestions();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setEditMessage("Failed to update question.");
    }
  };

  // --- UI ---
  return (
    <Grid
      container
      justifyContent="center"
      sx={{ minHeight: "100vh", backgroundColor: "#c8e6c9", p: 2, color: "#232323" }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="#232323">
            Activity Name (One Pic Four Words)
          </Typography>
        </Box>

        {/* EDIT MODE */}
        {question ? (
          <Paper
            elevation={3}
            sx={{
              bgcolor: "#18191B",
              p: 4,
              color: "#fff",
              borderRadius: 3,
              mb: 4,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#B3E5FC"
              sx={{ mb: 2 }}
            >
              Edit Question
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              {/* Image Upload */}
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Select Image +
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    bgcolor: "#232323",
                    p: 2,
                    textAlign: "center",
                    border: "2px dashed #616161",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#B3E5FC" },
                    minHeight: 180,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  component="label"
                >
                  <input type="file" hidden onChange={handleEditImageUpload} accept="image/*" />
                  {editImagePreview ? (
                    <Box>
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "contain",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          background: "#18191B",
                          border: "1px solid #333",
                        }}
                      />
                      <Typography variant="body2" color="#B3E5FC" sx={{ mt: 1 }}>
                        {editCorrectAnswer || <span style={{ color: "#616161" }}>No label</span>}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="#B3E5FC">Click to Upload Image</Typography>
                  )}
                </Paper>
              </Box>

              {/* Choices */}
              <Box sx={{ flex: 2 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Enter Choices ({editChoices.length}/5)
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    label="Add Choice"
                    variant="outlined"
                    value={editInputChoice}
                    onChange={(e) => setEditInputChoice(e.target.value)}
                    size="small"
                    sx={{
                      bgcolor: "#232323",
                      input: { color: "white" },
                      label: { color: "#B3E5FC" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#616161" },
                        "&:hover fieldset": { borderColor: "#B3E5FC" },
                        "&.Mui-focused fieldset": { borderColor: "#81D4FA" },
                      },
                      flex: 1,
                    }}
                    disabled={editChoices.length >= 5}
                  />
                  <Button
                    variant="contained"
                    onClick={addEditChoice}
                    disabled={!editInputChoice.trim() || editChoices.length >= 5}
                    sx={{
                      bgcolor: "#81D4FA",
                      color: "black",
                      "&:hover": { bgcolor: "#4FC3F7" },
                      minWidth: 90,
                    }}
                  >
                    Add
                  </Button>
                </Box>
                {/* Choices as Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {editChoices.map((choice) => (
                    <Chip
                      key={choice}
                      label={choice}
                      onClick={() => handleSelectEditCorrectAnswer(choice)}
                      onDelete={() => removeEditChoice(choice)}
                      sx={{
                        bgcolor:
                          editCorrectAnswer === choice ? "#4CAF50" : "#232323",
                        color:
                          editCorrectAnswer === choice ? "white" : "#B3E5FC",
                        border:
                          editCorrectAnswer === choice
                            ? "2px solid #4CAF50"
                            : "1px solid #616161",
                        fontWeight:
                          editCorrectAnswer === choice ? "bold" : "normal",
                        cursor: "pointer",
                        "& .MuiChip-deleteIcon": {
                          color: "#E57373",
                          "&:hover": { color: "#EF5350" },
                        },
                      }}
                    />
                  ))}
                  {editChoices.length === 0 && (
                    <Typography color="#616161" sx={{ mt: 1 }}>
                      No choices added yet.
                    </Typography>
                  )}
                </Box>
                <Typography color="#B3E5FC" mb={1}>
                  {editCorrectAnswer
                    ? `Correct Answer: ${editCorrectAnswer}`
                    : "Click a choice to set as correct answer"}
                </Typography>
                {/* Save/Cancel Buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={onClose}
                    sx={{
                      bgcolor: "#E57373",
                      "&:hover": { bgcolor: "#EF5350" },
                      minWidth: 100,
                      fontWeight: "bold",
                      borderRadius: 3,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveEdit}
                    disabled={
                      editChoices.length < 3 ||
                      editChoices.length > 5 ||
                      !editCorrectAnswer.trim()
                    }
                    sx={{
                      bgcolor: "#4CAF50",
                      color: "white",
                      "&:hover": { bgcolor: "#81C784" },
                      minWidth: 120,
                      fontWeight: "bold",
                      borderRadius: 3,
                    }}
                  >
                    Save
                  </Button>
                </Box>
                {editMessage && (
                  <Typography
                    color={editMessage.includes("success") ? "#81C784" : "#E57373"}
                    sx={{ mt: 3, textAlign: "center" }}
                  >
                    {editMessage}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ) : (
        // CREATE MODE
          <Paper
            elevation={3}
            sx={{
              bgcolor: "#18191B",
              p: 4,
              color: "#fff",
              borderRadius: 3,
              mb: 4,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#B3E5FC"
              sx={{ mb: 2 }}
            >
              {questions.length + 1}.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              {/* Image Upload */}
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Select Image +
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    bgcolor: "#232323",
                    p: 2,
                    textAlign: "center",
                    border: "2px dashed #616161",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#B3E5FC" },
                    minHeight: 180,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  component="label"
                >
                  <input type="file" hidden onChange={handleNewImageUpload} accept="image/*" />
                  {newQuestionImagePreview ? (
                    <Box>
                      <img
                        src={newQuestionImagePreview}
                        alt="Preview"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "contain",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          background: "#18191B",
                          border: "1px solid #333",
                        }}
                      />
                      <Typography variant="body2" color="#B3E5FC" sx={{ mt: 1 }}>
                        {newQuestionCorrectAnswer || <span style={{ color: "#616161" }}>No label</span>}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="#B3E5FC">Click to Upload Image</Typography>
                  )}
                </Paper>
              </Box>

              {/* Choices */}
              <Box sx={{ flex: 2 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Enter Choices ({newQuestionChoices.length}/5)
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    label="Add Choice"
                    variant="outlined"
                    value={newQuestionInputChoice}
                    onChange={(e) => setNewQuestionInputChoice(e.target.value)}
                    size="small"
                    sx={{
                      bgcolor: "#232323",
                      input: { color: "white" },
                      label: { color: "#B3E5FC" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#616161" },
                        "&:hover fieldset": { borderColor: "#B3E5FC" },
                        "&.Mui-focused fieldset": { borderColor: "#81D4FA" },
                      },
                      flex: 1,
                    }}
                    disabled={newQuestionChoices.length >= 5}
                  />
                  <Button
                    variant="contained"
                    onClick={addQuestionChoice}
                    disabled={!newQuestionInputChoice.trim() || newQuestionChoices.length >= 5}
                    sx={{
                      bgcolor: "#81D4FA",
                      color: "black",
                      "&:hover": { bgcolor: "#4FC3F7" },
                      minWidth: 90,
                    }}
                  >
                    Add
                  </Button>
                </Box>
                {/* Choices as Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {newQuestionChoices.map((choice) => (
                    <Chip
                      key={choice}
                      label={choice}
                      onClick={() => handleSelectCorrectAnswer(choice)}
                      onDelete={() => removeQuestionChoice(choice)}
                      sx={{
                        bgcolor:
                          newQuestionCorrectAnswer === choice ? "#4CAF50" : "#232323",
                        color:
                          newQuestionCorrectAnswer === choice ? "white" : "#B3E5FC",
                        border:
                          newQuestionCorrectAnswer === choice
                            ? "2px solid #4CAF50"
                            : "1px solid #616161",
                        fontWeight:
                          newQuestionCorrectAnswer === choice ? "bold" : "normal",
                        cursor: "pointer",
                        "& .MuiChip-deleteIcon": {
                          color: "#E57373",
                          "&:hover": { color: "#EF5350" },
                        },
                      }}
                    />
                  ))}
                  {newQuestionChoices.length === 0 && (
                    <Typography color="#616161" sx={{ mt: 1 }}>
                      No choices added yet.
                    </Typography>
                  )}
                </Box>
                <Typography color="#B3E5FC" mb={1}>
                  {newQuestionCorrectAnswer
                    ? `Correct Answer: ${newQuestionCorrectAnswer}`
                    : "Click a choice to set as correct answer"}
                </Typography>
                {/* Save/Cancel Buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      setNewQuestionImage(null);
                      setNewQuestionImagePreview(null);
                      setNewQuestionChoices([]);
                      setNewQuestionInputChoice("");
                      setNewQuestionCorrectAnswer("");
                      setNewQuestionMessage("");
                    }}
                    sx={{
                      bgcolor: "#E57373",
                      "&:hover": { bgcolor: "#EF5350" },
                      minWidth: 100,
                      fontWeight: "bold",
                      borderRadius: 3,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveNewQuestion}
                    disabled={
                      !newQuestionImage ||
                      newQuestionChoices.length < 3 ||
                      newQuestionChoices.length > 5 ||
                      !newQuestionCorrectAnswer.trim()
                    }
                    sx={{
                      bgcolor: "#4CAF50",
                      color: "white",
                      "&:hover": { bgcolor: "#81C784" },
                      minWidth: 120,
                      fontWeight: "bold",
                      borderRadius: 3,
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Box>
            {/* Only show message here if NOT editing an existing question */}
            {!question && newQuestionMessage && (
              <Typography
                color={newQuestionMessage.includes("success") ? "#81C784" : "#E57373"}
                sx={{ mt: 3, textAlign: "center" }}
              >
                {newQuestionMessage}
              </Typography>
            )}
            {/* Only show message here if editing an existing question */}
            {question && editMessage && (
              <Typography
                color={editMessage.includes("success") ? "#81C784" : "#E57373"}
                sx={{ mt: 3, textAlign: "center" }}
              >
                {editMessage}
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Grid>
  );
}

export default OnePicFourWords;