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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function OnePicFourWords() {
  const [image, setImage] = useState(null); // State for the uploaded image
  const [choices, setChoices] = useState([]); // State for the list of choices
  const [inputChoice, setInputChoice] = useState(""); // State for the current choice input
  const [correctAnswer, setCorrectAnswer] = useState(""); // State for the correct answer
  const [questions, setQuestions] = useState([]); // State for the list of questions
  const [message, setMessage] = useState(""); // State for success or error messages
  const [isImageSubmitted, setIsImageSubmitted] = useState(false); // Track if the image is submitted
  const [questionId, setQuestionId] = useState(null); // State for the current questionId
  const { activityId, classroomId } = useParams();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [editingChoicesQuestionId, setEditingChoicesQuestionId] = useState(null);
  const [editingChoices, setEditingChoices] = useState([]);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setMessage("File size exceeds the 10MB limit. Please upload a smaller file.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
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
      // Optionally refetch questions
    } catch (err) {
      console.error("Failed to update question:", err.response?.data || err.message);
      setMessage("Failed to update question. Please try again.");
    }
  };

  const editQuestionImage = async (id, newImage) => {
    if (!newImage) {
      setMessage("Please select a new image to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", newImage); // Add the new image file

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data", // Ensure correct content type
          },
        }
      );

      setMessage("Image updated successfully!");
      // Optionally refetch questions to reflect the updated image
      // setQuestions((prevQuestions) =>
      //   prevQuestions.map((q) =>
      //     q.questionId === id ? { ...q, questionImage: URL.createObjectURL(newImage) } : q
      //   )
      // );
    } catch (err) {
      console.error("Failed to update image:", err.response?.data || err.message);
      setMessage("Failed to update image. Please try again.");
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

  const editChoice = async (id, updatedData) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Choice updated successfully!");
    } catch (err) {
      console.error("Failed to update choice:", err.response?.data || err.message);
      setMessage("Failed to update choice. Please try again.");
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
      setChoices(choices.filter((c) => c !== id)); // Remove from local state
    } catch (err) {
      console.error("Failed to delete choice:", err.response?.data || err.message);
      setMessage("Failed to delete choice. Please try again.");
    }
  };

  const submitImage = async () => {
    if (!image) {
      setMessage("Please upload an image.");
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
      formData.append("questionDescription", "null"); // Set questionDescription to null
      formData.append("questionText", "null"); // Set questionText to null
      formData.append("image", image); // Add the image file

      // Post the image to the backend
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

      setMessage("Image successfully submitted!");
      setIsImageSubmitted(true);
      setQuestions((prevQuestions) => [...prevQuestions, response.data]); // Add the new question to the list
      setQuestionId(response.data.questionId); // Set the questionId from the backend response
    } catch (err) {
      console.error("Failed to submit image:", err.response?.data || err.message);
      setMessage(`Failed to submit image: ${err.response?.data?.message || err.message}`);
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
    if (!correctAnswer || choices.length < 3) {
      setMessage("Please fill in all fields and add at least 3 choices.");
      return;
    }

    if (!choices.includes(correctAnswer)) {
      setMessage("The correct answer must be one of the choices.");
      return;
    }

    try {
      if (!questionId) {
        setMessage("No question ID found. Please submit an image first.");
        return;
      }

      let score = 0;

      for (const choice of choices) {
        const isCorrect = choice === correctAnswer;

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${questionId}`,
          {
            choiceText: choice,
            correct: isCorrect, 
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
            },
          }
        );

        // Increment score if the choice is correct
        if (isCorrect) {
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
      setCorrectAnswer("");
      setChoices([]);
      setImage(null);
      setImagePreview(null);
      setIsImageSubmitted(false);
      setQuestionId(null); // Reset questionId for the next entry
    } catch (err) {
      console.error("Failed to add choices or score:", err.response?.data || err.message);
      setMessage("Failed to add choices or score. Please try again.");
    }
  };

  const startEditingChoices = async (question) => {
    setEditingChoicesQuestionId(question.questionId);

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
          One Pic Four Words
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography color="black" fontWeight="bold">
            Upload Image:
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ color: "black", bgcolor: "#81D4FA", "&:hover": { bgcolor: "#4FC3F7" } }}
          >
            Upload Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
          {image && <Typography color="black">Selected File: {image.name}</Typography>}
          {imagePreview && (
            <Box mt={2}>
              <Typography color="black">Image Preview:</Typography>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", maxHeight: "300px", objectFit: "contain", marginTop: "10px" }}
              />
            </Box>
          )}
          <Button
            variant="contained"
            onClick={submitImage}
            sx={{
              color: "black",
              bgcolor: "#81D4FA",
              "&:hover": { bgcolor: "#4FC3F7" },
            }}
          >
            Submit Image
          </Button>

          <TextField
            label="Correct Answer"
            variant="outlined"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            fullWidth
            sx={{
              bgcolor: "white",
            }}
          />
          {/* Add Choice Input */}
          <TextField
            label="Add Choice"
            variant="outlined"
            value={inputChoice}
            onChange={(e) => setInputChoice(e.target.value)}
            fullWidth
            sx={{
              bgcolor: "white",
            }}
          />
          <Button
            variant="contained"
            onClick={addChoice}
            disabled={!isImageSubmitted} // Disable if the image is not submitted
            sx={{
              color: "black",
              bgcolor: "#81D4FA",
              "&:hover": { bgcolor: "#4FC3F7" },
            }}
          >
            Add Choice
          </Button>

          <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
            <Typography variant="h6" color="black" mb={2}>
              Choices
            </Typography>
            <List>
              {choices.map((choice, index) => (
                <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText primary={choice} />
                  {/*<Button
                    variant="text"
                    color="error"
                    onClick={() => removeChoice(choice)}
                  >
                    Remove
                  </Button>*/}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box mt={4}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              color: "black",
              bgcolor: "#81D4FA",
              "&:hover": { bgcolor: "#4FC3F7" },
            }}
          >
            Save Choices
          </Button>
        </Box>

        {message && (
          <Typography color="black" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        {/* List of Questions */}
        <Box mt={4}>
          <Typography variant="h6" color="black" mb={2}>
            List of Questions
          </Typography>
          <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
            <List>
              {questions.length > 0 ? (
                questions.map((question, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {/* Display the image */}
                      {question.questionImage && (
                        <img
                          src={
                            question.questionImage.startsWith("http")
                              ? question.questionImage
                              : `${import.meta.env.VITE_API_BASE_URL.replace(
                                  /\/$/,
                                  ""
                                )}/${question.questionImage.replace(/^\//, "")}`
                          }
                          alt={`Question ${index + 1}`}
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "contain",
                            marginBottom: "10px",
                          }}
                        />
                      )}
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => startEditingChoices(question)}
                          sx={{
                            color: "black",
                            bgcolor: "#81D4FA",
                            "&:hover": { bgcolor: "#4FC3F7" },
                          }}
                        >
                          Edit Choices
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => deleteQuestion(question.questionId)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography color="black">No questions available.</Typography>
              )}
            </List>
          </Paper>
        </Box>
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
                  sx={{
                    color: "black",
                    bgcolor: "#81D4FA",
                    "&:hover": { bgcolor: "#4FC3F7" },
                  }}
                >
                  Save Choices
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setEditingChoicesQuestionId(null)}
                  sx={{
                    color: "black",
                    bgcolor: "#E57373",
                    "&:hover": { bgcolor: "#F44336" },
                  }}
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

export default OnePicFourWords;