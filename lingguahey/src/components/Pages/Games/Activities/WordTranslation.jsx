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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function WordTranslation() {
  const { activityId, classroomId } = useParams();
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

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    async function fetchData() {
      if (!activityId) return;
      try {
        const res = await api.get(`/api/lingguahey/questions/activities/${activityId}`);
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
      const { data } = await api.post(`/api/lingguahey/questions/activities/${activityId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const qId = data.questionId;
      let score = 0;
      for (let c of newChoices) {
        const isCorr = c === correctAnswer;
        await api.post(`/api/lingguahey/choices/questions/${qId}`, { choiceText: c, correct: isCorr });
        if (isCorr) score = 1;
      }
      await api.post(`/api/lingguahey/scores/questions/${qId}`, null, { params: { scoreValue: score } });
      setNewMessage("Saved successfully!");
      setNewWord(""); setNewChoices([]); setCorrectAnswer("");
      const res = await api.get(`/api/lingguahey/questions/activities/${activityId}`);
      setQuestions(res.data);
    } catch {
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
      const res = await api.get(`/api/lingguahey/questions/activities/${activityId}`);
      setQuestions(res.data);
    } catch {
      setMsgMap(m => ({ ...m, [editingId]: "Update failed." }));
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this question?")) return;
    setMsgMap(m => ({ ...m, [id]: "Deleting..." }));
    try {
      await api.delete(`/api/lingguahey/questions/${id}`);
      setQuestions(questions.filter(q => q.questionId !== id));
      setMsgMap(m => ({ ...m, [id]: "Deleted." }));
    } catch {
      setMsgMap(m => ({ ...m, [id]: "Delete failed." }));
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ minHeight: '100vh', bgcolor: '#18191B', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#B3E5FC">Word Translation</Typography>
          <Button variant="text" onClick={() => navigate(`/classroom/${classroomId}`)} sx={{ color: '#81D4FA' }}>← Back</Button>
        </Box>

        {/* Existing Questions */}
        {questions.map((q, idx) => (
          <Paper key={q.questionId} sx={{ bgcolor: '#232323', p: 4, borderRadius: 3, mb: 4 }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" color="#81D4FA" sx={{ mb: 2 }}>{idx + 1}.</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Word Column */}
              <Box sx={{ flex: 1 }}>
                <Typography color="#B3E5FC" mb={1}>Word</Typography>
                <TextField
                  fullWidth
                  variant={editingId === q.questionId ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: editingId !== q.questionId,
                    disableUnderline: editingId !== q.questionId,
                    style: { color: '#fff' }
                  }}
                  value={editingId === q.questionId ? editWord : q.questionText}
                  onChange={e => setEditWord(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#616161' },
                      '&:hover fieldset': { borderColor: '#81D4FA' },
                      '&.Mui-focused fieldset': { borderColor: '#81D4FA' }
                    }
                  }}
                />
              </Box>
              {/* Choices Column */}
              <Box sx={{ flex: 2 }}>
                <Typography color="#B3E5FC" mb={1}>Choices</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {(editingId === q.questionId ? editChoices : q.choices).map((c, i) => {
                    const text = editingId === q.questionId ? c.choiceText : c.choiceText;
                    const isCorrect = editingId === q.questionId ? (editCorrect === c.choiceText) : c.correct;
                    return (
                      <Chip
                        key={i}
                        label={editingId === q.questionId ? (
                          <TextField
                            value={c.choiceText}
                            variant="standard"
                            onChange={e => handleChoiceEdit(i, e.target.value)}
                            InputProps={{ disableUnderline: true, style: { color: '#fff' } }}
                          />) : text}
                        onClick={() => editingId === q.questionId ? setEditCorrect(c.choiceText) : null}
                        onDelete={() => editingId === q.questionId ? setEditChoices(editChoices.filter((_, j) => j !== i)) : null}
                        sx={{
                          bgcolor: isCorrect ? '#4CAF50' : '#232323',
                          color: '#fff',
                          border: isCorrect ? '2px solid #4CAF50' : '1px solid #616161',
                          fontWeight: isCorrect ? 'bold' : 'normal'
                        }}
                      />
                    );
                  })}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {editingId === q.questionId ? (
                    <>  
                      <Button variant="contained" onClick={handleSaveEdit} sx={{ bgcolor: '#4CAF50', fontWeight: 'bold' }}>Save</Button>
                      <Button variant="contained" color="error" onClick={() => setEditingId(null)} sx={{ bgcolor: '#E57373', fontWeight: 'bold' }}>Cancel</Button>
                    </>
                  ) : (
                    <>  
                      <Button variant="contained" onClick={() => startEdit(q)} sx={{ bgcolor: '#81D4FA', color: '#000', fontWeight: 'bold' }}>Edit</Button>
                      <IconButton onClick={() => handleDelete(q.questionId)} sx={{ bgcolor: '#E57373', color: '#fff' }}><DeleteIcon /></IconButton>
                    </>
                  )}
                </Box>
                {msgMap[q.questionId] && (
                  <Typography color={msgMap[q.questionId].includes('failed') ? '#E57373' : '#81C784'} sx={{ mt: 1, textAlign: 'center' }}>
                    {msgMap[q.questionId]}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}

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
    </Grid>
  );
}
