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
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Import game components
import LiveActOnePicFourWords from "./LiveActOnePicFourWords";
import LiveActPhraseTranslation from "./LiveActPhraseTranslation";
import LiveActWordTranslation from "./LiveActWordTranslation";

// Background assets
import LandingBackgroundPic from "../../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../../assets/images/backgrounds/GameTextFieldMedium.png";
import MonsterEditUIOuter from "../../../assets/images/backgrounds/MonsterEditUIOuter.png";
import MonsterEditUIOuterLight from "../../../assets/images/backgrounds/MonsterEditUIOuterLight.png";


const LiveActClassroom = () => {
  const navigate = useNavigate();
  const { roomId: classroomId, classroomName } = useParams();
  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState(""); // Use newActivityName
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [students, setStudents] = useState([]);
  const { roomId } = useParams();

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

  // New state for game-specific edit dialogs
  const [openGame1EditDialog, setOpenGame1EditDialog] = useState(false);
  const [openGame2EditDialog, setOpenGame2EditDialog] = useState(false);
  const [openGame3EditDialog, setOpenGame3EditDialog] = useState(false);

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
      //await API.delete(`/api/lingguahey/classrooms/${classroomId}/students/${selectedStudent.userId}`, {
      //  headers: {
      //    Authorization: `Bearer ${token}`,
      //  },
      //});
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
      //await API.delete(`/api/lingguahey/live-activities/${activityToDelete.activity_ActivityId}`, {
      //  headers: {
      //    Authorization: `Bearer ${token}`,
      //  },
      //});
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
    if (question.gameType === "GAME1") {
      setOpenGame1EditDialog(true);
    } else if (question.gameType === "GAME2") {
      setOpenGame2EditDialog(true);
    } else if (question.gameType === "GAME3") {
      setOpenGame3EditDialog(true);
    }
  };

  // Function to close the edit question dialog
  const closeEditDialog = () => {
    setOpenEditDialog(false);
    setQuestionToEdit(null);
  };

  // Functions to close game-specific edit dialogs
  const closeGame1EditDialog = () => setOpenGame1EditDialog(false);
  const closeGame2EditDialog = () => setOpenGame2EditDialog(false);
  const closeGame3EditDialog = () => setOpenGame3EditDialog(false);

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
    <Box sx={{
            minHeight: "96.5%",
            width: "98%",
            overflow: "hidden",
            backgroundImage: `url(${MonsterEditUIOuterLight})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            //alignItems: "center",
            p: 2,
          }}>
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: "#fff",
          py: 2,
          px: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DashboardIcon sx={{ mr: 2, color: "#3f51b5", fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#3f51b5" }}>
            Activity Creation
          </Typography>
        </Box>

        <Button 
          sx={{
          borderRadius: 6, 
          ml: "20px",
          backgroundColor: "#3f51b5", 
          color: "#fff"
          }} 
            onClick={() => navigate(`/teacherdashboard/classroom/${roomId}`)}
          >
            <Typography variant="body1" sx={{ color: "white" }}>
                Back to Dashboard
                </Typography>
        </Button>
        
      </Box>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="bold" color="#3f51b5" mb={3} pl={87}>
          {classroom ? `${classroom.classroomName}` : "Loading..."}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
      </Grid>

      {/* Main Content Sections - Stacked Vertically */}
      <Grid container direction="row" spacing={2}> {/* Changed direction to "row" and added spacing */}
        {/* Left Column */}
        <Grid item xs={12} md={6}> {/* Occupy half width on medium and up screens */}
          {/* Create New Activity Section */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: "#fff", mb: 5,marginLeft:20,width:500 }}> {/* Added mb for margin-bottom */}
            <Typography variant="h6" color="text.primary" mb={3}>
              Create a New Activity
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Activity Name"
                variant="outlined"
                fullWidth
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFA726", // Orange color for creation
                  "&:hover": { backgroundColor: "#FB8C00" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
                onClick={createActivity}
                disabled={!newActivityName}
              >
                Create
              </Button>
            </Box>
          </Paper>

          {/* Activity List Section */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: "#fff",marginLeft:20,width:500 }}>
            <Typography variant="h6" color="text.primary" mb={3}>
              Your Activities
            </Typography>
            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              <List>
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <ListItem
                      key={activity.activity_ActivityId}
                      divider
                      sx={{ py: 1.5, px: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {`${index + 1}. ${activity.activity_ActivityName}`}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleGoToActivity(activity)}
                          sx={{ mr: 1, borderRadius: 1.5 }}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label={`Delete activity ${activity.activity_ActivityName}`}
                          sx={{
                            color: "#f44336",
                            opacity: 0.7,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: "rgba(244, 67, 54, 0.08)"
                            }
                          }}
                          onClick={() => handleDelete(activity)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    No activities created yet.
                  </Typography>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>

        
      </Grid> 

      {/* Confirmation Dialogs */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "black" }}>
          {"Confirm Remove Student"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined"
            onClick={closeDialog}
            sx={{ 
              color: 'text.secondary',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.24)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRemoveStudent}
            sx={{
              bgcolor: '#d32f2f',
              color: 'white',
              '&:hover': {
                bgcolor: '#c62828'
              }
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "black" }}>
          {"Confirm Delete Activity"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {deleteDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined"
            onClick={closeDeleteDialog}
            sx={{ 
              color: 'text.secondary',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.24)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeleteActivity}
            sx={{
              bgcolor: '#d32f2f',
              color: 'white',
              '&:hover': {
                bgcolor: '#c62828'
              }
            }}
            autoFocus
          >
            Delete
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
        fullWidth={true}
        PaperProps={{
          sx: {
            maxHeight: "90vh", // Set the maximum height of the dialog
            overflowY: "auto", // Enable vertical scrolling if content exceeds max height
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle id="activity-dialog-title">
          {selectedActivity ? `Configure ${selectedActivity.activity_ActivityName}` : "Configure Activity"}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {/* List of Questions */}
          {activityQuestions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.primary" fontWeight="bold" mb={2}>
                Existing Questions:
              </Typography>
              <List sx={{ bgcolor: "#f9f9f9", borderRadius: 1, p: 2 }}>
                {activityQuestions.map((question, index) => (
                  <ListItem key={question.questionId} divider={index < activityQuestions.length - 1} sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {`Question ${index + 1}: ${question.questionText}`}
                        </Typography>
                      }
                      secondary={`Game Type: ${
                        question.gameType === "GAME1"
                          ? "One Pic Four Words"
                          : question.gameType === "GAME2"
                          ? "Phrase Translation"
                          : question.gameType === "GAME3"
                          ? "Word Translation"
                          : question.activityName
                      }`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditQuestion(question)}
                        sx={{ mr: 1 }}
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
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Select the game type to add new questions to this activity.
          </Typography>
          {/* Game type selection */}
          {!selectedQuestionType && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", mt: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="game-type-select-label">Select Game Type</InputLabel>
                <Select
                  labelId="game-type-select-label"
                  id="game-type-select"
                  value={selectedQuestionType || ""}
                  label="Select Game Type"
                  onChange={(e) => handleQuestionTypeSelect(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="GAME1">One Pic Four Words</MenuItem>
                  <MenuItem value="GAME2">Phrase Translation</MenuItem>
                  <MenuItem value="GAME3">Word Translation</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {/* Render the appropriate game component based on the selected game type */}
          {selectedQuestionType === "GAME1" && (
            <Box mt={3}>
              <LiveActOnePicFourWords
                activityId={selectedActivity.activity_ActivityId}
                classroomId={classroomId}
                onGameCreated={resetSelectedQuestionType} // Pass the callback function
              />
            </Box>
          )}
          {selectedQuestionType === "GAME2" && (
            <Box mt={3}>
              <LiveActPhraseTranslation
                activityId={selectedActivity.activity_ActivityId}
                classroomId={classroomId}
                onGameCreated={resetSelectedQuestionType} // Pass the callback function
              />
            </Box>
          )}
          {selectedQuestionType === "GAME3" && (
            <Box mt={3}>
              <LiveActWordTranslation
                activityId={selectedActivity.activity_ActivityId}
                classroomId={classroomId}
                onGameCreated={resetSelectedQuestionType} // Pass the callback function
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeActivityDialog} color="secondary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game 1 Edit Dialog */}
      <Dialog
        open={openGame1EditDialog}
        onClose={closeGame1EditDialog}
        aria-labelledby="game1-edit-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle id="game1-edit-dialog-title">Edit One Pic Four Words Question</DialogTitle>
        <DialogContent dividers>
          <LiveActOnePicFourWords
            activityId={selectedActivity?.activity_ActivityId}
            classroomId={classroomId}
            question={questionToEdit}
            onClose={closeGame1EditDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGame1EditDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game 2 Edit Dialog */}
      <Dialog
        open={openGame2EditDialog}
        onClose={closeGame2EditDialog}
        aria-labelledby="game2-edit-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle id="game2-edit-dialog-title">Edit Phrase Translation Question</DialogTitle>
        <DialogContent dividers>
          <LiveActPhraseTranslation
            activityId={selectedActivity?.activity_ActivityId}
            classroomId={classroomId}
            question={questionToEdit}
            onClose={closeGame2EditDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGame2EditDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game 3 Edit Dialog */}
      <Dialog
        open={openGame3EditDialog}
        onClose={closeGame3EditDialog}
        aria-labelledby="game3-edit-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle id="game3-edit-dialog-title">Edit Word Translation Question</DialogTitle>
        <DialogContent dividers>
          <LiveActWordTranslation
            activityId={selectedActivity?.activity_ActivityId}
            classroomId={classroomId}
            question={questionToEdit}
            onClose={closeGame3EditDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGame3EditDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Question Dialog - Consider removing this if game-specific edit dialogs are fully handling edits */}
      <Dialog
        open={openEditDialog}
        onClose={closeEditDialog}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
      >
        <DialogTitle id="edit-dialog-title">Edit Question</DialogTitle>
        <DialogContent>
          {questionToEdit && (
            <TextField
              autoFocus
              margin="dense"
              id="question-text"
              label="Question Text"
              type="text"
              fullWidth
              value={questionToEdit.questionText}
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
          <Button onClick={() => {}} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveActClassroom;