import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();

    return (
        <Grid
            container
            sx={{
                backgroundColor: '#e2a5bf',
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
                        minWidth: '30vw',
                        borderBottomLeftRadius: '50px',
                        borderBottomRightRadius: '50px',
                    }}>

                </Box>
                <Typography variant="h4" paddingTop={2}>
                    LinnguaHey
                </Typography>
                <Typography variant="h10" paddingBottom={3}>
                    A Filipino Language Learning App
                </Typography>
                <Button 
                    variant="contained"
                    color="primary"
                    sx={{minWidth:"250px", borderRadius:"20px"}}
                    onClick={()=>navigate("/login")}>
                        Get Started
                </Button>

                <Typography 
                    variant="h10" 
                    paddingTop={1}
                    color="#80EF80"
                    onClick={()=>navigate("/signup")}
                    sx={{cursor: 'pointer'}}>
                        No Account? Register Now!
                </Typography>
            </Stack>
        </Grid>
    );
}
