import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Chip,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PhraseTranslation({ activityId, classroomId, onGameCreated, question, onClose }) {
  const [newPhrase, setNewPhrase] = useState(question ? question.questionDescription : "");
  const [translation, setTranslation] = useState(question ? question.questionText : "");
  const [newChoices, setNewChoices] = useState(question ? question.choices.map(c => c.choiceText) : []);
  const [inputChoice, setInputChoice] = useState("");
  const [correctChoices, setCorrectChoices] = useState(question ? question.choices.filter(c => c.correct).map(c => c.choiceText) : []);
  const [choiceOrder, setChoiceOrder] = useState(question ? question.choices.filter(c => c.correct).map(c => c.choiceText) : []);
  const [newMessage, setNewMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(!!question);

  const navigate = useNavigate();

  useEffect(() => {
    if (question) {
      setNewPhrase(question.questionDescription || "");
      setTranslation(question.questionText || "");
      const allChoices = (question.choices || []).map(c => c.choiceText) || [];
      setNewChoices(allChoices);
      const sortedCorrect = (question.choices || [])
        .filter(c => c.correct)
        .sort((a, b) => (a.choiceOrder ?? 0) - (b.choiceOrder ?? 0))
        .map(c => c.choiceText);
      setCorrectChoices(sortedCorrect);
      setChoiceOrder(sortedCorrect);
      setIsEditMode(true);
    }
  }, [question]);

  const generateChoices = () => {
    if (!translation.trim()) {
      setNewMessage("Enter a correct translation first.");
      return;
    }
    const words = translation.trim().split(/\s+/);
    const shuffled = words.sort(() => Math.random() - 0.5);
    setNewChoices(shuffled.slice(0, 8));
    setNewMessage("");
  };

  const addManualChoice = () => {
    const val = inputChoice.trim();
    if (!val) {
      setNewMessage("Choice cannot be empty.");
      return;
    }
    if (newChoices.includes(val)) {
      setNewMessage("This choice is already added.");
      return;
    }
    if (newChoices.length >= 8) {
      setNewMessage("Maximum 8 choices allowed.");
      return;
    }
    setNewChoices([...newChoices, val]);
    setInputChoice("");
    setNewMessage("");
  };

  const removeChoice = (choice) => {
    setNewChoices(prev => prev.filter((c) => c !== choice));
    setCorrectChoices(prev => prev.filter((c) => c !== choice));
    setChoiceOrder(prev => prev.filter((c) => c !== choice));
    setNewMessage("");
  };

  const toggleCorrect = (choice) => {
    setCorrectChoices((prev) => {
      if (prev.includes(choice)) {
        setChoiceOrder((orderPrev) => orderPrev.filter(c => c !== choice));
        return prev.filter((c) => c !== choice);
      } else {
        setChoiceOrder((orderPrev) => [...orderPrev, choice]);
        return [...prev, choice];
      }
    });
    setNewMessage("");
  };

  const saveNew = async () => {
    if (!newPhrase.trim()) {
      setNewMessage("Enter a phrase.");
      return;
    }
    if (newChoices.length < 3) {
      setNewMessage("Add at least 3 choices.");
      return;
    }
    if (correctChoices.length === 0) {
      setNewMessage("Select at least one correct choice.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setNewMessage("Not authenticated.");
      navigate("/login");
      return;
    }
    setNewMessage("Saving...");
    try {
      const form = new FormData();
      form.append("questionDescription", newPhrase);
      form.append("questionText", translation || newChoices.join(" "));
      form.append("image", null);
      form.append("gameType", "GAME2");

      let qRes;
      let qId;
      if (isEditMode && question) {
        qRes = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${question.questionId}`,
          form,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        qId = question.questionId;
      } else {
        qRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/liveactivities/${activityId}`,
          form,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        qId = qRes.data.questionId;
      }

      // delete existing choices when editing to avoid duplicates
      if (isEditMode && question && Array.isArray(question.choices)) {
        try {
          const headers = { headers: { Authorization: `Bearer ${token}` } };
          for (const oldChoice of question.choices) {
            if (oldChoice && oldChoice.choiceId) {
              await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${oldChoice.choiceId}`, headers);
            }
          }
        } catch (e) {
          console.warn('Failed to delete one or more existing choices before re-creating:', e);
        }
      }

      // post choices (no scoring logic)
      for (let i = 0; i < newChoices.length; i++) {
        const ch = newChoices[i];
        const isCorr = correctChoices.includes(ch);
        const orderIndex = choiceOrder.indexOf(ch);
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${qId}`,
          { choiceText: ch, choiceOrder: isCorr ? orderIndex + 1 : null, correct: isCorr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setNewMessage("Saved successfully!");
      setNewPhrase("");
      setTranslation("");
      setNewChoices([]);
      setCorrectChoices([]);
      setChoiceOrder([]);
      if (onClose) onClose();
      if (onGameCreated) onGameCreated();
    } catch (err) {
      console.error(err);
      setNewMessage("Save failed.");
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ minHeight: '100vh', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', color: 'black' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Phrase Translation</Typography>
        </Box>

        <Paper sx={{ color: 'black', p: 4, borderRadius: 3, mb: 4, bgcolor: '#F7CB97', border:'3px solid #5D4037' }}>
          <Typography variant="h6" fontWeight="bold" color="black" sx={{ mb: 2 }}>{question ? 'Edit Question' : 'Add New Question'}</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography color="black" mb={1} fontWeight="bold">Enter Phrase</Typography>
              <TextField fullWidth variant="outlined" value={newPhrase} onChange={(e) => setNewPhrase(e.target.value)} sx={{ input: { color: 'black' }, boxShadow:2, border: '2px solid #5D4037' }} />
              <Typography color="black" mt={2} mb={1} fontWeight="bold">Enter Translation</Typography>
              <TextField fullWidth variant="outlined" value={translation} onChange={(e) => setTranslation(e.target.value)} sx={{ input: { color: 'black' }, boxShadow:2, border: '2px solid #5D4037' }} />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={generateChoices} sx={{ bgcolor: 'transparent', color:'#5D4037', border: '2px solid #5D4037' }}>Generate Choices</Button>
              </Box>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Typography color="black" mb={1} fontWeight="bold">Manual Choice ({newChoices.length}/8)</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField fullWidth variant="outlined" value={inputChoice} onChange={(e) => setInputChoice(e.target.value)} sx={{ input: { color: 'black' }, boxShadow:2, border: '2px solid #5D4037' }} />
                <Button variant="contained" onClick={addManualChoice} sx={{ bgcolor: 'transparent',color:'#5D4037', border: '1px solid #5D4037' }}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {newChoices.map((c, idx) => (
                  <Chip
                    key={idx}
                    label={c}
                    onClick={() => toggleCorrect(c)}
                    onDelete={() => removeChoice(c)}
                    sx={{
                      bgcolor: correctChoices.includes(c) ? '#4CAF50' : '',
                      color: correctChoices.includes(c) ? '#5D4037' : 'rgba(0, 0, 0, 1)',
                      border: correctChoices.includes(c) ? '2px solid #4CAF50' : '1px solid #616161'
                    }}
                  />
                ))}
                {newChoices.length === 0 && <Typography color="black">No choices yet</Typography>}
              </Box>
              <Typography color="black" mb={1}>
                {correctChoices.length > 0
                  ? `Correct: ${correctChoices.join(', ')}`
                  : 'Select correct choice(s)'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color="error" onClick={() => { setNewPhrase(''); setTranslation(''); setNewChoices([]); setCorrectChoices([]); setChoiceOrder([]); setNewMessage(''); }} sx={{ bgcolor: '#E57373' }}>Cancel</Button>
                <Button variant="contained" onClick={saveNew} disabled={!newPhrase.trim() || newChoices.length < 3 || correctChoices.length === 0} sx={{ bgcolor: '#4CAF50' }}>Save</Button>
              </Box>
            </Box>
          </Box>
          {newMessage && <Typography color={newMessage.includes('failed') ? '#E57373' : '#81C784'} sx={{ mt: 3, textAlign: 'center' }}>{newMessage}</Typography>}
        </Paper>
      </Box>
    </Grid>
  );
}

export default PhraseTranslation;