import React, { useState, useEffect } from "react";
import {Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, IconButton, Grid,} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function WordTranslation() {
  const [word, setWord] = useState("");
  const [correctTranslation, setCorrectTranslation] = useState("");
  const [inputChoice, setInputChoice] = useState("");
  const [choices, setChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [isWordSubmitted, setIsWordSubmitted] = useState(false);
  const { activityId, classroomId } = useParams();
  const navigate = useNavigate();
  const [questionId, setQuestionId] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [editingChoiceId, setEditingChoiceId] = useState(null);
  const [editedChoiceText, setEditedChoiceText] = useState("");
  const [editingChoicesQuestionId, setEditingChoicesQuestionId] = useState(null);
  const [editingChoices, setEditingChoices] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await API.get(`/api/lingguahey/questions/activities/${activityId}`);
        setQuestions(response.data);
      } catch (err) {
        console.error("Failed to fetch questions:", err.response?.data || err.message);
        setMessage("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, [activityId]);

  const submitWord = async () => {
    console.log("submitWord function called");
    if (!word) {
      setMessage("Please enter a word to post.");
      return;
    }

    if (!token) {
      setMessage("You are not logged in. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("questionText", word);
      formData.append("questionDescription", "");
      formData.append("image", null);

      const response = await API.post(
        `/api/lingguahey/questions/activities/${activityId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Backend response:", response.data);
      console.log("response.data", response.data);

      setMessage("Word successfully submitted!");
      setIsWordSubmitted(true);
      setQuestions((prevQuestions) => [...prevQuestions, response.data]);

      if (response.data.questionId) {
        console.log("response.data.questionId", response.data.questionId);
        setQuestionId(response.data.questionId);
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
    console.log("addChoice function called");
    if (!inputChoice) {
      setMessage("Choice cannot be empty.");
      return;
    }

    setChoices([...choices, inputChoice]);
    console.log("choices array:", choices);
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

        await API.post(
          `/api/lingguahey/choices/questions/${questionId}`,
          {
            choiceText: choice,
            choiceOrder: isGeneratedChoice ? i + 1 : null,
            correct: isGeneratedChoice,
          }
        );

        if (isGeneratedChoice) {
          score++;
        }
      }

      await API.post(
        `/api/lingguahey/scores/questions/${questionId}`,
        null,
        {
          params: { scoreValue: score }
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
      await API.put(`/api/lingguahey/questions/${id}`, updatedData);
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
      await API.delete(`/api/lingguahey/questions/${id}`);
      setMessage("Question deleted successfully!");
      setQuestions(questions.filter((q) => q.questionId !== id));
    } catch (err) {
      console.error("Failed to delete question:", err.response?.data || err.message);
      setMessage("Failed to delete question. Please try again.");
    }
  };

  const editChoice = async (id, updatedData) => {
    try {
      await API.put(`/api/lingguahey/choices/${id}`, updatedData);
      setMessage("Choice updated successfully!");
      setChoices((prevChoices) =>
        prevChoices.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
      );
    } catch (err) {
      console.error("Failed to update choice:", err.response?.data || err.message);
      setMessage("Failed to update choice:", err.response?.data || err.message);
    }
  };

  const saveEditedChoice = async (id) => {
    try {
      await API.put(
        `/api/lingguahey/choices/${id}`,
        { choiceText: editedChoiceText }
      );
      setMessage("Choice updated successfully!");
      setChoices((prevChoices) =>
        prevChoices.map((c) => (c.id === id ? { ...c, choiceText: editedChoiceText } : c))
      );
      setEditingChoiceId(null);
    } catch (err) {
      console.error("Failed to update choice:", err.response?.data || err.message);
      setMessage("Failed to update choice. Please try again.");
    }
  };

  const deleteChoice = async (id) => {
    try {
      await API.delete(`/api/lingguahey/choices/${id}`);
      setMessage("Choice deleted successfully!");
      setChoices(choices.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete choice:", err.response?.data || err.message);
      setMessage("Failed to delete choice. Please try again.");
    }
  };

  const startEditingQuestion = (id, currentText) => {
    setEditingQuestionId(id);
    setEditedQuestionText(currentText);
  };

  const saveEditedQuestion = async (id) => {
    try {
      await API.put(
        `/api/lingguahey/questions/${id}`,
        { questionText: editedQuestionText }
      );
      setMessage("Question updated successfully!");
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.questionId === id ? { ...q, questionText: editedQuestionText } : q
        )
      );
      setEditingQuestionId(null);
    } catch (err) {
      console.error("Failed to update question:", err.response?.data || err.message);
      setMessage("Failed to update question. Please try again.");
    }
  };

  const startEditingChoice = (id, currentText) => {
    setEditingChoiceId(id);
    setEditedChoiceText(currentText);
  };

  const handleGoBackToActivities = () => {
    navigate(`/classroom/${classroomId}`);
  };

  const startEditingChoices = async (question) => {
    setEditingChoicesQuestionId(question.questionId);

    try {
      const response = await API.get(`/api/lingguahey/choices/questions/${question.questionId}`);
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
        await API.put(
          `/api/lingguahey/choices/${choice.choiceId}`,
          { choiceText: choice.choiceText }
        );
      }

      setMessage("Choices updated successfully!");
      setEditingChoicesQuestionId(null);

      const fetchQuestions = async () => {
        try {
          const response = await API.get(`/api/lingguahey/questions/activities/${activityId}`);
          setQuestions(response.data);
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
        <Button variant="contained" onClick={handleGoBackToActivities} sx={{ mb: 2, bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}>
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
        <Button variant="contained" onClick={submitWord} mt={3} color="primary" sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}>
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
        <Button variant="contained" onClick={addChoice} mt={3} color="primary" sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }} disabled={!isWordSubmitted}>
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
                {editingChoiceId === choice.id ? (
                  <TextField
                    variant="outlined"
                    value={editedChoiceText}
                    onChange={(e) => setEditedChoiceText(e.target.value)}
                    fullWidth
                    sx={{ bgcolor: "white" }}
                  />
                ) : (
                  <ListItemText primary={choice} />
                )}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {editingChoiceId === choice.id ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => saveEditedChoice(choice.id)}
                        sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setEditingChoiceId(null)}
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
                    </>
                  )}
                </Box>
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
          sx={{ bgcolor: "#81D4FA", color: "black", '&:hover': { bgcolor: "#4FC3F7" } }}
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
                  <ListItemText
                    primary={`Word: ${question.questionText}`}
                    secondary={`Choices: ${question.choices ? question.choices.map(choice => choice.choiceText).join(', ') : 'No choices'}`}
                  />
                )}
                <Box>
                  {editingQuestionId === question.questionId ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => saveEditedQuestion(question.questionId)}
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
                        bgcolor: "#c8e3e3",
                        input: { color: "black" },
                        label: { color: "#BDBDBD" },
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
                >
                  Save Choices
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setEditingChoicesQuestionId(null)}
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