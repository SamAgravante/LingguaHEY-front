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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function PhraseTranslation({ activityId, classroomId, onGameCreated }) {
  // State for adding a new phrase question
  const [newPhrase, setNewPhrase] = useState("");
  const [translation, setTranslation] = useState("");
  const [newChoices, setNewChoices] = useState([]);
  const [inputChoice, setInputChoice] = useState("");
  const [correctChoices, setCorrectChoices] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // State for existing questions
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPhrase, setEditPhrase] = useState("");
  const [editChoices, setEditChoices] = useState([]);
  const [editCorrect, setEditCorrect] = useState([]);
  const [questionMessages, setQuestionMessages] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, [activityId]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/liveactivities/${activityId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      setNewMessage("Failed to fetch questions.");
    }
  };

  // --- New Phrase Logic ---
  const generateChoices = () => {
    if (!translation.trim()) {
      setNewMessage("Enter a correct translation first.");
      return;
    }
    const words = translation.trim().split(" ");
    const shuffled = words.sort(() => Math.random() - 0.5);
    setNewChoices(shuffled);
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
    setNewChoices([...newChoices, val]);
    setInputChoice("");
    setNewMessage("");
  };

  const removeChoice = (choice) => {
    setNewChoices(newChoices.filter((c) => c !== choice));
    setCorrectChoices(correctChoices.filter((c) => c !== choice));
    setNewMessage("");
  };

  const toggleCorrect = (choice) => {
    setCorrectChoices((prev) =>
      prev.includes(choice)
        ? prev.filter((c) => c !== choice)
        : [...prev, choice]
    );
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
      // create question: save phrase in description, and translation as the sequence of choices
      const form = new FormData();
      form.append("questionDescription", newPhrase);
      // store the full choice sequence as the translation
      form.append("questionText", newChoices.join(" "));
      form.append("image", null);
      form.append("gameType", "GAME2");
      const qRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/liveactivities/${activityId}`,
        form,
        { headers: 
          { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": `multipart/form-data` 
          } 
        }
      );
      const qId = qRes.data.questionId;

      // post choices and calculate score
      let score = 0;
      for (let i = 0; i < newChoices.length; i++) {
        const ch = newChoices[i];
        const isCorr = correctChoices.includes(ch);
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${qId}`,
          { 
            choiceText: ch, 
            choiceOrder: isCorr ? i + 1 : null, 
            correct: isCorr 
          },
          { 
            headers: 
            { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            } 
          }
        );
        if (isCorr) score++;
      }
      // post score
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${qId}`,
        null,
        { 
          params: { scoreValue: score }, 
          headers: 
          { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          } 
        }
      );

      setNewMessage("Saved successfully!");
      // reset form
      setNewPhrase("");
      setTranslation("");
      setNewChoices([]);
      setCorrectChoices([]);
      fetchQuestions();

      // Call the callback function after the game is created
      if (onGameCreated) {
        onGameCreated();
      }

    } catch (err) {
      console.error(err);
      setNewMessage("Save failed.");
    }
  };

  // --- Edit Existing ---
  const startEdit = (q) => {
    setEditingId(q.questionId);
    setEditPhrase(q.questionDescription || "");
    setEditChoices(q.choices.map((c) => ({ ...c })));
    setEditCorrect(q.choices.filter((c) => c.correct).map((c) => c.choiceText));
  };

  const changeEditChoice = (idx, text) => {
    const arr = [...editChoices];
    arr[idx].choiceText = text;
    setEditChoices(arr);
  };

  const toggleEditCorrect = (text) => {
    setEditCorrect((prev) =>
      prev.includes(text) ? prev.filter((c) => c !== text) : [...prev, text]
    );
  };

  const saveEdit = async () => {
    const id = editingId;
    if (!editPhrase.trim()) {
      setQuestionMessages((p) => ({ ...p, [id]: "Phrase cannot be empty." }));
      return;
    }
    if (editChoices.length < 3) {
      setQuestionMessages((p) => ({ ...p, [id]: "At least 3 choices required." }));
      return;
    }
    if (editCorrect.length === 0) {
      setQuestionMessages((p) => ({ ...p, [id]: "Select correct choices." }));
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setQuestionMessages((p) => ({ ...p, [id]: "Saving..." }));
    try {
      // update question: update description and choice sequence as translation
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        {
          questionDescription: editPhrase,
          questionText: editChoices.map((c) => c.choiceText).join(" "),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // update choices and score
      let score = 0;
      for (let c of editChoices) {
        const isCorr = editCorrect.includes(c.choiceText);
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${c.choiceId}`,
          { choiceText: c.choiceText, correct: isCorr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (isCorr) score++;
      }
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${id}/score`,
        null,
        { params: { scoreValue: score }, headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestionMessages((p) => ({ ...p, [id]: "Updated successfully!" }));
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setQuestionMessages((p) => ({ ...p, [id]: "Update failed." }));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setQuestionMessages({});
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setQuestionMessages((p) => ({ ...p, [id]: "Deleting..." }));
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestionMessages((p) => ({ ...p, [id]: "Deleted." }));
      setQuestions(questions.filter((q) => q.questionId !== id));
    } catch {
      setQuestionMessages((p) => ({ ...p, [id]: "Delete failed." }));
    }
  };

  const goBack = () => navigate(`/classroom/${classroomId}/live-activities`);

  return (
    <Grid container justifyContent="center" sx={{ minHeight: '100vh', backgroundColor: '#c8e6c9', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', color: '#232323' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Phrase Translation</Typography>
        </Box>

        {/* Existing Questions */}

        {/* Add New Phrase */}
        <Paper sx={{ bgcolor: '#18191B', color: '#fff', p:4, borderRadius:3, mb:4 }}>
          <Typography variant="h6" fontWeight="bold" color="#B3E5FC" sx={{ mb:2 }}>{questions.length+1}.</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs:'column', md:'row' }, gap:4 }}>
            <Box sx={{ flex:1 }}>
              <Typography color="#B3E5FC" mb={1} fontWeight="bold">Enter Phrase</Typography>
              <TextField fullWidth variant="outlined" value={newPhrase} onChange={(e) => setNewPhrase(e.target.value)} sx={{ bgcolor: '#232323', input:{ color:'#fff'} }} />
              <Typography color="#B3E5FC" mt={2} mb={1} fontWeight="bold">Enter Translation</Typography>
              <TextField fullWidth variant="outlined" value={translation} onChange={(e) => setTranslation(e.target.value)} sx={{ bgcolor: '#232323', input:{ color:'#fff'} }} />
              <Box sx={{ display:'flex', gap:2, mt:2 }}>
                <Button variant="contained" onClick={generateChoices} sx={{ bgcolor:'#81D4FA' }}>Generate Choices</Button>
              </Box>
            </Box>
            <Box sx={{ flex:2 }}>
              <Typography color="#B3E5FC" mb={1} fontWeight="bold">Manual Choice ({newChoices.length}/8)</Typography>
              <Box sx={{ display:'flex', gap:1, mb:2 }}>
                <TextField fullWidth variant="outlined" value={inputChoice} onChange={(e) => setInputChoice(e.target.value)} sx={{ bgcolor:'#232323', input:{ color:'#fff'} }} />
                <Button variant="contained" onClick={addManualChoice} sx={{ bgcolor:'#81D4FA' }}>Add</Button>
              </Box>
              <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mb:2 }}>
                {newChoices.map((c, idx) => (
                  <Chip
                    key={idx}
                    label={c}
                    onClick={() => toggleCorrect(c)}
                    onDelete={() => removeChoice(c)}
                    sx={{
                      bgcolor: correctChoices.includes(c) ? '#4CAF50':'#232323',
                      color: correctChoices.includes(c) ? '#fff':'#B3E5FC',
                      border: correctChoices.includes(c) ? '2px solid #4CAF50':'1px solid #616161'
                    }}
                  />
                ))}
                {newChoices.length === 0 && <Typography color="#616161">No choices yet</Typography>}
              </Box>
              <Typography color="#B3E5FC" mb={1}>
                {correctChoices.length > 0
                  ? `Correct: ${correctChoices.join(', ')}`
                  : 'Select correct choice(s)'}
              </Typography>
              <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end', mt:2 }}>
                <Button variant="contained" color="error" onClick={() => {setNewPhrase(''); setTranslation(''); setNewChoices([]); setCorrectChoices([]); setNewMessage('');}} sx={{ bgcolor:'#E57373' }}>Cancel</Button>
                <Button variant="contained" onClick={saveNew} disabled={!newPhrase.trim()||newChoices.length<3||correctChoices.length===0} sx={{ bgcolor:'#4CAF50' }}>Save</Button>
              </Box>
            </Box>
          </Box>
          {newMessage && <Typography color={newMessage.includes('Failed')?'#E57373':'#81C784'} sx={{ mt:3, textAlign:'center' }}>{newMessage}</Typography>}
        </Paper>
      </Box>
    </Grid>
  );
}

export default PhraseTranslation;