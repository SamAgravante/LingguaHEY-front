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

function PhraseTranslation({ activityId }) {
  // ---------- STATE ----------
  // New phrase state
  const [newPhrase, setNewPhrase] = useState("");
  const [translation, setTranslation] = useState("");
  const [newChoices, setNewChoices] = useState([]);          // All choices
  const [inputChoice, setInputChoice] = useState("");        // Manual input field
  const [correctChoices, setCorrectChoices] = useState([]);  // ORDERED list of correct choices
  const [newMessage, setNewMessage] = useState("");

  // Existing questions state
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPhrase, setEditPhrase] = useState("");
  const [editChoices, setEditChoices] = useState([]);
  const [editCorrect, setEditCorrect] = useState([]);        // ORDERED list while editing
  const [questionMessages, setQuestionMessages] = useState({});

  const navigate = useNavigate();

  // ---------- EFFECTS ----------
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      setNewMessage("Failed to fetch questions.");
    }
  };

  // ---------- NEW PHRASE LOGIC ----------
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

  // Maintain ORDER of selection
  const toggleCorrect = (choice) => {
    setCorrectChoices((prev) =>
      prev.includes(choice) ? prev.filter((c) => c !== choice) : [...prev, choice]
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
      // 1️⃣ Create question (phrase + translation)
      const form = new FormData();
      form.append("questionDescription", newPhrase);
      form.append("questionText", newChoices.join(" ")); // store full sequence
      form.append("image", null);

      const qRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/activities/${activityId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const qId = qRes.data.questionId;

      // 2️⃣ Post choices with CORRECT order preserved
      let score = 0;
      for (let i = 0; i < newChoices.length; i++) {
        const ch = newChoices[i];
        const isCorr = correctChoices.includes(ch);
        const orderIndex = correctChoices.indexOf(ch); // -1 if not correct

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/questions/${qId}`,
          {
            choiceText: ch,
            correct: isCorr,
            choiceOrder: isCorr ? orderIndex + 1 : null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (isCorr) score++;
      }

      // 3️⃣ Post score
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${qId}`,
        null,
        {
          params: { scoreValue: score },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage("Saved successfully!");
      // Reset form
      setNewPhrase("");
      setTranslation("");
      setNewChoices([]);
      setCorrectChoices([]);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setNewMessage("Save failed.");
    }
  };

  // ---------- EDIT EXISTING ----------
  const startEdit = (q) => {
    setEditingId(q.questionId);
    setEditPhrase(q.questionDescription || "");
    setEditChoices(q.choices.map((c) => ({ ...c }))); // clone
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
    if (!token) {
      console.warn("No token found, redirecting to login.");
      navigate("/login");
      return;
    }

    setQuestionMessages((p) => ({ ...p, [id]: "Saving..." }));

    try {
      // 1️⃣ Update question
      const form = new FormData();
      form.append("questionDescription", editPhrase);
      form.append("questionText", editChoices.map((c) => c.choiceText).join(" "));
      form.append("image", null);

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/questions/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 2️⃣ Update choices preserving order
      let score = 0;
      for (let i = 0; i < editChoices.length; i++) {
        const c = editChoices[i];
        const isCorr = editCorrect.includes(c.choiceText);
        const orderIndex = editCorrect.indexOf(c.choiceText);

        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/choices/${c.choiceId}`,
          {
            choiceText: c.choiceText,
            correct: isCorr,
            choiceOrder: isCorr ? orderIndex + 1 : null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (isCorr) score++;
      }

      // 3️⃣ Update score
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/scores/questions/${id}/score`,
        null,
        {
          params: { scoreValue: score },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuestionMessages((p) => ({ ...p, [id]: "Updated successfully!" }));
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      console.error("Update failed:", err);
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
    if (!token) {
      navigate("/login");
      return;
    }

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

  const goBack = () => navigate(`/admindashboard`);

  // ---------- RENDER ----------
  return (
    <Grid container justifyContent="center" sx={{ minHeight: "100vh", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", color: "black" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Phrase Translation
          </Typography>
        </Box>

        {/* Existing Questions */}
        {questions.map((q, i) => (
          <Paper
            key={q.questionId}
            sx={{ bgcolor: "#18191B", color: "#fff", p: 4, mb: 4, borderRadius: 3 }}
          >
            <Typography variant="h6" fontWeight="bold" color="#B3E5FC" sx={{ mb: 2 }}>
              {i + 1}.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
              {/* Phrase & Translation */}
              <Box sx={{ flex: 1 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Phrase
                </Typography>
                {editingId === q.questionId ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    value={editPhrase}
                    onChange={(e) => setEditPhrase(e.target.value)}
                    sx={{ input: { color: "#fff" }, bgcolor: "#232323", borderRadius: 1, p: 1 }}
                  />
                ) : (
                  <Typography>{q.questionDescription}</Typography>
                )}

                <Typography color="#B3E5FC" mt={2} mb={1} fontWeight="bold">
                  Translation
                </Typography>
                {editingId === q.questionId ? (
                  <Typography sx={{ color: "#fff", bgcolor: "#232323", p: 1, borderRadius: 1 }}>
                    {editChoices.map((c) => c.choiceText).join(" ")}
                  </Typography>
                ) : (
                  <Typography>{q.questionText}</Typography>
                )}
              </Box>

              {/* Choices */}
              <Box sx={{ flex: 2 }}>
                <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                  Choices
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {(editingId === q.questionId ? editChoices : q.choices).map((c, idx) => {
                    const text = c.choiceText;
                    const selected =
                      editingId === q.questionId ? editCorrect.includes(text) : c.correct;
                    return (
                      <Chip
                        key={idx}
                        label={
                          editingId === q.questionId ? (
                            <TextField
                              variant="standard"
                              value={text}
                              onChange={(e) => changeEditChoice(idx, e.target.value)}
                              InputProps={{
                                disableUnderline: true,
                                sx: { color: selected ? "#fff" : "#B3E5FC" },
                              }}
                            />
                          ) : (
                            text
                          )
                        }
                        onClick={
                          editingId === q.questionId ? () => toggleEditCorrect(text) : undefined
                        }
                        sx={{
                          bgcolor: selected ? "#4CAF50" : "#232323",
                          color: selected ? "#fff" : "#B3E5FC",
                          border: selected ? "2px solid #4CAF50" : "1px solid #616161",
                        }}
                      />
                    );
                  })}
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  {editingId === q.questionId ? (
                    <>
                      <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#4CAF50" }}>
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={cancelEdit}
                        sx={{ bgcolor: "#E57373" }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: "#81D4FA" }}
                        onClick={() => startEdit(q)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteQuestion(q.questionId)}
                        sx={{ bgcolor: "#E57373" }}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            {questionMessages[q.questionId] && (
              <Typography
                color={questionMessages[q.questionId].includes("failed") ? "#E57373" : "#81C784"}
                sx={{ mt: 2, textAlign: "center" }}
              >
                {questionMessages[q.questionId]}
              </Typography>
            )}
          </Paper>
        ))}

        {/* ------------ ADD NEW PHRASE ------------- */}
        <Paper sx={{ bgcolor: "#18191B", color: "#fff", p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="#B3E5FC" sx={{ mb: 2 }}>
            {questions.length + 1}.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
            {/* Left column: Phrase & Translation */}
            <Box sx={{ flex: 1 }}>
              <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                Enter Phrase
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                sx={{ bgcolor: "#232323", input: { color: "#fff" } }}
              />

              <Typography color="#B3E5FC" mt={2} mb={1} fontWeight="bold">
                Enter Translation
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                sx={{ bgcolor: "#232323", input: { color: "#fff" } }}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={generateChoices} sx={{ bgcolor: "#81D4FA" }}>
                  Generate Choices
                </Button>
              </Box>
            </Box>

            {/* Right column: Choices */}
            <Box sx={{ flex: 2 }}>
              <Typography color="#B3E5FC" mb={1} fontWeight="bold">
                Manual Choice ({newChoices.length}/8)
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={inputChoice}
                  onChange={(e) => setInputChoice(e.target.value)}
                  sx={{ bgcolor: "#232323", input: { color: "#fff" } }}
                />
                <Button variant="contained" onClick={addManualChoice} sx={{ bgcolor: "#81D4FA" }}>
                  Add
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {newChoices.map((c, idx) => (
                  <Chip
                    key={idx}
                    label={c}
                    onClick={() => toggleCorrect(c)}
                    onDelete={() => removeChoice(c)}
                    sx={{
                      bgcolor: correctChoices.includes(c) ? "#4CAF50" : "#232323",
                      color: correctChoices.includes(c) ? "#fff" : "#B3E5FC",
                      border: correctChoices.includes(c) ? "2px solid #4CAF50" : "1px solid #616161",
                    }}
                  />
                ))}
                {newChoices.length === 0 && <Typography color="#616161">No choices yet</Typography>}
              </Box>

              <Typography color="#B3E5FC" mb={1}>
                {correctChoices.length > 0
                  ? `Correct: ${correctChoices.join(", ")}`
                  : "Select correct choice(s)"}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setNewPhrase("");
                    setTranslation("");
                    setNewChoices([]);
                    setCorrectChoices([]);
                    setNewMessage("");
                  }}
                  sx={{ bgcolor: "#E57373" }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={saveNew}
                  disabled={!newPhrase.trim() || newChoices.length < 3 || correctChoices.length === 0}
                  sx={{ bgcolor: "#4CAF50" }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>

          {newMessage && (
            <Typography
              color={newMessage.includes("Failed") ? "#E57373" : "#81C784"}
              sx={{ mt: 3, textAlign: "center" }}
            >
              {newMessage}
            </Typography>
          )}
        </Paper>
      </Box>
    </Grid>
  );
}

export default PhraseTranslation;
