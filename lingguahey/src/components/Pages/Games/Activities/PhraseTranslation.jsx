import React, { useState } from "react";
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

function PhraseTranslation() {
  const [phrase, setPhrase] = useState("");
  const [translation, setTranslation] = useState("");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [questionIdCounter, setQuestionIdCounter] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedPhraseText, setEditedPhraseText] = useState("");
  const navigate = useNavigate();
  const { classroomId, activityId } = useParams();

  const handleSubmitQuestion = () => {
    if (!phrase || !translation) {
      setMessage("Please enter both a phrase and its translation.");
      return;
    }

    const newQuestion = {
      questionId: questionIdCounter,
      phrase: phrase,
      translation: translation,
    };

    setQuestions([...questions, newQuestion]);
    setMessage("Question submitted successfully!");
    setPhrase("");
    setTranslation("");
    setQuestionIdCounter(questionIdCounter + 1);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.questionId !== id));
    setMessage("Question deleted successfully!");
  };

  const startEditing = (id, currentPhrase) => {
    setEditingQuestionId(id);
    setEditedPhraseText(currentPhrase);
  };

  const saveEditedQuestion = (id) => {
    setQuestions(
      questions.map((q) =>
        q.questionId === id ? { ...q, phrase: editedPhraseText } : q
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

        {/* Translation Input */}
        <TextField
          label="Translation"
          variant="outlined"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ bgcolor: "white" }}
        />

        {/* Submit Button */}
        <Button variant="contained" onClick={handleSubmitQuestion} mt={3} color="primary">
          Submit Question
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
                  primary={`Phrase: ${question.phrase}`}
                  secondary={`Translation: ${question.translation}`}
                />
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => startEditing(question.questionId, question.phrase)}
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

export default PhraseTranslation;