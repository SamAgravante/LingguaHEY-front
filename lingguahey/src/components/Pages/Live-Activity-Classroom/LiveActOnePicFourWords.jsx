import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Grid,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function OnePicFourWords({ activityId, classroomId, onGameCreated }) {
  // Helper to choose between URL or base64 payload
  const getImageSrc = (img) =>
    img.startsWith("http") ? img : `data:image/png;base64,${img}`;

  // State for adding a new question (all parts collected before saving)
  const [newQuestionImage, setNewQuestionImage] = useState(null);
  const [newQuestionChoices, setNewQuestionChoices] = useState([]);
  const [newQuestionInputChoice, setNewQuestionInputChoice] = useState("");
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState("");
  const [newQuestionImagePreview, setNewQuestionImagePreview] = useState(null);
  const [newQuestionGameType, setNewQuestionGameType] = useState("guess_object");
  const [newQuestionMessage, setNewQuestionMessage] = useState("");

  // State for managing existing questions
  const [questions, setQuestions] = useState([]);
  const [editingChoicesQuestionId, setEditingChoicesQuestionId] = useState(null);
  const [editingChoices, setEditingChoices] = useState([]);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState("");
  const [editingImageFile, setEditingImageFile] = useState(null);
  const [editingImagePreview, setEditingImagePreview] = useState(null);
  const [questionMessages, setQuestionMessages] = useState({});

  // General state
  const navigate = useNavigate();

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, [activityId]);

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

  // --- Edit/Delete Logic ---

  const startEditingChoices = async (q) => {
    setEditingChoicesQuestionId(q.questionId);
    setEditingImageFile(null);
    setEditingImagePreview(getImageSrc(q.questionImage || ""));
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${q.questionId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEditingChoices(data);
      const correct = data.find((c) => c.correct);
      setEditingCorrectAnswer(correct ? correct.choiceText : "");
    } catch (err) {
      console.error(err);
      setQuestionMessages((prev) => ({ ...prev, [q.questionId]: "Failed to load choices." }));
    }
  };

  const handleEditingImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setQuestionMessages((prev) => ({ ...prev, [editingChoicesQuestionId]: "File too large." }));
      return;
    }
    setEditingImageFile(file);
    setEditingImagePreview(URL.createObjectURL(file));
  };

  const handleEditingChoiceChange = (i, text) => {
    const arr = [...editingChoices];
    arr[i].choiceText = text;
    setEditingChoices(arr);
  };

  const saveEditedChoices = async () => {
    const id = editingChoicesQuestionId;
    if (!id) return;
    if (!editingCorrectAnswer) {
      setQuestionMessages((prev) => ({ ...prev, [id]: "Select correct answer." }));
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      if (editingImageFile) {
        const fd = new FormData();
        fd.append("questionDescription", "");
        fd.append("questionText", "");
        fd.append("image", editingImageFile);
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
          fd,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
      }

      let score = 0;
      for (const c of editingChoices) {
        const correct = c.choiceText === editingCorrectAnswer;
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${c.choiceId}`,
          { choiceText: c.choiceText, correct },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (correct) score = 1;
      }

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${id}/score`,
        null,
        { params: { scoreValue: score }, headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestionMessages((prev) => ({ ...prev, [id]: "Updated!" }));
      setTimeout(() => setEditingChoicesQuestionId(null), 1000);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setQuestionMessages((prev) => ({ ...prev, [id]: "Failed to update." }));
    }
  };

  const cancelEditingChoices = () => setEditingChoicesQuestionId(null);

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete?")) return;
    const token = localStorage.getItem("token"); if (!token) return navigate("/login");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((arr) => arr.filter((q) => q.questionId !== id));
    } catch (err) {
      console.error(err);
      setQuestionMessages((prev) => ({ ...prev, [id]: "Failed to delete." }));
    }
  };

  const goBackToActivities = () => navigate(`/classroom/${classroomId}/live-activities`);

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

        {/* Existing Questions */}
        <Box>
          {/* Add New Question Card */}
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
            {(!editingChoicesQuestionId && newQuestionMessage) && (
              <Typography
                color={newQuestionMessage.includes("success") ? "#81C784" : "#E57373"}
                sx={{ mt: 3, textAlign: "center" }}
              >
                {newQuestionMessage}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Grid>
  );
}

export default OnePicFourWords;