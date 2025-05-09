import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function WordTranslation() {
  const [word, setWord] = useState(""); // State for the word to be posted
  const [correctTranslation, setCorrectTranslation] = useState(""); // State for the correct answer
  const [inputChoice, setInputChoice] = useState(""); // State for the current choice input
  const [choices, setChoices] = useState([]); // State for the list of choices
  const [questions, setQuestions] = useState([]); // State for the list of questions
  const [message, setMessage] = useState(""); // State for success or error messages
  const [isWordSubmitted, setIsWordSubmitted] = useState(false); // Track if the word is submitted
  const { activityId, classroomId } = useParams();
  const navigate = useNavigate();
  const [questionId, setQuestionId] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null); // Track the question being edited
  const [editedQuestionText, setEditedQuestionText] = useState(""); // Track the edited text
  const [editingChoicesQuestionId, setEditingChoicesQuestionId] = useState(null); // Track the question being edited
  const [editingChoices, setEditingChoices] = useState([]); // Track the choices being edited

  // Fetch questions for the activity
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
            },
          }
        );
        setQuestions(response.data); // Store the questions in state
      } catch (err) {
        console.error("Failed to fetch questions:", err.response?.data || err.message);
        setMessage("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, [activityId]);

  const submitWord = async () => {
    if (!word) {
      setMessage("Please enter a word to post.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not logged in. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      // Use a FormData object to send as multipart/form-data
      const formData = new FormData();
      formData.append("questionText", word); // Add the word as questionText
      formData.append("questionDescription", ""); // Add an empty description (or set a value if needed)
      formData.append("image", null); // Add null for the image (or attach a file if needed)

      // Post the word to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token
            "Content-Type": "multipart/form-data", // Set the correct Content-Type
          },
        }
      );

      console.log("Backend response:", response.data); // Log the backend response

      setMessage("Word successfully submitted!");
      setIsWordSubmitted(true);
      setQuestions((prevQuestions) => [...prevQuestions, response.data]); // Add the new question to the list

      // Get the questionId from the backend response
      if (response.data.questionId) {
        setQuestionId(response.data.questionId); // Use response.data.questionId
      } else {
        console.error("No questionId found in the response.");
        setMessage("Failed to retrieve question ID. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit word:", err.response?.data || err.message);
      setMessage("Failed to submit word. Please try again.");
    }
  };

  const addChoice = () => {
    if (!inputChoice) {
      setMessage("Choice cannot be empty.");
      return;
    }

    setChoices([...choices, inputChoice]); // Add the choice to the local state
    setInputChoice("");
    setMessage("Choice added successfully.");
  };

  const removeChoice = (choice) => {
    setChoices(choices.filter((c) => c !== choice));
    setMessage("Choice removed successfully.");
  };

  const handleSubmit = async () => {
    if (!correctTranslation || choices.length < 3) {
      setMessage("Please fill in all fields and ensure at least 3 choices are generated.");
      return;
    }

    try {
      if (!questionId) {
        setMessage("No question ID found. Please submit a phrase first.");
        return;
      }

      let score = 0;

      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        const isGeneratedChoice = correctTranslation.split(" ").includes(choice);

        // Add the choice to the backend
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${questionId}`,
          {
            choiceText: choice,
            choiceOrder: isGeneratedChoice ? i + 1 : null, // Add choiceOrder for generated choices, null for manual choices
            correct: isGeneratedChoice, // True for generated choices, false for manual choices
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
            },
          }
        );

        // Increment score if the choice is correct
        if (isGeneratedChoice) {
          score++;
        }
      }

      // Set the score for the question
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${questionId}`,
        null,
        {
          params: { scoreValue: score },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
          },
        }
      );

      setMessage("Choices and score successfully added to the question!");
      setCorrectTranslation("");
      setChoices([]);
      setWord("");
      setIsWordSubmitted(false);
      setQuestionId(null);
    } catch (err) {
      console.error("Failed to add choices or score:", err.response?.data || err.message);
      setMessage("Failed to add choices or score. Please try again.");
    }
  };

  const editQuestion = async (id, updatedData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Question updated successfully!");
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.questionId === id ? { ...q, ...updatedData } : q))
      );
    } catch (err) {
      console.error("Failed to update question:", err.response?.data || err.message);
      setMessage("Failed to update question. Please try again.");
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Question deleted successfully!");
      setQuestions(questions.filter((q) => q.questionId !== id)); // Remove from local state
    } catch (err) {
      console.error("Failed to delete question:", err.response?.data || err.message);
      setMessage("Failed to delete question. Please try again.");
    }
  };

  const deleteChoice = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Choice deleted successfully!");
      setChoices(choices.filter((c) => c.id !== id)); // Remove from local state
    } catch (err) {
      console.error("Failed to delete choice:", err.response?.data || err.message);
      setMessage("Failed to delete choice. Please try again.");
    }
  };

  const startEditing = (id, currentText) => {
    setEditingQuestionId(id);
    setEditedQuestionText(currentText);
  };

  const saveEditedQuestion = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        { questionText: editedQuestionText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Question updated successfully!");
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.questionId === id ? { ...q, questionText: editedQuestionText } : q
        )
      );
      setEditingQuestionId(null); // Exit editing mode
    } catch (err) {
      console.error("Failed to update question:", err.response?.data || err.message);
      setMessage("Failed to update question. Please try again.");
    }
  };

  const startEditingChoices = async (question) => {
    setEditingChoicesQuestionId(question.questionId);
    setEditedQuestionText(question.questionText);

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
    } catch (err) {
      console.error("Failed to fetch choices:", err.response?.data || err.message);
      setMessage("Failed to fetch choices. Please try again.");
    }
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...editingChoices];
    newChoices[index].choiceText = value;
    setEditingChoices(newChoices);
  };

  const saveEditedChoices = async (questionId) => {
    try {
      for (const choice of editingChoices) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${choice.choiceId}`,
          { choiceText: choice.choiceText },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      setMessage("Choices updated successfully!");
      setEditingChoicesQuestionId(null);

      // Refetch questions to update the list
      const fetchQuestions = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
              },
            }
          );
          setQuestions(response.data); // Set the questions in state
        } catch (err) {
          console.error("Failed to fetch questions:", err.response?.data || err.message);
          setMessage("Failed to fetch questions. Please try again.");
        }
      };

      fetchQuestions();
    } catch (err) {
      console.error("Failed to update choices:", err.response?.data || err.message);
      setMessage("Failed to update choices. Please try again.");
    }
  };

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E0F7FA", p: 2 }}>
      <Box p={3} sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
        <Button
          variant="contained"
          onClick={() => navigate(`/classroom/${classroomId}`)}
          sx={{ mb: 2, bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
        >
          Back to Activities
        </Button>
        <Typography variant="h4" fontWeight="bold" color="#0277BD" mb={3} align="center">
          Word Translation
        </Typography>

        {/* Word Input */}
        <TextField
          label="Word to Post"
          variant="outlined"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
        />
        <Button
          variant="contained"
          onClick={submitWord}
          mt={3}
          color="primary"
          sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
        >
          Submit Word
        </Button>

        {/* Correct Answer Input */}
        <TextField
          label="Correct Answer"
          variant="outlined"
          value={correctTranslation}
          onChange={(e) => setCorrectTranslation(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
          disabled={!isWordSubmitted}
        />

        {/* Add Choice Input */}
        <TextField
          label="Add Choice"
          variant="outlined"
          value={inputChoice}
          onChange={(e) => setInputChoice(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
          disabled={!isWordSubmitted}
        />
        <Button
          variant="contained"
          onClick={addChoice}
          mt={3}
          color="primary"
          sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
          disabled={!isWordSubmitted}
        >
          Add Choice
        </Button>

        {/* Choices List */}
        <Paper sx={{ bgcolor: "#B2EBF2", p: 2, color: "black", mt: 4 }}>
          <Typography variant="h6" color="black" mb={2}>
            Choices
          </Typography>
          <List>
            {choices.map((choice, index) => (
              <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                <ListItemText primary={choice} />
                {/*<Box sx={{ display: "flex", gap: 2 }}>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => startEditingChoice(choice.id, choice.choiceText || choice)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteChoice(choice.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>*/}
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          mt={3}
          color="primary"
          disabled={!isWordSubmitted}
          sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
        >
          Save Word and Choices
        </Button>

        {message && (
          <Typography mt={2} color={message.startsWith("Failed") ? "error" : "success"}>
            {message}
          </Typography>
        )}

        {/* List of Questions */}
        <Typography variant="h6" mt={4} color="black">
          Questions:
        </Typography>
        <List sx={{ width: "100%" }}>
          {questions.map((question) => (
            <Paper key={question.questionId} elevation={3} sx={{ mt: 2, p: 2, width: "100%" }}>
              <ListItem alignItems="flex-start" sx={{ display: "flex", justifyContent: "space-between" }}>
                {editingQuestionId === question.questionId ? (
                  <TextField
                    value={editedQuestionText}
                    onChange={(e) => setEditedQuestionText(e.target.value)}
                    fullWidth
                  />
                ) : (
                  <ListItemText primary={`Word: ${question.questionText}`} />
                )}
                <Box>
                  {editingQuestionId === question.questionId ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => saveEditedQuestion(question.questionId)}
                        sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setEditingQuestionId(null)}
                        sx={{ bgcolor: "#E57373", color: "black", "&:hover": { bgcolor: "#F44336" } }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {/*<IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => startEditingQuestion(question.questionId, question.questionText)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteQuestion(question.questionId)}
                      >
                        <DeleteIcon />
                      </IconButton>*/}
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => startEditingChoices(question)}
                        sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
                      >
                        Edit Choices
                      </Button>
                    </>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>

        {editingChoicesQuestionId && (
          <Box mt={4}>
            <Typography variant="h6" color="black" mb={2}>
              Edit Choices for Question
            </Typography>
            <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
              <List>
                {editingChoices.map((choice, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                    <TextField
                      label={`Choice ${index + 1}`}
                      variant="outlined"
                      value={choice.choiceText}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      fullWidth
                      sx={{
                        bgcolor: "white",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box mt={2} sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => saveEditedChoices(editingChoicesQuestionId)}
                  sx={{ bgcolor: "#81D4FA", color: "black", "&:hover": { bgcolor: "#4FC3F7" } }}
                >
                  Save Choices
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setEditingChoicesQuestionId(null)}
                  sx={{ bgcolor: "#E57373", color: "black", "&:hover": { bgcolor: "#F44336" } }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Grid>
  );
}

export default WordTranslation;