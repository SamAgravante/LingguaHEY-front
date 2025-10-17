import React, { useState, useContext } from 'react';
import {
  Box,
  Modal,
  Fade,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { MusicContext } from '../../contexts/MusicContext';

// Game assets (reuse same theme)
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextBox from "../../assets/images/backgrounds/MonsterEditUIOuter.png";


const ContactModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [loading, setLoading] = useState(false);

  const {
    playConfirm,
    playDenied,
    playCancel,
  } = useContext(MusicContext);

  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/contact`,
    timeout: 1000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const showSnack = (message, severity = "info") => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const handleSnackClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      showSnack("All fields are required.", "warning");
      playDenied();
      return;
    }

    setLoading(true);
    try {
      await API.post("/", formData);
      showSnack("Message sent successfully!", "success");
      playConfirm();
      setTimeout(() => {
        onClose();
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1500);
    } catch (err) {
      console.error("Failed to send message:", err);
      showSnack("Failed to send message. Please try again later.", "error");
      playDenied();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    playCancel();
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              backgroundImage: `url(${GameTextFieldBig})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              height: 520,
              borderRadius: 2,
              p: 4,
            }}
          >
            <IconButton
              onClick={() => { playCancel(); onClose(); }}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#5D4037' }}>
              Contact Support
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <TextField
                name="name"
                label="Your Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    backgroundImage: `url(${GameTextFieldLong})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    height: 40,
                    pl: 1,
                  },
                }}
              />

              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    backgroundImage: `url(${GameTextFieldLong})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    height: 40,
                    pl: 1,
                  },
                }}
              />

              <TextField
                name="subject"
                label="Subject"
                value={formData.subject}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    backgroundImage: `url(${GameTextFieldLong})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    height: 40,
                    pl: 1,
                  },
                }}
              />

              <TextField
                name="message"
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    backgroundImage: `url(${GameTextBox})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width:400,
                    height:200,
                    p: 1,
                  },
                }}
              />

              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#AED581',
                    color: '#5D4037',
                    '&:hover': { backgroundColor: '#C5E1A5' },
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: '#FFB74D',
                    color: '#5D4037',
                    '&:hover': { backgroundColor: '#FFA726' },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        container={document.body}
        sx={{
          position: "fixed",
          zIndex: 20000,
        }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: '100%' }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactModal;
