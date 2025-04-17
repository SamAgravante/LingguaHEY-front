import { Grid, Stack, Box, Typography, Modal, Fade, Backdrop, IconButton } from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const VocabularyContent = () => (
    <Box textAlign="center">
        <Typography variant="h4" gutterBottom>Vocabulary Section</Typography>
        <Typography>This is where you manage vocabulary exercises.</Typography>
    </Box>
);

const GrammarContent = () => (
    <Box textAlign="center">
        <Typography variant="h4" gutterBottom>Grammar Section</Typography>
        <Typography>Here you'll find grammar lessons and quizzes.</Typography>
    </Box>
);

const ActivityContent = () => (
    <Box textAlign="center">
        <Typography variant="h4" gutterBottom>Activity Section</Typography>
        <Typography>Engage with interactive activities here.</Typography>
    </Box>
);

export default function Homepage() {
    const [open, setOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState("");

    const handleOpen = (section) => {
        setSelectedSection(section);
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
        <>
            <Grid
                container
                sx={{
                    position: 'relative',
                    backgroundSize: 'cover',
                    backgroundColor: '#FFCBE1',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100%',
                    minWidth: '100%',
                    display: 'flex',
                    alignContent: 'center'
                }}
            >
                <Grid
                    container
                    sx={{
                        backgroundColor: '#C9E4DE',
                        minHeight: '70vh',
                        minWidth: '70vw',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4
                    }}
                >
                    <Stack direction="row" spacing={2}>
                        {["Vocabulary", "Grammar", "Activity"].map((section) => (
                            <Box
                                key={section}
                                onClick={() => handleOpen(section)}
                                sx={{
                                    backgroundColor: '#F7D9C4',
                                    minHeight: '50vh',
                                    minWidth: '20vw',
                                    maxHeight: '60vh',
                                    maxWidth: '50vw',
                                    display: 'flex',
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: 3,
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <Typography>{section}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Grid>
            </Grid>

            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            minWidth: '100vw',
                            minHeight: '100vh',
                            bgcolor: 'white',
                            color: "black",
                            p: 4,
                            borderRadius: 2,
                            boxShadow: 5,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={handleClose} aria-label="close">
                                <CloseIcon fontSize="large" />
                            </IconButton>
                        </Box>
                        {renderContent()}
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}