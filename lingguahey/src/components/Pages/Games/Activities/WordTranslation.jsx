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

function WordTranslation() {
  const [word, setWord] = useState("");
  const [correctTranslation, setCorrectTranslation] = useState("");
  const [inputChoice, setInputChoice] = useState("");
  const [choices, setChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [questionIdCounter, setQuestionIdCounter] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [isCorrectAnswerInChoices, setIsCorrectAnswerInChoices] = useState(false);
  const navigate = useNavigate();
  const { classroomId, activityId } = useParams();

  useEffect(() => {
    setIsCorrectAnswerInChoices(choices.includes(correctTranslation));
  }, [correctTranslation, choices]);

  const addChoice = () => {
    if (!inputChoice) {
      setMessage("Choice cannot be empty.");
      return;
    }

    setChoices([...choices, inputChoice]);
    setInputChoice("");
    setMessage("Choice added successfully.");
  };

  const removeChoice = (choice) => {
    setChoices(choices.filter((c) => c !== choice));
    setMessage("Choice removed successfully.");
  };

  const handleSubmit = () => {
    if (!word || !correctTranslation || choices.length < 3) {
      setMessage("Please fill in all fields and ensure at least 3 choices are generated.");
      return;
    }

    if (!isCorrectAnswerInChoices) {
      setMessage("Correct answer must be included in the choices.");
      return;
    }

    const newQuestion = {
      questionId: questionIdCounter,
      questionText: word,
      correctTranslation: correctTranslation,
      choices: choices,
    };

    setQuestions([...questions, newQuestion]);
    setMessage("Word and choices successfully submitted!");
    setWord("");
    setCorrectTranslation("");
    setChoices([]);
    setQuestionIdCounter(questionIdCounter + 1);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.questionId !== id));
    setMessage("Question deleted successfully!");
  };

  const startEditing = (id, currentText) => {
    setEditingQuestionId(id);
    setEditedQuestionText(currentText);
  };

  const saveEditedQuestion = (id) => {
    setQuestions(
      questions.map((q) =>
        q.questionId === id ? { ...q, questionText: editedQuestionText } : q
      )
    );
    setMessage("Question updated successfully!");
    setEditingQuestionId(null);
  };

  const handleGoBackToActivities = () => {
    navigate(`/classroom/${classroomId}/activities/${activityId}`);
  };

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
      <Box p={3} sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
        <Button variant="contained" onClick={handleGoBackToActivities} sx={{ mb: 2 }}>
          Back to Activities
        </Button>
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3} align="center">
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

        {/* Correct Answer Input */}
        <TextField
          label="Correct Answer"
          variant="outlined"
          value={correctTranslation}
          onChange={(e) => setCorrectTranslation(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
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
        />
        <Button variant="contained" onClick={addChoice} mt={3} color="primary">
          Add Choice
        </Button>

        {/* Choices List */}
        <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black", mt: 4 }}>
          <Typography variant="h6" color="black" mb={2}>
            Choices
          </Typography>
          <List>
            {choices.map((choice, index) => (
              <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                <ListItemText primary={choice} />
                <IconButton edge="end" aria-label="delete" onClick={() => removeChoice(choice)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          mt={3}
          disabled={!isCorrectAnswerInChoices}
          color="primary"
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
        <List sx={{ width: '100%' }}>
          {questions.map((question) => (
            <Paper key={question.questionId} elevation={3} sx={{ mt: 2, p: 2, width: '100%' }}>
              <ListItem alignItems="flex-start" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText
                  primary={`Word: ${question.questionText}`}
                  secondary={`Choices: ${question.choices.join(", ")}`}
                />
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => startEditing(question.questionId, question.questionText)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteQuestion(question.questionId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    </Grid>
  );
}

export default WordTranslation;