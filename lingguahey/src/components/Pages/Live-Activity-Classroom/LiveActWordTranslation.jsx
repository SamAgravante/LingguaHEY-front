import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function WordTranslation({ activityId, classroomId, onGameCreated,  question, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!activityId) {
      console.error("Activity ID is undefined in WordTranslation component.");
    }
  }, [activityId]);

  // Use question prop to initialize state if editing
  const [word, setWord] = useState(question ? question.word : "");
  const [choices, setChoices] = useState(question ? question.choices || [] : []);

  // New question state
  const [newWord, setNewWord] = useState("");
  const [newChoices, setNewChoices] = useState([]);
  const [inputChoice, setInputChoice] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Existing questions
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editWord, setEditWord] = useState("");
  const [editChoices, setEditChoices] = useState([]);
  const [editCorrect, setEditCorrect] = useState("");
  const [msgMap, setMsgMap] = useState({});

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const token = localStorage.getItem("token");
  const api = useMemo(() => axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

   useEffect(() => {
    if (question) {
      setWord(question.word || "");
      setChoices(question.choices || []);
      setCorrectAnswer(question.correctAnswer || null);
    }
  }, [question]);
  
  // small debug & guard: log incoming prop and skip fetch until defined
  useEffect(() => {
    console.log("LiveActWordTranslation: received activityId =", activityId);
  }, [activityId]);

  useEffect(() => {
    async function fetchData() {
      if (!activityId) {
        // explicit early exit so no request goes to .../undefined
        console.warn("fetchData skipped: activityId is falsy");
        return;
      }
      try {
        const res = await api.get(`/api/lingguahey/questions/liveactivities/${activityId}`);
        setQuestions(res.data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setNewMessage("Failed to load questions.");
      }
    }
    fetchData();
  }, [activityId]);

  // Add this useEffect to initialize edit fields when editing
  useEffect(() => {
    if (question) {
      setEditWord(question.word || question.questionText || "");
      setEditChoices(question.choices || []);
      setEditCorrect(
        (question.choices && question.choices.find(c => c.correct)?.choiceText) ||
        question.correctAnswer ||
        ""
      );
      setEditingId(question.questionId);
    } else {
      setEditWord("");
      setEditChoices([]);
      setEditCorrect("");
      setEditingId(null);
    }
  }, [question]);

  // Add choice for new question
  const handleAddChoice = () => {
    const val = inputChoice.trim();
    if (!val) return setNewMessage("Choice cannot be empty.");
    if (newChoices.includes(val)) return setNewMessage("Already added.");
    if (newChoices.length >= 4) return setNewMessage("Max 4 choices.");
    setNewChoices([...newChoices, val]);
    setInputChoice("");
    setNewMessage("");
  };

  const handleRemoveChoice = (c) => {
    setNewChoices(newChoices.filter(x => x !== c));
    if (correctAnswer === c) setCorrectAnswer("");
  };

  const handleSaveNew = async () => {
    if (!activityId) {
      console.error("Activity ID is undefined.");
      setNewMessage("Activity ID is undefined. Please refresh the page.");
      return;
    }

    if (!newWord.trim()) return setNewMessage("Enter a word.");
    if (newChoices.length < 3) return setNewMessage("Add at least 3 choices.");
    if (!correctAnswer) return setNewMessage("Select correct answer.");
    if (!token) return navigate("/login");

    setNewMessage("Saving new question...");
    try {
      const form = new FormData();
      form.append("questionText", newWord);
      form.append("questionDescription", "");
      form.append("image", null);
      form.append("gameType", "GAME3");
      const { data } = await api.post(`/api/lingguahey/questions/liveactivities/${activityId}`, form, {
        headers: 
        { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`  
        },
      });
      const qId = data.questionId;
      let score = 0;
      for (let i = 0; i < newChoices.length; i++) {
        const c = newChoices[i];
        const isCorr = c === correctAnswer;
        await api.post(
          `/api/lingguahey/choices/questions/${qId}`,
          {
            choiceText: c,
            choiceOrder: i,
            questionId: qId,
            correct: isCorr,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          }
        );
        if (isCorr) score = 1;
      }
      await api.post(
        `/api/lingguahey/scores/questions/${qId}`,
        null,
        {
          params: { scoreValue: score },
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      setNewMessage("Saved successfully!");
      setNewWord("");
      setNewChoices([]);
      setCorrectAnswer("");
      const res = await api.get(`/api/lingguahey/questions/liveactivities/${activityId}`);
      setQuestions(res.data);

      // Call the callback function after the game is created
      if (onGameCreated) {
        onGameCreated();
      }

      if (onClose) {
        onClose();
      }

    } catch (error) {
      setNewMessage("Save failed.");
    }
  };

  // Edit existing question
  const startEdit = q => {
    setEditingId(q.questionId);
    setEditWord(q.questionText);
    setEditChoices(q.choices.map(c => ({ ...c })));
    setEditCorrect(q.choices.find(c => c.correct)?.choiceText || "");
    setMsgMap({});
  };

  const handleChoiceEdit = (i, text) => {
    const arr = [...editChoices]; arr[i].choiceText = text;
    setEditChoices(arr);
  };

  const handleSaveEdit = async () => {
    if (!editWord.trim()) return setMsgMap(m => ({ ...m, [editingId]: "Word cannot be empty." }));
    if (editChoices.length < 3) return setMsgMap(m => ({ ...m, [editingId]: "Add at least 3 choices." }));
    if (!editCorrect) return setMsgMap(m => ({ ...m, [editingId]: "Select correct answer." }));

    setMsgMap(m => ({ ...m, [editingId]: "Saving changes..." }));
    try {
      const form = new FormData();
      form.append("questionText", editWord);
      form.append("questionDescription", "");
      form.append("image", null);

      // Update the question
      await api.put(`/api/lingguahey/questions/${editingId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update choices and score
      let score = 0;
      for (let c of editChoices) {
        const isCorr = c.choiceText === editCorrect;
        await api.put(`/api/lingguahey/choices/${c.choiceId}`, { choiceText: c.choiceText, correct: isCorr });
        if (isCorr) score = 1;
      }
      await api.put(`/api/lingguahey/scores/questions/${editingId}/score`, null, { params: { scoreValue: score } });

      setMsgMap(m => ({ ...m, [editingId]: "Updated successfully!" }));
      setEditingId(null);
      const res = await api.get(`/api/lingguahey/questions/liveactivities/${activityId}`);
      setQuestions(res.data);

      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Update failed:", error);
      setMsgMap(m => ({ ...m, [editingId]: "Update failed." }));
    }
  };

  // Delete existing question
  const openDeleteConfirmation = (id) => {
    setSelectedQuestionId(id);
    setDialogMessage("Are you sure you want to delete this question?");
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuestionId) return;

    setMsgMap(m => ({ ...m, [selectedQuestionId]: "Deleting..." }));
    try {
      await api.delete(`/api/lingguahey/questions/${selectedQuestionId}`);
      setQuestions(questions.filter(q => q.questionId !== selectedQuestionId));
      setMsgMap(m => ({ ...m, [selectedQuestionId]: "Deleted." }));
    } catch {
      setMsgMap(m => ({ ...m, [selectedQuestionId]: "Delete failed." }));
    } finally {
      closeDialog();
      setSelectedQuestionId(null);
    }
  };
  
  return (
    <Grid container justifyContent="center" sx={{ minHeight: '100vh', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 999, mx: 'auto', overflowY: 'auto', maxHeight: '90vh', p: 4, borderRadius: 3, }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="black">Word Translation</Typography>
        </Box>

        {/* EDIT MODE */}
        {question ? (
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#F7CB97', border:'3px solid #5D4037' }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" color="black" sx={{ mb: 2 }}>Edit Question</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box flex={1}>
                <Typography color="black" mb={1}>Word</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editWord}
                  onChange={e => setEditWord(e.target.value)}
                  sx={{
                    input: { color: 'black' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#616161' },
                      '&:hover fieldset': { borderColor: '#81D4FA' },
                      '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                    },
                    boxShadow:2,
                    bgcolor:'transparent',
                    border:'2px solid #5D4037',
                    borderRadius:2
                  }}
                />
              </Box>
              <Box flex={2}>
                <Typography color="black" mb={1}>Choices ({editChoices.length}/4)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {editChoices.map((c, i) => {
                    const isCorr = c.choiceText === editCorrect;
                    return (
                      <Chip
                        key={i}
                        label={c.choiceText}
                        onClick={() => setEditCorrect(c.choiceText)}
                        sx={{
                          bgcolor: isCorr ? '#4CAF50' : '',
                          color: 'black',
                          border: isCorr ? '2px solid #4CAF50' : '1px solid #616161',
                          fontWeight: isCorr ? 'bold' : 'normal'
                        }}
                      />
                    );
                  })}
                </Box>
                <Typography color="black" mb={2}>
                  {editCorrect ? `Correct: ${editCorrect}` : 'Click a choice to set correct answer'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="contained" color="error" onClick={onClose} sx={{ bgcolor: '#E57373' }}>Cancel</Button>
                  <Button variant="contained" onClick={handleSaveEdit} disabled={!editWord.trim()||editChoices.length<3||!editCorrect} sx={{ bgcolor: '#4CAF50' }}>Save</Button>
                </Box>
                {msgMap[editingId] && (
                  <Typography color={msgMap[editingId].includes('failed') ? '#E57373' : '#81C784'} sx={{ mt: 2, textAlign: 'center' }}>{msgMap[editingId]}</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ) : (
        // CREATE MODE
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#F7CB97', border:'3px solid #5D4037' }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" color="black" sx={{ mb: 2 }}>{questions.length + 1}.</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box flex={1}>
                <Typography color="black" mb={1}>Word</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  sx={{
                    input: { color: 'black' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#616161' },
                      '&:hover fieldset': { borderColor: '#81D4FA' },
                      '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                    },
                    boxShadow:2,
                    bgcolor:'transparent',
                    border:'2px solid #5D4037',
                    borderRadius:2
                  }}
                />
              </Box>
              <Box flex={2}>
                <Typography color="black" mb={1}>Choices ({newChoices.length}/4)</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Add Choice"
                    size="small"
                    variant="outlined"
                    value={inputChoice}
                    onChange={e => setInputChoice(e.target.value)}
                    disabled={newChoices.length >= 5}
                    sx={{ flex: 1,
                      input: { color: 'black' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#616161' },
                        '&:hover fieldset': { borderColor: '#81D4FA' },
                        '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                      },
                      boxShadow:2,
                      bgcolor:'transparent',
                      border:'2px solid #5D4037',
                      borderRadius:2
                    }}
                  />
                  <Button variant="contained" onClick={handleAddChoice} disabled={!inputChoice.trim() || newChoices.length>=5} sx={{ bgcolor: '#81D4FA', color: '#000'}}>Add</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {newChoices.map((c,i) => {
                    const isCorr = c === correctAnswer;
                    return (
                      <Chip
                        key={i}
                        label={c}
                        onClick={() => setCorrectAnswer(c)}
                        onDelete={() => handleRemoveChoice(c)}
                        sx={{
                          bgcolor: isCorr ? '#4CAF50' : '',
                          color: 'black',
                          border: isCorr ? '2px solid #4CAF50' : '1px solid #616161',
                          fontWeight: isCorr ? 'bold' : 'normal'
                        }}
                      />
                    );
                  })}
                </Box>
                <Typography color="black" mb={2}>
                  {correctAnswer ? `Correct: ${correctAnswer}` : 'Click a choice to set correct answer'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="contained" color="error" onClick={() => { setNewWord(''); setNewChoices([]); setInputChoice(''); setCorrectAnswer(''); setNewMessage(''); }} sx={{ bgcolor: '#E57373' }}>Cancel</Button>
                  <Button variant="contained" onClick={handleSaveNew} disabled={!newWord.trim()||newChoices.length<3||!correctAnswer} sx={{ bgcolor: '#4CAF50' }}>Save</Button>
                </Box>
              </Box>
            </Box>
            {newMessage && (
              <Typography color={newMessage.includes('failed') ? '#E57373' : '#81C784'} sx={{ mt: 3, textAlign: 'center' }}>{newMessage}</Typography>
            )}
          </Paper>
        )}

      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}