import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField, // Import TextField
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { jwtDecode } from "jwt-decode";
//import API from "../../api";

// Import game components
import LiveActOnePicFourWords from "./LiveActOnePicFourWords";
import LiveActPhraseTranslation from "./LiveActPhraseTranslation";
import LiveActWordTranslation from "./LiveActWordTranslation";

const LiveActClassroom = () => {
  const navigate = useNavigate();
  const { classroomId, classroomName } = useParams();
  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState(""); // Use newActivityName
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [students, setStudents] = useState([]);

  //Dialogs State
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null); // Changed from classroomId to student
  const [studentId, setStudentId] = useState(""); // State for student ID input

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteDialogMessage, setDeleteDialogMessage] = useState("");
  const [activityToDelete, setActivityToDelete] = useState(null);

  // New state for "Go To Activity" dialog
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null); // Changed from gameType to questionType
  const [questionText, setQuestionText] = useState("");
  const [activityQuestions, setActivityQuestions] = useState([]);

  // New state for edit question dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const openRemoveStudentDialog = (student) => {
    setSelectedStudent(student);
    setDialogMessage(`Are you sure you want to remove ${student.firstName} ${student.lastName}?`);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setDialogMessage("");
    setSelectedStudent(null);
  };

  const openDeleteActivityDialog = (activity) => {
    setActivityToDelete(activity);
    setDeleteDialogMessage(`Are you sure you want to delete ${activity.activity_ActivityName}?`);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteDialogMessage("");
    setActivityToDelete(null);
  };

  const handleConfirmRemoveStudent = async () => {
    try {
      await API.delete(`/api/lingguahey/classrooms/${classroomId}/students/${selectedStudent.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents((prevStudents) => prevStudents.filter((s) => s.userId !== selectedStudent.userId));
      setDialogMessage("Student removed successfully.");
    } catch (err) {
      console.error("Error removing student:", err.response?.data || err.message);
      setDialogMessage("Failed to remove student. Please try again.");
    } finally {
      closeDialog();
    }
  };

  const handleConfirmDeleteActivity = async () => {
    try {
      await API.delete(`/api/lingguahey/live-activities/${activityToDelete.activity_ActivityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivities(activities.filter((activity) => activity.activity_ActivityId !== activityToDelete.activity_ActivityId));
      //alert("Activity deleted successfully.");
    } catch (err) {
      console.error("Error deleting activity:", err.response?.data || err.message);
      //alert("Failed to delete activity. Please try again.");
    } finally {
      closeDeleteDialog();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // Assuming the token contains the user's role
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Failed to decode token. Please try again later.");
      }
    }
  }, []);

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
    if (classroomId) {
      const fetchClassroom = async () => {
        try {
          const response = await API.get(`/api/lingguahey/classrooms/${classroomId}`);
          setClassroom(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching classroom:", err.response?.data || err.message);
          setError("Failed to fetch classroom. Please try again later.");
          setLoading(false);
        }
      };

      fetchClassroom();
    }
  }, [classroomId]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await API.get(`/api/lingguahey/live-activities/${classroomId}/live-activities`);
        setActivities(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err.response?.data || err.message);
        setError("Failed to fetch activities. Please try again later.");
      }
    };

    fetchActivities();
  }, [classroomId]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await API.get(`/api/lingguahey/classrooms/${classroomId}/students`);
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err.response?.data || err.message);
        setError("Failed to fetch students. Please try again later.");
      }
    };

    fetchStudents();
  }, [classroomId]);

  const createActivity = async () => {
    try {
      const response = await API.post(`/api/lingguahey/live-activities/classrooms/${classroomId}`, {
        activityIdd: "",
        activityName: newActivityName, // Use newActivityName
        completed: false,
        questions: [],
      });
      console.log("Activity created:", response.data);
      const newActivity = {
        ...response.data,
        activity_ActivityId:
          response.data.activity_ActivityId ||
          response.data.activityID ||
          response.data.activityId ||
          response.data.id,
        activity_ActivityName:
          response.data.activity_ActivityName ||
          response.data.activityName ||
          newActivityName, // Use newActivityName
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
      setNewActivityName(""); // Clear the input field
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleDelete = (activity) => {
    openDeleteActivityDialog(activity);
  };

  // Function to open the "Go To Activity" dialog
  const handleGoToActivity = (activity) => {
    setSelectedActivity(activity);
    setOpenActivityDialog(true);
    fetchActivityQuestions(activity.activity_ActivityId); // Fetch questions when dialog opens
  };

  // Function to close the "Go To Activity" dialog
  const closeActivityDialog = () => {
    setOpenActivityDialog(false);
    setSelectedActivity(null);
    setSelectedQuestionType(null); // Reset selected question type
    setActivityQuestions([]); // Clear questions when dialog closes
  };

  const handleRemoveStudent = (student) => {
    openRemoveStudentDialog(student);
  };

  // Function to handle question type selection
  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
  };

  // Callback function to reset selectedQuestionType
  const resetSelectedQuestionType = () => {
    setSelectedQuestionType(null);
  };

  // Function to fetch questions for the selected activity
  const fetchActivityQuestions = async (activityId) => {
    try {
      const response = await API.get(`/api/lingguahey/questions/liveactivities/${activityId}`);
      setActivityQuestions(response.data);
    } catch (err) {
      console.error("Error fetching activity questions:", err.response?.data || err.message);
      setError("Failed to fetch activity questions. Please try again later.");
      setActivityQuestions([]);
    }
  };

  // Function to open the edit question dialog
  const handleEditQuestion = (question) => {
    setQuestionToEdit(question);
    setOpenEditDialog(true);
  };

  // Function to close the edit question dialog
  const closeEditDialog = () => {
    setOpenEditDialog(false);
    setQuestionToEdit(null);
  };

  // Function to handle saving the edited question
  const handleSaveQuestion = async () => {
    try {
      await API.put(`/api/lingguahey/questions/${questionToEdit.questionId}`, questionToEdit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the question in the local state
      setActivityQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.questionId === questionToEdit.questionId ? questionToEdit : question
        )
      );
      closeEditDialog();
    } catch (err) {
      console.error("Error updating question:", err.response?.data || err.message);
      setError("Failed to update question. Please try again later.");
    }
  };

  // Function to handle deleting a question
  const handleDeleteQuestion = async (questionId) => {
    try {
      await API.delete(`/api/lingguahey/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivityQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.questionId !== questionId)
      );
    } catch (err) {
      console.error("Error deleting question:", err.response?.data || err.message);
      setError("Failed to delete question. Please try again later.");
    }
  };

  if (loading) {
    return (
      <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
          Loading Classroom Data...
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container direction="column" sx={{ minHeight: "100vh", backgroundColor: "#E1F5FE", p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="black" mb={3}>
        {classroom ? `Live Activities for ${classroom.classroomName}` : "Loading..."}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Create New Activity Section */}
      <Box mt={4} p={4}>
        <Typography variant="h6" color="black" mb={2}>
          Create a New Activity
        </Typography>
        <TextField
          label="Activity Name"
          variant="outlined"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
          sx={{ mr: 2, width: "300px" }}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FFCCBC", "&:hover": { backgroundColor: "#FFAB91" } }}
          onClick={createActivity}
          disabled={!newActivityName} // Disable if activity name is empty
        >
          Create Activity
        </Button>
      </Box>

      {/* Activity List */}
      <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
        <Box
          sx={{
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <List>
            {activities.map((activity, index) => {
              return (
                <ListItem key={activity.activity_ActivityId} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText
                    primary={`${index + 1}: ${activity.activity_ActivityName}`} // Display activity name
                    secondary={`Activity ID: ${activity.activity_ActivityId}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleGoToActivity(activity)}
                      sx={{ mr: 1 }}
                    >
                      Go To Activity
                    </Button>
                    <IconButton edge="end" color="error" onClick={() => handleDelete(activity)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>

      {/* View Students Section */}
      <Box mt={4} sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h6" color="black" mb={2}>
          List of Students
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Paper sx={{ bgcolor: "#F4F8D3", p: 2, color: "black" }}>
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <List>
              {students.map((student, index) => (
                <ListItem key={index} sx={{ borderBottom: "1px solid #444" }}>
                  <ListItemText
                    primary={`${index + 1}. ${student.firstName} ${student.lastName}`}
                    secondary={`Email: ${student.email}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleRemoveStudent(student)}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Remove Student"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemoveStudent} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Activity Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete Activity"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{deleteDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteActivity} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* "Go To Activity" Dialog */}
      <Dialog
        open={openActivityDialog}
        onClose={closeActivityDialog}
        aria-labelledby="activity-dialog-title"
        aria-describedby="activity-dialog-description"
        maxWidth="md"
        fullWidth="true"
        overflowY="auto"
        sx={{
          "& .MuiDialog-paper": {
            maxHeight: "80vh", // Set the maximum height of the dialog
            overflowY: "auto", // Enable vertical scrolling if content exceeds max height
          },
        }}
      >
        <DialogTitle id="activity-dialog-title">
          {selectedActivity ? `Configure ${selectedActivity.activity_ActivityName}` : "Configure Activity"}
        </DialogTitle>
        <DialogContent>
          {/* List of Questions */}
          {activityQuestions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="black" fontWeight="bold">
                Existing Questions:
              </Typography>
              <List>
                {activityQuestions.map((question, index) => (
                  <ListItem key={question.questionId}>
                    <ListItemText
                      primary={`Question ${index + 1}: ${question.questionText || question.questionDescription}`}
                      secondary={`Game Type: 
                        ${question.gameType === "GAME1" ? "One Pic Four Words" 
                          : question.gameType === "GAME2" ? "Phrase Translation"
                          : question.gameType === "GAME3" ? "Word Translation"
                          : question.activityName
                    }`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteQuestion(question.questionId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          <DialogContentText id="activity-dialog-description">
            Select the game type to configure the activity.
          </DialogContentText>
          {/* Game type selection */}
          {!selectedQuestionType && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="game-type-select-label">Game Type</InputLabel>
                <Select
                  labelId="game-type-select-label"
                  id="game-type-select"
                  value={selectedQuestionType || ""}
                  label="Game Type"
                  onChange={(e) => handleQuestionTypeSelect(e.target.value)}
                >
                  <MenuItem value="GAME1">One Pic Four Words</MenuItem>
                  <MenuItem value="GAME2">Phrase Translation</MenuItem>
                  <MenuItem value="GAME3">Word Translation</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {/* Render the appropriate game component based on the selected game type */}
          {selectedQuestionType === "GAME1" && (
            <LiveActOnePicFourWords
              activityId={selectedActivity.activity_ActivityId}
              classroomId={classroomId}
              onGameCreated={resetSelectedQuestionType} // Pass the callback function
            />
          )}
          {selectedQuestionType === "GAME2" && (
            <LiveActPhraseTranslation
              activityId={selectedActivity.activity_ActivityId}
              classroomId={classroomId}
              onGameCreated={resetSelectedQuestionType} // Pass the callback function
            />
          )}
          {selectedQuestionType === "GAME3" && (
            <LiveActWordTranslation
              activityId={selectedActivity.activity_ActivityId}
              classroomId={classroomId}
              onGameCreated={resetSelectedQuestionType} // Pass the callback function
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActivityDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={closeEditDialog}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">Edit Question</DialogTitle>
        <DialogContent>
          {questionToEdit && questionToEdit.gameType === "GAME1" && (
            <TextField
              autoFocus
              margin="dense"
              id="question-text"
              label="Question Text"
              type="text"
              fullWidth
              value={questionToEdit.questionText || ""}
              onChange={(e) =>
                setQuestionToEdit({ ...questionToEdit, questionText: e.target.value })
              }
            />
          )}
          {questionToEdit && questionToEdit.gameType === "GAME2" && (
            <TextField
              autoFocus
              margin="dense"
              id="question-description"
              label="Question Description"
              type="text"
              fullWidth
              value={questionToEdit.questionDescription || ""}
              onChange={(e) =>
                setQuestionToEdit({ ...questionToEdit, questionDescription: e.target.value })
              }
            />
          )}
          {questionToEdit && questionToEdit.gameType === "GAME3" && (
            <TextField
              autoFocus
              margin="dense"
              id="question-text"
              label="Question Text"
              type="text"
              fullWidth
              value={questionToEdit.questionText || ""}
              onChange={(e) =>
                setQuestionToEdit({ ...questionToEdit, questionText: e.target.value })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveQuestion} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default LiveActClassroom;