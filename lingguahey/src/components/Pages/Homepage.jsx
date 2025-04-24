import { Grid, Stack, Box, Typography, Modal, Fade, Backdrop, IconButton } from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const sections = [
  { key: "Vocabulary", label: "Vocabulary", icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />, bgColor: '#FFEBEE' },
  { key: "Grammar", label: "Grammar", icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />, bgColor: '#E3F2FD' },
  { key: "Activity", label: "Activity", icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />, bgColor: '#E8F5E9' },
];

const VocabularyContent = () => (
  <Box textAlign="center" sx={{ flexGrow: 1 }}>
    <Typography variant="h3" gutterBottom color="#3E2723">Vocabulary Section</Typography>
    <Typography fontSize="1.25rem" color="#5D4037" sx={{ mb: 2 }}>
      This is where you manage vocabulary exercises.
    </Typography>
  </Box>
);

const GrammarContent = () => (
  <Box textAlign="center" sx={{ flexGrow: 1 }}>
    <Typography variant="h3" gutterBottom color="#3E2723">Grammar Section</Typography>
    <Typography fontSize="1.25rem" color="#5D4037" sx={{ mb: 2 }}>
      Here you'll find grammar lessons and quizzes.
    </Typography>
  </Box>
);

const ActivityContent = () => (
  <Box textAlign="center" sx={{ flexGrow: 1 }}>
    <Typography variant="h3" gutterBottom color="#3E2723">Activity Section</Typography>
    <Typography fontSize="1.25rem" color="#5D4037" sx={{ mb: 2 }}>
      Engage with interactive activities here.
    </Typography>
  </Box>
);

export default function Homepage() {
  // Remove user token and API logic so we only manage modal state
  const [open, setOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  const handleOpen = (key) => {
    setSelectedSection(key);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSection("");
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "Vocabulary":
        return <VocabularyContent />;
      case "Grammar":
        return <GrammarContent />;
      case "Activity":
        return <ActivityContent />;
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#E1F5FE',
        p: 2,
      }}
    >
      {/* Greet a static user now that user fetching logic is removed */}
      <Typography variant="h4" sx={{ mb: 2, color: '#4E342E' }}>
        Welcome, Friend!
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: '#6D4C41' }}>
        Choose a section to start learning:
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
        {sections.map((section) => (
          <Box
            key={section.key}
            onClick={() => handleOpen(section.key)}
            sx={{
              backgroundColor: section.bgColor,
              width: 360,
              height: 560,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 3,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            {section.icon}
            <Typography variant="subtitle1" sx={{ mt: 1, color: '#4E342E' }}>
              {section.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '98vw',
              height: '100vh',
              bgcolor: '#FFFFFF',
              color: '#3E2723',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <IconButton onClick={handleClose} aria-label="back">
                <ArrowBackIcon fontSize="large" sx={{ color: '#6D4C41' }} />
              </IconButton>
              <IconButton onClick={handleClose} aria-label="close">
                <CloseIcon fontSize="large" sx={{ color: '#6D4C41' }} />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {renderContent()}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
}
