import React, { useContext } from 'react';
import { Box, Typography, Grid, IconButton, Chip, Stack as MuiStack } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import speechBubble from '../../assets/images/objects/speech-bubble.png';
import { PastelContainer, PastelProgress, ChoiceButton } from './MultiplayerGameRoom';
import { MusicContext } from '../../contexts/MusicContext';

// This component renders the game content for the live multiplayer room
export default function MultiplayerGameRoomGameContent({
  q,
  progress,
  index,
  questions,
  shuffledOptions,
  shuffledChoices,
  selected,
  handleChoice,
  handleSelect,
  handleRemove,
  pendingAnswer,
  userRole,
  waitingForTeacher,
  pastels,
  synthesizeSpeech,
}) {
  //Music functions
  const {
    playCancel,
  } = useContext(MusicContext);


  if (!q) return null;
  if (q.gameType === 'GAME1') {
    // One Pic Four Words
    return (
      <PastelContainer>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            One Pic Four Words
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <PastelProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
              {index + 1} / {questions.length}
            </Typography>
          </Box>
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 2, width: '100%' }}>
            <MuiStack direction="row" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ minHeight: 120, minWidth: 60, width: 80, height: 160, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ height: 120, width: 180, minWidth: 80, maxWidth: 220, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center">
                    <Typography variant="h6" sx={{ textAlign: 'center', color: '#2E2E34', maxWidth: '90%', mb: 1 }}>
                      Can you tell me what is this?
                    </Typography>
                  </MuiStack>
                </Grid>
              </Box>
              {q.questionImage && (
                <Box sx={{ textAlign: 'center', minWidth: 120, minHeight: 120, width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`data:image/png;base64,${q.questionImage}`} alt="quiz" style={{ width: '100%', height: '100%', objectFit: 'contain', maxWidth: 140, maxHeight: 140 }} />
                </Box>
              )}
            </MuiStack>
          </Grid>
          <Grid container spacing={2} sx={{ justifyContent: 'center', width: '100%', flexGrow: 1, overflow: 'auto', mt: 0 }}>
            {shuffledOptions.map((choice, i) => (
              <Grid item xs={6} key={choice.choiceId} sx={{ minHeight: 60, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                <ChoiceButton
                  onClick={() => { userRole !== 'TEACHER' && handleChoice(choice); playCancel(); }}
                  sx={{
                    backgroundColor: pastels[i % pastels.length],
                    border: (userRole === 'TEACHER' && choice.correct) ? '3px solid #4CAF50' :
                      (pendingAnswer === choice.choiceId ? '3px solid #4CAF50' : 'none'),
                    '&:hover': {
                      opacity: userRole === 'TEACHER' ? 1 :
                        (pendingAnswer !== null && pendingAnswer !== choice.choiceId ? 0.7 : 1)
                    },
                    cursor: userRole === 'TEACHER' ? 'default' : 'pointer'
                  }}
                  disabled={userRole === 'TEACHER'}
                >
                  {choice.choiceText}
                </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 2, fontSize: 18, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </Box>
      </PastelContainer>
    );
  } else if (q.gameType === 'GAME2') {
    // Phrase Translation
    return (
      <PastelContainer>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            Phrase Translation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <PastelProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
              {index + 1} / {questions.length}
            </Typography>
          </Box>
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <MuiStack direction="row" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ minHeight: 120, minWidth: 60, width: 80, height: 160, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ minHeight: 120, minWidth: 80, maxWidth: 220, width: 180, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', justifyItems: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center" sx={{ p: 1 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      What does
                    </Typography>
                    <MuiStack direction="row" alignItems="center" sx={{ flexWrap: 'wrap' }}>
                      <Typography variant="h5" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f' }}>
                        {q.questionDescription}
                      </Typography>
                      <IconButton onClick={() => synthesizeSpeech(q.questionDescription)}>
                        <VolumeUpIcon sx={{ fontSize: 24, color: '#2E2E34' }} />
                      </IconButton>
                    </MuiStack>
                    <Typography variant="h6" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      mean?
                    </Typography>
                  </MuiStack>
                </Grid>
              </Box>
            </MuiStack>
          </Grid>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#BBDEFB', p: 0.5, borderRadius: 1, width: '100%' }}>
            {selected.map(id => {
              const choice = q.choices.find(c => c.choiceId === id) || {};
              return (
                <Chip
                  key={id}
                  label={choice.choiceText}
                  onDelete={() => { handleRemove(id); playCancel(); }}
                  onClick={() => { handleRemove(id); playCancel(); }}
                  deleteIcon={<CloseIcon sx={{ color: '#bb998f', fontSize: 18, '&:hover': { color: '#E6bbad' } }} />}
                  sx={{ m: 0.5, backgroundColor: '#FFECB3', color: '#2E2E34', fontSize: '1.2rem', minHeight: 36, minWidth: 30, p: 0.5, '& .MuiChip-label': { fontSize: '1.2rem', pr: 1 } }} disabled={userRole === 'TEACHER'}
                />
              );
            })}
          </Box>
          {userRole === 'TEACHER' && (
            <Typography sx={{ textAlign: 'center', color: '#2E2E34', mb: 1, fontWeight: 'bold' }}>
              Correct order: {q.choices.filter(c => c.correct).sort((a, b) => a.choiceOrder - b.choiceOrder).map(c => c.choiceText).join(' → ')}
            </Typography>
          )}
          <Grid container spacing={2} sx={{ justifyContent: 'center', width: '100%', flexGrow: 1, overflow: 'auto', mt: 0 }}>
            {shuffledChoices.map((c, i) => (
              <Grid item xs={6} key={c.choiceId} sx={{ minHeight: 60, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>                <ChoiceButton
                onClick={() => { userRole !== 'TEACHER' && handleSelect(c); playCancel(); }}
                variant={selected.includes(c.choiceId)}
                disabled={userRole === 'TEACHER'}
                sx={{ backgroundColor: pastels[i % pastels.length] }}
              >
                {c.choiceText}
              </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 2, fontSize: 18, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </Box>
      </PastelContainer>
    );
  } else if (q.gameType === 'GAME3') {
    // Word Translation
    return (
      <PastelContainer>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            Word Translation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <PastelProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
              {index + 1} / {questions.length}
            </Typography>
          </Box>
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <MuiStack direction="row" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ minHeight: 120, minWidth: 60, width: 80, height: 160, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ minHeight: 120, minWidth: 120, maxWidth: 220, width: 180, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', justifyItems: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center" sx={{ pt: 1 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      What does this mean?
                    </Typography>
                    <MuiStack direction="row" alignItems="center">
                      <Typography variant="h5" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f' }}>
                        {q.questionText}
                      </Typography>
                      <IconButton onClick={() => synthesizeSpeech(q.questionText)}>
                        <VolumeUpIcon sx={{ fontSize: 24, color: '#2E2E34' }} />
                      </IconButton>
                    </MuiStack>
                  </MuiStack>
                </Grid>
              </Box>
            </MuiStack>
          </Grid>
          <Grid container spacing={2} sx={{ justifyContent: 'center', width: '100%', flexGrow: 1, overflow: 'auto', mt: 0 }}>
            {shuffledOptions.map((choice, i) => (
              <Grid item xs={6} key={choice.choiceId} sx={{ minHeight: 60, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                <ChoiceButton
                  onClick={() => { userRole !== 'TEACHER' && handleChoice(choice); playCancel(); }}
                  sx={{
                    backgroundColor: pastels[i % pastels.length],
                    border: (userRole === 'TEACHER' && choice.correct) ? '3px solid #4CAF50' :
                      (pendingAnswer === choice.choiceId ? '3px solid #4CAF50' : 'none'),
                    '&:hover': {
                      opacity: userRole === 'TEACHER' ? 1 :
                        (pendingAnswer !== null && pendingAnswer !== choice.choiceId ? 0.7 : 1)
                    },
                    cursor: userRole === 'TEACHER' ? 'default' : 'pointer'
                  }}
                  disabled={userRole === 'TEACHER'}
                >
                  {choice.choiceText}
                </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 2, fontSize: 18, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </Box>
      </PastelContainer>
    );
  }
  return null;
}
