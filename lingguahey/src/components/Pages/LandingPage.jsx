import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();
    const primaryBtn = "#FFCC80";
    const textColor = "#5D4037"; 

    return (
        <Grid
            container
            sx={{
                background: 'linear-gradient(135deg,#FFECB3 30%,#E1F5FE 90%)',
                minHeight: '100vh',
                minWidth: '100vw',
                display: 'flex',
                justifyContent: 'center',
                //alignItems: 'center',
            }}
        >
            <Stack direction="column" alignItems="center" >
                <Box
                    sx={{
                        backgroundColor: '#D2E0D3',
                        minHeight: '60vh',
                        minWidth: '20vw',
                        borderBottomLeftRadius: '50px',
                        borderBottomRightRadius: '50px',
                    }}>

                </Box>
                <Typography variant="h4" paddingTop={2} color="#5D4037">
                    LinnguaHey
                </Typography>
                <Typography variant="h10" paddingBottom={3} color="#5D4037">
                    A Filipino Language Learning App
                </Typography>
                <Button 
                    variant="contained"
                    color="primary"
                    sx={{minWidth:"250px", borderRadius:"20px",backgroundColor: primaryBtn, color: textColor, textTransform: 'none'}}
                    onClick={()=>navigate("/login")}>
                        Get Started
                </Button>

                <Typography
                    align="center"
                    sx={{ color: '#FFCC80', cursor: 'pointer', mt: 1 }}
                    onClick={() => navigate('/roleselect')}
                >
                    No Account? Register Now!
                </Typography>
                    </Stack>
        </Grid>
    );
}
