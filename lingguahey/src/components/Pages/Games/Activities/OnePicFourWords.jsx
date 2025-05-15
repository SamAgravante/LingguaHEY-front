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

function OnePicFourWords() {
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
  const { activityId, classroomId } = useParams();
  const navigate = useNavigate();

  // Fetch questions for the activity on component mount
  useEffect(() => {
    fetchQuestions();
  }, [activityId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setQuestions(response.data);
    } catch (err) {
      console.error("Failed to fetch questions:", err.response?.data || err.message);
      setNewQuestionMessage("Failed to fetch existing questions. Please try again.");
    }
  };

  // --- New Question Creation Logic ---

  const handleNewImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setNewQuestionMessage("File size exceeds the 10MB limit. Please upload a smaller file.");
        return;
      }
      setNewQuestionImage(file);
      setNewQuestionImagePreview(URL.createObjectURL(file));
      setNewQuestionMessage(""); // Clear previous messages
    }
  };

  const addQuestionChoice = () => {
    if (!newQuestionInputChoice.trim()) {
      setNewQuestionMessage("Choice cannot be empty.");
      return;
    }
    if (newQuestionChoices.length >= 5) {
      setNewQuestionMessage("You can only add up to 5 choices.");
      return;
    }
    if (newQuestionChoices.includes(newQuestionInputChoice.trim())) {
      setNewQuestionMessage("This choice has already been added.");
      setNewQuestionInputChoice("");
      return;
    }
    setNewQuestionChoices([...newQuestionChoices, newQuestionInputChoice.trim()]);
    setNewQuestionInputChoice("");
    setNewQuestionMessage("");
  };

  const removeQuestionChoice = (choiceToRemove) => {
    setNewQuestionChoices(newQuestionChoices.filter((choice) => choice !== choiceToRemove));
    if (newQuestionCorrectAnswer === choiceToRemove) {
      setNewQuestionCorrectAnswer("");
    }
    setNewQuestionMessage("");
  };

  const handleSelectCorrectAnswer = (choice) => {
    setNewQuestionCorrectAnswer(choice);
    setNewQuestionMessage("");
  };

  const handleSaveNewQuestion = async () => {
    if (!newQuestionImage) {
      setNewQuestionMessage("Please upload an image for the new question.");
      return;
    }
    if (
      !newQuestionCorrectAnswer.trim() ||
      newQuestionChoices.length < 3 ||
      newQuestionChoices.length > 5
    ) {
      setNewQuestionMessage("Please select a correct answer and provide 3 to 5 choices.");
      return;
    }
    if (!newQuestionChoices.includes(newQuestionCorrectAnswer.trim())) {
      setNewQuestionMessage("The correct answer must be one of the choices.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setNewQuestionMessage("You are not logged in. Please log in again.");
      navigate("/login");
      return;
    }

    setNewQuestionMessage("Saving new question..."); // Provide feedback

    try {
      // 1. Submit the image to create the question and get its ID
      const formData = new FormData();
      formData.append("questionDescription", ""); // Set description/text as per previous logic
      formData.append("questionText", "");
      formData.append("image", newQuestionImage);
      formData.append("gameType", newQuestionGameType);

      const questionResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newQuestionId = questionResponse.data.questionId; // Get the ID of the newly created question

      // 2. Submit the choices for the newly created question
      let score = 0; // Assuming score is 1 for correct answer in this format
      for (const choice of newQuestionChoices) {
        const isCorrect = choice === newQuestionCorrectAnswer.trim();

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${newQuestionId}`,
          {
            choiceText: choice,
            correct: isCorrect,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isCorrect) {
          score = 1;
        }
      }

      // 3. Set the score for the newly created question
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${newQuestionId}`,
        null,
        {
          params: { scoreValue: score },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNewQuestionMessage("New question saved successfully!");

      // Reset the form for adding a new question
      setNewQuestionImage(null);
      setNewQuestionImagePreview(null);
      setNewQuestionChoices([]);
      setNewQuestionInputChoice("");
      setNewQuestionCorrectAnswer("");
      setNewQuestionGameType("guess_object");

      // Refetch the list of questions to show the newly added one
      fetchQuestions();
    } catch (err) {
      console.error("Failed to save new question:", err.response?.data || err.message);
      setNewQuestionMessage(`Failed to save new question: ${err.response?.data?.message || err.message}`);
    }
  };

  // --- Existing Question Management Logic ---

  const startEditingChoices = async (question) => {
    setEditingChoicesQuestionId(question.questionId);
    setEditingImageFile(null);
    setEditingImagePreview(
      question.questionImage
        ? (question.questionImage.startsWith("http")
          ? question.questionImage
          : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/${question.questionImage.replace(/^\/+/, "")}`)
        : null
    );
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${question.questionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEditingChoices(response.data);
      const correct = response.data.find((choice) => choice.correct === true);
      if (correct) {
        setEditingCorrectAnswer(correct.choiceText);
      } else {
        setEditingCorrectAnswer("");
      }
    } catch (err) {
      console.error("Failed to fetch choices:", err.response?.data || err.message);
      setQuestionMessages((prev) => ({
        ...prev,
        [question.questionId]: "Failed to fetch choices for editing. Please try again.",
      }));
    }
  };

  const handleEditingImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setQuestionMessages((prev) => ({
          ...prev,
          [editingChoicesQuestionId]: "File size exceeds the 10MB limit. Please upload a smaller file.",
        }));
        return;
      }
      setEditingImageFile(file);
      setEditingImagePreview(URL.createObjectURL(file));
      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: "",
      }));
    }
  };

  const handleEditingChoiceChange = (index, value) => {
    const newChoices = [...editingChoices];
    newChoices[index].choiceText = value;
    setEditingChoices(newChoices);
  };

  const handleEditingCorrectAnswerChange = (e) => {
    setEditingCorrectAnswer(e.target.value);
  };

  const saveEditedChoices = async () => {
    if (!editingChoicesQuestionId) return;

    if (!editingCorrectAnswer.trim()) {
      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: "Correct answer cannot be empty.",
      }));
      return;
    }

    if (!editingChoices.find((choice) => choice.choiceText === editingCorrectAnswer.trim())) {
      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: "The correct answer must be one of the choices being edited.",
      }));
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: "You are not logged in. Please log in again.",
      }));
      navigate("/login");
      return;
    }

    setQuestionMessages((prev) => ({
      ...prev,
      [editingChoicesQuestionId]: "Saving edited choices...",
    }));

    try {
      // If image changed, upload it with questionDescription and questionText (empty if not used)
      if (editingImageFile) {
        const formData = new FormData();
        formData.append("questionDescription", "");
        formData.append("questionText", "");
        formData.append("image", editingImageFile);

        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${editingChoicesQuestionId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      let score = 0;
      for (const choice of editingChoices) {
        const isCorrect = choice.choiceText === editingCorrectAnswer.trim();
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${choice.choiceId}`,
          { choiceText: choice.choiceText, correct: isCorrect },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (isCorrect) {
          score = 1;
        }
      }

      // Use PUT for score update, with scoreValue as a query param
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${editingChoicesQuestionId}/score`,
        null,
        {
          params: { scoreValue: score },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: "Choices and correct answer updated successfully!",
      }));

      setTimeout(() => {
        setEditingChoicesQuestionId(null);
        setEditingChoices([]);
        setEditingCorrectAnswer("");
        setEditingImageFile(null);
        setEditingImagePreview(null);
        setQuestionMessages((prev) => ({
          ...prev,
          [editingChoicesQuestionId]: "",
        }));
        fetchQuestions();
      }, 1200);
    } catch (err) {
      console.error("Failed to update choices:", err.response?.data || err.message);
      setQuestionMessages((prev) => ({
        ...prev,
        [editingChoicesQuestionId]: `Failed to update choices: ${err.response?.data?.message || err.message}`,
      }));
    }
  };

  const cancelEditingChoices = () => {
    setEditingChoicesQuestionId(null);
    setEditingChoices([]);
    setEditingCorrectAnswer("");
    setEditingImageFile(null);
    setEditingImagePreview(null);
    setQuestionMessages((prev) => ({
      ...prev,
      [editingChoicesQuestionId]: "Editing cancelled.",
    }));
  };

  const deleteQuestion = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setQuestionMessages((prev) => ({
        ...prev,
        [id]: "You are not logged in. Please log in again.",
      }));
      navigate("/login");
      return;
    }
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestionMessages((prev) => ({
        ...prev,
        [id]: "Deleting question...",
      }));
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuestionMessages((prev) => ({
          ...prev,
          [id]: "Question deleted successfully!",
        }));
        setQuestions(questions.filter((q) => q.questionId !== id));
        if (editingChoicesQuestionId === id) {
          cancelEditingChoices(); // Cancel editing if the deleted question was being edited
        }
      } catch (err) {
        console.error("Failed to delete question:", err.response?.data || err.message);
        setQuestionMessages((prev) => ({
          ...prev,
          [id]: `Failed to delete question: ${err.response?.data?.message || err.message}`,
        }));
      }
    }
  };

  const goBackToActivities = () => {
    navigate(`/classroom/${classroomId}`);
  };

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
          <Button
            variant="text"
            onClick={goBackToActivities}
            sx={{ color: "#388e3c", "&:hover": { color: "#2e7031" } }}
          >
            ← Back to Class
          </Button>
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
                      <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto" }}>
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
                          src={
                            question.questionImage.startsWith("http")
                              ? question.questionImage
                              : `${import.meta.env.VITE_API_BASE_URL.replace(
                                  /\/$/,
                                  ""
                                )}/${question.questionImage.replace(/^\/+/, "")}`
                          }
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