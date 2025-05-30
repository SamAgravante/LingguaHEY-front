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

function OnePicFourWords({activityId}) {
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
  //const { activityId, classroomId } = useParams();
  const navigate = useNavigate();

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, [activityId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
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
    if (newQuestionChoices.length >= 4) return setNewQuestionMessage("Max 4 choices.");
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
      formData.append("gameType", newQuestionGameType);

      const { data: { questionId } } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      let score = 0;
      for (const choice of newQuestionChoices) {
        const correct = choice === newQuestionCorrectAnswer;
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${questionId}`,
          { choiceText: choice, correct },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (correct) score = 1;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${questionId}`,
        null,
        { params: { scoreValue: score }, headers: { Authorization: `Bearer ${token}` } }
      );

      setNewQuestionMessage("Saved successfully!");
      setNewQuestionImage(null);
      setNewQuestionImagePreview(null);
      setNewQuestionChoices([]);
      setNewQuestionCorrectAnswer("");
      setNewQuestionInputChoice("");

      fetchQuestions();
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
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${c.choiceId}`,
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

  const goBackToActivities = () => navigate(`/admindashboard`);

  return (
    <Grid
      container
      justifyContent="center"
      sx={{ minHeight: "100vh", p: 2, color: "black" }}
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
          <Typography variant="h5" fontWeight="bold" color="black">
           One Pic Four Words
          </Typography>
          {/*
          <Button
            variant="text"
            onClick={goBackToActivities}
            sx={{ color: "#388e3c", "&:hover": { color: "#2e7031" } }}
          >
            ← Back to Class
          </Button>*/
          }
        </Box>

        {/* Existing Questions */}
        <Box>
          {questions.length > 0 &&
            questions.map((question, index) => (
              <Paper
                key={question.questionId}
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
                  {index + 1}.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Image */}
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    {editingChoicesQuestionId === question.questionId ? (
                      <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto"}}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`edit-image-input-${question.questionId}`}
                          onChange={handleEditingImageUpload}
                        />
                        <label htmlFor={`edit-image-input-${question.questionId}`}>
                          <img
                            src={editingImagePreview}
                            alt={`Question ${index + 1}`}
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              marginBottom: "10px",
                              borderRadius: "8px",
                              background: "#fff",
                              border: "1px solid #333",
                              cursor: "pointer",
                              opacity: 0.85,
                            }}
                            title="Click to change image"
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              left: 0,
                              width: "100%",
                              textAlign: "center",
                              color: "#B3E5FC",
                              fontSize: 12,
                              pointerEvents: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <PhotoCamera sx={{ fontSize: 16, mr: 0.5 }} />
                            Click to change
                          </Box>
                        </label>
                      </Box>
                    ) : (
                      question.questionImage && (
                        <img
                          src={getImageSrc(question.questionImage || "")}
                          alt={`Question ${index + 1}`}
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            background: "#fff",
                            border: "1px solid #333",
                          }}
                        />
                      )

                    )}
                    {/* Show correct answer label */}
                    <Typography
                      variant="body2"
                      color="#B3E5FC"
                      sx={{ mt: 1, textAlign: "center" }}
                    >
                      {editingChoicesQuestionId === question.questionId
                        ? editingCorrectAnswer || <span style={{ color: "#616161" }}>No label</span>
                        : (question.choices?.find(c => c.correct)?.choiceText || <span style={{ color: "#616161" }}>No label</span>)
                      }
                    </Typography>
                  </Box>

                  {/* Choices */}
                  <Box sx={{ flex: 2 }}>
                    <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                      Enter Choices
                    </Typography>
                    {editingChoicesQuestionId === question.questionId ? (
                      <>
                        {/* Editing mode: show chips for choices, editable */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                          {editingChoices.map((choice, idx) => (
                            <Chip
                              key={choice.choiceId}
                              label={
                                <TextField
                                  value={choice.choiceText}
                                  onChange={e =>
                                    handleEditingChoiceChange(idx, e.target.value)
                                  }
                                  variant="standard"
                                  sx={{
                                    input: { color: "#fff", minWidth: 60 },
                                    "& .MuiInput-underline:before": { borderBottom: "none" },
                                    "& .MuiInput-underline:after": { borderBottom: "none" },
                                    bgcolor: "transparent",
                                  }}
                                />
                              }
                              onClick={() => setEditingCorrectAnswer(choice.choiceText)}
                              onDelete={() => {
                                // Remove choice from editingChoices
                                setEditingChoices(editingChoices.filter((_, i) => i !== idx));
                                if (editingCorrectAnswer === choice.choiceText) {
                                  setEditingCorrectAnswer("");
                                }
                              }}
                              sx={{
                                bgcolor:
                                  editingCorrectAnswer === choice.choiceText
                                    ? "#4CAF50"
                                    : "#232323",
                                color:
                                  editingCorrectAnswer === choice.choiceText
                                    ? "white"
                                    : "#B3E5FC",
                                border:
                                  editingCorrectAnswer === choice.choiceText
                                    ? "2px solid #4CAF50"
                                    : "1px solid #616161",
                                fontWeight:
                                  editingCorrectAnswer === choice.choiceText
                                    ? "bold"
                                    : "normal",
                                cursor: "pointer",
                                "& .MuiChip-deleteIcon": {
                                  color: "#E57373",
                                  "&:hover": { color: "#EF5350" },
                                },
                              }}
                            />
                          ))}
                        </Box>
                        <Typography color="#B3E5FC" mb={1}>
                          {editingCorrectAnswer
                            ? `Correct Answer: ${editingCorrectAnswer}`
                            : "Click a choice to set as correct answer"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={saveEditedChoices}
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
                          <Button
                            variant="contained"
                            color="error"
                            onClick={cancelEditingChoices}
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
                        </Box>
                      </>
                    ) : (
                      <>
                        {/* View mode: show chips for choices */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                          {(question.choices || []).map((choice, idx) => (
                            <Chip
                              key={choice.choiceId || idx}
                              label={choice.choiceText}
                              sx={{
                                bgcolor: choice.correct ? "#4CAF50" : "#232323",
                                color: choice.correct ? "white" : "#B3E5FC",
                                border: choice.correct
                                  ? "2px solid #4CAF50"
                                  : "1px solid #616161",
                                fontWeight: choice.correct ? "bold" : "normal",
                              }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                          <Button
                            variant="contained"
                            onClick={() => startEditingChoices(question)}
                            sx={{
                              bgcolor: "#81D4FA",
                              color: "black",
                              "&:hover": { bgcolor: "#4FC3F7" },
                              minWidth: 120,
                              fontWeight: "bold",
                              borderRadius: 3,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteQuestion(question.questionId)}
                            sx={{
                              bgcolor: "#E57373",
                              "&:hover": { bgcolor: "#EF5350" },
                              minWidth: 100,
                              fontWeight: "bold",
                              borderRadius: 3,
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
                {/* Error message for this question */}
                {editingChoicesQuestionId === question.questionId && questionMessages[question.questionId] && (
                  <Typography
                    color={questionMessages[question.questionId].includes("success") ? "#81C784" : "#E57373"}
                    sx={{ mt: 2, textAlign: "center" }}
                  >
                    {questionMessages[question.questionId]}
                  </Typography>
                )}
              </Paper>
            ))}

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
                  Enter Choices ({newQuestionChoices.length}/4)
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