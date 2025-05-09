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

function PhraseTranslation() {
  const [phrase, setPhrase] = useState(""); // State for the phrase to be posted
  const [translation, setTranslation] = useState(""); // State for the correct translation
  const [inputChoice, setInputChoice] = useState(""); // State for the manually added choice
  const [choices, setChoices] = useState([]); // State for the list of choices
  const [questions, setQuestions] = useState([]); // State for the list of questions
  const [message, setMessage] = useState(""); // State for success or error messages
  const [isPhraseSubmitted, setIsPhraseSubmitted] = useState(false); // Track if the phrase is submitted
  const [questionId, setQuestionId] = useState(null); // State for the current questionId
  const [editingQuestionId, setEditingQuestionId] = useState(null); // Track the question being edited
  const [editedPhrase, setEditedPhrase] = useState(""); // Track the edited phrase
  const [editingChoicesQuestionId, setEditingChoicesQuestionId] = useState(null); // Track the question being edited
  const [editingChoices, setEditingChoices] = useState([]); // Track the choices being edited
  const { activityId, classroomId } = useParams();
  const navigate = useNavigate();

  // Fetch questions for the activity
  useEffect(() => {
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
        setMessage("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, [activityId]);

  const submitPhrase = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not logged in. Please log in again.");
      navigate("/login");
      return;
    }

    if (!phrase) {
      setMessage("Please enter a phrase to post.");
      return;
    }

    try {
      // Use a FormData object to send as multipart/form-data
      const formData = new FormData();
      formData.append("questionDescription", phrase); // Add the phrase as questionDescription
      formData.append("questionText", null); // Explicitly set to null
      formData.append("image", null); // Add null for the image (or attach a file if needed)

      // Post the phrase to the backend
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

      setMessage("Phrase successfully submitted!");
      setIsPhraseSubmitted(true);
      setQuestions((prevQuestions) => [...prevQuestions, response.data]); // Add the new question to the list

      // Get the questionId from the backend response
      if (response.data.questionId) {
        setQuestionId(response.data.questionId); // Use response.data.questionId
      } else {
        console.error("No questionId found in the response.");
        setMessage("Failed to retrieve question ID. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit phrase:", err.response?.data || err.message);
      setMessage("Failed to submit phrase. Please try again.");
    }
  };

  const generateChoicesFromPhrase = () => {
    if (!translation) {
      setMessage("Please enter the correct translation.");
      return;
    }

    // Split the correct translation into words and shuffle them
    const words = translation.split(" ");
    const shuffledWords = words.sort(() => Math.random() - 0.5);

    setChoices(shuffledWords); // Set the shuffled words as choices
    setMessage("Choices generated from the correct translation.");
  };

  const addManualChoice = () => {
    if (!inputChoice) {
      setMessage("Choice cannot be empty.");
      return;
    }

    setChoices([...choices, inputChoice]); // Add the manually entered choice to the list
    setInputChoice(""); // Clear the input field
    setMessage("Choice added successfully.");
  };

  const removeChoice = (choice) => {
    setChoices(choices.filter((c) => c !== choice));
    setMessage("Choice removed successfully.");
  };

  const handleSubmit = async () => {
    if (!translation || choices.length < 3) {
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
        const isGeneratedChoice = translation.split(" ").includes(choice);

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

      // Reset the form fields
      setTranslation("");
      setChoices([]);
      setPhrase("");
      setIsPhraseSubmitted(false);
      setQuestionId(null); // Reset questionId for the next entry
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
      setMessage("Phrase updated successfully!");
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.questionId === id ? { ...q, ...updatedData } : q))
      );
      setEditingQuestionId(null); // Exit editing mode
    } catch (err) {
      console.error("Failed to update phrase:", err.response?.data || err.message);
      setMessage("Failed to update phrase. Please try again.");
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Phrase deleted successfully!");
      setQuestions(questions.filter((q) => q.questionId !== id)); // Remove from local state
    } catch (err) {
      console.error("Failed to delete phrase:", err.response?.data || err.message);
      setMessage("Failed to delete phrase. Please try again.");
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

  const startEditing = (id, currentPhrase) => {
    setEditingQuestionId(id);
    setEditedPhrase(currentPhrase);
  };

  const saveEditedPhrase = async (id) => {
    await editQuestion(id, { questionDescription: editedPhrase });
  };

  const startEditingChoices = async (question) => {
    setEditingChoicesQuestionId(question.questionId);
    setEditedPhrase(question.questionDescription);

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
        <Button variant="contained" onClick={() => navigate(`/classroom/${classroomId}`)} sx={{ mb: 2, bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}>
          Back to Activities
        </Button>
        <Typography variant="h4" fontWeight="bold" color="#0277BD" mb={3} align="center">
          Phrase Translation
        </Typography>

        {/* Phrase Input */}
        <TextField
          label="Phrase"
          variant="outlined"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
        />
        <Button variant="contained" onClick={submitPhrase} mt={3} color="primary" sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}>
          Submit Phrase
        </Button>

        {/* Translation Input */}
        <TextField
          label="Translation"
          variant="outlined"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
          disabled={!isPhraseSubmitted}
        />

        {/* Generate Choices Button */}
        <Button
          variant="contained"
          onClick={generateChoicesFromPhrase}
          mt={3}
          color="primary"
          disabled={!isPhraseSubmitted}
          sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
        >
          Generate Choices
        </Button>

        {/* Manual Choice Input */}
        <TextField
          label="Add Manual Choice"
          variant="outlined"
          value={inputChoice}
          onChange={(e) => setInputChoice(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
        />

        {/* Add Manual Choice Button */}
        <Button
          variant="contained"
          onClick={addManualChoice}
          mt={3}
          color="primary"
          sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
        >
          Add Choice
        </Button>

        {/* Display Choices */}
        <Typography variant="h6" mt={4} color="black">
          Choices:
        </Typography>
        <List sx={{ width: "100%" }}>
          {choices.map((choice, index) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", color: "black" }}>
              <ListItemText primary={choice.choiceText || choice} />
            </ListItem>
          ))}
        </List>

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          mt={3}
          color="primary"
          disabled={!isPhraseSubmitted}
          sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
        >
          Save Translation
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
                    value={editedPhrase}
                    onChange={(e) => setEditedPhrase(e.target.value)}
                    fullWidth
                  />
                ) : (
                  <ListItemText
                    primary={`Phrase: ${question.questionDescription}`}
                  />
                )}
                <Box>
                  {editingQuestionId === question.questionId ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => saveEditedPhrase(question.questionId)}
                        sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setEditingQuestionId(null)}
                        sx={{ bgcolor: "#E57373", color: "black", '&:hover': { bgcolor: "#F44336" } }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => startEditing(question.questionId, question.questionDescription)}
                      >
                        <EditIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => startEditingChoices(question)}
                      >
                        Edit Choices
                      </Button>
                      <IconButton
                        variant="contained"
                        color="error"
                        onClick={() => deleteQuestion(question.questionId)}
                      >
                      <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    </Grid>
  );
}

export default PhraseTranslation;