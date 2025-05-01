import {
  Grid, Stack, Box, Typography, Modal, Fade, Backdrop, IconButton, Button, LinearProgress
} from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const mockActivities = [
  {
    activityId: 1,
    activityName: "Prutas",
    gameType: "GAME1",
    questions: [
      {
        questionId: 1,
        questionText: "Manzana",
        choices: [
          { choiceId: 1, choiceText: "Apple", correct: true },
          { choiceId: 2, choiceText: "Pear", correct: false },
          { choiceId: 3, choiceText: "Banana", correct: false },
        ],
      },
      {
        questionId: 2,
        questionText: "Saging",
        choices: [
          { choiceId: 4, choiceText: "Banana", correct: true },
          { choiceId: 5, choiceText: "Melon", correct: false },
          { choiceId: 6, choiceText: "Orange", correct: false },
        ],
      },
    ],
  },
  {
    activityId: 2,
    activityName: "Mga Kulay",
    gameType: "GAME1",
    questions: [
      {
        questionId: 3,
        questionText: "Pula",
        choices: [
          { choiceId: 7, choiceText: "Red", correct: true },
          { choiceId: 8, choiceText: "Blue", correct: false },
          { choiceId: 9, choiceText: "Green", correct: false },
        ],
      },
      {
        questionId: 4,
        questionText: "Berde",
        choices: [
          { choiceId: 10, choiceText: "Yellow", correct: false },
          { choiceId: 11, choiceText: "Green", correct: true },
          { choiceId: 12, choiceText: "Black", correct: false },
        ],
      },
    ],
  },
];


const VocabularyContent = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const handleChoice = (choice) => {
    const currentQuestion = selectedActivity.questions[currentQuestionIndex];
    if (choice.correct) {
      setScore(score + 1);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < selectedActivity.questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setShowEndScreen(true);
    }
  };

  const handleStartActivity = (activity) => {
    setSelectedActivity(activity);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowEndScreen(false);
  };

  const handleBackToMenu = () => {
    setSelectedActivity(null);
    setCurrentQuestionIndex(0);
    setShowEndScreen(false);
  };

  if (!selectedActivity) {
    return (
      <Box textAlign="center" sx={{ flexGrow: 1 }}>
        <Typography variant="h3" gutterBottom color="#3E2723">Vocabulary Activities</Typography>
        <Stack spacing={2} sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
          {mockActivities.map((activity) => (
            <Button
              key={activity.activityId}
              variant="contained"
              onClick={() => handleStartActivity(activity)}
              sx={{
                backgroundColor: activity.completed ? "#A5D6A7" : "#8D6E63",
                '&:hover': {
                  backgroundColor: activity.completed ? "#81C784" : "#6D4C41",
                }
              }}
            >
              {activity.activityName}
            </Button>
          ))}
        </Stack>
      </Box>
    );
  }

  if (showEndScreen) {
    return (
      <Box textAlign="center" sx={{ flexGrow: 1 }}>
        <Typography variant="h4" color="#4E342E" gutterBottom>
          Great Job!
        </Typography>
        <Typography variant="h6" color="#6D4C41">
          You scored {score} out of {selectedActivity.questions.length}
        </Typography>
        <Button
          onClick={handleBackToMenu}
          variant="contained"
          sx={{ mt: 4, backgroundColor: "#6D4C41", '&:hover': { backgroundColor: "#5D4037" } }}
        >
          Back to Menu
        </Button>
      </Box>
    );
  }

  const currentQuestion = selectedActivity.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / selectedActivity.questions.length) * 100;

  return (
    <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
      <Typography variant="h5" color="#4E342E" gutterBottom>
        {selectedActivity.activityName}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, mb: 3 }} />
      <Typography variant="h4" gutterBottom color="#3E2723">
        {currentQuestion.questionText}
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto', mt: 3 }}>
        {currentQuestion.choices.map((choice) => (
          <Button
            key={choice.choiceId}
            variant="outlined"
            onClick={() => handleChoice(choice)}
            sx={{ borderColor: '#6D4C41', color: '#6D4C41', '&:hover': { backgroundColor: '#EFEBE9' } }}
          >
            {choice.choiceText}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

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

  const sections = [
    { key: "Vocabulary", label: "Vocabulary", icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />, bgColor: '#FFEBEE' },
    { key: "Grammar", label: "Grammar", icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />, bgColor: '#E3F2FD' },
    { key: "Activity", label: "Activity", icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />, bgColor: '#E8F5E9' },
  ];

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      sx={{ minHeight: '100vh', backgroundColor: '#E1F5FE', p: 2 }}
    >
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
