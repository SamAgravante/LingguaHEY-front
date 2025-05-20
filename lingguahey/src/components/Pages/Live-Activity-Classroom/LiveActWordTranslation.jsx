import React, { useState, useEffect } from "react";
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

export default function WordTranslation({ activityId, classroomId, onGameCreated }) {
  const navigate = useNavigate();

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
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    async function fetchData() {
      if (!activityId) return;
      try {
        const res = await api.get(`/api/lingguahey/questions/liveactivities/${activityId}`);
        setQuestions(res.data);
      } catch {
        setNewMessage("Failed to load questions.");
      }
    }
    fetchData();
  }, [activityId]);

  // Add choice for new question
  const handleAddChoice = () => {
    const val = inputChoice.trim();
    if (!val) return setNewMessage("Choice cannot be empty.");
    if (newChoices.includes(val)) return setNewMessage("Already added.");
    if (newChoices.length >= 5) return setNewMessage("Max 5 choices.");
    setNewChoices([...newChoices, val]);
    setInputChoice("");
    setNewMessage("");
  };

  const handleRemoveChoice = (c) => {
    setNewChoices(newChoices.filter(x => x !== c));
    if (correctAnswer === c) setCorrectAnswer("");
  };

  const handleSaveNew = async () => {
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
      await api.put(`/api/lingguahey/questions/${editingId}`, { questionText: editWord, questionDescription: "", image: null });
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
    } catch {
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
    <Grid container justifyContent="center" sx={{ minHeight: '100vh', bgcolor: '#18191B', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 999, mx: 'auto', overflowY: 'auto', maxHeight: '90vh', p: 4, borderRadius: 3, bgcolor: '#121212' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#B3E5FC">Word Translation</Typography>
        </Box>

        {/* Add New Question */}
        <Paper sx={{ bgcolor: '#232323', p: 4, borderRadius: 3 }} elevation={3}>
          <Typography variant="h6" fontWeight="bold" color="#B3E5FC" sx={{ mb: 2 }}>{questions.length + 1}.</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box flex={1}>
              <Typography color="#B3E5FC" mb={1}>Word</Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                sx={{
                  bgcolor: '#232323',
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#616161' },
                    '&:hover fieldset': { borderColor: '#81D4FA' },
                    '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                  }
                }}
              />
            </Box>
            <Box flex={2}>
              <Typography color="#B3E5FC" mb={1}>Choices ({newChoices.length}/5)</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Choice"
                  size="small"
                  variant="outlined"
                  value={inputChoice}
                  onChange={e => setInputChoice(e.target.value)}
                  disabled={newChoices.length >= 5}
                  sx={{ flex: 1,
                    bgcolor: '#232323', input: { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#616161' },
                      '&:hover fieldset': { borderColor: '#81D4FA' },
                      '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                    }
                  }}
                />
                <Button variant="contained" onClick={handleAddChoice} disabled={!inputChoice.trim() || newChoices.length>=5} sx={{ bgcolor: '#81D4FA', color: '#000' }}>Add</Button>
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
                        bgcolor: isCorr ? '#4CAF50' : '#232323',
                        color: '#fff',
                        border: isCorr ? '2px solid #4CAF50' : '1px solid #616161',
                        fontWeight: isCorr ? 'bold' : 'normal'
                      }}
                    />
                  );
                })}
              </Box>
              <Typography color="#B3E5FC" mb={2}>
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