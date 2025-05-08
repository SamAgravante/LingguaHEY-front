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

function OnePicFourWords() {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [questionIdCounter, setQuestionIdCounter] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [isCorrectAnswerInChoices, setIsCorrectAnswerInChoices] = useState(false);
  const navigate = useNavigate();
  const { classroomId, activityId } = useParams();

  useEffect(() => {
    const correctAnswer = choices[correctAnswerIndex] || "";
    setIsCorrectAnswerInChoices(choices.includes(correctAnswer));
  }, [choices, correctAnswerIndex]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleCorrectAnswerChange = (index) => {
    setCorrectAnswerIndex(index);
  };

  const handleSubmitQuestion = () => {
    if (!selectedImage || choices.some((choice) => choice === "")) {
      setMessage("Please upload an image and fill in all choices.");
      return;
    }

    if (!isCorrectAnswerInChoices) {
      setMessage("Correct answer must be included in the choices.");
      return;
    }

    const newQuestion = {
      questionId: questionIdCounter,
      imagePreview: imagePreview,
      choices: choices,
      correctAnswerIndex: correctAnswerIndex,
    };

    setQuestions([...questions, newQuestion]);
    setMessage("Question submitted successfully!");
    setSelectedImage(null);
    setImagePreview(null);
    setChoices(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setQuestionIdCounter(questionIdCounter + 1);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.questionId !== id));
    setMessage("Question deleted successfully!");
  };

  const startEditing = (id) => {
    setEditingQuestionId(id);
  };

  const saveEditedQuestion = (id) => {
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
          One Pic Four Words
        </Typography>

        {/* Image Upload */}
        {imagePreview && (
          <Box mt={2} mb={2}>
            <img src={imagePreview} alt="Uploaded" style={{ maxWidth: "200px", maxHeight: "200px" }} />
          </Box>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          id="image-upload"
          style={{ display: "none" }}
        />
        <label htmlFor="image-upload">
          <Button variant="contained" component="span" color="primary">
            Upload Image
          </Button>
        </label>

        {/* Choices */}
        <Typography variant="h6" mt={2} color="black">
          Choices:
        </Typography>
        {choices.map((choice, index) => (
          <TextField
            key={index}
            label={`Choice ${index + 1}`}
            value={choice}
            onChange={(e) => handleChoiceChange(index, e.target.value)}
            fullWidth
            margin="normal"
            sx={{ bgcolor: "white" }}
          />
        ))}

        {/* Correct Answer */}
        <Typography variant="h6" mt={2} color="black">
          Correct Answer:
        </Typography>
        {choices.map((choice, index) => (
          <Box key={index} mt={1}>
            <label style={{ color: "black" }}>
              <input
                type="radio"
                name="correctAnswer"
                value={index}
                checked={correctAnswerIndex === index}
                onChange={() => handleCorrectAnswerChange(index)}
              />
              {`Choice ${index + 1}`}
            </label>
          </Box>
        ))}

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmitQuestion}
          mt={3}
          color="primary"
          disabled={!isCorrectAnswerInChoices}
        >
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
                  primary={`Question ID: ${question.questionId}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="black">
                        Choices: {question.choices ? question.choices.join(", ") : "No choices"}
                      </Typography>
                      {/*<Typography component="span" variant="body2" color="gray">
                        Correct Answer Index: {question.correctAnswerIndex}
                      </Typography>*/}
                    </React.Fragment>
                  }
                />
                <Box>
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

export default OnePicFourWords;